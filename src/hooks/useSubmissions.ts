import { useCallback, useEffect, useState } from 'react'
import { indexedDbSubmissionStorage } from '../db/submissionStorage'
import type { SubmissionRecord } from '../types/submission'

export type SubmissionHistoryState = {
  submissions: SubmissionRecord[]
  loading: boolean
  error: string | null
  reload: () => void
}

export function useSubmissions(
  problemId?: string,
  refreshKey = 0,
): SubmissionHistoryState {
  const [reloadKey, setReloadKey] = useState(0)
  const requestKey = `${problemId ?? 'all'}:${refreshKey}:${reloadKey}`
  const [state, setState] = useState<{
    requestKey: string | null
    submissions: SubmissionRecord[]
    error: string | null
  }>({
    requestKey: null,
    submissions: [],
    error: null,
  })

  const reload = useCallback(() => {
    setReloadKey((current) => current + 1)
  }, [])

  useEffect(() => {
    let isActive = true

    indexedDbSubmissionStorage
      .listSubmissions(problemId)
      .then((records) => {
        if (!isActive) {
          return
        }

        setState({
          requestKey,
          submissions: records,
          error: null,
        })
      })
      .catch((caughtError: unknown) => {
        if (!isActive) {
          return
        }

        setState({
          requestKey,
          submissions: [],
          error:
            caughtError instanceof Error
              ? caughtError.message
              : '读取提交记录失败',
        })
      })

    return () => {
      isActive = false
    }
  }, [problemId, requestKey])

  const loading = state.requestKey !== requestKey

  return {
    submissions: state.submissions,
    loading,
    error: loading ? null : state.error,
    reload,
  }
}
