import { describe, expect, it } from 'vitest'
import { deepEqual } from '../src/judge'

describe('deepEqual', () => {
  it('matches primitive JSON values', () => {
    expect(deepEqual(1, 1)).toBe(true)
    expect(deepEqual('answer', 'answer')).toBe(true)
    expect(deepEqual(true, true)).toBe(true)
    expect(deepEqual(null, null)).toBe(true)
  })

  it('rejects different primitive values and types', () => {
    expect(deepEqual(1, 2)).toBe(false)
    expect(deepEqual('1', 1)).toBe(false)
    expect(deepEqual(false, null)).toBe(false)
  })

  it('matches nested arrays in order', () => {
    expect(deepEqual([1, [2, 3], null], [1, [2, 3], null])).toBe(true)
  })

  it('rejects arrays with different order or length', () => {
    expect(deepEqual([1, 2], [2, 1])).toBe(false)
    expect(deepEqual([1], [1, 2])).toBe(false)
  })

  it('matches object keys regardless of insertion order', () => {
    expect(
      deepEqual(
        { indexes: [0, 1], meta: { passed: true, count: 2 } },
        { meta: { count: 2, passed: true }, indexes: [0, 1] },
      ),
    ).toBe(true)
  })

  it('rejects objects with missing, extra, or different nested values', () => {
    expect(deepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false)
    expect(deepEqual({ a: 1, b: 2 }, { a: 1 })).toBe(false)
    expect(deepEqual({ a: { b: 2 } }, { a: { b: 3 } })).toBe(false)
  })

  it('treats NaN values as equal for runtime results', () => {
    expect(deepEqual(Number.NaN, Number.NaN)).toBe(true)
  })
})
