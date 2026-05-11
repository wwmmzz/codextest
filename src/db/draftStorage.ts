import { appDb } from './appDb'
import type { DraftStorage } from '../services/drafts'

export const indexedDbDraftStorage: DraftStorage = {
  getDraft(problemId) {
    return appDb.codeDrafts.get(problemId)
  },

  async saveDraft(draft) {
    await appDb.codeDrafts.put(draft)
  },

  async deleteDraft(problemId) {
    await appDb.codeDrafts.delete(problemId)
  },
}
