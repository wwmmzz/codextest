import { describe, expect, it } from 'vitest'
import { runFirstTestCase, type JudgeCaseExecutor } from '../src/judge'
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
  ],
  timeLimitMs: 1000,
  memoryLimitBytes: 16 * 1024 * 1024,
}

describe('runFirstTestCase', () => {
  it('summarizes a passing first test case', async () => {
    const executeCase: JudgeCaseExecutor = async (_, testCase) => ({
      testCaseId: testCase.id,
      status: 'passed',
      durationMs: 3,
      actual: [0, 1],
      expected: [0, 1],
    })

    const result = await runFirstTestCase(baseRequest, executeCase)

    expect(result).toMatchObject({
      requestId: 'request-1',
      problemId: 'two-sum',
      mode: 'run',
      status: 'accepted',
      passedCount: 1,
      totalCount: 1,
      cases: [
        {
          testCaseId: 'visible-1',
          status: 'passed',
        },
      ],
    })
  })

  it('summarizes a failing first test case', async () => {
    const executeCase: JudgeCaseExecutor = async (_, testCase) => ({
      testCaseId: testCase.id,
      status: 'failed',
      durationMs: 2,
      actual: [1, 0],
      expected: [0, 1],
    })

    const result = await runFirstTestCase(baseRequest, executeCase)

    expect(result.status).toBe('wrong-answer')
    expect(result.passedCount).toBe(0)
    expect(result.totalCount).toBe(1)
  })

  it('returns an internal error result when a request has no tests', async () => {
    const executeCase: JudgeCaseExecutor = async () => {
      throw new Error('should not execute')
    }

    const result = await runFirstTestCase(
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
