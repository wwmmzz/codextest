import { describe, expect, it } from 'vitest'
import { baseProblems } from '../src/data/baseProblems'
import type { SubmissionRecord } from '../src/types/submission'
import {
  buildProblemRows,
  getProblemStatus,
  matchesProblemSearch,
} from '../src/pages/problemListHelpers'

const submissions: SubmissionRecord[] = [
  {
    id: 'request-1',
    problemId: baseProblems[0].id,
    problemTitle: baseProblems[0].title,
    code: 'code-1',
    status: 'accepted',
    passedCount: 4,
    totalCount: 4,
    durationMs: 12,
    result: {
      requestId: 'request-1',
      problemId: baseProblems[0].id,
      mode: 'submit',
      status: 'accepted',
      passedCount: 4,
      totalCount: 4,
      durationMs: 12,
      cases: [],
    },
    submittedAt: 100,
  },
  {
    id: 'request-2',
    problemId: baseProblems[1].id,
    problemTitle: baseProblems[1].title,
    code: 'code-2',
    status: 'wrong-answer',
    passedCount: 1,
    totalCount: 4,
    durationMs: 18,
    result: {
      requestId: 'request-2',
      problemId: baseProblems[1].id,
      mode: 'submit',
      status: 'wrong-answer',
      passedCount: 1,
      totalCount: 4,
      durationMs: 18,
      cases: [],
    },
    submittedAt: 200,
  },
]

describe('problem list helpers', () => {
  it('derives problem status from local submissions', () => {
    expect(getProblemStatus(baseProblems[0].id, submissions)).toBe('已通过')
    expect(getProblemStatus(baseProblems[1].id, submissions)).toBe('已尝试')
    expect(getProblemStatus('missing-problem', submissions)).toBe('未开始')
  })

  it('matches query against ids, titles, tags, and function names', () => {
    expect(matchesProblemSearch(baseProblems[0], baseProblems[0].title)).toBe(
      true,
    )
    expect(matchesProblemSearch(baseProblems[0], baseProblems[0].id)).toBe(true)
    expect(matchesProblemSearch(baseProblems[0], baseProblems[0].functionName)).toBe(
      true,
    )
    expect(matchesProblemSearch(baseProblems[0], 'does-not-match')).toBe(false)
  })

  it('builds filtered rows with computed status', () => {
    const rows = buildProblemRows(baseProblems, submissions, 'two-sum')

    expect(rows).toHaveLength(1)
    expect(rows[0]?.id).toBe(baseProblems[0].id)
    expect(rows.find((row) => row.id === baseProblems[0].id)?.status).toBe(
      '已通过',
    )
  })
})
