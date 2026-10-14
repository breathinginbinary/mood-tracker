# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

MoodTracker is a freshly scaffolded Angular 22 app (Angular CLI, standalone components, no NgModules). It is still the CLI starter: `src/app/app.ts` is the only component and `src/app/app.routes.ts` has no routes yet.

## Commands

- `npm start` (`ng serve`): dev server at http://localhost:4200/, with live reload
- `npm run build` (`ng build`): production build into `dist/`
- `npm run watch`: development-configuration build in watch mode
- `npm test` (`ng test`): unit tests with Vitest (jsdom), not Karma/Jasmine
- Single test file: `ng test --include=src/app/app.spec.ts`
- `ng generate component <name>`: scaffold new components

There is no lint script configured. Formatting is Prettier (`.prettierrc`: 100 columns, single quotes, Angular parser for `*.html`).

## Architecture

- Bootstrap: `src/main.ts` bootstraps `App` with `appConfig` from `src/app/app.config.ts`. Providers (router, global error listeners) are registered there, not in a module.
- Components use separate `templateUrl`/`styleUrl` files (`app.html`, `app.css`) and signals for state (e.g. `signal('mood-tracker')`).
- TypeScript is `~6.0`, with the strict settings from `tsconfig.json`.
