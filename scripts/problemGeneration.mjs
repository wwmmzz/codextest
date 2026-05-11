import { validateGeneratedProblemList } from './problemValidation.mjs'

const problemSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'id',
    'title',
    'difficulty',
    'tags',
    'statement',
    'examples',
    'constraints',
    'starterCode',
    'functionName',
    'timeLimitMs',
    'memoryLimitBytes',
    'visibleTests',
    'hiddenTests',
  ],
  properties: {
    id: { type: 'string' },
    title: { type: 'string' },
    difficulty: { type: 'string', enum: ['Easy', 'Medium', 'Hard'] },
    tags: { type: 'array', items: { type: 'string' }, minItems: 1 },
    statement: { type: 'string' },
    examples: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['input', 'output'],
        properties: {
          input: { type: 'string' },
          output: { type: 'string' },
          explanation: { type: 'string' },
        },
      },
    },
    constraints: {
      type: 'array',
      items: { type: 'string' },
      minItems: 1,
    },
    starterCode: { type: 'string' },
    functionName: { type: 'string' },
    timeLimitMs: { type: 'integer', minimum: 1 },
    memoryLimitBytes: { type: 'integer', minimum: 1 },
    visibleTests: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'input', 'expected', 'visibility'],
        properties: {
          id: { type: 'string' },
          input: { type: 'array' },
          expected: {},
          visibility: { type: 'string', enum: ['visible'] },
          description: { type: 'string' },
        },
      },
    },
    hiddenTests: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'input', 'expected', 'visibility'],
        properties: {
          id: { type: 'string' },
          input: { type: 'array' },
          expected: {},
          visibility: { type: 'string', enum: ['hidden'] },
          description: { type: 'string' },
        },
      },
    },
  },
}

export function buildProblemPrompt({
  cadence = 'daily',
  difficulty = 'Easy',
  baseProblemSummaries,
  generatedProblemSummaries,
}) {
  const existingProblems = [...baseProblemSummaries, ...generatedProblemSummaries]

  return [
    `Generate exactly one new ${cadence} coding practice problem.`,
    `Target difficulty: ${difficulty}.`,
    'The problem must use the existing frontend problem model:',
    '- JavaScript function-style submission only.',
    '- JSON-serializable inputs and outputs only.',
    '- Include at least 1 example, at least 1 visible test, and at least 1 hidden test.',
    '- Keep the starter code short and leave the implementation blank.',
    '- Ensure the function name is a valid JavaScript identifier.',
    '- Return only a JSON object matching the required schema.',
    '',
    'Avoid duplicating or trivially rephrasing these existing problems:',
    ...existingProblems.map(
      (problem) =>
        `- ${problem.id}: ${problem.title} [${problem.difficulty}] (${problem.functionName})`,
    ),
    '',
    'The response must include:',
    '- problem: the public problem object',
    '- referenceSolution: a complete JavaScript solution function string used only for validation',
  ].join('\n')
}

export function parseGeneratedProblemBundle(text) {
  const trimmed = text.trim()
  const jsonText = extractJsonText(trimmed)

  const parsed = JSON.parse(jsonText)

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Generated bundle must be a JSON object.')
  }

  const bundle = parsed

  if (
    !('problem' in bundle) ||
    !('referenceSolution' in bundle) ||
    typeof bundle.referenceSolution !== 'string'
  ) {
    throw new Error('Generated bundle must include problem and referenceSolution.')
  }

  return bundle
}

export function extractJsonText(text) {
  const codeFenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i)

  if (codeFenceMatch) {
    return codeFenceMatch[1].trim()
  }

  const firstBrace = text.indexOf('{')
  const lastBrace = text.lastIndexOf('}')

  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return text.slice(firstBrace, lastBrace + 1)
  }

  throw new Error('Could not find JSON content in model output.')
}

export function mergeGeneratedProblems(existingProblems, newProblem) {
  const nextProblems = existingProblems.filter(
    (problem) => problem.id !== newProblem.id,
  )

  nextProblems.push(newProblem)

  return nextProblems
}

export function validateCandidateProblem(candidate, baseProblemIds) {
  validateGeneratedProblemList([candidate], baseProblemIds)
}

export { problemSchema }
