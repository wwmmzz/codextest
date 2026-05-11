export type JudgeRunMode = 'run' | 'submit'

export type JudgeTestVisibility = 'visible' | 'hidden'

export type JudgeTestCase = {
  id: string
  input: unknown[]
  expected: unknown
  visibility: JudgeTestVisibility
  description?: string
}

export type JudgeRequest = {
  requestId: string
  mode: JudgeRunMode
  problemId: string
  functionName: string
  code: string
  tests: JudgeTestCase[]
  timeLimitMs: number
  memoryLimitBytes: number
}

export type JudgeCaseStatus =
  | 'passed'
  | 'failed'
  | 'runtime-error'
  | 'time-limit-exceeded'

export type JudgeCaseResult = {
  testCaseId: string
  status: JudgeCaseStatus
  durationMs: number
  input?: unknown[]
  expected?: unknown
  actual?: unknown
  error?: string
}

export type JudgeResultStatus =
  | 'accepted'
  | 'wrong-answer'
  | 'runtime-error'
  | 'time-limit-exceeded'
  | 'internal-error'

export type JudgeResult = {
  requestId: string
  problemId: string
  mode: JudgeRunMode
  status: JudgeResultStatus
  passedCount: number
  totalCount: number
  durationMs: number
  cases: JudgeCaseResult[]
}

export type JudgeWorkerMessage =
  | {
      type: 'judge-request'
      request: JudgeRequest
    }
  | {
      type: 'cancel'
      requestId: string
    }

export type JudgeWorkerResponse =
  | {
      type: 'judge-result'
      result: JudgeResult
    }
  | {
      type: 'judge-error'
      requestId: string
      error: string
    }
