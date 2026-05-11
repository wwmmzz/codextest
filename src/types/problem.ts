export type Difficulty = 'Easy' | 'Medium' | 'Hard'

export type ProblemStatus = '未开始' | '已尝试' | '已通过'

export type TestCase = {
  id: string
  input: unknown[]
  expected: unknown
  description?: string
}

export type Example = {
  input: string
  output: string
  explanation?: string
}

export type Problem = {
  id: string
  title: string
  difficulty: Difficulty
  tags: string[]
  statement: string
  examples: Example[]
  constraints: string[]
  starterCode: string
  functionName: string
  timeLimitMs: number
  memoryLimitBytes: number
  visibleTests: TestCase[]
  hiddenTests: TestCase[]
}
