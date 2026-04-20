import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import { useState } from 'react';

export interface CloudflareConfig {
  enabled: boolean;
  mode: 'api';
  token: string;
  accountId: string;
  zoneId: string;
  zoneName: string;
  tunnelName: string;
  hostname: string;
  servicePort: number;
}

interface CloudflareConfigDialogProps {
  onComplete: (config: CloudflareConfig) => void;
}

type Step = 'token' | 'accountId' | 'zoneId' | 'tunnelName' | 'hostname' | 'servicePort';

interface ValidationState {
  validating: boolean;
  error: string | null;
  success: string | null;
}

async function validateToken(token: string): Promise<{ valid: boolean; message: string }> {
  try {
    const res = await fetch('https://api.cloudflare.com/client/v4/user/tokens/verify', {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const data = (await res.json()) as { success?: boolean };
      if (data.success) return { valid: true, message: 'Token validated' };
    }
    return { valid: false, message: `Cloudflare returned ${res.status}` };
  } catch (e) {
    return { valid: false, message: `Connection failed: ${e instanceof Error ? e.message : 'unknown'}` };
  }
}

async function validateZone(
  token: string,
  zoneId: string,
): Promise<{ valid: boolean; zoneName: string; message: string }> {
  try {
    const res = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const data = (await res.json()) as { success?: boolean; result?: { name?: string } };
      if (data.success && data.result?.name) {
        return { valid: true, zoneName: data.result.name, message: `Zone verified: ${data.result.name}` };
      }
    }
    return { valid: false, zoneName: '', message: `Cloudflare returned ${res.status}` };
  } catch (e) {
    return { valid: false, zoneName: '', message: `Connection failed: ${e instanceof Error ? e.message : 'unknown'}` };
  }
}

export default function CloudflareConfigDialog({
  existingConfig,
  onComplete,
}: CloudflareConfigDialogProps) {
  const [step, setStep] = useState<Step>('enable');
  const [mode, setMode] = useState<'oauth' | 'api'>(
    existingConfig?.mode || 'api'
  );
  const [domain, setDomain] = useState(existingConfig?.domain || '');
  const [token, setToken] = useState(existingConfig?.token || '');
  const [accountId, setAccountId] = useState(existingConfig?.accountId || '');
  const [zoneId, setZoneId] = useState(existingConfig?.zoneId || '');
  const [tunnelName] = useState(
    existingConfig?.tunnelName || 'main-backend-tunnel'
  );
  const [services] = useState<ServiceMapping[]>([
    { subdomain: 'vault', port: 8200 },
    { subdomain: 'grafana', port: 3000 },
    { subdomain: 'alloy', port: 12345 },
  ]);
  const [inputValue, setInputValue] = useState('');

  // Step 1: Enable/Skip
  if (step === 'enable') {
    const options: SelectOption[] = [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
      { label: 'Skip for now', value: 'skip' },
    ];

    const handleSelect = (item: SelectOption) => {
      if (item.value === 'yes') {
        setStep('mode');
      } else {
        onComplete({ enabled: false });
      }
    };

    return (
      <Box flexDirection="column" paddingY={1}>
        <Text bold>◆ Expose services via Cloudflare Tunnel?</Text>
        <Box paddingLeft={3}>
          <SelectInput items={options} onSelect={handleSelect} />
        </Box>
      </Box>
    );
  }

  // Step 2: Mode selection
  if (step === 'mode') {
    const options: SelectOption[] = [
      { label: 'API Token (recommended)', value: 'api' },
      { label: 'OAuth', value: 'oauth' },
      { label: 'Skip for now', value: 'skip' },
    ];

    const handleSelect = (item: SelectOption) => {
      if (item.value === 'skip') {
        onComplete({ enabled: false });
      } else {
        setMode(item.value as 'oauth' | 'api');
        setStep('domain');
      }
    };

    return (
      <Box flexDirection="column" paddingY={1}>
        <Text bold>◆ Choose authentication method</Text>
        <Box paddingLeft={3}>
          <SelectInput items={options} onSelect={handleSelect} />
        </Box>
      </Box>
    );
  }

  // Step 3: Domain
  if (step === 'domain') {
    const handleSubmit = (value: string) => {
      const finalDomain = value.trim() || domain;
      setDomain(finalDomain);
      setInputValue('');
      if (mode === 'api') {
        setStep('token');
      } else {
        setStep('tunnelName');
      }
    };

    return (
      <Box flexDirection="column" paddingY={1}>
        <Text bold>◆ Enter your domain name</Text>
        <Box paddingLeft={3}>
          <Text dimColor>
            (Current: {domain || 'not set'} - press Enter to keep)
          </Text>
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

  // Step 4: API Token (only for API mode)
  if (step === 'token') {
    const handleSubmit = (value: string) => {
      const finalToken = value.trim() || token;
      setToken(finalToken);
      setInputValue('');
      setStep('accountId');
    };

    return (
      <Box flexDirection="column" paddingY={1}>
        <Text bold>◆ Enter Cloudflare API Token</Text>
        <Box paddingLeft={3}>
          <Text dimColor>
            (Current: {token ? '***hidden***' : 'not set'} - press Enter to
            keep)
          </Text>
        </Box>
        <Box paddingLeft={3}>
          <Text dimColor>
            (Get from: Cloudflare &gt; My Profile &gt; API Tokens)
          </Text>
        </Box>
        <Box paddingLeft={3} marginTop={1}>
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

  // Step 5: Account ID
  if (step === 'accountId') {
    const handleSubmit = (value: string) => {
      const finalAccountId = value.trim() || accountId;
      setAccountId(finalAccountId);
      setInputValue('');
      setStep('zoneId');
    };

    return (
      <Box flexDirection="column" paddingY={1}>
        <Text bold>◆ Enter Cloudflare Account ID</Text>
        <Box paddingLeft={3}>
          <Text dimColor>
            (Current: {accountId || 'not set'} - press Enter to keep)
          </Text>
        </Box>
        <Box paddingLeft={3}>
          <Text dimColor>
            (Found in: Cloudflare Dashboard &gt; Account Overview)
          </Text>
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

  // Step 6: Zone ID
  if (step === 'zoneId') {
    const handleSubmit = (value: string) => {
      const finalZoneId = value.trim() || zoneId;
      setZoneId(finalZoneId);
      setInputValue('');
      setStep('tunnelName');
    };

    return (
      <Box flexDirection="column" paddingY={1}>
        <Text bold>◆ Enter Cloudflare Zone ID</Text>
        <Box paddingLeft={3}>
          <Text dimColor>
            (Current: {zoneId || 'not set'} - press Enter to keep)
          </Text>
        </Box>
        <Box paddingLeft={3}>
          <Text dimColor>(Found in: Cloudflare &gt; Domain &gt; Overview)</Text>
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

  // Step 7: Tunnel name
  if (step === 'tunnelName') {
    const options: SelectOption[] = [
      { label: 'Use default', value: 'default' },
      { label: 'Custom name', value: 'custom' },
    ];

    const handleSelect = (item: SelectOption) => {
      if (item.value === 'default') {
        // Complete with all collected data
        const serviceMappings = services.map((s) => ({
          ...s,
          hostname: `${s.subdomain}.${domain}`,
        }));

        onComplete({
          enabled: true,
          mode,
          domain,
          token: mode === 'api' ? token : undefined,
          accountId: mode === 'api' ? accountId : undefined,
          zoneId: mode === 'api' ? zoneId : undefined,
          tunnelName,
          services: serviceMappings,
        });
      }
    };

    return (
      <Box flexDirection="column" paddingY={1}>
        <Text bold>◆ Enter tunnel name</Text>
        <Box paddingLeft={3}>
          <Text dimColor>(Default: {tunnelName})</Text>
        </Box>
        <Box paddingLeft={3}>
          <SelectInput items={options} onSelect={handleSelect} />
        </Box>
      </Box>
    );
  }

  return null;
}

export type { CloudflareConfig };
