import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import OpenAI from "openai";
import { getQuickJS, shouldInterruptAfterDeadline } from "quickjs-emscripten";
import {
  buildProblemPrompt,
  problemSchema,
  mergeGeneratedProblems,
  parseGeneratedProblemBundle,
  validateCandidateProblem,
} from "./problemGeneration.mjs";
import {
  readBaseProblemSummaries,
  readJsonArray,
  validateGeneratedProblemList,
} from "./problemValidation.mjs";
import { resolveGenerationConfig } from "./generate-generated-problems.shared.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const baseProblemsPath = path.join(rootDir, "src", "data", "baseProblems.ts");
const generatedProblemsPath = path.join(
  rootDir,
  "src",
  "data",
  "generated",
  "problems.generated.json",
);

const generatedProblemBundleSchema = {
  type: "object",
  additionalProperties: false,
  required: ["problem", "referenceSolution"],
  properties: {
    problem: {
      ...problemSchema,
      description: "Public problem data to append to the static problem list.",
    },
    referenceSolution: {
      type: "string",
      minLength: 1,
      description: "Reference solution used only during validation.",
    },
  },
};

function isTimeLimitError(error) {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    "message" in error &&
    typeof error.name === "string" &&
    typeof error.message === "string" &&
    error.name === "InternalError" &&
    error.message.toLowerCase().includes("interrupted")
  );
}

function formatError(error) {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Unknown execution error";
}

function deepEqualJson(left, right) {
  if (Object.is(left, right)) {
    return true;
  }

  if (
    typeof left !== "object" ||
    left === null ||
    typeof right !== "object" ||
    right === null
  ) {
    return false;
  }

  if (Array.isArray(left) || Array.isArray(right)) {
    if (!Array.isArray(left) || !Array.isArray(right)) {
      return false;
    }

    if (left.length !== right.length) {
      return false;
    }

    return left.every((item, index) => deepEqualJson(item, right[index]));
  }

  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);

  if (leftKeys.length !== rightKeys.length) {
    return false;
  }

  return leftKeys.every(
    (key) => Object.hasOwn(right, key) && deepEqualJson(left[key], right[key]),
  );
}

function buildSingleCaseScript(code, functionName, input) {
  if (!/^[A-Za-z_$][\w$]*$/.test(functionName)) {
    throw new Error(`Invalid function name: ${functionName}`);
  }

  const serializedInput = JSON.stringify(input);

  return `
${code}

const __judgeInput = JSON.parse(${JSON.stringify(serializedInput)});
const __judgeTarget = ${functionName};

if (typeof __judgeTarget !== "function") {
  throw new TypeError("Expected ${functionName} to be a function");
}

__judgeTarget(...__judgeInput);
`;
}

async function validateReferenceSolution(problem, referenceSolution) {
  const quickJs = await getQuickJS();
  const tests = [...problem.visibleTests, ...problem.hiddenTests];

  for (const testCase of tests) {
    const startedAt = performance.now();

    try {
      const actual = quickJs.evalCode(
        buildSingleCaseScript(
          referenceSolution,
          problem.functionName,
          testCase.input,
        ),
        {
          memoryLimitBytes: problem.memoryLimitBytes,
          shouldInterrupt: shouldInterruptAfterDeadline(
            Date.now() + problem.timeLimitMs,
          ),
        },
      );

      if (!deepEqualJson(actual, testCase.expected)) {
        throw new Error(
          `expected ${JSON.stringify(testCase.expected)}, got ${JSON.stringify(actual)}`,
        );
      }
    } catch (error) {
      const durationMs = Math.round(performance.now() - startedAt);
      const message = isTimeLimitError(error)
        ? `time limit exceeded after ${durationMs}ms`
        : formatError(error);

      throw new Error(
        `Reference solution failed for ${problem.id} / ${testCase.id}: ${message}`,
      );
    }
  }
}

async function main() {
  const { args, apiKey, baseUrl, model, cadence, difficulty } =
    resolveGenerationConfig({
      argv: process.argv.slice(2),
      env: process.env,
      defaults: {
        output: generatedProblemsPath,
      },
    });
  const outputPath = args.output ?? generatedProblemsPath;

  if (!apiKey) {
    throw new Error(
      "Missing API key. Set OPENAI_API_KEY, AI_API_KEY, or pass --api-key.",
    );
  }

  const client = new OpenAI({
    apiKey,
    ...(baseUrl ? { baseURL: baseUrl } : {}),
  });

  const [baseProblemSummaries, generatedProblems] = await Promise.all([
    readBaseProblemSummaries(baseProblemsPath),
    readJsonArray(outputPath),
  ]);

  const prompt = buildProblemPrompt({
    cadence,
    difficulty,
    baseProblemSummaries,
    generatedProblemSummaries: generatedProblems.map((problem) => ({
      id: problem.id,
      title: problem.title,
      difficulty: problem.difficulty,
      functionName: problem.functionName,
    })),
  });

  // Keep Chat Completions for now because it is the broadest compatibility target
  // across OpenAI-compatible providers; migrate only when the downstream parser is updated too.
  const response = await client.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content:
          "You generate one high-quality browser-friendly coding problem and one reference solution.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "generated_problem_bundle",
        strict: true,
        schema: generatedProblemBundleSchema,
      },
    },
  });

  const bundle = parseGeneratedProblemBundle(response.choices[0].message.content);

  validateCandidateProblem(bundle.problem, [
    ...baseProblemSummaries.map((problem) => problem.id),
    ...generatedProblems.map((problem) => problem.id),
  ]);

  await validateReferenceSolution(bundle.problem, bundle.referenceSolution);

  const nextGeneratedProblems = mergeGeneratedProblems(
    generatedProblems,
    bundle.problem,
  );

  validateGeneratedProblemList(
    nextGeneratedProblems,
    baseProblemSummaries.map((problem) => problem.id),
  );

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(
    outputPath,
    `${JSON.stringify(nextGeneratedProblems, null, 2)}\n`,
  );

  console.log(
    `Generated ${bundle.problem.id} with model ${model} and updated ${outputPath}.`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
