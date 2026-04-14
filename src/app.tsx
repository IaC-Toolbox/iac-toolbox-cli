import { Box, Text, useApp, useInput } from 'ink';
import { useMemo, useState } from 'react';

import { moveSelection } from './navigation.js';
import {
  canGoBack,
  createWizardState,
  getCurrentStep,
  getDisplayStatus,
  getProgress,
  goBack,
  runCurrentStep,
  skipCurrentStep,
  wizardSteps,
  type WizardState,
  type WizardStep,
  type WizardStepStatus,
} from './wizard.js';

type WizardActionId = 'run' | 'skip' | 'back' | 'quit';

type WizardAction = {
  id: WizardActionId;
  label: string;
  description: string;
};

const statusLabels: Record<WizardStepStatus, string> = {
  idle: 'idle',
  ready: 'ready',
  running: 'running',
  success: 'done',
  failed: 'failed',
  skipped: 'skipped',
};

const statusColors: Partial<Record<WizardStepStatus, string>> = {
  ready: 'cyan',
  running: 'yellow',
  success: 'green',
  failed: 'red',
  skipped: 'gray',
};

function getPrimaryAction(step: WizardStep): WizardAction {
  if (step.kind === 'summary') {
    return {
      id: 'quit',
      label: 'Finish and exit',
      description: 'Close the mocked wizard after reviewing the summary.',
    };
  }

  if (step.kind === 'info') {
    return {
      id: 'run',
      label: 'Continue',
      description: 'Acknowledge this screen and move to the next step.',
    };
  }

  return {
    id: 'run',
    label: 'Approve and continue',
    description: 'Run the mocked step and move forward when it completes.',
  };
}

function getActions(state: WizardState, step: WizardStep): WizardAction[] {
  const actions = [getPrimaryAction(step)];

  if (step.optional && step.kind !== 'summary') {
    actions.push({
      id: 'skip',
      label: 'Skip this step',
      description: 'Mark this step as skipped and continue through the flow.',
    });
  }

  if (canGoBack(state)) {
    actions.push({
      id: 'back',
      label: 'Go back',
      description: 'Return to the previous wizard step.',
    });
  }

  if (step.kind !== 'summary') {
    actions.push({
      id: 'quit',
      label: 'Quit wizard',
      description: 'Exit without running any real install command.',
    });
  }

  return actions;
}

function WizardActionRow({
  action,
  isSelected,
}: {
  action: WizardAction;
  isSelected: boolean;
}) {
  return (
    <Box flexDirection="column" marginTop={1}>
      <Text color={isSelected ? 'cyan' : undefined} bold={isSelected}>
        {isSelected ? '> ' : '  '}
        {action.label}
      </Text>
      <Box marginLeft={2}>
        <Text color="gray">{action.description}</Text>
      </Box>
    </Box>
  );
}

function StepList({ state }: { state: WizardState }) {
  return (
    <Box flexDirection="column" marginTop={1}>
      <Text bold>Install flow</Text>
      {state.steps.map((step, index) => {
        const status = getDisplayStatus(state, step.id, index);
        const marker = index === state.currentStepIndex ? '>' : ' ';

        return (
          <Text key={step.id} color={statusColors[status]}>
            {marker} {step.shortTitle} [{statusLabels[status]}]
          </Text>
        );
      })}
    </Box>
  );
}

function StepDetails({ step }: { step: WizardStep }) {
  return (
    <Box flexDirection="column" marginTop={1}>
      <Text bold>{step.title}</Text>
      <Text>{step.summary}</Text>
      {step.description.map((line) => (
        <Text key={line} color="gray">
          {line}
        </Text>
      ))}
      <Box flexDirection="column" marginTop={1}>
        {step.preview.map((line) => (
          <Text key={line} color="gray">
            - {line}
          </Text>
        ))}
      </Box>
    </Box>
  );
}

function ProgressSummary({ state }: { state: WizardState }) {
  const progress = getProgress(state);

  return (
    <Text color="gray">
      Completed {progress.completed} | Skipped {progress.skipped} | Failed{' '}
      {progress.failed} | Remaining {progress.remaining}
    </Text>
  );
}

export default function App() {
  const { exit } = useApp();
  const [state, setState] = useState(() => createWizardState(wizardSteps));
  const [selectedActionIndex, setSelectedActionIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const currentStep = getCurrentStep(state);
  const actions = useMemo(
    () => getActions(state, currentStep),
    [currentStep, state]
  );

  useInput((_input, key) => {
    if (isRunning) {
      return;
    }

    if (key.upArrow) {
      setSelectedActionIndex((index) =>
        moveSelection(index, actions.length, 'up')
      );
      return;
    }

    if (key.downArrow) {
      setSelectedActionIndex((index) =>
        moveSelection(index, actions.length, 'down')
      );
      return;
    }

    if (key.return) {
      const action = actions[selectedActionIndex];

      if (action.id === 'quit') {
        exit();
        return;
      }

      setSelectedActionIndex(0);

      if (action.id === 'back') {
        setState((currentState) => goBack(currentState));
        return;
      }

      if (action.id === 'skip') {
        setState((currentState) => skipCurrentStep(currentState));
        return;
      }

      setIsRunning(true);
      void runCurrentStep(state).then((nextState) => {
        setState(nextState);
        setSelectedActionIndex(0);
        setIsRunning(false);
      });
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold>IaC Toolbox install wizard</Text>
      <ProgressSummary state={state} />

      <StepList state={state} />
      <StepDetails step={currentStep} />

      <Box flexDirection="column" marginTop={1}>
        <Text bold>Actions</Text>
        {actions.map((action, index) => (
          <WizardActionRow
            key={action.id}
            action={action}
            isSelected={index === selectedActionIndex}
          />
        ))}
      </Box>

      <Box marginTop={1}>
        <Text color="gray">
          {isRunning
            ? 'Running mocked step...'
            : 'Use Up/Down to choose, Enter to select.'}
        </Text>
      </Box>
    </Box>
  );
}
