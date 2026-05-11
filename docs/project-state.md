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

Not implemented yet:

- Monaco editor integration.
- Draft persistence.
- QuickJS judge worker.
- Deep comparison and result rendering.
- IndexedDB submission records.
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
- `src/pages/ProblemDetailPage.tsx`: problem workspace shell and starter code preview.
- `src/pages/SubmissionsPage.tsx`: placeholder for local submission history.
- `src/types/problem.ts`: problem, example, and test case types.
- `src/data/problems.ts`: current static problem set and helpers.
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

1. Replace starter code preview with Monaco Editor.
2. Keep editable code in local React state.
3. Add draft persistence per problem.
4. Add judge request/result types under `src/judge`.
5. Implement QuickJS Web Worker for one test case.
6. Extend judge worker to multiple tests and result summaries.
7. Store submissions in IndexedDB.

## Verification

Last verified command:

```bash
npm run build
```

Result: passed.

Known warning: Vite reports a large initial chunk because Ant Design and future editor-related dependencies are included. This is acceptable for the current scaffold and can be addressed later with route/component level dynamic imports.
