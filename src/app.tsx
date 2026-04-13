import { Box, Text, useInput } from 'ink';
import { useMemo, useState } from 'react';

type WizardOption = {
  label: string;
  description: string;
};

type WizardStep = {
  id: 'workflow' | 'tool' | 'nextStep';
  title: string;
  prompt: string;
  options: WizardOption[];
};

type WizardAnswers = Partial<Record<WizardStep['id'], WizardOption>>;

const STEPS: WizardStep[] = [
  {
    id: 'workflow',
    title: 'Workflow',
    prompt: 'What do you want to prepare?',
    options: [
      {
        label: 'Review an existing project',
        description: 'Collect context before adding real checks.',
      },
      {
        label: 'Plan a change',
        description: 'Shape the next IaC operation before execution exists.',
      },
      {
        label: 'Start from a template',
        description: 'Capture the intent for a future scaffold command.',
      },
    ],
  },
  {
    id: 'tool',
    title: 'IaC tool',
    prompt: 'Which tool should this wizard focus on?',
    options: [
      {
        label: 'Terraform',
        description: 'Use the Terraform path when actions are wired in.',
      },
      {
        label: 'OpenTofu',
        description: 'Use the OpenTofu path when actions are wired in.',
      },
      {
        label: 'Not sure yet',
        description: 'Keep the plan tool-neutral for now.',
      },
    ],
  },
  {
    id: 'nextStep',
    title: 'Next step',
    prompt: 'What should happen after this preview?',
    options: [
      {
        label: 'Show summary only',
        description: 'Finish without running an IaC command.',
      },
      {
        label: 'Save for later',
        description: 'Reserve this path for a future persistence command.',
      },
      {
        label: 'Run checks later',
        description: 'Reserve this path for future validation commands.',
      },
    ],
  },
];

function WizardOptionRow({
  option,
  isSelected,
}: {
  option: WizardOption;
  isSelected: boolean;
}) {
  return (
    <Box flexDirection="column" marginTop={1}>
      <Text color={isSelected ? 'cyan' : undefined} bold={isSelected}>
        {isSelected ? '> ' : '  '}
        {option.label}
      </Text>
      <Box marginLeft={2}>
        <Text color="gray">{option.description}</Text>
      </Box>
    </Box>
  );
}

function AnswerSummary({ answers }: { answers: WizardAnswers }) {
  return (
    <Box flexDirection="column" marginTop={1}>
      {STEPS.map((step) => (
        <Text key={step.id}>
          <Text color="gray">{step.title}: </Text>
          {answers[step.id]?.label ?? 'Not selected'}
        </Text>
      ))}
    </Box>
  );
}

export default function App() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);
  const [answers, setAnswers] = useState<WizardAnswers>({});

  const currentStep = STEPS[currentStepIndex];
  const isComplete = currentStepIndex >= STEPS.length;
  const progress = useMemo(
    () => `${Math.min(currentStepIndex + 1, STEPS.length)} of ${STEPS.length}`,
    [currentStepIndex]
  );

  useInput((_input, key) => {
    if (isComplete || !currentStep) {
      return;
    }

    if (key.upArrow) {
      setSelectedOptionIndex((index) =>
        index === 0 ? currentStep.options.length - 1 : index - 1
      );
      return;
    }

    if (key.downArrow) {
      setSelectedOptionIndex((index) =>
        index === currentStep.options.length - 1 ? 0 : index + 1
      );
      return;
    }

    if (key.return) {
      setAnswers((currentAnswers) => ({
        ...currentAnswers,
        [currentStep.id]: currentStep.options[selectedOptionIndex],
      }));
      setCurrentStepIndex((index) => index + 1);
      setSelectedOptionIndex(0);
    }
  });

  if (isComplete) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text bold>IaC Toolbox wizard</Text>
        <Text color="green">Wizard complete.</Text>
        <AnswerSummary answers={answers} />
        <Box marginTop={1} flexDirection="column">
          <Text>No backend action was run.</Text>
          <Text color="gray">Press Ctrl+C to exit.</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold>IaC Toolbox wizard</Text>
      <Text color="gray">Step {progress}</Text>

      <Box flexDirection="column" marginTop={1}>
        <Text bold>{currentStep.title}</Text>
        <Text>{currentStep.prompt}</Text>
      </Box>

      <Box flexDirection="column" marginTop={1}>
        {currentStep.options.map((option, index) => (
          <WizardOptionRow
            key={option.label}
            option={option}
            isSelected={index === selectedOptionIndex}
          />
        ))}
      </Box>

      <Box marginTop={1}>
        <Text color="gray">Use Up/Down to choose, Enter to continue.</Text>
      </Box>
    </Box>
  );
}
