import generatedProblemsJson from './generated/problems.generated.json?raw'
import { baseProblems } from './baseProblems'
import type { Difficulty, Problem } from '../types/problem'

export const difficultyColor: Record<Difficulty, string> = {
  Easy: 'green',
  Medium: 'gold',
  Hard: 'red',
}

function readGeneratedProblems(rawJson: string): Problem[] {
  if (!rawJson.trim()) {
    return []
  }

  const parsed = JSON.parse(rawJson) as unknown

  if (!Array.isArray(parsed)) {
    throw new Error('Generated problems file must contain a JSON array.')
  }

  return parsed as Problem[]
}

function dedupeProblems(problems: Problem[]) {
  const seen = new Set<string>()
  const deduped: Problem[] = []

  for (const problem of problems) {
    if (seen.has(problem.id)) {
      continue
    }

    seen.add(problem.id)
    deduped.push(problem)
  }

  return deduped
}

export const generatedProblems = readGeneratedProblems(generatedProblemsJson)

export const problems = dedupeProblems([...baseProblems, ...generatedProblems])

export function getProblemById(problemId: string | undefined) {
  return problems.find((problem) => problem.id === problemId)
}
