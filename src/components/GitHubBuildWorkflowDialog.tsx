import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import { useState } from 'react';

export interface GitHubBuildWorkflowConfig {
  dockerHubUsername: string;
  dockerHubToken: string;
  dockerImageName: string;
}

interface GitHubBuildWorkflowDialogProps {
  onComplete: (config: GitHubBuildWorkflowConfig) => void;
}

type Step = 'username' | 'token' | 'imageName';

/**
 * Configuration dialog for the GitHub Build Workflow integration.
 *
 * Collects:
 * - Docker Hub username (non-sensitive, written to iac-toolbox.yml)
 * - Docker Hub token (sensitive, written to ~/.iac-toolbox/credentials)
 * - Docker image name (non-sensitive, defaults to username/repo pattern)
 */
export default function GitHubBuildWorkflowDialog({
  onComplete,
}: GitHubBuildWorkflowDialogProps) {
  const [step, setStep] = useState<Step>('username');
  const [username, setUsername] = useState('');
  const [token, setToken] = useState('');
  const [inputValue, setInputValue] = useState('');

  if (step === 'username') {
    const handleSubmit = (value: string) => {
      const finalValue = value.trim();
      if (finalValue) {
        setUsername(finalValue);
        setInputValue('');
        setStep('token');
      }
    };

    return (
      <Box flexDirection="column" paddingY={1}>
        <Text bold color="green">
          {'◇ Select integrations to install'}
        </Text>
        <Text>{'│ GitHub Build Workflow'}</Text>
        <Text>{'│'}</Text>
        <Text bold>{'◆ Docker Hub username'}</Text>
        <Box paddingLeft={3} marginTop={1}>
          <Text>{'› '}</Text>
          <TextInput
            value={inputValue}
            onChange={setInputValue}
            onSubmit={handleSubmit}
          />
        </Box>
      </Box>
    );
  }

  if (step === 'token') {
    const handleSubmit = (value: string) => {
      const finalValue = value.trim();
      if (finalValue) {
        setToken(finalValue);
        setInputValue('');
        setStep('imageName');
      }
    };

    return (
      <Box flexDirection="column" paddingY={1}>
        <Text bold color="green">
          {'◇ Select integrations to install'}
        </Text>
        <Text>{'│ GitHub Build Workflow'}</Text>
        <Text>{'│'}</Text>
        <Text bold>{'◆ Docker Hub token'}</Text>
        <Box paddingLeft={3} marginTop={1}>
          <Text>{'› '}</Text>
          <TextInput
            value={inputValue}
            onChange={setInputValue}
            onSubmit={handleSubmit}
            mask="*"
          />
        </Box>
      </Box>
    );
  }

  // step === 'imageName'
  const defaultImageName = `${username}/my-repo`;
  const handleSubmit = (value: string) => {
    const finalValue = value.trim() || defaultImageName;
    onComplete({
      dockerHubUsername: username,
      dockerHubToken: token,
      dockerImageName: finalValue,
    });
  };

  return (
    <Box flexDirection="column" paddingY={1}>
      <Text bold color="green">
        {'◇ Select integrations to install'}
      </Text>
      <Text>{'│ GitHub Build Workflow'}</Text>
      <Text>{'│'}</Text>
      <Text bold>{'◆ Docker image name'}</Text>
      <Box paddingLeft={3}>
        <Text dimColor>
          (Default: {defaultImageName} — press Enter to use default)
        </Text>
      </Box>
      <Box paddingLeft={3} marginTop={1}>
        <Text>{'› '}</Text>
        <TextInput
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleSubmit}
        />
      </Box>
    </Box>
  );
}
