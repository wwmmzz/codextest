import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const draftStorage = vi.hoisted(() => ({
  getDraft: vi.fn(),
  saveDraft: vi.fn(),
  deleteDraft: vi.fn(),
}))

vi.mock('../src/db/draftStorage', () => ({
  indexedDbDraftStorage: draftStorage,
}))

import { useProblemDraft } from '../src/hooks/useProblemDraft'

describe('useProblemDraft', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
  })

  it('loads saved draft code before starter code', async () => {
    draftStorage.getDraft.mockResolvedValue({
      problemId: 'two-sum',
      code: 'saved draft',
      updatedAt: 123,
    })

    const { result } = renderHook(() =>
      useProblemDraft('two-sum', 'starter code'),
    )

    await waitFor(() => expect(result.current.status).toBe('idle'))

    expect(result.current.code).toBe('saved draft')
  })

  it('autosaves updated code after the debounce delay', async () => {
    draftStorage.getDraft.mockResolvedValue(undefined)
    draftStorage.saveDraft.mockResolvedValue(undefined)

    const { result } = renderHook(() =>
      useProblemDraft('two-sum', 'starter code'),
    )

    await waitFor(() => expect(result.current.status).toBe('idle'))

    vi.useFakeTimers()

    try {
      act(() => {
        result.current.setCode('new code')
      })

      expect(result.current.status).toBe('saving')

      await act(async () => {
        await vi.advanceTimersByTimeAsync(500)
      })

      expect(result.current.status).toBe('saved')

      expect(draftStorage.saveDraft).toHaveBeenCalledWith({
        problemId: 'two-sum',
        code: 'new code',
        updatedAt: expect.any(Number),
      })
    } finally {
      vi.useRealTimers()
    }
  })
})
