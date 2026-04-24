import { Box, Text } from 'ink';
import path from 'path';
import { useEffect } from 'react';

interface Props {
  onSelect: (directory: string, useExisting: boolean) => void;
}

export default function DirectoryDialog({ onSelect }: Props) {
  const infrastructureDir = path.join(process.cwd(), 'infrastructure');

  useEffect(() => {
    onSelect(infrastructureDir, false);
  }, [infrastructureDir, onSelect]);

  return (
    <Box flexDirection="column" paddingY={1}>
      <Text bold>◇ Using /infrastructure directory</Text>
      <Box paddingLeft={3}>
        <Text dimColor>
          The /infrastructure folder will be created in the current working
          directory.
        </Text>
      </Box>
    </Box>
  );
}
