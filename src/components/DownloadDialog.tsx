import { Box, Text } from 'ink';
import { useState, useEffect } from 'react';
import * as path from 'path';
import { downloadInfrastructureFiles } from '../utils/downloadFiles.js';

const SPINNER_FRAMES = ['◜', '◠', '◝', '◞', '●'];

type DownloadState = 'idle' | 'creating' | 'downloading' | 'completed';

interface DownloadDialogProps {
  targetDir: string;
  onComplete?: () => void;
}

export default function DownloadDialog({ targetDir, onComplete }: DownloadDialogProps) {
  const [state, setState] = useState<DownloadState>('idle');
  const [spinnerIndex, setSpinnerIndex] = useState(0);

  useEffect(() => {
    const spinnerInterval = setInterval(() => {
      setSpinnerIndex((prev) => (prev + 1) % SPINNER_FRAMES.length);
    }, 100);

    return () => clearInterval(spinnerInterval);
  }, []);

  useEffect(() => {
    const runDownload = async () => {
      // Start creating directory
      setState('creating');
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Start downloading
      setState('downloading');

      try {
        await downloadInfrastructureFiles(targetDir);
      } catch (error) {
        console.error('Download failed:', error);
      }

      // Complete
      setState('completed');
      if (onComplete) {
        onComplete();
      }
    };

    runDownload();
  }, [targetDir, onComplete]);

  const spinner = SPINNER_FRAMES[spinnerIndex];

  return (
    <Box flexDirection="column">
      <Text>◆  Downloading infrastructure scripts...</Text>
      <Text>│  Cloning IaC-Toolbox Raspberry Pi templates</Text>
      <Text>
        │  {state === 'creating' ? spinner : '●'} Creating directory...
      </Text>
      <Text>
        │  {state === 'downloading' ? spinner : state === 'completed' ? '●' : ' '} Downloading files...
      </Text>
      {state === 'completed' && <Text>│  ● Completed</Text>}
      {!onComplete && state === 'completed' && <Text>│</Text>}
      {!onComplete && state === 'completed' && (
        <Text>◆  Scripts installed successfully</Text>
      )}
      {!onComplete && state === 'completed' && (
        <Text>│  Files saved to `{path.join(process.cwd(), targetDir)}`</Text>
      )}
      {!onComplete && state === 'completed' && <Text>└</Text>}
    </Box>
  );
}
