import type { Problem, TestCase } from '../types/problem'
import type { JudgeRequest, JudgeRunMode, JudgeTestCase } from './types'

function toJudgeTestCase(
  testCase: TestCase,
  visibility: JudgeTestCase['visibility'],
): JudgeTestCase {
  return {
    id: testCase.id,
    input: testCase.input,
    expected: testCase.expected,
    description: testCase.description,
    visibility,
  }
}

export function getJudgeTests(problem: Problem, mode: JudgeRunMode) {
  const visibleTests = problem.visibleTests.map((testCase) =>
    toJudgeTestCase(testCase, 'visible'),
  )

  if (mode === 'run') {
    return visibleTests
  }

  return [
    ...visibleTests,
    ...problem.hiddenTests.map((testCase) =>
      toJudgeTestCase(testCase, 'hidden'),
    ),
  ]
}

export function createJudgeRequest(
  problem: Problem,
  code: string,
  mode: JudgeRunMode,
  requestId = crypto.randomUUID(),
): JudgeRequest {
  return {
    requestId,
    mode,
    problemId: problem.id,
    functionName: problem.functionName,
    code,
    tests: getJudgeTests(problem, mode),
    timeLimitMs: problem.timeLimitMs,
    memoryLimitBytes: problem.memoryLimitBytes,
  }
}
