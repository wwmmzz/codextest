import { describe, expect, it } from 'vitest'
import {
  createCodeDraft,
  loadInitialCode,
  saveCodeDraft,
  type DraftStorage,
} from '../src/services/drafts'
import type { CodeDraft } from '../src/types/draft'

function createMemoryDraftStorage(initialDrafts: CodeDraft[] = []): DraftStorage {
  const drafts = new Map(
    initialDrafts.map((draft) => [draft.problemId, draft]),
  )

  return {
    async getDraft(problemId) {
      return drafts.get(problemId)
    },

    async saveDraft(draft) {
      drafts.set(draft.problemId, draft)
    },

    async deleteDraft(problemId) {
      drafts.delete(problemId)
    },
  }
}

describe('draft services', () => {
  it('creates a timestamped draft record for a problem', () => {
    const draft = createCodeDraft('two-sum', 'function twoSum() {}', () => 123)

    expect(draft).toEqual({
      problemId: 'two-sum',
      code: 'function twoSum() {}',
      updatedAt: 123,
    })
  })

  it('loads starter code when no saved draft exists', async () => {
    const storage = createMemoryDraftStorage()

    await expect(
      loadInitialCode(storage, 'two-sum', 'starter code'),
    ).resolves.toEqual({
      code: 'starter code',
      source: 'starter',
    })
  })

  it('loads saved draft code before starter code', async () => {
    const storage = createMemoryDraftStorage([
      {
        problemId: 'two-sum',
        code: 'saved draft',
        updatedAt: 123,
      },
    ])

    await expect(
      loadInitialCode(storage, 'two-sum', 'starter code'),
    ).resolves.toEqual({
      code: 'saved draft',
      source: 'draft',
    })
  })

  it('saves drafts through the storage adapter', async () => {
    const storage = createMemoryDraftStorage()

    await saveCodeDraft(storage, 'two-sum', 'new code', () => 456)

    await expect(storage.getDraft('two-sum')).resolves.toEqual({
      problemId: 'two-sum',
      code: 'new code',
      updatedAt: 456,
    })
  })
})
