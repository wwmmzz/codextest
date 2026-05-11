import { useEffect, useRef, useState } from 'react'
import { indexedDbDraftStorage } from '../db/draftStorage'
import { loadInitialCode, saveCodeDraft } from '../services/drafts'

const AUTOSAVE_DELAY_MS = 500

export type DraftSaveStatus = 'loading' | 'idle' | 'saving' | 'saved' | 'error'

export function useProblemDraft(problemId: string, starterCode: string) {
  const [code, setCode] = useState(starterCode)
  const [status, setStatus] = useState<DraftSaveStatus>('loading')
  const [isReady, setIsReady] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const editVersionRef = useRef(0)

  useEffect(() => {
    let isCurrent = true

    void loadInitialCode(indexedDbDraftStorage, problemId, starterCode)
      .then((result) => {
        if (!isCurrent) {
          return
        }

        setCode(result.code)
        setStatus('idle')
        setIsReady(true)
      })
      .catch(() => {
        if (!isCurrent) {
          return
        }

        setCode(starterCode)
        setStatus('error')
        setIsReady(true)
      })

    return () => {
      isCurrent = false
    }
  }, [problemId, starterCode])

  useEffect(() => {
    if (!isReady || !isDirty) {
      return
    }

    const saveVersion = editVersionRef.current
    const timeoutId = window.setTimeout(() => {
      void saveCodeDraft(indexedDbDraftStorage, problemId, code)
        .then(() => {
          if (saveVersion === editVersionRef.current) {
            setStatus('saved')
            setIsDirty(false)
          }
        })
        .catch(() => {
          if (saveVersion === editVersionRef.current) {
            setStatus('error')
          }
        })
    }, AUTOSAVE_DELAY_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [code, isDirty, isReady, problemId])

  function updateCode(nextCode: string) {
    editVersionRef.current += 1
    setCode(nextCode)
    setIsDirty(true)
    setStatus('saving')
  }

  return {
    code,
    setCode: updateCode,
    status,
  }
}
