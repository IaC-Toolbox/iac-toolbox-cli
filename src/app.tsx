import { Box, Text, useApp, useInput, useStdin } from 'ink';
import { useMemo, useState } from 'react';
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

const VIOLET = '#7c3aed';
const CYAN = '#06b6d4';
const GREEN = '#22c55e';
const YELLOW = '#eab308';
const RED = '#ef4444';
const SLATE = '#94a3b8';
const WHITE = '#f8fafc';

function getStepMarker(status: WizardStepStatus) {
  if (status === 'success') {
    return { label: 'OK', color: GREEN };
  }

  if (status === 'running') {
    return { label: '..', color: VIOLET };
  }

  if (status === 'ready') {
    return { label: '>>', color: CYAN };
  }

  if (status === 'skipped') {
    return { label: 'SK', color: YELLOW };
  }

  if (status === 'failed') {
    return { label: '!!', color: RED };
  }

  return { label: '--', color: SLATE };
}

function getStatusLabel(status: WizardStepStatus) {
  if (status === 'success') {
    return { label: 'Completed', color: GREEN };
  }

  if (status === 'running') {
    return { label: 'Running mocked step', color: VIOLET };
  }

  if (status === 'ready') {
    return { label: 'Ready for approval', color: CYAN };
  }

  if (status === 'skipped') {
    return { label: 'Skipped', color: YELLOW };
  }

  if (status === 'failed') {
    return { label: 'Failed', color: RED };
  }

  return { label: 'Pending', color: SLATE };
}

function Header() {
  return (
    <Box
      justifyContent="space-between"
      borderStyle="round"
      borderColor={VIOLET}
      paddingX={1}
      marginBottom={1}
    >
      <Box flexDirection="column">
        <Text color={WHITE} bold>
          IaC Toolbox CLI
        </Text>
        <Text color={SLATE}>Interactive setup wizard</Text>
      </Box>
      <Box flexDirection="column" alignItems="flex-end">
        <Text color={CYAN} bold>
          Mocked phase 1 UI
        </Text>
        <Text color={SLATE}>Continue, skip, back, quit</Text>
      </Box>
    </Box>
  );
}

type SidebarProps = {
  state: WizardState;
};

function Sidebar({ state }: SidebarProps) {
  return (
    <Box
      width={36}
      flexDirection="column"
      borderStyle="round"
      borderColor={VIOLET}
      paddingX={1}
      paddingY={1}
    >
      <Text color={WHITE} bold>
        Wizard Flow
      </Text>
      <Text color={SLATE}>Skipped steps stay visible in the flow.</Text>
      <Box flexDirection="column" marginTop={1}>
        {state.steps.map((step, index) => {
          const status = getDisplayStatus(state, step.id, index);
          const marker = getStepMarker(status);

          return (
            <Box key={step.id}>
              <Box width={4}>
                <Text color={marker.color} bold>
                  {marker.label}
                </Text>
              </Box>
              <Text color={index === state.currentStepIndex ? WHITE : SLATE}>
                {index + 1}. {step.shortTitle}
              </Text>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

type ProgressProps = {
  state: WizardState;
  step: WizardStep;
};

function ProgressPanel({ state, step }: ProgressProps) {
  const progress = getProgress(state);
  const status = getDisplayStatus(state, step.id, state.currentStepIndex);
  const statusLabel = getStatusLabel(status);

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={CYAN}
      paddingX={1}
      paddingY={1}
      marginBottom={1}
    >
      <Text color={WHITE} bold>
        Step {state.currentStepIndex + 1} of {state.steps.length} — {step.title}
      </Text>
      <Box marginTop={1} flexWrap="wrap">
        <Text color={GREEN}>{`Completed: ${progress.completed}`}</Text>
        <Text color={SLATE}> | </Text>
        <Text color={YELLOW}>{`Skipped: ${progress.skipped}`}</Text>
        <Text color={SLATE}> | </Text>
        <Text color={RED}>{`Failed: ${progress.failed}`}</Text>
        <Text color={SLATE}> | </Text>
        <Text color={SLATE}>{`Remaining: ${progress.remaining}`}</Text>
      </Box>
      <Box marginTop={1}>
        <Text color={SLATE}>Status: </Text>
        <Text color={statusLabel.color} bold>
          {statusLabel.label}
        </Text>
      </Box>
    </Box>
  );
}

type StepScreenProps = {
  step: WizardStep;
  status: WizardStepStatus;
};

function StepScreen({ step, status }: StepScreenProps) {
  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={VIOLET}
      paddingX={1}
      paddingY={1}
      flexGrow={1}
    >
      <Text color={WHITE} bold>
        {step.title}
      </Text>
      <Text color={CYAN}>{step.summary}</Text>

      <Box marginTop={1}>
        <Text color={SLATE}>Kind: </Text>
        <Text color={WHITE}>{step.kind}</Text>
        {step.optional ? (
          <>
            <Text color={SLATE}> | </Text>
            <Text color={YELLOW}>Optional</Text>
          </>
        ) : null}
      </Box>

      <Box flexDirection="column" marginTop={1}>
        <Text color={WHITE} bold>
          Why this step exists
        </Text>
        {step.description.map((line) => (
          <Text key={line} color={SLATE}>
            {line}
          </Text>
        ))}
      </Box>

      <Box flexDirection="column" marginTop={1}>
        <Text color={WHITE} bold>
          Mocked backend preview
        </Text>
        {step.preview.map((line) => (
          <Text key={line} color={SLATE}>
            - {line}
          </Text>
        ))}
      </Box>

      <Box flexDirection="column" marginTop={1}>
        <Text color={WHITE} bold>
          Approval prompt
        </Text>
        <Text color={SLATE}>{getApprovalCopy(step)}</Text>
      </Box>

      {status === 'running' ? (
        <Box marginTop={1}>
          <Text color={VIOLET}>Mocked execution in progress…</Text>
        </Box>
      ) : null}
    </Box>
  );
}

function getApprovalCopy(step: WizardStep) {
  if (step.kind === 'summary') {
    return 'Review the mocked outcomes and decide what should be wired to the real backend next.';
  }

  if (step.kind === 'info') {
    return `Proceed after reviewing ${step.shortTitle}?`;
  }

  return `Approve mocked ${step.shortTitle} step?`;
}

type SummaryProps = {
  state: WizardState;
};

function SummaryScreen({ state }: SummaryProps) {
  const completed = state.steps.filter(
    (step) => state.statuses[step.id] === 'success'
  );
  const skipped = state.steps.filter(
    (step) => state.statuses[step.id] === 'skipped'
  );
  const failed = state.steps.filter(
    (step) => state.statuses[step.id] === 'failed'
  );

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={GREEN}
      paddingX={1}
      paddingY={1}
      flexGrow={1}
    >
      <Text color={WHITE} bold>
        Setup summary
      </Text>
      <Text color={SLATE}>
        This phase is mocked, but the flow, skip behaviour, and progress model
        are now in place.
      </Text>

      <Box flexDirection="column" marginTop={1}>
        <Text color={GREEN} bold>
          Completed
        </Text>
        {completed.length > 0 ? (
          completed.map((step) => (
            <Text key={step.id} color={SLATE}>
              - {step.title}
            </Text>
          ))
        ) : (
          <Text color={SLATE}>- Nothing completed</Text>
        )}
      </Box>

      <Box flexDirection="column" marginTop={1}>
        <Text color={YELLOW} bold>
          Skipped
        </Text>
        {skipped.length > 0 ? (
          skipped.map((step) => (
            <Text key={step.id} color={SLATE}>
              - {step.title}
            </Text>
          ))
        ) : (
          <Text color={SLATE}>- Nothing skipped</Text>
        )}
      </Box>

      <Box flexDirection="column" marginTop={1}>
        <Text color={RED} bold>
          Failed
        </Text>
        {failed.length > 0 ? (
          failed.map((step) => (
            <Text key={step.id} color={SLATE}>
              - {step.title}
            </Text>
          ))
        ) : (
          <Text color={SLATE}>- No failures in mocked mode</Text>
        )}
      </Box>

      <Box flexDirection="column" marginTop={1}>
        <Text color={WHITE} bold>
          Pending in later milestones
        </Text>
        <Text color={SLATE}>
          - Replace mocked delays with a real command runner
        </Text>
        <Text color={SLATE}>
          - Add concrete command previews and approval details
        </Text>
        <Text color={SLATE}>
          - Collect environment values and persist real setup state
        </Text>
      </Box>
    </Box>
  );
}

type FooterProps = {
  canGoBackToPrevious: boolean;
  canSkip: boolean;
  isRunning: boolean;
  isSummary: boolean;
};

function Footer({
  canGoBackToPrevious,
  canSkip,
  isRunning,
  isSummary,
}: FooterProps) {
  const actions = [`Enter: ${isSummary ? 'finish' : 'continue / approve'}`];

  if (canSkip) {
    actions.push('S: skip');
  }

  if (canGoBackToPrevious) {
    actions.push('B: back');
  }

  actions.push('Q: quit');

  return (
    <Box
      marginTop={1}
      borderStyle="round"
      borderColor={SLATE}
      paddingX={1}
      paddingY={0}
      flexDirection="column"
    >
      <Text color={WHITE}>{actions.join('   ')}</Text>
      <Text color={SLATE}>
        {isRunning
          ? 'Current step is in mocked running state. Inputs are temporarily locked.'
          : isSummary
            ? 'Summary reflects the mocked outcomes from this run.'
            : 'All state transitions are mocked in this phase. No install commands run yet.'}
      </Text>
    </Box>
  );
}

export default function App() {
  const { exit } = useApp();
  const { isRawModeSupported } = useStdin();
  const [wizardState, setWizardState] = useState(() =>
    createWizardState(wizardSteps)
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const currentStep = getCurrentStep(wizardState);
  const currentStatus = getDisplayStatus(
    wizardState,
    currentStep.id,
    wizardState.currentStepIndex
  );
  const isSummary = currentStep.kind === 'summary';

  useInput(
    (input, key) => {
      if (isProcessing) {
        return;
      }

      if (input.toLowerCase() === 'q' || key.escape) {
        exit();
        return;
      }

      if (key.return) {
        if (isSummary) {
          exit();
          return;
        }

        setIsProcessing(true);
        runCurrentStep(wizardState)
          .then((nextState) => {
            setWizardState(nextState);
          })
          .finally(() => {
            setIsProcessing(false);
          });
        return;
      }

      if (input.toLowerCase() === 's' && !isSummary) {
        setWizardState((previous) => skipCurrentStep(previous));
        return;
      }

      if (input.toLowerCase() === 'b' && canGoBack(wizardState)) {
        setWizardState((previous) => goBack(previous));
      }
    },
    { isActive: isRawModeSupported }
  );

  const viewState = useMemo(() => wizardState, [wizardState]);

  return (
    <Box flexDirection="column" padding={1}>
      <Header />
      <Box>
        <Sidebar state={viewState} />
        <Box flexDirection="column" marginLeft={1} flexGrow={1}>
          <ProgressPanel state={viewState} step={currentStep} />
          {isSummary ? (
            <SummaryScreen state={viewState} />
          ) : (
            <StepScreen step={currentStep} status={currentStatus} />
          )}
          {!isRawModeSupported ? (
            <Box
              marginTop={1}
              borderStyle="round"
              borderColor={YELLOW}
              paddingX={1}
              paddingY={0}
            >
              <Text color={YELLOW}>
                Interactive input is unavailable in this terminal. Run the CLI
                in a real TTY to use continue, skip, back, and quit controls.
              </Text>
            </Box>
          ) : null}
          <Footer
            canGoBackToPrevious={canGoBack(viewState)}
            canSkip={!isSummary}
            isRunning={isProcessing || currentStatus === 'running'}
            isSummary={isSummary}
          />
        </Box>
      </Box>
    </Box>
  );
}
