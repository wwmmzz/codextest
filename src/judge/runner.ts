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

export async function runJudgeRequest(
  request: JudgeRequest,
  executeCase: JudgeCaseExecutor,
): Promise<JudgeResult> {
  const startedAt = performance.now()

  if (request.tests.length === 0) {
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

  const cases: JudgeCaseResult[] = []

  for (const testCase of request.tests) {
    cases.push(await executeCase(request, testCase))
  }

  const firstFailedCase = cases.find((caseResult) => caseResult.status !== 'passed')

  return {
    requestId: request.requestId,
    problemId: request.problemId,
    mode: request.mode,
    status: firstFailedCase ? getResultStatus(firstFailedCase) : 'accepted',
    passedCount: cases.filter((caseResult) => caseResult.status === 'passed').length,
    totalCount: request.tests.length,
    durationMs: Math.round(performance.now() - startedAt),
    cases,
  }
}
