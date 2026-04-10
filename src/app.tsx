import { Box, Text, useApp, useInput, useStdin } from 'ink';
import { useState } from 'react';

const CYAN = '#06b6d4';
const GREEN = '#22c55e';
const YELLOW = '#eab308';
const SLATE = '#94a3b8';
const WHITE = '#f8fafc';

const options = [
  {
    id: 'install-all',
    label: 'Install all',
    description: 'Run the full terminal app installation flow.',
  },
  {
    id: 'skip',
    label: 'Skip',
    description: 'Exit without starting installation.',
  },
] as const;

type OptionId = (typeof options)[number]['id'];

type SelectionState = {
  selectedIndex: number;
  confirmed: OptionId | null;
};

function Header() {
  return (
    <Box flexDirection="column" marginBottom={1}>
      <Text color={WHITE} bold>
        IaC Toolbox CLI
      </Text>
      <Text color={SLATE}>Choose an action and press Enter.</Text>
    </Box>
  );
}

type MenuProps = {
  selectedIndex: number;
};

function Menu({ selectedIndex }: MenuProps) {
  return (
    <Box flexDirection="column" borderStyle="round" borderColor={CYAN} paddingX={1} paddingY={1}>
      {options.map((option, index) => {
        const isSelected = index === selectedIndex;

        return (
          <Box key={option.id} flexDirection="column" marginBottom={index === options.length - 1 ? 0 : 1}>
            <Text color={isSelected ? GREEN : WHITE} bold={isSelected}>
              {isSelected ? '›' : ' '} {option.label}
            </Text>
            <Text color={SLATE}>{option.description}</Text>
          </Box>
        );
      })}
    </Box>
  );
}

type ResultProps = {
  confirmed: OptionId;
};

function Result({ confirmed }: ResultProps) {
  const isInstallAll = confirmed === 'install-all';

  return (
    <Box flexDirection="column" borderStyle="round" borderColor={isInstallAll ? GREEN : YELLOW} paddingX={1} paddingY={1}>
      <Text color={WHITE} bold>
        {isInstallAll ? 'Install all selected' : 'Skip selected'}
      </Text>
      <Text color={SLATE}>
        {isInstallAll
          ? 'The new minimal UI is wired. Next step is attaching this selection to the real install flow.'
          : 'No installation was started.'}
      </Text>
      <Text color={SLATE}>Press Enter, Escape, or Q to exit.</Text>
    </Box>
  );
}

function Footer() {
  return (
    <Box marginTop={1}>
      <Text color={SLATE}>↑/↓ move   Enter confirm   Q quit</Text>
    </Box>
  );
}

export default function App() {
  const { exit } = useApp();
  const { isRawModeSupported } = useStdin();
  const [state, setState] = useState<SelectionState>({
    selectedIndex: 0,
    confirmed: null,
  });

  useInput(
    (input, key) => {
      if (input.toLowerCase() === 'q' || key.escape) {
        exit();
        return;
      }

      if (state.confirmed) {
        if (key.return) {
          exit();
        }

        return;
      }

      if (key.upArrow) {
        setState((previous) => ({
          ...previous,
          selectedIndex:
            previous.selectedIndex === 0
              ? options.length - 1
              : previous.selectedIndex - 1,
        }));
        return;
      }

      if (key.downArrow) {
        setState((previous) => ({
          ...previous,
          selectedIndex:
            previous.selectedIndex === options.length - 1
              ? 0
              : previous.selectedIndex + 1,
        }));
        return;
      }

      if (key.return) {
        setState((previous) => ({
          ...previous,
          confirmed: options[previous.selectedIndex].id,
        }));
      }
    },
    { isActive: isRawModeSupported }
  );

  return (
    <Box flexDirection="column" padding={1}>
      <Header />
      {state.confirmed ? (
        <Result confirmed={state.confirmed} />
      ) : (
        <>
          <Menu selectedIndex={state.selectedIndex} />
          <Footer />
        </>
      )}
      {!isRawModeSupported ? (
        <Box marginTop={1}>
          <Text color={YELLOW}>
            Interactive input is unavailable in this terminal. Run the CLI in a real TTY.
          </Text>
        </Box>
      ) : null}
    </Box>
  );
}
