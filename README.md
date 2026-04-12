# iac-toolbox-cli

A beautiful terminal CLI for Infrastructure as Code workflows, built with [Ink](https://github.com/vadimdemedes/ink) (React for CLIs).

## Features

- 🎨 Fumadocs-inspired colour scheme (purple/violet/cyan)
- ⚡ React-based terminal UI via Ink
- 🏗️ Ready to extend with IaC commands

## Getting Started

```bash
pnpm install
pnpm run dev
```

## Scripts

```bash
pnpm run dev
pnpm run build
pnpm start
pnpm run typecheck
pnpm run lint
pnpm run lint:fix
pnpm run format
pnpm run format:check
```

- `pnpm run dev` runs the CLI directly from TypeScript via `tsx`
- `pnpm run build` compiles the CLI into `dist/`
- `pnpm start` runs the compiled CLI from `dist/cli.js`
- `pnpm run typecheck` runs TypeScript without emitting files
- `pnpm run lint` and `pnpm run lint:fix` run ESLint
- `pnpm run format` and `pnpm run format:check` run Prettier

## Stack

- [Ink](https://github.com/vadimdemedes/ink) — React renderer for CLIs
- [React](https://react.dev) — Component model
- TypeScript
- ESLint + Prettier
- Node.js ESM modules
