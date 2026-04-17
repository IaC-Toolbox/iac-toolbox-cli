import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import path from 'path';

interface Props {
  onSelect: (directory: string) => void;
}

interface DirectoryOption {
  label: string;
  value: string;
}

const options: DirectoryOption[] = [
  { label: 'Yes', value: path.join(process.cwd(), 'infrastructure') },
  { label: 'No', value: process.cwd() },
];

export default function DirectoryDialog({ onSelect }: Props) {
  const handleSelect = (item: DirectoryOption) => {
    const resolvedPath = path.resolve(item.value);
    onSelect(resolvedPath);
  };

  return (
    <Box flexDirection="column" paddingY={1}>
      <Text>◆ Use `/infrastructure` directory?</Text>
      <SelectInput items={options} onSelect={handleSelect} />
    </Box>
  );
}
