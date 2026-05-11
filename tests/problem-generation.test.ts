import { describe, expect, it } from 'vitest'
import { baseProblems } from '../src/data/baseProblems'
import {
  buildProblemPrompt,
  extractJsonText,
  mergeGeneratedProblems,
  parseGeneratedProblemBundle,
} from '../scripts/problemGeneration.mjs'

describe('problem generation helpers', () => {
  it('builds a prompt that references existing problems', () => {
    const prompt = buildProblemPrompt({
      cadence: 'daily',
      difficulty: 'Easy',
      baseProblemSummaries: baseProblems.slice(0, 2).map((problem) => ({
        id: problem.id,
        title: problem.title,
        difficulty: problem.difficulty,
        functionName: problem.functionName,
      })),
      generatedProblemSummaries: [
        {
          id: 'generated-1',
          title: 'Generated One',
          difficulty: 'Medium',
          functionName: 'generatedOne',
        },
      ],
    })

    expect(prompt).toContain('Generate exactly one new daily coding practice problem.')
    expect(prompt).toContain('two-sum: Two Sum')
    expect(prompt).toContain('generated-1: Generated One')
    expect(prompt).toContain('referenceSolution')
  })

  it('parses a generated problem bundle from raw json text', () => {
    const bundle = parseGeneratedProblemBundle(
      JSON.stringify({
        problem: baseProblems[0],
        referenceSolution: 'function twoSum() { return [0, 1] }',
      }),
    )

    expect(bundle.problem.id).toBe('two-sum')
    expect(bundle.referenceSolution).toContain('function twoSum')
  })

  it('extracts json from fenced or wrapped model output', () => {
    expect(extractJsonText('```json\n{"a":1}\n```')).toBe('{"a":1}')
    expect(extractJsonText('prefix {"a":1} suffix')).toBe('{"a":1}')
  })

  it('replaces generated problems with the same id', () => {
    const merged = mergeGeneratedProblems(
      [
        {
          ...baseProblems[0],
          id: 'generated-1',
        },
        {
          ...baseProblems[1],
          id: 'generated-2',
        },
      ],
      {
        ...baseProblems[2],
        id: 'generated-2',
        title: 'Replacement',
      },
    )

    expect(merged).toHaveLength(2)
    expect(merged.find((problem) => problem.id === 'generated-2')?.title).toBe(
      'Replacement',
    )
  })
})
