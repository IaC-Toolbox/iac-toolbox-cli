import { Box, Text, useInput } from 'ink';
import { useState } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
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

  useInput((_input, key) => {
    if (hasSelected) return;

    if (key.upArrow) {
      let newIndex = selectedIndex;
      do {
        newIndex = newIndex > 0 ? newIndex - 1 : options.length - 1;
      } while (options[newIndex].disabled && newIndex !== selectedIndex);
      setSelectedIndex(newIndex);
    } else if (key.downArrow) {
      let newIndex = selectedIndex;
      do {
        newIndex = newIndex < options.length - 1 ? newIndex + 1 : 0;
      } while (options[newIndex].disabled && newIndex !== selectedIndex);
      setSelectedIndex(newIndex);
    } else if (key.return) {
      if (!options[selectedIndex].disabled) {
        setHasSelected(true);
        onSelect(options[selectedIndex].value);
      }
    }
  });

  return (
    <Box flexDirection="column">
      <Text>◆  {title}</Text>
      {options.map((option, index) => (
        <Text key={option.value} dimColor={option.disabled}>
          │  {selectedIndex === index ? '●' : '○'} {option.label}
        </Text>
      ))}
      {showBorder && !hasSelected && <Text>└</Text>}
    </Box>
  );
}
