---
status: completed
completed_date: 2026-04-22
pr_url: https://github.com/IaC-Toolbox/iac-toolbox-cli/pull/128
---

# Bug: Install script output truncated when running through wizard

## Summary

When the install script exits early (e.g., due to missing environment variables), the wizard UI transitions to InstallCompleteDialog before the script's stdout/stderr have fully flushed to the terminal, causing the user to see an incomplete error message.

## Repo

iac-toolbox-cli

## Observed behaviour

When running through the wizard with missing environment variables, the output is truncated:

```
Raspberry Pi Infrastructure Install
========================================
Mode: Ansible only (--ansible-only)
Target mode: local (--local)

[1/4] Checking required tools...

◆ Install failed
│
│ Exit code: 1
└
```

## Expected behaviour

The full script output should be visible before the completion dialog appears, matching what users see when running the script directly:

```
Raspberry Pi Infrastructure Install
========================================
Mode: Ansible only (--ansible-only)
Target mode: local (--local)

[1/4] Checking required tools...
✓ Ansible found

[2/4] Checking environment configuration...
✓ Environment configured

[3/4] Validating required environment variables...
Error: Missing required environment variables:
  - RPI_HOST
  - RPI_USER
  - GITHUB_REPO_URL
  - GITHUB_RUNNER_TOKEN
```

## Relevant files

- `src/app.tsx` (lines 83-92, 327-346)
- `src/components/InstallRunnerDialog.tsx` (lines 35-82)
- `src/utils/installRunner.ts` (lines 81-175)
- `src/components/InstallCompleteDialog.tsx`

## Context

The wizard runs the install script via `runInstallScript()` which spawns a bash process with `stdio: ['inherit', 'inherit', 'pipe']`. This configuration pipes stdout and stderr directly to the terminal for live streaming.

When the script completes, the `close` event fires immediately and resolves the promise, which triggers `handleInstallComplete` callback in InstallRunnerDialog (line 89-92 in app.tsx). This callback sets `installRunning = false` and `installResult = {...}`, causing React to unmount InstallRunnerDialog and mount InstallCompleteDialog.

The problem is that the `close` event fires as soon as the process exits, but the inherited stdio streams may still have buffered data that hasn't been flushed to the terminal yet. When the component unmounts immediately, Ink may clear the terminal area before the buffered output appears, resulting in truncated output.

## Likely cause

The `child.on('close')` handler in `runInstallScript()` resolves the promise synchronously, triggering an immediate React state update and component unmount. There is no delay to allow stdio streams to finish flushing their buffers. The issue is most visible with early exits because there's less output overall, making the truncation more obvious.

## Acceptance criteria

- [ ] When the install script exits with an error, all stdout lines are visible in the terminal before the completion dialog appears
- [ ] The wizard output matches the direct script execution output for the same failure scenario
- [ ] Success case (long-running installs) still streams output correctly with no regression
- [ ] The fix does not introduce artificial delays that slow down normal operation

## Validation

Run through the wizard with intentionally missing environment variables and verify the full error output is visible:

```bash
# Clear credentials to trigger missing env vars
rm ~/.iac-toolbox/credentials.ini

# Run wizard
npm run build && node dist/index.js init

# Compare output to direct script execution
bash infrastructure/scripts/install.sh --ansible-only --local
```

Also verify success case still works:

- Complete wizard with all credentials
- Verify install output streams correctly during execution
