import type { Problem, ProblemStatus } from '../types/problem'
import type { SubmissionRecord } from '../types/submission'

export type ProblemListRow = Problem & {
  status: ProblemStatus
}

function normalizeQuery(query: string) {
  return query.trim().toLowerCase()
}

export function getProblemStatus(
  problemId: string,
  submissions: SubmissionRecord[],
): ProblemStatus {
  const problemSubmissions = submissions.filter(
    (submission) => submission.problemId === problemId,
  )

  if (problemSubmissions.length === 0) {
    return '未开始'
  }

  if (problemSubmissions.some((submission) => submission.status === 'accepted')) {
    return '已通过'
  }

  return '已尝试'
}

export function matchesProblemSearch(problem: Problem, query: string) {
  const normalizedQuery = normalizeQuery(query)

  if (!normalizedQuery) {
    return true
  }

  return [
    problem.id,
    problem.title,
    problem.difficulty,
    problem.statement,
    problem.functionName,
    ...problem.tags,
  ].some((value) => value.toLowerCase().includes(normalizedQuery))
}

export function buildProblemRows(
  problems: Problem[],
  submissions: SubmissionRecord[],
  query: string,
): ProblemListRow[] {
  return problems
    .filter((problem) => matchesProblemSearch(problem, query))
    .map((problem) => ({
      ...problem,
      status: getProblemStatus(problem.id, submissions),
    }))
}
