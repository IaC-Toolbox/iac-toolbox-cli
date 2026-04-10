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
  },
  {
    id: 'skip',
    label: 'Skip',
  },
] as const;

type OptionId = (typeof options)[number]['id'];

function moveSelection(currentIndex: number, direction: 'up' | 'down') {
  if (direction === 'up') {
    return currentIndex === 0 ? options.length - 1 : currentIndex - 1;
  }

  return currentIndex === options.length - 1 ? 0 : currentIndex + 1;
}

function Header() {
  return (
    <Box flexDirection="column" marginBottom={1}>
      <Text color={WHITE} bold>
        IaC Toolbox CLI
      </Text>
      <Text color={SLATE}>Select an option with ↑/↓ and press Enter.</Text>
    </Box>
  );
}

function Menu({ selectedIndex }: { selectedIndex: number }) {
  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={CYAN}
      paddingX={1}
      paddingY={1}
    >
      {options.map((option, index) => {
        const isSelected = index === selectedIndex;

        return (
          <Text key={option.id} color={isSelected ? GREEN : WHITE} bold={isSelected}>
            {isSelected ? '›' : ' '} {option.label}
          </Text>
        );
      })}
    </Box>
  );
}

function Result({ confirmed }: { confirmed: OptionId }) {
  if (confirmed === 'install-all') {
    return (
      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor={GREEN}
        paddingX={1}
        paddingY={1}
      >
        <Text color={WHITE} bold>
          Install all selected
        </Text>
        <Text color={SLATE}>Install flow placeholder accepted.</Text>
        <Text color={SLATE}>Press Enter, Escape, or Q to exit.</Text>
      </Box>
    );
  }

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={YELLOW}
      paddingX={1}
      paddingY={1}
    >
      <Text color={WHITE} bold>
        Skip selected
      </Text>
      <Text color={SLATE}>Nothing will be installed.</Text>
      <Text color={SLATE}>Press Enter, Escape, or Q to exit.</Text>
    </Box>
  );
}

function Footer() {
  return (
    <Box marginTop={1}>
      <Text color={SLATE}>↑/↓ move   Enter select   Q quit</Text>
    </Box>
  );
}

export default function App() {
  const { exit } = useApp();
  const { isRawModeSupported } = useStdin();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [confirmed, setConfirmed] = useState<OptionId | null>(null);

  useInput(
    (input, key) => {
      if (input.toLowerCase() === 'q' || key.escape) {
        exit();
        return;
      }

      if (confirmed) {
        if (key.return) {
          exit();
        }
        return;
      }

      if (key.upArrow) {
        setSelectedIndex((currentIndex) => moveSelection(currentIndex, 'up'));
        return;
      }

      if (key.downArrow) {
        setSelectedIndex((currentIndex) => moveSelection(currentIndex, 'down'));
        return;
      }

      if (key.return) {
        setConfirmed(options[selectedIndex].id);
      }
    },
    { isActive: isRawModeSupported }
  );

  return (
    <Box flexDirection="column" padding={1}>
      <Header />
      {confirmed ? <Result confirmed={confirmed} /> : <Menu selectedIndex={selectedIndex} />}
      {!confirmed ? <Footer /> : null}
      {!isRawModeSupported ? (
        <Box marginTop={1}>
          <Text color={YELLOW}>Interactive input is unavailable in this terminal. Run the CLI in a real TTY.</Text>
        </Box>
      ) : null}
    </Box>
  );
}
