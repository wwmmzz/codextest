import Dexie, { type Table } from 'dexie'
import type { CodeDraft } from '../types/draft'

class AppDatabase extends Dexie {
  codeDrafts!: Table<CodeDraft, string>

  constructor() {
    super('ai-judge')

    this.version(1).stores({
      codeDrafts: 'problemId, updatedAt',
    })
  }
}

export const appDb = new AppDatabase()
