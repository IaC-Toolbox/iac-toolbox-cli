import { Box, Text } from 'ink';
import { useState } from 'react';
import SelectDialog, { SelectOption } from './SelectDialog.js';

interface CloudflareConfigDialogProps {
  onComplete: (config: { enabled: boolean; mode?: 'token' | 'oauth' }) => void;
}

const mainOptions: SelectOption[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'skip', label: 'Skip for now' },
];

const authOptions: SelectOption[] = [
  { value: 'token', label: 'API Token (recommended)' },
  { value: 'oauth', label: 'OAuth' },
  { value: 'skip', label: 'Skip for now' },
];

export default function CloudflareConfigDialog({
  onComplete,
}: CloudflareConfigDialogProps) {
  const [step, setStep] = useState<'main' | 'auth' | 'complete'>('main');

  const handleMainSelect = (value: string) => {
    if (value === 'yes') {
      setStep('auth');
    } else {
      // No or Skip
      onComplete({ enabled: false });
      setStep('complete');
    }
  };

  const handleAuthSelect = (value: string) => {
    if (value === 'skip') {
      onComplete({ enabled: false });
    } else {
      onComplete({ enabled: true, mode: value as 'token' | 'oauth' });
    }
    setStep('complete');
  };

  if (step === 'complete') {
    return null;
  }

  return (
    <Box flexDirection="column">
      {step === 'main' && (
        <SelectDialog
          title="Expose services via Cloudflare Tunnel?"
          options={mainOptions}
          onSelect={handleMainSelect}
        />
      )}
      {step === 'auth' && (
        <Box flexDirection="column">
          <Text>◇  Expose services via Cloudflare Tunnel?</Text>
          <Text>│  Yes</Text>
          <Text>│</Text>
          <SelectDialog
            title="Choose authentication method"
            options={authOptions}
            onSelect={handleAuthSelect}
          />
        </Box>
      )}
    </Box>
  );
}
