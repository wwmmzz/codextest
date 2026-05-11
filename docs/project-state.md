# Project State

Last updated: 2026-05-11

## Product Goal

Build a pure frontend LeetCode-like coding practice platform. The platform should use static problems first, provide an Ant Design based workspace, and later run JavaScript submissions in a QuickJS WebAssembly sandbox inside a Web Worker.

This project is currently a local-first learning/practice tool. Hidden tests and judging logic are bundled in the frontend, so they are not secure against users who inspect the app bundle.

## Current Phase

Phase 1: brushing-flow MVP.

Completed:

- Vite React TypeScript project scaffold.
- Ant Design application shell with sidebar navigation.
- React Router routes for problem list, problem detail, and submissions.
- Static, verifiable problem model.
- Static problem set with visible and hidden test cases.
- Problem list reads from `src/data/problems.ts`.
- Problem detail page renders statement, metadata, examples, constraints, tests, and starter code.
- Monaco editor integration on the problem detail page.
- Editable code is kept in local React state while viewing a problem.
- Draft persistence per problem through Dexie and IndexedDB.
- Focused Vitest coverage for draft service behavior.
- Judge request/result types under `src/judge`.
- Deep comparison helper with focused Vitest coverage.
- QuickJS Web Worker foundation for executing judge requests.
- Focused Vitest coverage for QuickJS execution and result summarization.
- Multi-test judge execution and summaries.
- Focused Vitest coverage for multi-case judge result summarization.
- Problem detail page can run visible tests or submit all tests through the QuickJS judge worker.
- Judge result rendering in the problem workspace, including summary status and per-case details.
- Focused Vitest coverage for judge request construction.
- IndexedDB submission records for submit-mode judge results.
- Submission history rendering in the problem workspace and global submissions page.
- Focused Vitest coverage for submission record creation and storage service behavior.

Not implemented yet:

- GitHub Actions + GitHub Pages based AI static problem updates for daily/weekly featured problems.
- AI assistant features.

## Main Decisions

- UI library: Ant Design.
- Routing: `react-router-dom`.
- Problem source: static TypeScript data for now.
- Submission shape: JavaScript function-style problems, not stdin/stdout programs.
- Judge target: `quickjs-emscripten` in a Web Worker.
- Persistence target: Dexie over IndexedDB.
- State target: Zustand for UI/session state when needed.

## Key Files

- `src/App.tsx`: application layout, sidebar navigation, route definitions.
- `src/main.tsx`: React root, Ant Design config provider, router provider.
- `src/pages/ProblemListPage.tsx`: problem table backed by static problem data.
- `src/pages/ProblemDetailPage.tsx`: problem workspace shell and Monaco code editor.
- `src/pages/SubmissionsPage.tsx`: placeholder for local submission history.
- `src/types/problem.ts`: problem, example, and test case types.
- `src/types/draft.ts`: local code draft type.
- `src/data/problems.ts`: current static problem set and helpers.
- `src/db/appDb.ts`: Dexie database definition.
- `src/db/draftStorage.ts`: IndexedDB-backed draft storage adapter.
- `src/db/submissionStorage.ts`: IndexedDB-backed submission storage adapter.
- `src/services/drafts.ts`: testable draft load/save helpers.
- `src/services/submissions.ts`: testable submission record creation and save helpers.
- `src/hooks/useProblemDraft.ts`: problem editor draft loading and autosave hook.
- `src/hooks/useSubmissions.ts`: local submission history loading hook.
- `src/components/SubmissionHistory.tsx`: shared submission history renderer.
- `src/judge/types.ts`: judge request, response, test case, and result types.
- `src/judge/compare.ts`: deep comparison helper for actual and expected results.
- `src/judge/executor.ts`: QuickJS-backed single test case execution.
- `src/judge/request.ts`: problem-to-judge request construction helpers.
- `src/judge/runner.ts`: multi-test judge execution and result summarization.
- `src/judge/worker.ts`: Web Worker message handler for judge requests.
- `src/judge/client.ts`: browser helper for creating and messaging the judge worker.
- `src/index.css`: application layout and page-level styles.

## Current Problem Model

Each `Problem` contains:

- `id`
- `title`
- `difficulty`
- `tags`
- `statement`
- `examples`
- `constraints`
- `starterCode`
- `functionName`
- `timeLimitMs`
- `memoryLimitBytes`
- `visibleTests`
- `hiddenTests`

`TestCase.input` is an array of arguments that will be spread into the target function. `TestCase.expected` is the expected return value.

Example future execution shape:

```js
const result = twoSum(...[[2, 7, 11, 15], 9])
```

## Static Problems

Current problems:

- `two-sum`
- `valid-parentheses`
- `binary-search`
- `reverse-string`
- `climbing-stairs`

All current problems are `Easy` and use JSON-serializable inputs/expected outputs.

## Next Steps

1. Add GitHub Actions + GitHub Pages based AI static problem updates for daily/weekly featured problems, after the core brushing loop is complete.
2. Add AI assistant features.

## Future Static Problem Automation

After the core brushing loop is complete, add an automated static problem update pipeline:

- Use GitHub Actions scheduled workflows plus manual `workflow_dispatch` to generate daily or weekly candidate problems.
- Have AI generate strict structured JSON instead of directly editing TypeScript source.
- Validate generated problems before publishing, including schema checks, unique IDs, valid function names, JSON-serializable tests, and reference-solution execution against visible and hidden tests.
- Prefer opening an automated pull request first; direct commits to `main` can be considered only after the validation pipeline is stable.
- Publish the Vite app through GitHub Pages after validated problem updates are merged.
- Expose daily/weekly featured problems in the frontend once generated problem metadata is available.

## Testing Approach

Use Vitest for focused tests around key logic, especially judge request/result shaping, deep comparison, worker execution behavior, draft persistence, and submission storage. Dexie-backed browser adapters can be kept thin and verified through build/lint plus browser checks unless schema or migration behavior becomes complex enough to justify IndexedDB integration tests.

## Verification

Last verified commands:

```bash
npm run build
npm run lint
npm run test
```

Result: passed.

Known warning: Vite reports a large initial chunk because Ant Design and future editor-related dependencies are included. This is acceptable for the current scaffold and can be addressed later with route/component level dynamic imports.
