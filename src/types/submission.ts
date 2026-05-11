import type { JudgeResult, JudgeResultStatus } from '../judge'

export type SubmissionRecord = {
  id: string
  problemId: string
  problemTitle: string
  code: string
  status: JudgeResultStatus
  passedCount: number
  totalCount: number
  durationMs: number
  result: JudgeResult
  submittedAt: number
}
