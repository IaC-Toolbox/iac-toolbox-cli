import { Box, Text, useInput } from 'ink';
import { useMemo, useState } from 'react';

type WizardOption = {
  label: string;
  description: string;
};

type OptionWizardStep = {
  id: 'workflow' | 'tool' | 'nextStep';
  kind: 'option';
  title: string;
  prompt: string;
  options: WizardOption[];
};

type FolderWizardStep = {
  id: 'snippetFolder';
  kind: 'folder';
  title: string;
  prompt: string;
  defaultValue: string;
};

type WizardStep = OptionWizardStep | FolderWizardStep;

type WizardAnswers = Partial<Record<OptionWizardStep['id'], WizardOption>> & {
  snippetFolder?: string;
};

const defaultSnippetFolder = process.cwd();

const STEPS: WizardStep[] = [
  {
    id: 'workflow',
    kind: 'option',
    title: 'Workflow',
    prompt: 'What do you want to prepare?',
    options: [
      {
        label: 'Download Raspberry Pi snippets',
        description: 'Prepare setup assets before installation begins.',
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
    id: 'snippetFolder',
    kind: 'folder',
    title: 'Raspberry Pi snippet folder',
    prompt: 'Where should Raspberry Pi snippets be downloaded?',
    defaultValue: defaultSnippetFolder,
  },
  {
    id: 'tool',
    kind: 'option',
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
    kind: 'option',
    title: 'Next step',
    prompt: 'What should happen after this preview?',
    options: [
      {
        label: 'Install from selected folder',
        description: 'Use the downloaded snippets from the chosen location.',
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

function FolderPrompt({
  value,
  defaultValue,
}: {
  value: string;
  defaultValue: string;
}) {
  const displayValue = value.length > 0 ? value : defaultValue;

  return (
    <Box flexDirection="column" marginTop={1}>
      <Text>
        <Text color="cyan">{displayValue}</Text>
        {value.length === 0 ? <Text color="gray"> (default)</Text> : null}
      </Text>
      <Text color="gray">Type a path or press Enter to use the default.</Text>
    </Box>
  );
}

function AnswerSummary({ answers }: { answers: WizardAnswers }) {
  const snippetFolder = answers.snippetFolder ?? defaultSnippetFolder;

  return (
    <Box flexDirection="column" marginTop={1}>
      {STEPS.map((step) => (
        <Text key={step.id}>
          <Text color="gray">{step.title}: </Text>
          {step.kind === 'folder'
            ? snippetFolder
            : answers[step.id]?.label ?? 'Not selected'}
        </Text>
      ))}
    </Box>
  );
}

export default function App() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);
  const [snippetFolderInput, setSnippetFolderInput] = useState('');
  const [answers, setAnswers] = useState<WizardAnswers>({});

  const currentStep = STEPS[currentStepIndex];
  const isComplete = currentStepIndex >= STEPS.length;
  const selectedSnippetFolder = answers.snippetFolder ?? defaultSnippetFolder;
  const progress = useMemo(
    () => `${Math.min(currentStepIndex + 1, STEPS.length)} of ${STEPS.length}`,
    [currentStepIndex]
  );

  useInput((_input, key) => {
    if (isComplete || !currentStep) {
      return;
    }

    if (currentStep.kind === 'folder') {
      if (key.return) {
        setAnswers((currentAnswers) => ({
          ...currentAnswers,
          snippetFolder: snippetFolderInput.trim() || currentStep.defaultValue,
        }));
        setCurrentStepIndex((index) => index + 1);
        setSnippetFolderInput('');
        return;
      }

      if (key.backspace || key.delete) {
        setSnippetFolderInput((value) => value.slice(0, -1));
        return;
      }

      if (_input.length > 0 && !key.ctrl && !key.meta) {
        setSnippetFolderInput((value) => `${value}${_input}`);
      }

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
          <Text>Download/install flow will use: {selectedSnippetFolder}</Text>
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

      {currentStep.kind === 'folder' ? (
        <FolderPrompt
          value={snippetFolderInput}
          defaultValue={currentStep.defaultValue}
        />
      ) : (
        <Box flexDirection="column" marginTop={1}>
          {currentStep.options.map((option, index) => (
            <WizardOptionRow
              key={option.label}
              option={option}
              isSelected={index === selectedOptionIndex}
            />
          ))}
        </Box>
      )}

      <Box marginTop={1}>
        <Text color="gray">
          {currentStep.kind === 'folder'
            ? 'Type a folder path, Backspace to edit, Enter to continue.'
            : 'Use Up/Down to choose, Enter to continue.'}
        </Text>
      </Box>
    </Box>
  );
}
