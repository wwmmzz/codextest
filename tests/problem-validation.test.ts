import { afterEach, describe, expect, it } from 'vitest'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {
  readBaseProblemIds,
  validateGeneratedProblemList,
} from '../scripts/problemValidation.mjs'
import { baseProblems } from '../src/data/baseProblems'

afterEach(() => {
  // no-op placeholder for future temp files
})

describe('problem validation', () => {
  it('accepts a valid generated problem list', () => {
    expect(() =>
      validateGeneratedProblemList([], baseProblems.map((problem) => problem.id)),
    ).not.toThrow()
  })

  it('rejects duplicate ids and malformed problems', () => {
    expect(() =>
      validateGeneratedProblemList(
        [
          {
            ...baseProblems[0],
            id: 'two-sum',
          },
          {
            id: 'generated-1',
            title: '',
            difficulty: 'Extreme',
            tags: [],
            statement: '',
            examples: [],
            constraints: [],
            starterCode: 'function generated() {}',
            functionName: 'generated',
            timeLimitMs: 0,
            memoryLimitBytes: 0,
            visibleTests: [],
            hiddenTests: [],
          },
        ],
        baseProblems.map((problem) => problem.id),
      ),
    ).toThrowError(/validation failed/)
  })

  it('reads base problem ids from the TypeScript source file', async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'problem-ids-'))
    const tempFile = path.join(tempDir, 'baseProblems.ts')

    await fs.writeFile(
      tempFile,
      `export const baseProblems = [
        { id: 'alpha' },
        { id: 'beta' },
      ]`,
    )

    await expect(readBaseProblemIds(tempFile)).resolves.toEqual([
      'alpha',
      'beta',
    ])
  })
})
