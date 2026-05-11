import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { SubmissionRecord } from '../src/types/submission'

const submissionStorage = vi.hoisted(() => ({
  listSubmissions: vi.fn(),
  saveSubmission: vi.fn(),
  getSubmission: vi.fn(),
}))

vi.mock('../src/db/submissionStorage', () => ({
  indexedDbSubmissionStorage: submissionStorage,
}))

import { useSubmissions } from '../src/hooks/useSubmissions'

const baseSubmission: SubmissionRecord = {
  id: 'request-1',
  problemId: 'two-sum',
  problemTitle: 'Two Sum',
  code: 'code-1',
  status: 'accepted',
  passedCount: 4,
  totalCount: 4,
  durationMs: 12,
  result: {
    requestId: 'request-1',
    problemId: 'two-sum',
    mode: 'submit',
    status: 'accepted',
    passedCount: 4,
    totalCount: 4,
    durationMs: 12,
    cases: [],
  },
  submittedAt: 100,
}

describe('useSubmissions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads submissions for a problem and refreshes on demand', async () => {
    const nextSubmission: SubmissionRecord = {
      ...baseSubmission,
      id: 'request-2',
      code: 'code-2',
      submittedAt: 200,
    }

    submissionStorage.listSubmissions
      .mockResolvedValueOnce([baseSubmission])
      .mockResolvedValueOnce([nextSubmission])

    const { result, rerender } = renderHook(
      ({ refreshKey }) => useSubmissions('two-sum', refreshKey),
      {
        initialProps: {
          refreshKey: 0,
        },
      },
    )

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.submissions).toEqual([baseSubmission])

    rerender({ refreshKey: 1 })

    await waitFor(() => expect(result.current.submissions).toEqual([nextSubmission]))
  })

  it('exposes errors from the storage adapter', async () => {
    submissionStorage.listSubmissions.mockRejectedValueOnce(new Error('boom'))

    const { result } = renderHook(() => useSubmissions())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.error).toBe('boom')
  })
})
