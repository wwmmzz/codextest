function isRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  )
}

export function deepEqual(actual: unknown, expected: unknown): boolean {
  if (actual === expected) {
    return true
  }

  if (
    typeof actual === 'number' &&
    typeof expected === 'number' &&
    Number.isNaN(actual) &&
    Number.isNaN(expected)
  ) {
    return true
  }

  if (Array.isArray(actual) || Array.isArray(expected)) {
    if (!Array.isArray(actual) || !Array.isArray(expected)) {
      return false
    }

    if (actual.length !== expected.length) {
      return false
    }

    return actual.every((actualItem, index) =>
      deepEqual(actualItem, expected[index]),
    )
  }

  if (isRecord(actual) || isRecord(expected)) {
    if (!isRecord(actual) || !isRecord(expected)) {
      return false
    }

    const actualKeys = Object.keys(actual)
    const expectedKeys = Object.keys(expected)

    if (actualKeys.length !== expectedKeys.length) {
      return false
    }

    return expectedKeys.every((key) =>
      Object.hasOwn(actual, key) && deepEqual(actual[key], expected[key]),
    )
  }

  return false
}
