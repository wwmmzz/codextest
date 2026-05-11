import Dexie, { type Table } from 'dexie'
import type { CodeDraft } from '../types/draft'
import type { SubmissionRecord } from '../types/submission'

class AppDatabase extends Dexie {
  codeDrafts!: Table<CodeDraft, string>
  submissions!: Table<SubmissionRecord, string>

  constructor() {
    super('ai-judge')

    this.version(1).stores({
      codeDrafts: 'problemId, updatedAt',
    })

    this.version(2).stores({
      codeDrafts: 'problemId, updatedAt',
      submissions: 'id, problemId, submittedAt, status',
    })
  }
}

export const appDb = new AppDatabase()
