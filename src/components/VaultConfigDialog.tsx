import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import SelectInput from 'ink-select-input';
import { useState } from 'react';

interface VaultConfig {
  enabled: boolean;
  storagePath?: string;
  port?: number;
}

interface VaultConfigDialogProps {
  existingConfig?: Partial<VaultConfig>;
  onComplete: (config: VaultConfig) => void;
}

type Step = 'enable' | 'pathChoice' | 'customPath' | 'port';

interface SelectOption {
  label: string;
  value: string;
}

export default function VaultConfigDialog({
  existingConfig,
  onComplete,
}: VaultConfigDialogProps) {
  const [step, setStep] = useState<Step>('enable');
  const [storagePath, setStoragePath] = useState(
    existingConfig?.storagePath || '~/vault'
  );
  const [port, setPort] = useState(existingConfig?.port || 8200);
  const [inputValue, setInputValue] = useState('');

  if (step === 'enable') {
    const options: SelectOption[] = [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
      { label: 'Skip for now', value: 'skip' },
    ];

    const handleSelect = (item: SelectOption) => {
      if (item.value === 'yes') {
        setStep('pathChoice');
      } else {
        onComplete({ enabled: false });
      }
    };

    return (
      <Box flexDirection="column" paddingY={1}>
        <Text bold>◆ Install HashiCorp Vault?</Text>
        <Box paddingLeft={3}>
          <Text dimColor>(Secrets management)</Text>
        </Box>
        <Box paddingLeft={3}>
          <SelectInput items={options} onSelect={handleSelect} />
        </Box>
      </Box>
    );
  }

  if (step === 'pathChoice') {
    const options: SelectOption[] = [
      { label: 'Use default', value: 'default' },
      { label: 'Custom path', value: 'custom' },
    ];

    const handleSelect = (item: SelectOption) => {
      if (item.value === 'default') {
        setStep('port');
      } else {
        setStep('customPath');
      }
    };

    return (
      <Box flexDirection="column" paddingY={1}>
        <Text bold>◆ Vault storage path</Text>
        <Box paddingLeft={3}>
          <Text dimColor>(Default: ~/vault)</Text>
        </Box>
        <Box paddingLeft={3}>
          <SelectInput items={options} onSelect={handleSelect} />
        </Box>
      </Box>
    );
  }

  if (step === 'customPath') {
    const handleSubmit = (value: string) => {
      const finalPath = value.trim() || storagePath;
      setStoragePath(finalPath);
      setInputValue('');
      setStep('port');
    };

    return (
      <Box flexDirection="column" paddingY={1}>
        <Text bold>◆ Enter custom storage path</Text>
        <Box paddingLeft={3}>
          <Text dimColor>(Current: {storagePath})</Text>
        </Box>
        <Box paddingLeft={3} marginTop={1}>
          <TextInput
            value={inputValue}
            onChange={setInputValue}
            onSubmit={handleSubmit}
          />
        </Box>
      </Box>
    );
  }

  const handlePortSubmit = (value: string) => {
    const portNum = parseInt(value.trim(), 10);
    if (!isNaN(portNum) && portNum >= 1024 && portNum <= 65535) {
      setPort(portNum);
      onComplete({
        enabled: true,
        storagePath,
        port: portNum,
      });
    } else if (value.trim() === '') {
      onComplete({
        enabled: true,
        storagePath,
        port,
      });
    }
  };

  return (
    <Box flexDirection="column" paddingY={1}>
      <Text bold>◆ Vault port</Text>
      <Box paddingLeft={3}>
        <Text dimColor>(Default: {port})</Text>
      </Box>
      <Box paddingLeft={3} marginTop={1}>
        <TextInput
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handlePortSubmit}
        />
      </Box>
    </Box>
  );
}

export type { VaultConfig };
