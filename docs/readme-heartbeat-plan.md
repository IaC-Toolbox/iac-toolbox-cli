# README heartbeat plan

## Goal

Add the requested heartbeat text to the README with the smallest practical change.

## Requested behavior

The README should contain the exact text:

```txt
heartbeat new test loool
```

## Proposed implementation

1. Inspect the README structure.
2. Add the exact heartbeat text near the top of the README where it is easy to find and minimally disruptive.
3. Add this plan record under `docs/`.
4. Validate the README content and changed files.

## Open questions

- None.

## Validation approach

Run the requested validation commands:

- `git diff -- README.md docs/`
- `grep -n "heartbeat new test loool" README.md`
- `git status --short`

## Definition of done

- `README.md` contains the exact text `heartbeat new test loool`.
- `docs/` includes this plan record.
- The branch is pushed to origin.
- A GitHub pull request is opened.
