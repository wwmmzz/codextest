import { describe, expect, it } from 'vitest'
import { runJudgeRequest, type JudgeCaseExecutor } from '../src/judge'
import type { JudgeRequest } from '../src/judge'

const baseRequest: JudgeRequest = {
  requestId: 'request-1',
  mode: 'run',
  problemId: 'two-sum',
  functionName: 'twoSum',
  code: 'function twoSum(nums, target) { return [0, 1] }',
  tests: [
    {
      id: 'visible-1',
      input: [[2, 7, 11, 15], 9],
      expected: [0, 1],
      visibility: 'visible',
    },
    {
      id: 'hidden-1',
      input: [[3, 2, 4], 6],
      expected: [1, 2],
      visibility: 'hidden',
    },
  ],
  timeLimitMs: 1000,
  memoryLimitBytes: 16 * 1024 * 1024,
}

describe('runJudgeRequest', () => {
  it('summarizes passing test cases', async () => {
    const executeCase: JudgeCaseExecutor = async (_, testCase) => ({
      testCaseId: testCase.id,
      status: 'passed',
      durationMs: 3,
      actual: testCase.expected,
      expected: testCase.expected,
    })

    const result = await runJudgeRequest(baseRequest, executeCase)

    expect(result).toMatchObject({
      requestId: 'request-1',
      problemId: 'two-sum',
      mode: 'run',
      status: 'accepted',
      passedCount: 2,
      totalCount: 2,
      cases: [
        {
          testCaseId: 'visible-1',
          status: 'passed',
        },
        {
          testCaseId: 'hidden-1',
          status: 'passed',
        },
      ],
    })
  })

  it('summarizes mixed results using the first failing case status', async () => {
    const executeCase: JudgeCaseExecutor = async (_, testCase) => ({
      testCaseId: testCase.id,
      status: testCase.id === 'hidden-1' ? 'failed' : 'passed',
      durationMs: 2,
      actual: testCase.id === 'hidden-1' ? [0, 1] : testCase.expected,
      expected: testCase.expected,
    })

    const result = await runJudgeRequest(baseRequest, executeCase)

    expect(result.status).toBe('wrong-answer')
    expect(result.passedCount).toBe(1)
    expect(result.totalCount).toBe(2)
    expect(result.cases).toHaveLength(2)
  })

  it('uses runtime error status when runtime error is the first failure', async () => {
    const executeCase: JudgeCaseExecutor = async (_, testCase) => ({
      testCaseId: testCase.id,
      status: testCase.id === 'visible-1' ? 'runtime-error' : 'failed',
      durationMs: 2,
      expected: testCase.expected,
      error: testCase.id === 'visible-1' ? 'boom' : undefined,
    })

    const result = await runJudgeRequest(baseRequest, executeCase)

    expect(result.status).toBe('runtime-error')
    expect(result.passedCount).toBe(0)
    expect(result.totalCount).toBe(2)
  })

  it('uses time limit status when time limit exceeded is the first failure', async () => {
    const executeCase: JudgeCaseExecutor = async (_, testCase) => ({
      testCaseId: testCase.id,
      status: testCase.id === 'visible-1' ? 'time-limit-exceeded' : 'passed',
      durationMs: 1000,
      expected: testCase.expected,
    })

    const result = await runJudgeRequest(baseRequest, executeCase)

    expect(result.status).toBe('time-limit-exceeded')
    expect(result.passedCount).toBe(1)
    expect(result.totalCount).toBe(2)
  })

  it('returns an internal error result when a request has no tests', async () => {
    const executeCase: JudgeCaseExecutor = async () => {
      throw new Error('should not execute')
    }

    const result = await runJudgeRequest(
      {
        ...baseRequest,
        tests: [],
      },
      executeCase,
    )

    expect(result).toMatchObject({
      status: 'internal-error',
      passedCount: 0,
      totalCount: 0,
      cases: [],
    })
  })
})
