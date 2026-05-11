import { describe, expect, it } from 'vitest'
import {
  createSubmissionRecord,
  saveJudgeSubmission,
  type SubmissionStorage,
} from '../src/services/submissions'
import { problems } from '../src/data/problems'
import type { JudgeResult } from '../src/judge'
import type { SubmissionRecord } from '../src/types/submission'

const problem = problems[0]

const acceptedResult: JudgeResult = {
  requestId: 'request-1',
  problemId: problem.id,
  mode: 'submit',
  status: 'accepted',
  passedCount: 4,
  totalCount: 4,
  durationMs: 12,
  cases: [],
}

function createMemorySubmissionStorage(
  initialSubmissions: SubmissionRecord[] = [],
): SubmissionStorage {
  const submissions = new Map(
    initialSubmissions.map((submission) => [submission.id, submission]),
  )

  return {
    async saveSubmission(submission) {
      submissions.set(submission.id, submission)
    },

    async listSubmissions(problemId) {
      return Array.from(submissions.values())
        .filter((submission) => !problemId || submission.problemId === problemId)
        .sort((a, b) => b.submittedAt - a.submittedAt)
    },

    async getSubmission(id) {
      return submissions.get(id)
    },
  }
}

describe('submission services', () => {
  it('creates a submission record from problem, code, and judge result', () => {
    const submission = createSubmissionRecord(
      problem,
      'function twoSum() { return [0, 1] }',
      acceptedResult,
      () => 123,
    )

    expect(submission).toEqual({
      id: 'request-1',
      problemId: problem.id,
      problemTitle: problem.title,
      code: 'function twoSum() { return [0, 1] }',
      status: 'accepted',
      passedCount: 4,
      totalCount: 4,
      durationMs: 12,
      result: acceptedResult,
      submittedAt: 123,
    })
  })

  it('saves submission records through the storage adapter', async () => {
    const storage = createMemorySubmissionStorage()

    await saveJudgeSubmission(
      storage,
      problem,
      'function twoSum() { return [0, 1] }',
      acceptedResult,
      () => 456,
    )

    await expect(storage.getSubmission('request-1')).resolves.toMatchObject({
      id: 'request-1',
      problemId: problem.id,
      submittedAt: 456,
    })
  })

  it('lists newest submissions first and filters by problem', async () => {
    const storage = createMemorySubmissionStorage([
      createSubmissionRecord(problem, 'old', acceptedResult, () => 100),
      createSubmissionRecord(
        { ...problem, id: 'other-problem', title: 'Other Problem' },
        'other',
        { ...acceptedResult, requestId: 'request-2', problemId: 'other-problem' },
        () => 300,
      ),
      createSubmissionRecord(
        problem,
        'new',
        { ...acceptedResult, requestId: 'request-3' },
        () => 200,
      ),
    ])

    await expect(storage.listSubmissions(problem.id)).resolves.toMatchObject([
      { id: 'request-3', submittedAt: 200 },
      { id: 'request-1', submittedAt: 100 },
    ])
  })
})
