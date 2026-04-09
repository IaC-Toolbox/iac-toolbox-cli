# iac-toolbox-cli

An Ink-based terminal CLI for Infrastructure as Code workflows.

## Features

- Interactive setup wizard for the Raspberry Pi flow
- Mocked step engine for approve, skip, and back navigation
- Visible progress and a final summary screen
- React-based terminal UI via [Ink](https://github.com/vadimdemedes/ink)

## Wizard Flow

The phase-1 CLI replaces the old hello-world app with a guided Ink wizard that walks through:

1. Welcome
2. Install Ansible
3. Install Terraform
4. Bootstrap repository notice for `IaC-Toolbox/iac-toolbox-raspberrypi`
5. Playbook overview
6. Individual playbook steps for:
   - `base/setup`
   - `docker`
   - `vault`
   - `cloudflare tunnel`
   - `grafana`
   - `prometheus`
   - `loki`
   - `openclaw`
   - `github runner`
7. Summary

The wizard is UI-only in this phase. It shows mocked running states, per-step status markers, and a mocked failure path on the `github runner` step so the summary can exercise completed, skipped, and failed outcomes. It does not execute real install commands, clone repositories, collect API keys, or write environment files.

## Controls

- `Enter` continues or approves the current step
- `s` skips the current step when skipping is available
- `b` returns to the previous step when going back is available
- `q` quits the wizard

## Getting Started

```bash
npm install
npm run dev
```

The current wizard phase is UI only. It does not execute real install commands.

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
