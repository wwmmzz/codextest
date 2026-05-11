import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  readBaseProblemIds,
  readJsonArray,
  validateGeneratedProblemList,
} from './problemValidation.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(scriptDir, '..')
const baseProblemsPath = path.join(rootDir, 'src', 'data', 'baseProblems.ts')
const generatedProblemsPath = path.join(
  rootDir,
  'src',
  'data',
  'generated',
  'problems.generated.json',
)

async function main() {
  const [baseProblemIds, generatedProblems] = await Promise.all([
    readBaseProblemIds(baseProblemsPath),
    readJsonArray(generatedProblemsPath),
  ])

  validateGeneratedProblemList(generatedProblems, baseProblemIds)

  console.log(
    `Validated ${generatedProblems.length} generated problem(s) against ${baseProblemIds.length} base problem(s).`,
  )
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
