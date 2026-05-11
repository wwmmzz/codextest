# AI Judge

A pure frontend LeetCode-like practice platform. The current phase focuses on a static problem set, Ant Design UI, and a browser-side judging flow that will use QuickJS in a Web Worker.

## Current Status

Read [docs/project-state.md](docs/project-state.md) first when returning to this project. It records the current phase, architecture decisions, important files, and next implementation steps.

## Planning Reference

Read [docs/next-phase-directions.md](docs/next-phase-directions.md) for next-phase product directions, UI improvement ideas, and the saved UI concept reference.

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
