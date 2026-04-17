import { Box, Text } from 'ink';
import { useState } from 'react';
import DownloadDialog from './components/DownloadDialog.js';

export default function App() {
  const [downloadComplete, setDownloadComplete] = useState(false);

  // For demo purposes, use /tmp/infrastructure as destination
  const destination = '/tmp/infrastructure';

  const handleDownloadComplete = () => {
    setDownloadComplete(true);
  };

  // Show download dialog
  if (!downloadComplete) {
    return (
      <DownloadDialog
        destination={destination}
        onComplete={handleDownloadComplete}
      />
    );
  }

  // Show completion message
  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="green">
        Download complete!
      </Text>
      <Text>Infrastructure scripts are ready at: {destination}</Text>
    </Box>
  );
}
