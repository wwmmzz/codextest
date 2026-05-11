import type { CodeDraft } from '../types/draft'

export type DraftStorage = {
  getDraft(problemId: string): Promise<CodeDraft | undefined>
  saveDraft(draft: CodeDraft): Promise<void>
  deleteDraft(problemId: string): Promise<void>
}

export type InitialCodeResult = {
  code: string
  source: 'draft' | 'starter'
}

export function createCodeDraft(
  problemId: string,
  code: string,
  now = Date.now,
): CodeDraft {
  return {
    problemId,
    code,
    updatedAt: now(),
  }
}

export async function loadInitialCode(
  storage: Pick<DraftStorage, 'getDraft'>,
  problemId: string,
  starterCode: string,
): Promise<InitialCodeResult> {
  const draft = await storage.getDraft(problemId)

  if (!draft) {
    return {
      code: starterCode,
      source: 'starter',
    }
  }

  return {
    code: draft.code,
    source: 'draft',
  }
}

export async function saveCodeDraft(
  storage: Pick<DraftStorage, 'saveDraft'>,
  problemId: string,
  code: string,
  now = Date.now,
) {
  await storage.saveDraft(createCodeDraft(problemId, code, now))
}
