import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import SelectInput from 'ink-select-input';
import { useState } from 'react';

interface GrafanaConfig {
  enabled: boolean;
  adminUser?: string;
  adminPassword?: string;
}

interface GrafanaConfigDialogProps {
  existingConfig?: Partial<GrafanaConfig>;
  onComplete: (config: GrafanaConfig) => void;
}

type Step = 'enable' | 'username' | 'passwordChoice' | 'customPassword';

interface SelectOption {
  label: string;
  value: string;
}

function generateSecurePassword(): string {
  const length = 24;
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    password += charset[array[i] % charset.length];
  }
  return password;
}

export default function GrafanaConfigDialog({
  existingConfig,
  onComplete,
}: GrafanaConfigDialogProps) {
  const [step, setStep] = useState<Step>('enable');
  const [adminUser, setAdminUser] = useState(
    existingConfig?.adminUser || 'admin'
  );
  const [adminPassword, setAdminPassword] = useState(
    existingConfig?.adminPassword || ''
  );
  const [inputValue, setInputValue] = useState('');

  if (step === 'enable') {
    const options: SelectOption[] = [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
    ];

    const handleSelect = (item: SelectOption) => {
      if (item.value === 'yes') {
        setStep('username');
      } else {
        onComplete({ enabled: false });
      }
    };

    return (
      <Box flexDirection="column" paddingY={1}>
        <Text bold>◆ Install Grafana?</Text>
        <Box paddingLeft={3}>
          <Text dimColor>(Visualization dashboards)</Text>
        </Box>
        <Box paddingLeft={3}>
          <SelectInput items={options} onSelect={handleSelect} />
        </Box>
      </Box>
    );
  }

  if (step === 'username') {
    const handleSubmit = (value: string) => {
      const finalUser = value.trim() || adminUser;
      setAdminUser(finalUser);
      setInputValue('');
      setStep('passwordChoice');
    };

    return (
      <Box flexDirection="column" paddingY={1}>
        <Text bold>◆ Grafana admin username</Text>
        <Box paddingLeft={3}>
          <Text dimColor>(Current: {adminUser} - press Enter to keep)</Text>
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

  if (step === 'passwordChoice') {
    const options: SelectOption[] = [
      { label: 'Use existing/Generate secure password', value: 'generate' },
      { label: 'Enter custom password', value: 'custom' },
    ];

    const handleSelect = (item: SelectOption) => {
      if (item.value === 'generate') {
        const password = adminPassword || generateSecurePassword();
        setAdminPassword(password);
        onComplete({
          enabled: true,
          adminUser,
          adminPassword: password,
        });
      } else {
        setStep('customPassword');
      }
    };

    return (
      <Box flexDirection="column" paddingY={1}>
        <Text bold>◆ Grafana admin password</Text>
        <Box paddingLeft={3}>
          <Text dimColor>
            (Current: {adminPassword ? '***hidden***' : 'not set'} - press Enter
            to keep)
          </Text>
        </Box>
        <Box paddingLeft={3}>
          <SelectInput items={options} onSelect={handleSelect} />
        </Box>
      </Box>
    );
  }

  const handlePasswordSubmit = (value: string) => {
    const finalPassword =
      value.trim() || adminPassword || generateSecurePassword();
    setAdminPassword(finalPassword);
    onComplete({
      enabled: true,
      adminUser,
      adminPassword: finalPassword,
    });
  };

  return (
    <Box flexDirection="column" paddingY={1}>
      <Text bold>◆ Enter custom admin password</Text>
      <Box paddingLeft={3}>
        <Text dimColor>(Press Enter for secure generated password)</Text>
      </Box>
      <Box paddingLeft={3} marginTop={1}>
        <TextInput
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handlePasswordSubmit}
          mask="*"
        />
      </Box>
    </Box>
  );
}

export type { GrafanaConfig };
