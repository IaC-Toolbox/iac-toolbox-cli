# Tasks: Install script output truncated when running through wizard

Source: 001-install-output-truncated-on-early-exit.md
Repo: /Users/vvasylkovskyi/git/iac-toolbox-cli
Branch: fix/install-output-truncated-on-early-exit
Base branch: main
Worktree: /Users/vvasylkovskyi/git/iac-toolbox-cli/.claude/worktrees/session
Status: complete

## Tasks

- [ ] 1. Add delay in runInstallScript after close event — wait for stdio buffers to flush
- [ ] 2. Test with missing env vars scenario — verify full error output visible
- [ ] 3. Test success case — verify no regression in output streaming
- [ ] 4. Ensure no artificial delays that impact normal operation
