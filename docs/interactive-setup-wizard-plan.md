# Interactive Setup Wizard Plan

## Goal

Design an interactive CLI wizard in `iac-toolbox-cli` that guides a user through setting up the Raspberry Pi infrastructure step by step.

For this phase, the goal is **UI first** with a **mocked backend**.

The wizard should guide the user through the same broad installation flow currently represented by the Raspberry Pi repo install/playbook setup, but in a friendlier, reviewable, step-by-step interface with built-in approval and skip support.

## Product Direction

The wizard should feel like a guided installer, not a raw shell wrapper.

It should:
- explain what each step does
- ask for confirmation before actions
- allow skipping steps
- show progress through the full setup journey
- make it obvious which steps are safe, optional, blocked, or already completed
- be designed so the mocked backend can later be swapped for real execution logic

## Initial Wizard Scope

For the first UI version, the wizard should present the following high-level flow:

1. **Install Ansible**
2. **Install Terraform**
3. **Show bootstrap notice** explaining that files will be downloaded from `IaC-Toolbox/iac-toolbox-raspberrypi`
4. **Install playbooks one by one**

Each step must support:
- **Approve / Continue**
- **Skip**
- **Back** where sensible
- clear state transitions

## UX Principles

### 1. Step-by-step, not overwhelming

Do not dump every variable and install option at once.

The wizard should reveal information as the user progresses:
- what this step does
- why it matters
- what will happen if approved
- whether it is optional

### 2. Built-in approval

Every actionable step should include an approval moment before execution.

Example pattern:
- Step description
- What will happen
- Status: not started / skipped / complete / blocked
- Actions: `Continue`, `Skip`, maybe `Back`

Later, when real execution is added, this maps naturally to:
- preview command(s)
- ask for approval
- run
- show result

### 3. Skippable by design

User should be able to skip any step.

Skipped steps should remain visible in the progress summary so the user knows what was intentionally not done.

### 4. Progress should be obvious

The wizard should always show:
- current step index
- total number of steps
- step name
- overall status summary

Example:

```text
Step 2 of 6 — Install Terraform
Completed: 1 | Skipped: 0 | Remaining: 4
```

### 5. Mock backend separation

The UI should not be tightly coupled to shell commands yet.

Instead, the UI should consume a mocked step engine that returns states such as:
- `idle`
- `running`
- `success`
- `failed`
- `skipped`

That makes it easy to replace later with real command execution.

## Proposed Wizard Structure

## Phase 1 step list

Suggested first version step sequence:

1. **Welcome**
   - explain what the wizard does
   - explain that steps can be skipped
   - explain that this phase is currently mocked

2. **Install Ansible**
   - explain why Ansible is needed
   - show mocked action preview
   - allow approve or skip

3. **Install Terraform**
   - explain why Terraform is needed
   - show mocked action preview
   - allow approve or skip

4. **Bootstrap Repository Notice**
   - explain that setup uses bootstrap files from:
     - `https://github.com/IaC-Toolbox/iac-toolbox-raspberrypi`
   - clarify that later this step may clone/download/update files locally
   - allow continue or skip

5. **Playbook Selection Overview**
   - explain that infrastructure is installed role/playbook by role/playbook
   - show the install units that will be presented one by one

6. **Install Playbooks One by One**
   Suggested mocked sub-steps:
   - base/setup
   - docker
   - vault
   - cloudflare tunnel
   - grafana
   - prometheus
   - loki
   - openclaw
   - github runner

7. **Summary**
   - show completed steps
   - show skipped steps
   - show failed steps
   - show what would happen next in a real backend

## Why use separate playbook sub-steps?

Even if the backend later maps these to tags or scripts, the UI benefits from treating them as separate install units because:
- the user can understand the setup progressively
- each step can carry tailored explanation and requirements
- approvals are clearer
- skip behavior is easier to reason about

## Proposed UI Layout

A simple full-screen Ink layout is enough for v1.

### Layout zones

1. **Header**
   - product name
   - current mode (`Mocked setup wizard`)

2. **Progress sidebar or progress strip**
   - list of steps
   - current step highlighted
   - completed/skipped/failed markers

3. **Main content pane**
   - step title
   - explanation
   - preview of what will happen
   - warnings / prerequisites if any

4. **Action footer**
   - available keys/buttons
   - e.g. `Enter = Continue`, `S = Skip`, `B = Back`, `Q = Quit`

## Interaction Model

## Recommended keyboard controls

Suggested defaults:
- `Enter` → Continue / Approve
- `s` → Skip current step
- `b` → Back
- `q` → Quit wizard
- arrow keys or `j/k` → optional later for navigating lists

## Approval wording

Instead of generic confirmation text, use concrete wording.

Examples:
- `Approve mocked Ansible installation step?`
- `Skip Terraform installation for now?`
- `Proceed to playbook installation overview?`

## Mock backend design

The frontend should be built against a mocked step runner.

### Suggested data model

```ts
export type WizardStepStatus =
  | 'idle'
  | 'ready'
  | 'running'
  | 'success'
  | 'failed'
  | 'skipped';

export type WizardStep = {
  id: string;
  title: string;
  description: string;
  optional?: boolean;
  kind: 'info' | 'approval' | 'install';
  preview?: string[];
  status: WizardStepStatus;
  children?: WizardStep[];
};
```

### Suggested mocked runner API

```ts
interface WizardRunner {
  getSteps(): WizardStep[];
  runStep(stepId: string): Promise<void>;
  skipStep(stepId: string): void;
  goBack(): void;
}
```

For v1, `runStep()` can simply:
- set state to `running`
- wait 600–1200ms
- resolve with `success`

This gives realistic UI behavior without real side effects.

## Information Architecture for Playbook Steps

Each playbook step should be able to carry:
- title
- short explanation
- whether it is optional
- prerequisites
- mocked preview action

Example:

```ts
{
  id: 'playbook-vault',
  title: 'Install Vault',
  description: 'Deploy HashiCorp Vault for secrets management.',
  optional: true,
  kind: 'install',
  preview: [
    'Would run the Vault installation flow',
    'Would prepare data/config directories',
    'Would enable required services'
  ],
  status: 'idle'
}
```

## Suggested Component Structure

Inside `src/`, likely structure for implementation:

```text
src/
  app.tsx
  cli.tsx
  wizard/
    WizardApp.tsx
    WizardLayout.tsx
    WizardHeader.tsx
    WizardProgress.tsx
    WizardStepView.tsx
    WizardFooter.tsx
    mockSteps.ts
    useWizardState.ts
    types.ts
```

## Visual Style

Keep the current polished Ink style, but move from “hello world dashboard” to a guided installer.

Suggested visual treatment:
- clean, high-contrast headings
- muted descriptive copy
- explicit colored status markers
- minimal box drawing, not too noisy
- Fumadocs-like calm/polished feel, not retro-terminal chaos

Status colors:
- ready → cyan
- running → violet
- success → green
- skipped → yellow
- failed → red
- muted/explanatory → gray/brown

## Summary Screen Design

At the end of the flow, show:
- completed steps
- skipped steps
- failed steps
- next actions

Example summary:

```text
Setup summary

Completed
- Install Ansible
- Install Terraform
- Bootstrap notice acknowledged
- Install Docker
- Install Vault

Skipped
- Install Grafana
- Install GitHub Runner

Pending in real backend
- Write environment file
- Execute playbook commands
- Persist setup state
```

## Non-goals for this phase

This first PR should **not**:
- run real shell commands
- install Ansible or Terraform for real
- clone or download the repo for real
- write environment files
- require API keys
- persist state across sessions
- implement real backend approvals/execution

Those belong to later phases.

## Follow-up phases

### Phase 2 — Real command integration
- replace mocked runner with a command execution layer
- add command previews and approvals
- handle success/failure output cleanly

### Phase 3 — Environment collection
- collect API keys and config values step by step
- validate inputs
- write env/config safely

### Phase 4 — Real Raspberry Pi install orchestration
- clone/update bootstrap repo
- run install script / tags intentionally
- show live execution progress
- support resume/retry

## Open Questions

1. Should the first wizard show all playbook steps by default, or should some be hidden behind an “advanced” view?
2. Should the progress UI be a sidebar list or a top progress strip for narrow terminals?
3. Should skipped steps be revisitable from the summary screen?
4. Should the first step ask which target environment the user wants to configure, even in mocked mode?
5. Do we want the wizard entrypoint to become the default app experience, or live behind a subcommand first?

## Recommended Next Step

Open a documentation-first PR in `iac-toolbox-cli` that:
- describes this wizard UX
- proposes the step model
- proposes mocked backend architecture
- locks the phase-1 scope to UI only

After approval, implementation can begin in the same repo with the mocked step engine and Ink UI components.
