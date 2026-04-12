# iac-toolbox-cli

A beautiful terminal CLI for Infrastructure as Code workflows, built with [Ink](https://github.com/vadimdemedes/ink) (React for CLIs).

## Features

- 🎨 Fumadocs-inspired colour scheme (purple/violet/cyan)
- ⚡ React-based terminal UI via Ink
- 🏗️ Ready to extend with IaC commands

## Getting Started

```bash
bun install
bun run dev
```

## Scripts

```bash
bun run dev
bun run build
bun run start
bun run typecheck
bun run lint
bun run lint:fix
bun run format
bun run format:check
```

- `bun run dev` runs the CLI directly from TypeScript via `tsx`
- `bun run build` compiles the CLI into `dist/`
- `bun run start` runs the compiled CLI from `dist/cli.js`
- `bun run typecheck` runs TypeScript without emitting files
- `bun run lint` and `bun run lint:fix` run ESLint
- `bun run format` and `bun run format:check` run Prettier

## Stack

- [Ink](https://github.com/vadimdemedes/ink) — React renderer for CLIs
- [React](https://react.dev) — Component model
- TypeScript
- ESLint + Prettier
- Node.js ESM modules
