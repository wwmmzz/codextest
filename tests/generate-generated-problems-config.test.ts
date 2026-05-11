import { describe, expect, it } from 'vitest'
import {
  parseArgs,
  resolveCredential,
  resolveGenerationConfig,
} from '../scripts/generate-generated-problems.shared.mjs'

describe('generate generated problems config', () => {
  it('parses explicit CLI arguments', () => {
    expect(
      parseArgs(
        [
          '--api-key',
          'key-123',
          '--base-url',
          'https://example.com',
          '--model',
          'gpt-5.5',
          '--cadence',
          'weekly',
          '--difficulty',
          'Medium',
          '--output',
          'custom.json',
        ],
        { output: 'default.json' },
      ),
    ).toEqual({
      apiKey: 'key-123',
      baseUrl: 'https://example.com',
      model: 'gpt-5.5',
      cadence: 'weekly',
      difficulty: 'Medium',
      output: 'custom.json',
    })
  })

  it('falls back to env vars and default values', () => {
    const config = resolveGenerationConfig({
      argv: [],
      env: {
        OPENAI_API_KEY: 'env-key',
        OPENAI_BASE_URL: 'https://api.example.com',
        OPENAI_MODEL: 'gpt-5.4',
      },
      defaults: {
        output: 'generated.json',
      },
    })

    expect(config).toMatchObject({
      apiKey: 'env-key',
      baseUrl: 'https://api.example.com',
      model: 'gpt-5.4',
      cadence: 'daily',
      difficulty: 'Easy',
      args: {
        output: 'generated.json',
      },
    })
  })

  it('prefers the first non-empty credential', () => {
    expect(resolveCredential(' ', undefined, '  api-key  ', 'fallback')).toBe(
      'api-key',
    )
  })
})
