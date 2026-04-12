# GitHub Actions CI pipeline plan

## Goal

Add a simple GitHub Actions pipeline that runs on pull requests and verifies the project is healthy before merge.

## Requested checks

Run these on each PR:

- `pnpm run lint`
- `pnpm run format:check`
- `pnpm run build`

## Proposed implementation

1. Add a workflow under `.github/workflows/ci.yml`
2. Trigger it on `pull_request`
3. Use a current Node.js version compatible with the repo engines
4. Install dependencies with `pnpm install --frozen-lockfile`
5. Run lint, prettier check, and build as separate steps

## Notes

- Keep the workflow minimal and easy to read
- Prefer fast feedback over complex matrix builds for now
- This pipeline should validate PRs against `main`
