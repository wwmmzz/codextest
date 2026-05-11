# AI Judge

A pure frontend LeetCode-like practice platform. The current phase focuses on a static problem set, Ant Design UI, and a browser-side judging flow that will use QuickJS in a Web Worker.

## Current Status

Read [docs/project-state.md](docs/project-state.md) first when returning to this project. It records the current phase, architecture decisions, important files, and next implementation steps.

## Planning Reference

Read [docs/next-phase-directions.md](docs/next-phase-directions.md) for next-phase product directions, UI improvement ideas, and the saved UI concept reference.

## Project Structure

```text
.
|-- .github/
|   `-- workflows/
|       |-- deploy-pages.yml              # Publishes the Vite app to GitHub Pages.
|       `-- generate-featured-problem.yml # Generates featured static problems and opens PRs.
|-- docs/
|   |-- assets/
|   |   `-- ai-judge-ui-concept.png       # Saved UI concept reference for future design work.
|   |-- next-phase-directions.md          # Product, UI, AI, and roadmap planning reference.
|   `-- project-state.md                  # Source of truth for current phase and architecture.
|-- public/
|   |-- favicon.svg                       # Browser favicon.
|   `-- icons.svg                         # Public icon asset.
|-- scripts/
|   |-- generate-generated-problems.mjs   # CLI entry for AI-backed problem generation.
|   |-- generate-generated-problems.shared.mjs # Shared CLI config parsing helpers.
|   |-- problemGeneration.mjs             # Prompting, parsing, validation, and merge helpers.
|   |-- problemValidation.mjs             # Shared generated-problem validation logic.
|   `-- validate-generated-problems.mjs   # CLI guardrail for generated problem JSON.
|-- src/
|   |-- assets/                           # App-local static image assets.
|   |-- components/                       # Shared React UI components.
|   |-- data/                             # Static and generated problem data.
|   |-- db/                               # Dexie / IndexedDB database adapters.
|   |-- hooks/                            # React hooks for drafts and submissions.
|   |-- judge/                            # QuickJS judge types, runner, worker, and client.
|   |-- pages/                            # Route-level React pages.
|   |-- services/                         # Testable persistence and submission services.
|   |-- types/                            # Shared TypeScript domain types.
|   |-- App.tsx                           # Application shell, sidebar, and routes.
|   |-- App.css                           # Legacy app-level styles from the scaffold.
|   |-- index.css                         # Main application layout and page styles.
|   `-- main.tsx                          # React root, router, and Ant Design provider setup.
|-- tests/                                # Vitest coverage for judge, storage, hooks, and generation.
|-- AGENTS.md                             # Instructions for coding agents working in this repo.
|-- eslint.config.js                      # ESLint configuration.
|-- index.html                            # Vite HTML entry point.
|-- package.json                          # npm scripts and dependency declarations.
|-- package-lock.json                     # Locked npm dependency graph.
|-- tsconfig*.json                        # TypeScript project configurations.
|-- vite.config.ts                        # Vite config, including GitHub Pages base path support.
`-- vitest.config.ts                      # Vitest configuration.
```

### Key Source Files

- `src/pages/ProblemListPage.tsx`: problem browsing table backed by static problem data.
- `src/pages/problemListHelpers.ts`: helper logic for problem list filtering or shaping.
- `src/pages/ProblemDetailPage.tsx`: problem workspace with statement, editor, judge actions, results, and submissions.
- `src/pages/SubmissionsPage.tsx`: global local submission history page.
- `src/components/SubmissionHistory.tsx`: shared renderer for submission history lists.
- `src/components/submissionHistoryHelpers.ts`: presentation helpers for submission history.
- `src/data/problems.ts`: public problem collection and lookup helpers.
- `src/data/baseProblems.ts`: hand-written baseline problem set.
- `src/data/generated/problems.generated.json`: generated problem data loaded into the app.
- `src/db/appDb.ts`: Dexie database schema and shared database instance.
- `src/db/draftStorage.ts`: IndexedDB adapter for editor drafts.
- `src/db/submissionStorage.ts`: IndexedDB adapter for submission records.
- `src/hooks/useProblemDraft.ts`: loads, edits, and autosaves per-problem drafts.
- `src/hooks/useSubmissions.ts`: loads local submission history for pages and panels.
- `src/services/drafts.ts`: testable draft load/save service functions.
- `src/services/submissions.ts`: testable submission creation and persistence functions.
- `src/judge/types.ts`: judge request, response, test case, and result types.
- `src/judge/compare.ts`: deep comparison helper for actual and expected values.
- `src/judge/executor.ts`: QuickJS-backed execution for a single test case.
- `src/judge/request.ts`: converts a problem and code string into a judge request.
- `src/judge/runner.ts`: runs multiple test cases and summarizes the result.
- `src/judge/worker.ts`: Web Worker message handler for judge execution.
- `src/judge/client.ts`: browser helper for creating and messaging the judge worker.
- `src/judge/index.ts`: judge module barrel exports.
- `src/types/problem.ts`: problem, example, and test case domain types.
- `src/types/draft.ts`: local code draft type.
- `src/types/submission.ts`: local submission record type.

### Test Files

- `tests/setup.ts`: shared Vitest and Testing Library setup.
- `tests/drafts.test.ts`: draft service behavior.
- `tests/problem-draft-hook.test.tsx`: draft hook loading and autosave behavior.
- `tests/submissions.test.ts`: submission record creation and storage service behavior.
- `tests/submissions-hook.test.tsx`: submissions hook behavior.
- `tests/submission-history.test.tsx`: submission history UI behavior.
- `tests/problem-list.test.ts`: problem list helper behavior.
- `tests/judge-compare.test.ts`: deep comparison behavior.
- `tests/judge-executor.test.ts`: QuickJS execution behavior.
- `tests/judge-request.test.ts`: judge request construction.
- `tests/judge-runner.test.ts`: multi-case judge result summarization.
- `tests/problem-validation.test.ts`: generated problem validation behavior.
- `tests/problem-generation.test.ts`: generated problem prompt, parse, and merge behavior.
- `tests/generate-generated-problems-config.test.ts`: generation CLI configuration parsing.

## Scripts

```bash
npm run dev
npm run build
npm run lint
```

## Deployment

GitHub Pages deployment is handled by `.github/workflows/deploy-pages.yml`.
In the repository settings, configure Pages to use GitHub Actions as the source.
The workflow builds with `VITE_BASE_PATH=/${{ github.event.repository.name }}/`
so project-site asset paths and React Router basename match the Pages URL.

## Problem Generation

Generated problem data lives in `src/data/generated/problems.generated.json`.
Validate it with `npm run validate:problems`.
Generate a new problem with:

```bash
npm run generate:problem -- --api-key YOUR_KEY
```

The generator also accepts `AI_API_KEY` or `API_KEY`, plus optional `--base-url`
and `--model` overrides for compatible providers.

## Tech Stack

- Vite + React + TypeScript
- Ant Design
- React Router
- Monaco Editor
- quickjs-emscripten
- Dexie / IndexedDB
- Zustand
