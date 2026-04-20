import { Box, Text } from 'ink';
import type { InstallResult } from '../utils/installRunner.js';

interface InstallCompleteDialogProps {
  result: InstallResult;
  selectedIntegrations: string[];
  destination: string;
}

/**
 * Shown after install.sh completes. Displays either a success screen
 * listing what was installed, or a failure screen with exit code and
 * last error line.
 */
export default function InstallCompleteDialog({
  result,
  selectedIntegrations,
  destination,
}: InstallCompleteDialogProps) {
  if (result.success) {
    return (
      <Box flexDirection="column" paddingY={1}>
        <Text bold color="green">
          {'◆ Install completed'}
        </Text>
        <Text>{'│'}</Text>
        <Text>{'│ ✓ Docker installed and configured'}</Text>
        {selectedIntegrations.includes('github_build_workflow') && (
          <Text>{'│ ✓ GitHub Build Workflow ready'}</Text>
        )}
        <Text>{'│'}</Text>
        <Text>
          {'│ Run `iac-toolbox status` to verify your setup'}
        </Text>
        <Text>{'└'}</Text>
      </Box>
    );
  }

  // Failure screen
  return (
    <Box flexDirection="column" paddingY={1}>
      <Text bold color="red">
        {'◆ Install failed'}
      </Text>
      <Text>{'│'}</Text>
      <Text>
        {'│ Exit code: '}
        {result.exitCode ?? 'unknown'}
      </Text>
      {result.lastErrorLine && (
        <Text>
          {'│ Error: '}
          {result.lastErrorLine}
        </Text>
      )}
      <Text>{'│'}</Text>
      <Text>
        {'│ Full log available at: '}
        {destination}/install.log
      </Text>
      <Text>{'└'}</Text>
    </Box>
  );
}
