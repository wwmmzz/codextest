export function resolveCredential(...candidates) {
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim()
    }
  }

  return undefined
}

export function parseArgs(argv, defaults = {}) {
  const args = {
    apiKey: undefined,
    baseUrl: undefined,
    model: undefined,
    cadence: undefined,
    difficulty: undefined,
    output: defaults.output,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index]

    if (current === '--api-key') {
      args.apiKey = argv[++index]
      continue
    }

    if (current === '--base-url') {
      args.baseUrl = argv[++index]
      continue
    }

    if (current === '--model') {
      args.model = argv[++index]
      continue
    }

    if (current === '--cadence') {
      args.cadence = argv[++index]
      continue
    }

    if (current === '--difficulty') {
      args.difficulty = argv[++index]
      continue
    }

    if (current === '--output') {
      args.output = argv[++index] ?? defaults.output
    }
  }

  return args
}

export function resolveGenerationConfig({
  argv,
  env,
  defaults = {},
}) {
  const args = parseArgs(argv, defaults)

  return {
    args,
    apiKey: resolveCredential(
      args.apiKey,
      env.OPENAI_API_KEY,
      env.AI_API_KEY,
      env.API_KEY,
    ),
    baseUrl: resolveCredential(
      args.baseUrl,
      env.OPENAI_BASE_URL,
      env.AI_BASE_URL,
      env.API_BASE_URL,
    ),
    model:
      resolveCredential(
        args.model,
        env.OPENAI_MODEL,
        env.AI_MODEL,
        env.MODEL,
      ) ?? 'gpt-5.5',
    cadence:
      resolveCredential(args.cadence, env.AI_CADENCE, env.CADENCE) ?? 'daily',
    difficulty:
      resolveCredential(
        args.difficulty,
        env.AI_DIFFICULTY,
        env.DIFFICULTY,
      ) ?? 'Easy',
  }
}
