import { getQuickJS, shouldInterruptAfterDeadline } from 'quickjs-emscripten'
import { deepEqual } from './compare'
import type { JudgeCaseResult, JudgeRequest, JudgeTestCase } from './types'

const IDENTIFIER_PATTERN = /^[A-Za-z_$][\w$]*$/

function formatError(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  return 'Unknown execution error'
}

function isTimeLimitError(error: unknown) {
  if (
    typeof error !== 'object' ||
    error === null ||
    !('name' in error) ||
    !('message' in error) ||
    typeof error.name !== 'string' ||
    typeof error.message !== 'string'
  ) {
    return false
  }

  return (
    error.name === 'InternalError' &&
    error.message.toLowerCase().includes('interrupted')
  )
}

export function buildSingleCaseScript(
  code: string,
  functionName: string,
  input: unknown[],
) {
  if (!IDENTIFIER_PATTERN.test(functionName)) {
    throw new Error(`Invalid function name: ${functionName}`)
  }

  const serializedInput = JSON.stringify(input)

  return `
${code}

const __judgeInput = JSON.parse(${JSON.stringify(serializedInput)});
const __judgeTarget = ${functionName};

if (typeof __judgeTarget !== "function") {
  throw new TypeError("Expected ${functionName} to be a function");
}

__judgeTarget(...__judgeInput);
`
}

export async function executeQuickJsTestCase(
  request: JudgeRequest,
  testCase: JudgeTestCase,
): Promise<JudgeCaseResult> {
  const quickJs = await getQuickJS()
  const startedAt = performance.now()

  try {
    const actual = quickJs.evalCode(
      buildSingleCaseScript(request.code, request.functionName, testCase.input),
      {
        memoryLimitBytes: request.memoryLimitBytes,
        shouldInterrupt: shouldInterruptAfterDeadline(
          Date.now() + request.timeLimitMs,
        ),
      },
    )
    const durationMs = Math.round(performance.now() - startedAt)
    const isPassed = deepEqual(actual, testCase.expected)

    return {
      testCaseId: testCase.id,
      status: isPassed ? 'passed' : 'failed',
      durationMs,
      input: testCase.input,
      expected: testCase.expected,
      actual,
    }
  } catch (error) {
    const durationMs = Math.round(performance.now() - startedAt)

    return {
      testCaseId: testCase.id,
      status: isTimeLimitError(error) ? 'time-limit-exceeded' : 'runtime-error',
      durationMs,
      input: testCase.input,
      expected: testCase.expected,
      error: formatError(error),
    }
  }
}
