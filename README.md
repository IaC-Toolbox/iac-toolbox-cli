# iac-toolbox-cli

A beautiful terminal CLI for Infrastructure as Code workflows, built with [Ink](https://github.com/vadimdemedes/ink) (React for CLIs).

## Features

- 🎨 Fumadocs-inspired colour scheme (purple/violet/cyan)
- ⚡ React-based terminal UI via Ink
- 🏗️ Ready to extend with IaC commands

## Getting Started

```bash
npm install
npm run dev
```

## Scripts

```bash
npm run dev
npm run build
npm start
npm run typecheck
npm run lint
npm run lint:fix
npm run format
npm run format:check
```

- `npm run dev` runs the CLI directly from TypeScript via `tsx`
- `npm run build` compiles the CLI into `dist/`
- `npm start` runs the compiled CLI from `dist/cli.js`
- `npm run typecheck` runs TypeScript without emitting files
- `npm run lint` and `npm run lint:fix` run ESLint
- `npm run format` and `npm run format:check` run Prettier

## Stack

- [Ink](https://github.com/vadimdemedes/ink) — React renderer for CLIs
- [React](https://react.dev) — Component model
- TypeScript
- ESLint + Prettier
- Node.js ESM modules
- Terminal run evidence should be attached to PRs when validating CLI changes
