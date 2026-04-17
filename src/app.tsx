import { Box, Text } from 'ink';
import { useState } from 'react';
import DirectoryDialog from './components/DirectoryDialog.js';

export default function App() {
  const [scriptsDirectory, setScriptsDirectory] = useState<string | null>(null);

  const handleDirectorySelect = (directory: string) => {
    setScriptsDirectory(directory);
  };

  // Show directory selection dialog
  if (!scriptsDirectory) {
    return <DirectoryDialog onSelect={handleDirectorySelect} />;
  }

  // Show confirmation after selection
  return (
    <Box flexDirection="column" padding={1}>
      <Text>◇ Use `/infrastructure` directory?</Text>
      <Text>│ {scriptsDirectory === '/infrastructure' ? 'Yes' : 'No'}</Text>
      <Text>│</Text>
      <Text>│ Will install to: {scriptsDirectory}</Text>
      <Text>└</Text>
    </Box>
  );
}
