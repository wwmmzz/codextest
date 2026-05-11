import { describe, expect, it } from 'vitest'
import { buildSingleCaseScript, executeQuickJsTestCase } from '../src/judge'
import type { JudgeRequest, JudgeTestCase } from '../src/judge'

const baseTestCase: JudgeTestCase = {
  id: 'case-1',
  input: [[2, 7, 11, 15], 9],
  expected: [0, 1],
  visibility: 'visible',
}

function createRequest(code: string): JudgeRequest {
  return {
    requestId: 'request-1',
    mode: 'run',
    problemId: 'two-sum',
    functionName: 'twoSum',
    code,
    tests: [baseTestCase],
    timeLimitMs: 1000,
    memoryLimitBytes: 16 * 1024 * 1024,
  }
}

describe('buildSingleCaseScript', () => {
  it('rejects unsafe function names', () => {
    expect(() =>
      buildSingleCaseScript('function twoSum() {}', 'twoSum;alert(1)', []),
    ).toThrow('Invalid function name')
  })
})

describe('executeQuickJsTestCase', () => {
  it('runs a passing JavaScript function in QuickJS', async () => {
    const result = await executeQuickJsTestCase(
      createRequest(
        'function twoSum(nums, target) { return [0, nums.indexOf(target - nums[0])] }',
      ),
      baseTestCase,
    )

    expect(result).toMatchObject({
      testCaseId: 'case-1',
      status: 'passed',
      actual: [0, 1],
      expected: [0, 1],
    })
  })

  it('marks mismatched output as failed', async () => {
    const result = await executeQuickJsTestCase(
      createRequest('function twoSum() { return [1, 0] }'),
      baseTestCase,
    )

    expect(result.status).toBe('failed')
    expect(result.actual).toEqual([1, 0])
  })

  it('captures runtime errors', async () => {
    const result = await executeQuickJsTestCase(
      createRequest('function twoSum() { throw new Error("boom") }'),
      baseTestCase,
    )

    expect(result.status).toBe('runtime-error')
    expect(result.error).toContain('boom')
  })
})
