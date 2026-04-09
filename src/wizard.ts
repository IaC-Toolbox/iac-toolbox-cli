export type WizardStepKind = 'info' | 'approval' | 'install' | 'summary';

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
  shortTitle: string;
  kind: WizardStepKind;
  summary: string;
  description: string[];
  preview: string[];
  optional?: boolean;
};

export type WizardState = {
  steps: WizardStep[];
  currentStepIndex: number;
  statuses: Record<string, WizardStepStatus>;
  visited: Set<string>;
};

const playbookSteps: WizardStep[] = [
  {
    id: 'playbook-base-setup',
    title: 'Install Playbook: base/setup',
    shortTitle: 'base/setup',
    kind: 'install',
    summary: 'Prepare baseline packages and shared Raspberry Pi host configuration.',
    description: [
      'This models the shared host preparation layer before more specialised services.',
      'Keeping it separate makes later approvals and execution output easier to trust.'
    ],
    preview: [
      'Would run ansible-playbook for the base/setup install flow.',
      'Would prepare baseline packages, users, and shared host configuration.'
    ],
    optional: true
  },
  {
    id: 'playbook-docker',
    title: 'Install Playbook: docker',
    shortTitle: 'docker',
    kind: 'install',
    summary: 'Install the container runtime and supporting system services.',
    description: [
      'Docker is its own approval unit instead of being buried inside generic setup.',
      'That keeps the eventual installer more reviewable and less opaque.'
    ],
    preview: [
      'Would run ansible-playbook for the docker install flow.',
      'Would install runtime packages and enable supporting services.'
    ],
    optional: true
  },
  {
    id: 'playbook-vault',
    title: 'Install Playbook: vault',
    shortTitle: 'vault',
    kind: 'install',
    summary: 'Model secret-management setup as its own install unit.',
    description: [
      'Vault stays explicit so secret-management work is visible and separately skippable.',
      'This phase only renders the flow and mocked execution behaviour.'
    ],
    preview: [
      'Would run ansible-playbook for the vault install flow.',
      'Would prepare storage, config, and service bootstrap steps.'
    ],
    optional: true
  },
  {
    id: 'playbook-cloudflare-tunnel',
    title: 'Install Playbook: cloudflare tunnel',
    shortTitle: 'cloudflare tunnel',
    kind: 'install',
    summary: 'Represent the remote access layer as a separate networking step.',
    description: [
      'Network-facing setup should remain reviewable on its own.',
      'This is especially useful once real approvals and previews are wired in.'
    ],
    preview: [
      'Would run ansible-playbook for the cloudflare tunnel flow.',
      'Would install the daemon and validate connectivity settings.'
    ],
    optional: true
  },
  {
    id: 'playbook-grafana',
    title: 'Install Playbook: grafana',
    shortTitle: 'grafana',
    kind: 'install',
    summary: 'Add the dashboard tier for the monitoring stack.',
    description: [
      'Grafana is shown separately so observability remains easy to review step by step.',
      'That separation matters once the backend starts doing real work.'
    ],
    preview: [
      'Would run ansible-playbook for the grafana install flow.',
      'Would configure datasources, dashboards, and service startup.'
    ],
    optional: true
  },
  {
    id: 'playbook-prometheus',
    title: 'Install Playbook: prometheus',
    shortTitle: 'prometheus',
    kind: 'install',
    summary: 'Represent metrics collection and scrape configuration.',
    description: [
      'Prometheus stays distinct from dashboards and logging to keep approvals concrete.',
      'This version only mocks the step and visible progress state.'
    ],
    preview: [
      'Would run ansible-playbook for the prometheus install flow.',
      'Would prepare scrape configuration, retention, and service startup.'
    ],
    optional: true
  },
  {
    id: 'playbook-loki',
    title: 'Install Playbook: loki',
    shortTitle: 'loki',
    kind: 'install',
    summary: 'Model log aggregation as its own install step.',
    description: [
      'Logging remains distinct from metrics so the user sees concrete approvals.',
      'This mocked phase reserves that structure without side effects.'
    ],
    preview: [
      'Would run ansible-playbook for the loki install flow.',
      'Would prepare storage, retention, and service configuration.'
    ],
    optional: true
  },
  {
    id: 'playbook-openclaw',
    title: 'Install Playbook: openclaw',
    shortTitle: 'openclaw',
    kind: 'install',
    summary: 'Represent application deployment after the shared prerequisites.',
    description: [
      'OpenClaw appears later in the flow so prerequisites come first.',
      'The wizard makes that sequencing obvious before any real backend is attached.'
    ],
    preview: [
      'Would run ansible-playbook for the openclaw install flow.',
      'Would deploy application files and restart supporting services.'
    ],
    optional: true
  },
  {
    id: 'playbook-github-runner',
    title: 'Install Playbook: github runner',
    shortTitle: 'github runner',
    kind: 'install',
    summary: 'Reserve an optional self-hosted runner installation step.',
    description: [
      'This shows how optional components can still live inside one guided flow.',
      'Skipping it should remain a first-class path in the UI.'
    ],
    preview: [
      'Would run ansible-playbook for the github runner install flow.',
      'Would register the runner and enable the service.'
    ],
    optional: true
  }
];

export const wizardSteps: WizardStep[] = [
  {
    id: 'welcome',
    title: 'Welcome',
    shortTitle: 'welcome',
    kind: 'info',
    summary: 'Introduce the interactive setup wizard and its mocked first phase.',
    description: [
      'This wizard mirrors the planned Raspberry Pi setup flow as a guided installer UI.',
      'Phase 1 is intentionally mocked: no shell commands, package installs, or repo downloads run yet.',
      'You can continue, skip, go back, and review the whole flow before any backend exists.'
    ],
    preview: [
      'Would initialise the setup session and display the planned flow.',
      'Would later create a real execution context for approvals and command previews.'
    ]
  },
  {
    id: 'install-ansible',
    title: 'Install Ansible',
    shortTitle: 'ansible',
    kind: 'approval',
    summary: 'Represent Ansible as the automation prerequisite for the host.',
    description: [
      'Ansible will eventually back host configuration and playbook execution.',
      'Keeping it as a separate approval step makes the installer easier to understand and review.'
    ],
    preview: [
      'Would check whether ansible is available on PATH.',
      'Would install or upgrade Ansible if required.'
    ],
    optional: true
  },
  {
    id: 'install-terraform',
    title: 'Install Terraform',
    shortTitle: 'terraform',
    kind: 'approval',
    summary: 'Represent Terraform as a separate infrastructure prerequisite.',
    description: [
      'Terraform remains explicit instead of being bundled into generic setup.',
      'That keeps later approvals and execution hooks straightforward.'
    ],
    preview: [
      'Would check whether terraform is available on PATH.',
      'Would install or upgrade Terraform if required.'
    ],
    optional: true
  },
  {
    id: 'bootstrap-notice',
    title: 'Bootstrap Repository Notice',
    shortTitle: 'bootstrap notice',
    kind: 'info',
    summary: 'Explain that setup assets come from the raspberrypi bootstrap repo.',
    description: [
      'Setup files come from IaC-Toolbox/iac-toolbox-raspberrypi.',
      'A later phase can clone, download, or refresh that repository locally.',
      'For now this step exists to make that dependency visible and acknowledged.'
    ],
    preview: [
      'Reference: https://github.com/IaC-Toolbox/iac-toolbox-raspberrypi',
      'Would later validate access and prepare a local working copy.'
    ],
    optional: true
  },
  {
    id: 'playbook-overview',
    title: 'Playbook Installation Overview',
    shortTitle: 'playbook overview',
    kind: 'info',
    summary: 'Show that playbooks are reviewed one by one rather than as one opaque block.',
    description: [
      'The remaining steps are individual install units for clearer progress and approvals.',
      'This keeps skip behaviour straightforward and makes later execution mapping easier.'
    ],
    preview: [
      'Upcoming playbooks: base/setup, docker, vault, cloudflare tunnel, grafana, prometheus, loki, openclaw, github runner.',
      'Would later map each visible step to a concrete backend action.'
    ]
  },
  ...playbookSteps,
  {
    id: 'summary',
    title: 'Summary',
    shortTitle: 'summary',
    kind: 'summary',
    summary: 'Review what was completed, skipped, or left for the real backend.',
    description: [
      'The final screen summarises the decisions made during the mocked wizard run.',
      'This is where future phases can add failures, retries, and real execution evidence.'
    ],
    preview: [
      'Would summarise completed, skipped, and failed work.',
      'Would later map approved steps to real backend commands and next actions.'
    ]
  }
];

export function createWizardState(steps: WizardStep[]): WizardState {
  const statuses = Object.fromEntries(
    steps.map((step, index) => [step.id, index === 0 ? 'ready' : 'idle'])
  ) as Record<string, WizardStepStatus>;

  return {
    steps,
    currentStepIndex: 0,
    statuses,
    visited: new Set([steps[0]?.id].filter(Boolean))
  };
}

export function getCurrentStep(state: WizardState): WizardStep {
  return state.steps[state.currentStepIndex];
}

export function canGoBack(state: WizardState): boolean {
  return state.currentStepIndex > 0;
}

export function getProgress(state: WizardState) {
  return state.steps.reduce(
    (counts, step, index) => {
      const status = state.statuses[step.id];

      if (status === 'success') {
        counts.completed += 1;
      } else if (status === 'skipped') {
        counts.skipped += 1;
      } else if (status === 'failed') {
        counts.failed += 1;
      }

      if (index > state.currentStepIndex && status !== 'skipped') {
        counts.remaining += 1;
      }

      return counts;
    },
    {
      completed: 0,
      skipped: 0,
      failed: 0,
      remaining: 0
    }
  );
}

export function getDisplayStatus(
  state: WizardState,
  stepId: string,
  stepIndex: number
): WizardStepStatus {
  const stored = state.statuses[stepId];

  if (stored === 'skipped' || stored === 'success' || stored === 'running' || stored === 'failed') {
    return stored;
  }

  if (stepIndex === state.currentStepIndex) {
    return 'ready';
  }

  return stored;
}

export function goBack(state: WizardState): WizardState {
  if (!canGoBack(state)) {
    return state;
  }

  const previousIndex = state.currentStepIndex - 1;
  const previousStep = state.steps[previousIndex];

  return {
    ...state,
    currentStepIndex: previousIndex,
    statuses: {
      ...state.statuses,
      [previousStep.id]: state.statuses[previousStep.id] === 'idle' ? 'ready' : state.statuses[previousStep.id]
    },
    visited: new Set([...state.visited, previousStep.id])
  };
}

export function skipCurrentStep(state: WizardState): WizardState {
  return advanceFromCurrent(state, 'skipped');
}

export async function runCurrentStep(state: WizardState): Promise<WizardState> {
  const currentStep = getCurrentStep(state);

  const runningState: WizardState = {
    ...state,
    statuses: {
      ...state.statuses,
      [currentStep.id]: 'running'
    },
    visited: new Set([...state.visited, currentStep.id])
  };

  await delay(getMockDuration(currentStep));

  return advanceFromCurrent(runningState, 'success');
}

function advanceFromCurrent(
  state: WizardState,
  finishedStatus: Extract<WizardStepStatus, 'success' | 'skipped'>
): WizardState {
  const currentStep = getCurrentStep(state);
  const nextIndex = Math.min(state.currentStepIndex + 1, state.steps.length - 1);
  const nextStep = state.steps[nextIndex];
  const isStayingOnSummary = state.currentStepIndex === state.steps.length - 1;

  return {
    ...state,
    currentStepIndex: nextIndex,
    statuses: {
      ...state.statuses,
      [currentStep.id]: finishedStatus,
      ...(nextStep && !isStayingOnSummary && state.statuses[nextStep.id] === 'idle'
        ? { [nextStep.id]: 'ready' }
        : {})
    },
    visited: new Set([...state.visited, currentStep.id, nextStep?.id].filter(Boolean) as string[])
  };
}

function getMockDuration(step: WizardStep): number {
  if (step.kind === 'install') {
    return 1100;
  }

  if (step.kind === 'approval') {
    return 850;
  }

  return 650;
}

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}
