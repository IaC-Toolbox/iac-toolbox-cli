---
status: draft
completed_date:
pr_url:
---

# Standalone Install Command

## Overview

Add a new `iac-toolbox install` CLI command that executes the install step directly, bypassing the interactive configuration wizard. This command reads existing configuration from `iac-toolbox.yml` and credentials from `~/.iac-toolbox/credentials`, then runs the install script with the same behavior as choosing "Yes — run install script" during `iac-toolbox init`. This enables users to re-run installations, apply configuration changes, or automate deployments without stepping through the wizard again.

---

## What Changes

| Area                 | Change                                                                 |
| -------------------- | ---------------------------------------------------------------------- |
| CLI                  | Add `install` command to commander program                             |
| Install runner logic | Extract destination path from iac-toolbox.yml or use default/flag      |
| Error handling       | Surface errors when config files are missing or invalid                |
| Documentation        | Update CLI help text and manual run instructions to reference command  |

---

## CLI Commands

### iac-toolbox install

Runs the install script using existing configuration files. Requires that `iac-toolbox init` has been run at least once to generate configuration.

```bash
iac-toolbox install
```

**Options:**

```sh
--profile <name>     Credential profile to use (default: "default")
--destination <path> Path to infrastructure directory (default: ./infrastructure)
```

**Behavior:**

- Reads `<destination>/iac-toolbox.yml` to determine enabled integrations
- Loads credentials from `~/.iac-toolbox/credentials` using the specified profile
- Builds environment variables for the install script (same as InstallRunnerDialog)
- Spawns `bash <destination>/scripts/install.sh --ansible-only --local`
- Streams stdout/stderr to terminal (stdio: inherit)
- Exits with the same exit code as install.sh

**Error cases:**

- `iac-toolbox.yml` not found → Exit with error message: `Configuration file not found at <destination>/iac-toolbox.yml. Run 'iac-toolbox init' first.`
- `install.sh` not found → Exit with error message: `install.sh not found at <destination>/scripts/install.sh. Ensure infrastructure files are present.`
- Missing required credentials → Exit with error message listing missing keys

---

## Implementation Notes

### Config file location

The command needs to resolve the destination directory. Options:

1. **Default to `./infrastructure`** — matches the most common wizard output
2. **Read from `iac-toolbox.yml` in current directory** — assumes user is in project root
3. **Accept `--destination` flag** — explicit override

Recommended: Default to `./infrastructure`, allow override with `--destination`.

### Reuse existing utilities

The command should reuse:

- `buildInstallEnv()` from `src/utils/installRunner.ts` — constructs environment variables
- `runInstallScript()` from `src/utils/installRunner.ts` — spawns install.sh and streams output
- `loadCredentials()` from `src/utils/credentials.ts` — reads ~/.iac-toolbox/credentials

### Difference from init flow

Unlike the wizard flow (which uses InstallRunnerDialog and shows a spinner in Ink), this command runs as a plain CLI tool with direct stdio inheritance. The install script output appears immediately in the terminal, and the process exits with install.sh's exit code.

This matches the behavior of existing standalone commands like `iac-toolbox cloudflare install` and `iac-toolbox vault install`.

---

## Example Usage

**Re-run install after editing iac-toolbox.yml:**

```sh
# Edit infrastructure/iac-toolbox.yml to enable a new integration
vim infrastructure/iac-toolbox.yml

# Re-run install to apply changes
iac-toolbox install
```

**Install using a different credential profile:**

```sh
iac-toolbox install --profile production
```

**Install from a non-standard location:**

```sh
iac-toolbox install --destination /opt/homelab/infrastructure
```

---

## Error Handling

| Scenario                             | Exit Code | Message                                                                                |
| ------------------------------------ | --------- | -------------------------------------------------------------------------------------- |
| iac-toolbox.yml not found            | 1         | `Configuration file not found at <destination>/iac-toolbox.yml. Run 'iac-toolbox init' first.` |
| install.sh not found                 | 1         | `install.sh not found at <destination>/scripts/install.sh. Ensure infrastructure files are present.` |
| Missing credentials (non-fatal)      | 0*        | Warning printed to stderr, install.sh decides whether to fail                          |
| install.sh fails                     | N         | Exit with install.sh's exit code, last stderr lines shown (via existing logic)        |

*Note: Missing credentials are passed as empty strings to install.sh. The install script itself validates required environment variables and fails if needed. The CLI does not pre-validate credentials to avoid duplicating validation logic.

---

## Out of Scope

- Validating iac-toolbox.yml schema — trust the file is well-formed (user edited it or init generated it)
- Interactive credential prompts — if credentials are missing, let install.sh fail and instruct user to run `iac-toolbox credentials set <key>`
- Progress UI or Ink spinner — this is a plain CLI command, not an interactive wizard
- Support for `--remote` mode — initial implementation is `--local` only (matches existing subcommands)
- Selective integration install — the command runs install.sh as-is, which respects enabled/disabled flags in iac-toolbox.yml
