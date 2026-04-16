import { Box, Text } from 'ink';
import { useState } from 'react';
import DeviceTypeDialog from './components/DeviceTypeDialog.js';
import DirectoryDialog from './components/DirectoryDialog.js';
import DownloadDialog from './components/DownloadDialog.js';
import DockerConfigDialog from './components/DockerConfigDialog.js';
import CloudflareConfigDialog from './components/CloudflareConfigDialog.js';
import { WizardConfig } from './types/config.js';
import { writeConfigYaml } from './utils/configWriter.js';

type WizardStep =
  | 'device-type'
  | 'directory'
  | 'download'
  | 'docker'
  | 'cloudflare'
  | 'complete';

export default function App() {
  const [step, setStep] = useState<WizardStep>('device-type');
  const [deviceType, setDeviceType] = useState<string>('');
  const [targetDir, setTargetDir] = useState<string>('infrastructure');
  const [config, setConfig] = useState<WizardConfig>({
    docker: { enabled: false },
    cloudflare: { enabled: false },
  });

  const handleDeviceTypeSelect = (device: string) => {
    setDeviceType(device);
    setTimeout(() => {
      setStep('directory');
    }, 100);
  };

  const handleDirectorySelect = (useInfrastructureDir: boolean) => {
    if (useInfrastructureDir) {
      setTargetDir('infrastructure');
    } else {
      setTargetDir(process.cwd());
    }
    setTimeout(() => {
      setStep('download');
    }, 100);
  };

  const handleDownloadComplete = () => {
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
      <Box marginTop={1}>
        {step === 'device-type' && (
          <DeviceTypeDialog onComplete={handleDeviceTypeSelect} />
        )}
        {step === 'directory' && (
          <Box flexDirection="column">
            <Text>◇  Choose device type</Text>
            <Text>│  {deviceType === 'raspberry-pi' ? 'Raspberry Pi ARM64' : deviceType}</Text>
            <Text>│</Text>
            <Text>│</Text>
            <DirectoryDialog onComplete={handleDirectorySelect} />
          </Box>
        )}
        {step === 'download' && (
          <Box flexDirection="column">
            <Text>◇  Choose device type</Text>
            <Text>│  {deviceType === 'raspberry-pi' ? 'Raspberry Pi ARM64' : deviceType}</Text>
            <Text>│</Text>
            <Text>◇  Use `/infrastructure` directory?</Text>
            <Text>│  {targetDir === 'infrastructure' ? 'Yes' : 'No'}</Text>
            <Text>│</Text>
            <DownloadDialog
              targetDir={targetDir}
              onComplete={handleDownloadComplete}
            />
          </Box>
        )}
        {step === 'docker' && (
          <Box flexDirection="column">
            <Text>◇  Choose device type</Text>
            <Text>│  {deviceType === 'raspberry-pi' ? 'Raspberry Pi ARM64' : deviceType}</Text>
            <Text>│</Text>
            <Text>◇  Use `/infrastructure` directory?</Text>
            <Text>│  {targetDir === 'infrastructure' ? 'Yes' : 'No'}</Text>
            <Text>│</Text>
            <Text>◇  Scripts installed successfully</Text>
            <Text>│  Files saved to `{targetDir}`</Text>
            <Text>│</Text>
            <DockerConfigDialog onComplete={handleDockerConfig} />
          </Box>
        )}
        {step === 'cloudflare' && (
          <Box flexDirection="column">
            <Text>◇  Choose device type</Text>
            <Text>│  {deviceType === 'raspberry-pi' ? 'Raspberry Pi ARM64' : deviceType}</Text>
            <Text>│</Text>
            <Text>◇  Use `/infrastructure` directory?</Text>
            <Text>│  {targetDir === 'infrastructure' ? 'Yes' : 'No'}</Text>
            <Text>│</Text>
            <Text>◇  Scripts installed successfully</Text>
            <Text>│  Files saved to `{targetDir}`</Text>
            <Text>│</Text>
            <Text>◇  Install Docker?</Text>
            <Text>│  {config.docker.enabled ? 'Yes' : 'No'}</Text>
            <Text>│</Text>
            <CloudflareConfigDialog onComplete={handleCloudflareConfig} />
          </Box>
        )}
        {step === 'complete' && (
          <Box flexDirection="column">
            <Text>◇  Choose device type</Text>
            <Text>│  {deviceType === 'raspberry-pi' ? 'Raspberry Pi ARM64' : deviceType}</Text>
            <Text>│</Text>
            <Text>◇  Use `/infrastructure` directory?</Text>
            <Text>│  {targetDir === 'infrastructure' ? 'Yes' : 'No'}</Text>
            <Text>│</Text>
            <Text>◇  Scripts installed successfully</Text>
            <Text>│  Files saved to `{targetDir}`</Text>
            <Text>│</Text>
            <Text>◇  Install Docker?</Text>
            <Text>│  {config.docker.enabled ? 'Yes' : 'No'}</Text>
            <Text>│</Text>
            <Text color="green">✓ Configuration complete!</Text>
            <Text>Configuration saved to {targetDir}/config.yaml</Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}
