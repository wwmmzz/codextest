import { appDb } from './appDb'
import type { SubmissionStorage } from '../services/submissions'

export const indexedDbSubmissionStorage: SubmissionStorage = {
  async saveSubmission(submission) {
    await appDb.submissions.put(submission)
  },

  async listSubmissions(problemId) {
    if (problemId) {
      const submissions = await appDb.submissions
        .where('problemId')
        .equals(problemId)
        .toArray()

      return submissions.sort((a, b) => b.submittedAt - a.submittedAt)
    }

    return appDb.submissions.orderBy('submittedAt').reverse().toArray()
  },

  getSubmission(id) {
    return appDb.submissions.get(id)
  },
}
