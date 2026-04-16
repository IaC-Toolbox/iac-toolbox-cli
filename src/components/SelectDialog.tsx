import { Box, Text, useInput } from 'ink';
import { useState } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectDialogProps {
  title: string;
  options: SelectOption[];
  onSelect: (value: string) => void;
  showBorder?: boolean;
}

export default function SelectDialog({
  title,
  options,
  onSelect,
  showBorder = true,
}: SelectDialogProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [hasSelected, setHasSelected] = useState(false);

  useInput((input, key) => {
    if (hasSelected) return;

    if (key.upArrow) {
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
    } else if (key.downArrow) {
      setSelectedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
    } else if (key.return) {
      setHasSelected(true);
      onSelect(options[selectedIndex].value);
    }
  });

  return (
    <Box flexDirection="column">
      <Text>◆  {title}</Text>
      {options.map((option, index) => (
        <Text key={option.value}>
          │  {selectedIndex === index ? '●' : '○'} {option.label}
        </Text>
      ))}
      {showBorder && !hasSelected && <Text>└</Text>}
    </Box>
  );
}
