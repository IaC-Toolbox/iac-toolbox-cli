import { Box, Text } from 'ink';
import { useState } from 'react';
import SelectDialog, { SelectOption } from './components/SelectDialog.js';

export default function App() {
  const [selection, setSelection] = useState<string | null>(null);

  const handleSelect = (value: string) => {
    setSelection(value);
  };

  if (selection) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="green">✓ You selected: {selection}</Text>
      </Box>
    );
  }

  const options: SelectOption[] = [
    { label: 'Option 1', value: 'option1' },
    { label: 'Option 2', value: 'option2' },
    { label: 'Skip', value: 'skip' },
  ];

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold>IaC Toolbox wizard</Text>
      <SelectDialog
        title="Choose an option"
        options={options}
        onSelect={handleSelect}
      />
    </Box>
  );
}
