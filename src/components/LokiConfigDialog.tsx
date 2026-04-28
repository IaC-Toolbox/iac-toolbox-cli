import { useState } from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import SelectDialog, { SelectOption } from './SelectDialog.js';

interface LokiConfig {
  enabled: boolean;
  retentionHours?: number;
  alloyDomain?: string;
}

interface LokiConfigDialogProps {
  onComplete: (config: LokiConfig) => void;
  cloudflareConfigured?: boolean;
  defaultAlloyDomain?: string;
}

/**
 * Loki log aggregation configuration dialog.
 * Prompts for:
 * 1. Enable/disable Loki installation
 * 2. If enabled, select log retention period
 * 3. If enabled, prompt for Alloy domain (unless Cloudflare is configured)
 */
export default function LokiConfigDialog({
  onComplete,
  cloudflareConfigured = false,
  defaultAlloyDomain = 'alloy.iac-toolbox.com',
}: LokiConfigDialogProps) {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [retentionHours, setRetentionHours] = useState<number | null>(null);
  const [alloyDomain, setAlloyDomain] = useState('');

  // Step 1: Ask if Loki should be installed
  if (enabled === null) {
    const options: SelectOption[] = [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
    ];

    const handleEnableSelect = (value: string) => {
      const isEnabled = value === 'yes';
      setEnabled(isEnabled);

      // If disabled, complete immediately
      if (!isEnabled) {
        onComplete({ enabled: false });
      }
    };

    return (
      <SelectDialog
        title="Install Loki?"
        options={options}
        onSelect={handleEnableSelect}
      />
    );
  }

  // Step 2: Ask for retention period (only if enabled)
  if (retentionHours === null) {
    const retentionOptions: SelectOption[] = [
      { label: '3 days (72 hours)', value: '72' },
      { label: '7 days (168 hours)', value: '168' },
      { label: '14 days (336 hours)', value: '336' },
      { label: '30 days (720 hours)', value: '720' },
    ];

    const handleRetentionSelect = (value: string) => {
      const hours = parseInt(value, 10);
      setRetentionHours(hours);

      // If Cloudflare is configured, we can use the domain from there
      // Complete immediately with default domain
      if (cloudflareConfigured) {
        onComplete({
          enabled: true,
          retentionHours: hours,
          alloyDomain: defaultAlloyDomain,
        });
      }
    };

    return (
      <SelectDialog
        title="Log retention period"
        options={retentionOptions}
        onSelect={handleRetentionSelect}
      />
    );
  }

  // Step 3: Ask for Alloy domain (only if Cloudflare not configured)
  const handleDomainSubmit = (value: string) => {
    const domain = value.trim() || defaultAlloyDomain;
    onComplete({
      enabled: true,
      retentionHours,
      alloyDomain: domain,
    });
  };

  return (
    <Box flexDirection="column" paddingY={1}>
      <Text bold>◆ Alloy domain</Text>
      <Box paddingLeft={3} flexDirection="column">
        <Text dimColor>(Press Enter to use default: {defaultAlloyDomain})</Text>
        <Box marginTop={1}>
          <Text>Domain: </Text>
          <TextInput
            value={alloyDomain}
            onChange={setAlloyDomain}
            onSubmit={handleDomainSubmit}
            placeholder={defaultAlloyDomain}
          />
        </Box>
      </Box>
    </Box>
  );
}

export type { LokiConfig };
