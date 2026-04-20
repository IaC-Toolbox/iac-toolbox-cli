import { Box, Text } from 'ink';
import { useState, useEffect } from 'react';
import Spinner from 'ink-spinner';
import {
  buildInstallEnv,
  runInstallScript,
  installScriptExists,
} from '../utils/installRunner.js';
import type { InstallResult } from '../utils/installRunner.js';

interface InstallRunnerDialogProps {
  destination: string;
  profile: string;
  dockerHubUsername?: string;
  dockerImageName?: string;
  onComplete: (result: InstallResult) => void;
}

/**
 * Live install screen that spawns install.sh and streams output to the terminal.
 *
 * Shows a spinner while the script runs, then calls onComplete with the result.
 * If install.sh is not found, shows an inline error immediately.
 */
export default function InstallRunnerDialog({
  destination,
  profile,
  dockerHubUsername,
  dockerImageName,
  onComplete,
}: InstallRunnerDialogProps) {
  const [running, setRunning] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Check script exists before spawning
    if (!installScriptExists(destination)) {
      setRunning(false);
      setError(
        `install.sh not found at ${destination}/scripts/install.sh. Try re-running \`iac-toolbox init\`.`,
      );
      onComplete({
        success: false,
        exitCode: 1,
        lastErrorLine: `install.sh not found at ${destination}/scripts/install.sh`,
        errorLines: [`install.sh not found at ${destination}/scripts/install.sh`],
      });
      return;
    }

    const env = buildInstallEnv(profile, dockerHubUsername, dockerImageName);

    runInstallScript(destination, env).then((result) => {
      if (!cancelled) {
        setRunning(false);
        onComplete(result);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [destination, profile, dockerHubUsername, dockerImageName, onComplete]);

  if (error) {
    return (
      <Box flexDirection="column" paddingY={1}>
        <Text bold color="red">
          {'◆ Install failed'}
        </Text>
        <Text>{'│'}</Text>
        <Text>{'│ '}{error}</Text>
        <Text>{'└'}</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" paddingY={1}>
      <Text bold color="green">
        {'◇ Install now?'}
      </Text>
      <Text>{'│ Yes'}</Text>
      <Text>{'│'}</Text>
      <Text bold>
        {'◆ Running install... '}
        {running && <Spinner type="dots" />}
      </Text>
      <Text>{'│'}</Text>
      <Text dimColor>{'│ Output from install.sh is streamed below:'}</Text>
      <Text>{'│'}</Text>
    </Box>
  );
}
