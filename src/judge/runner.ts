import type {
  JudgeCaseResult,
  JudgeRequest,
  JudgeResult,
  JudgeResultStatus,
  JudgeTestCase,
} from './types'

export type JudgeCaseExecutor = (
  request: JudgeRequest,
  testCase: JudgeTestCase,
) => Promise<JudgeCaseResult>

function getResultStatus(caseResult: JudgeCaseResult): JudgeResultStatus {
  switch (caseResult.status) {
    case 'passed':
      return 'accepted'
    case 'failed':
      return 'wrong-answer'
    case 'runtime-error':
      return 'runtime-error'
    case 'time-limit-exceeded':
      return 'time-limit-exceeded'
  }
}

export async function runFirstTestCase(
  request: JudgeRequest,
  executeCase: JudgeCaseExecutor,
): Promise<JudgeResult> {
  const startedAt = performance.now()
  const testCase = request.tests[0]

  if (!testCase) {
    return {
      requestId: request.requestId,
      problemId: request.problemId,
      mode: request.mode,
      status: 'internal-error',
      passedCount: 0,
      totalCount: 0,
      durationMs: 0,
      cases: [],
    }
  }

  const caseResult = await executeCase(request, testCase)

  return {
    requestId: request.requestId,
    problemId: request.problemId,
    mode: request.mode,
    status: getResultStatus(caseResult),
    passedCount: caseResult.status === 'passed' ? 1 : 0,
    totalCount: 1,
    durationMs: Math.round(performance.now() - startedAt),
    cases: [caseResult],
  }
}
