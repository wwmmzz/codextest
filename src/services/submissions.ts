import type { JudgeResult } from '../judge'
import type { Problem } from '../types/problem'
import type { SubmissionRecord } from '../types/submission'

export type SubmissionStorage = {
  saveSubmission(submission: SubmissionRecord): Promise<void>
  listSubmissions(problemId?: string): Promise<SubmissionRecord[]>
  getSubmission(id: string): Promise<SubmissionRecord | undefined>
}

export function createSubmissionRecord(
  problem: Problem,
  code: string,
  result: JudgeResult,
  now = Date.now,
): SubmissionRecord {
  return {
    id: result.requestId,
    problemId: problem.id,
    problemTitle: problem.title,
    code,
    status: result.status,
    passedCount: result.passedCount,
    totalCount: result.totalCount,
    durationMs: result.durationMs,
    result,
    submittedAt: now(),
  }
}

export async function saveJudgeSubmission(
  storage: Pick<SubmissionStorage, 'saveSubmission'>,
  problem: Problem,
  code: string,
  result: JudgeResult,
  now = Date.now,
) {
  await storage.saveSubmission(createSubmissionRecord(problem, code, result, now))
}
