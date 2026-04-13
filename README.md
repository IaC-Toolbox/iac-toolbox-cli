# iac-toolbox-cli

A beautiful terminal CLI for Infrastructure as Code workflows, built with [Ink](https://github.com/vadimdemedes/ink) (React for CLIs).

## Features

- 🎨 Fumadocs-inspired colour scheme (purple/violet/cyan)
- ⚡ React-based terminal UI via Ink
- 🏗️ Ready to extend with IaC commands

## Getting Started

```bash
pnpm install
pnpm dev
```

## Scripts

```bash
pnpm dev
pnpm build
pnpm start
pnpm typecheck
pnpm lint
pnpm lint:fix
pnpm format
pnpm format:check
```

- `pnpm dev` runs the CLI directly from TypeScript via `tsx`
- `pnpm build` compiles the CLI into `dist/`
- `pnpm start` runs the compiled CLI from `dist/cli.js`
- `pnpm typecheck` runs TypeScript without emitting files
- `pnpm lint` and `pnpm lint:fix` run ESLint
- `pnpm format` and `pnpm format:check` run Prettier

## Stack

- [Ink](https://github.com/vadimdemedes/ink) — React renderer for CLIs
- [React](https://react.dev) — Component model
- TypeScript
- ESLint + Prettier
- Node.js ESM modules
