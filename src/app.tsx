import { Box, Text } from 'ink';
import { useState } from 'react';
import DownloadDialog from './components/DownloadDialog.js';
import DockerConfigDialog from './components/DockerConfigDialog.js';
import CloudflareConfigDialog from './components/CloudflareConfigDialog.js';
import { WizardConfig } from './types/config.js';
import { writeConfigYaml } from './utils/configWriter.js';

type WizardStep = 'download' | 'docker' | 'cloudflare' | 'complete';

export default function App() {
  const [step, setStep] = useState<WizardStep>('download');
  const [config, setConfig] = useState<WizardConfig>({
    docker: { enabled: false },
    cloudflare: { enabled: false },
  });
  const [downloadComplete, setDownloadComplete] = useState(false);
  const targetDir = 'infrastructure';

  const handleDownloadComplete = () => {
    setDownloadComplete(true);
    setTimeout(() => {
      setStep('docker');
    }, 100);
  };

  const handleDockerConfig = (enabled: boolean) => {
    const newConfig = {
      ...config,
      docker: { enabled },
    };
    setConfig(newConfig);
    setTimeout(() => {
      setStep('cloudflare');
    }, 100);
  };

  const handleCloudflareConfig = (cloudflareConfig: {
    enabled: boolean;
    mode?: 'token' | 'oauth';
  }) => {
    const newConfig = {
      ...config,
      cloudflare: cloudflareConfig,
    };
    setConfig(newConfig);
    writeConfigYaml(targetDir, newConfig);
    setTimeout(() => {
      setStep('complete');
    }, 100);
  };

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold>IaC Toolbox wizard</Text>
      <Box marginTop={1}>
        {step === 'download' && (
          <DownloadDialog
            targetDir={targetDir}
            onComplete={handleDownloadComplete}
          />
        )}
        {step === 'docker' && (
          <Box flexDirection="column">
            <Text>◇  Scripts installed successfully</Text>
            <Text>│  Files saved to `{targetDir}`</Text>
            <Text>│</Text>
            <DockerConfigDialog onComplete={handleDockerConfig} />
          </Box>
        )}
        {step === 'cloudflare' && (
          <Box flexDirection="column">
            <Text>◇  Install Docker?</Text>
            <Text>│  {config.docker.enabled ? 'Yes' : 'No'}</Text>
            <Text>│</Text>
            <CloudflareConfigDialog onComplete={handleCloudflareConfig} />
          </Box>
        )}
        {step === 'complete' && (
          <Box flexDirection="column">
            <Text color="green">✓ Configuration complete!</Text>
            <Text>Configuration saved to {targetDir}/config.yaml</Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}
