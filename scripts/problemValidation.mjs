import fs from 'node:fs/promises'
import * as ts from 'typescript'

const difficultyValues = new Set(['Easy', 'Medium', 'Hard'])
const identifierPattern = /^[A-Za-z_$][\w$]*$/

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function describePath(path) {
  return path || 'value'
}

function appendError(errors, path, message) {
  errors.push(`${describePath(path)}: ${message}`)
}

function validateString(value, path, errors) {
  if (typeof value !== 'string' || value.trim() === '') {
    appendError(errors, path, 'must be a non-empty string')
    return false
  }

  return true
}

function validateOptionalString(value, path, errors) {
  if (value === undefined) {
    return true
  }

  if (typeof value !== 'string') {
    appendError(errors, path, 'must be a string when provided')
    return false
  }

  return true
}

function validateArray(value, path, errors) {
  if (!Array.isArray(value)) {
    appendError(errors, path, 'must be an array')
    return false
  }

  return true
}

function validateTestCase(testCase, path, errors) {
  if (!isPlainObject(testCase)) {
    appendError(errors, path, 'must be an object')
    return
  }

  validateString(testCase.id, `${path}.id`, errors)
  validateArray(testCase.input, `${path}.input`, errors)

  if (testCase.expected === undefined) {
    appendError(errors, `${path}.expected`, 'must be present')
  }

  validateString(testCase.visibility, `${path}.visibility`, errors)
  if (
    testCase.visibility !== 'visible' &&
    testCase.visibility !== 'hidden'
  ) {
    appendError(
      errors,
      `${path}.visibility`,
      'must be either "visible" or "hidden"',
    )
  }

  validateOptionalString(testCase.description, `${path}.description`, errors)
}

function validateExample(example, path, errors) {
  if (!isPlainObject(example)) {
    appendError(errors, path, 'must be an object')
    return
  }

  validateString(example.input, `${path}.input`, errors)
  validateString(example.output, `${path}.output`, errors)
  validateOptionalString(example.explanation, `${path}.explanation`, errors)
}

function validateProblem(problem, path, errors) {
  if (!isPlainObject(problem)) {
    appendError(errors, path, 'must be an object')
    return
  }

  validateString(problem.id, `${path}.id`, errors)
  validateString(problem.title, `${path}.title`, errors)

  if (!difficultyValues.has(problem.difficulty)) {
    appendError(
      errors,
      `${path}.difficulty`,
      'must be one of Easy, Medium, or Hard',
    )
  }

  if (!validateArray(problem.tags, `${path}.tags`, errors)) {
    return
  }

  if (!problem.tags.every((tag) => typeof tag === 'string' && tag.trim())) {
    appendError(errors, `${path}.tags`, 'must contain only non-empty strings')
  }

  validateString(problem.statement, `${path}.statement`, errors)

  if (!validateArray(problem.examples, `${path}.examples`, errors)) {
    return
  }

  if (problem.examples.length === 0) {
    appendError(errors, `${path}.examples`, 'must include at least one example')
  }

  problem.examples.forEach((example, index) => {
    validateExample(example, `${path}.examples[${index}]`, errors)
  })

  if (!validateArray(problem.constraints, `${path}.constraints`, errors)) {
    return
  }

  if (
    !problem.constraints.every(
      (constraint) => typeof constraint === 'string' && constraint.trim(),
    )
  ) {
    appendError(
      errors,
      `${path}.constraints`,
      'must contain only non-empty strings',
    )
  }

  validateString(problem.starterCode, `${path}.starterCode`, errors)
  validateString(problem.functionName, `${path}.functionName`, errors)

  if (!identifierPattern.test(problem.functionName ?? '')) {
    appendError(
      errors,
      `${path}.functionName`,
      'must be a valid JavaScript identifier',
    )
  }

  if (
    typeof problem.starterCode === 'string' &&
    typeof problem.functionName === 'string' &&
    !problem.starterCode.includes(problem.functionName)
  ) {
    appendError(
      errors,
      `${path}.starterCode`,
      'must include the target function name',
    )
  }

  if (!Number.isInteger(problem.timeLimitMs) || problem.timeLimitMs <= 0) {
    appendError(
      errors,
      `${path}.timeLimitMs`,
      'must be a positive integer',
    )
  }

  if (
    !Number.isInteger(problem.memoryLimitBytes) ||
    problem.memoryLimitBytes <= 0
  ) {
    appendError(
      errors,
      `${path}.memoryLimitBytes`,
      'must be a positive integer',
    )
  }

  if (!validateArray(problem.visibleTests, `${path}.visibleTests`, errors)) {
    return
  }

  if (problem.visibleTests.length === 0) {
    appendError(errors, `${path}.visibleTests`, 'must include at least one test')
  }

  problem.visibleTests.forEach((testCase, index) => {
    validateTestCase(testCase, `${path}.visibleTests[${index}]`, errors)
  })

  if (!validateArray(problem.hiddenTests, `${path}.hiddenTests`, errors)) {
    return
  }

  if (problem.hiddenTests.length === 0) {
    appendError(errors, `${path}.hiddenTests`, 'must include at least one test')
  }

  problem.hiddenTests.forEach((testCase, index) => {
    validateTestCase(testCase, `${path}.hiddenTests[${index}]`, errors)
  })
}

export function validateGeneratedProblemList(
  problems,
  baseProblemIds = [],
) {
  const errors = []

  if (!Array.isArray(problems)) {
    throw new Error('Generated problems must be a JSON array.')
  }

  const seenIds = new Set(baseProblemIds)

  problems.forEach((problem, index) => {
    const path = `problems[${index}]`
    validateProblem(problem, path, errors)

    if (!isPlainObject(problem) || typeof problem.id !== 'string') {
      return
    }

    if (seenIds.has(problem.id)) {
      appendError(errors, `${path}.id`, `duplicates an existing id: ${problem.id}`)
      return
    }

    seenIds.add(problem.id)
  })

  if (errors.length > 0) {
    throw new Error(`Generated problem validation failed:\n- ${errors.join('\n- ')}`)
  }

  return problems
}

export async function readJsonArray(filePath) {
  const raw = await fs.readFile(filePath, 'utf8')
  const parsed = JSON.parse(raw)

  if (!Array.isArray(parsed)) {
    throw new Error(`${filePath} must contain a JSON array.`)
  }

  return parsed
}

export async function readBaseProblemIds(filePath) {
  const source = await fs.readFile(filePath, 'utf8')
  const sourceFile = ts.createSourceFile(
    filePath,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  )

  const ids = []

  function visit(node) {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === 'baseProblems' &&
      node.initializer &&
      ts.isArrayLiteralExpression(node.initializer)
    ) {
      for (const element of node.initializer.elements) {
        if (!ts.isObjectLiteralExpression(element)) {
          throw new Error('baseProblems must contain object literals only.')
        }

        const idProperty = element.properties.find(
          (property) =>
            ts.isPropertyAssignment(property) &&
            ts.isIdentifier(property.name) &&
            property.name.text === 'id',
        )

        if (
          !idProperty ||
          !ts.isPropertyAssignment(idProperty) ||
          !ts.isStringLiteralLike(idProperty.initializer)
        ) {
          throw new Error('Each base problem must declare a string id.')
        }

        ids.push(idProperty.initializer.text)
      }
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)

  if (ids.length === 0) {
    throw new Error(`Could not read any ids from ${filePath}.`)
  }

  return ids
}

export async function readBaseProblemSummaries(filePath) {
  const source = await fs.readFile(filePath, 'utf8')
  const sourceFile = ts.createSourceFile(
    filePath,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  )

  const summaries = []

  function readStringLiteral(expression, fieldName) {
    if (!expression || !ts.isStringLiteralLike(expression)) {
      throw new Error(`baseProblems.${fieldName} must be a string literal.`)
    }

    return expression.text
  }

  function readStringArray(expression, fieldName) {
    if (!expression || !ts.isArrayLiteralExpression(expression)) {
      throw new Error(`baseProblems.${fieldName} must be a string array.`)
    }

    return expression.elements.map((element, index) => {
      if (!ts.isStringLiteralLike(element)) {
        throw new Error(
          `baseProblems.${fieldName}[${index}] must be a string literal.`,
        )
      }

      return element.text
    })
  }

  function visit(node) {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === 'baseProblems' &&
      node.initializer &&
      ts.isArrayLiteralExpression(node.initializer)
    ) {
      for (const element of node.initializer.elements) {
        if (!ts.isObjectLiteralExpression(element)) {
          throw new Error('baseProblems must contain object literals only.')
        }

        const properties = new Map()

        for (const property of element.properties) {
          if (!ts.isPropertyAssignment(property)) {
            continue
          }

          const propertyName = ts.isIdentifier(property.name)
            ? property.name.text
            : ts.isStringLiteralLike(property.name)
              ? property.name.text
              : null

          if (propertyName) {
            properties.set(propertyName, property.initializer)
          }
        }

        summaries.push({
          id: readStringLiteral(properties.get('id'), 'id'),
          title: readStringLiteral(properties.get('title'), 'title'),
          difficulty: readStringLiteral(
            properties.get('difficulty'),
            'difficulty',
          ),
          tags: readStringArray(properties.get('tags'), 'tags'),
          functionName: readStringLiteral(
            properties.get('functionName'),
            'functionName',
          ),
        })
      }
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)

  if (summaries.length === 0) {
    throw new Error(`Could not read any problem summaries from ${filePath}.`)
  }

  return summaries
}
