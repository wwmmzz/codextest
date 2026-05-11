import { describe, expect, it } from 'vitest'
import { createJudgeRequest, getJudgeTests } from '../src/judge'
import { problems } from '../src/data/problems'

const problem = problems[0]

describe('getJudgeTests', () => {
  it('uses only visible tests for run mode', () => {
    const tests = getJudgeTests(problem, 'run')

    expect(tests).toHaveLength(problem.visibleTests.length)
    expect(tests.every((testCase) => testCase.visibility === 'visible')).toBe(
      true,
    )
  })

  it('uses visible and hidden tests for submit mode', () => {
    const tests = getJudgeTests(problem, 'submit')

    expect(tests).toHaveLength(
      problem.visibleTests.length + problem.hiddenTests.length,
    )
    expect(tests.map((testCase) => testCase.visibility)).toEqual([
      ...problem.visibleTests.map(() => 'visible'),
      ...problem.hiddenTests.map(() => 'hidden'),
    ])
  })
})

describe('createJudgeRequest', () => {
  it('builds a judge request from problem metadata and current code', () => {
    const request = createJudgeRequest(
      problem,
      'function twoSum() { return [0, 1] }',
      'run',
      'request-1',
    )

    expect(request).toMatchObject({
      requestId: 'request-1',
      mode: 'run',
      problemId: problem.id,
      functionName: problem.functionName,
      code: 'function twoSum() { return [0, 1] }',
      timeLimitMs: problem.timeLimitMs,
      memoryLimitBytes: problem.memoryLimitBytes,
    })
    expect(request.tests).toHaveLength(problem.visibleTests.length)
  })
})
