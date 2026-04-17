import { Box, Text } from 'ink';
import { useState } from 'react';
import DeviceTypeDialog from './components/DeviceTypeDialog.js';
import ConnectionDialog from './components/ConnectionDialog.js';
import DirectoryDialog from './components/DirectoryDialog.js';
import DownloadDialog from './components/DownloadDialog.js';
import PrerequisitePrompt from './components/PrerequisitePrompt.js';
import DockerConfigDialog from './components/DockerConfigDialog.js';
import VaultConfigDialog from './components/VaultConfigDialog.js';
import GrafanaConfigDialog from './components/GrafanaConfigDialog.js';
import PrometheusConfigDialog from './components/PrometheusConfigDialog.js';
import PagerDutyConfigDialog from './components/PagerDutyConfigDialog.js';
import GitHubActionsConfigDialog from './components/GitHubActionsConfigDialog.js';
import ConfigSummaryDialog from './components/ConfigSummaryDialog.js';
import type { PrerequisiteStatus } from './types/config.js';
import type { VaultConfig } from './components/VaultConfigDialog.js';
import type { GrafanaConfig } from './components/GrafanaConfigDialog.js';
import type { PrometheusConfig } from './components/PrometheusConfigDialog.js';
import type { PagerDutyConfig } from './components/PagerDutyConfigDialog.js';
import type { GitHubActionsConfig } from './components/GitHubActionsConfigDialog.js';
import type { ServiceSummary } from './components/ConfigSummaryDialog.js';

export default function App() {
  const [deviceType, setDeviceType] = useState<string | null>(null);
  const [connection, setConnection] = useState<any>(null);
  const [directory, setDirectory] = useState<string | null>(null);
  const [downloaded, setDownloaded] = useState(false);
  const [prerequisites, setPrerequisites] = useState<PrerequisiteStatus | null>(
    null
  );
  const [dockerConfig, setDockerConfig] = useState<{ enabled: boolean } | null>(
    null
  );
  const [vaultConfig, setVaultConfig] = useState<VaultConfig | null>(null);
  const [grafanaConfig, setGrafanaConfig] = useState<GrafanaConfig | null>(
    null
  );
  const [prometheusConfig, setPrometheusConfig] =
    useState<PrometheusConfig | null>(null);
  const [pagerDutyConfig, setPagerDutyConfig] =
    useState<PagerDutyConfig | null>(null);
  const [githubConfig, setGithubConfig] = useState<GitHubActionsConfig | null>(
    null
  );
  const [summary, setSummary] = useState(false);

  // 1. Device type selection
  if (!deviceType) {
    return <DeviceTypeDialog onSelect={setDeviceType} />;
  }

  // 2. Connection details
  if (!connection) {
    return (
      <ConnectionDialog
        mode={deviceType === 'remote' ? 'remote' : 'local'}
        onComplete={setConnection}
      />
    );
  }

  // 3. Scripts destination directory
  if (!directory) {
    return <DirectoryDialog onSelect={setDirectory} />;
  }

  // 4. Download scripts
  if (!downloaded) {
    return (
      <DownloadDialog
        destination={directory}
        onComplete={() => setDownloaded(true)}
      />
    );
  }

  // 5. Prerequisites (Ansible/Terraform)
  if (!prerequisites) {
    return <PrerequisitePrompt onComplete={setPrerequisites} />;
  }

  // 6. Docker
  if (!dockerConfig) {
    return (
      <DockerConfigDialog
        onSelect={(enabled) => setDockerConfig({ enabled })}
      />
    );
  }

  // 7. Vault
  if (!vaultConfig) {
    return <VaultConfigDialog onComplete={setVaultConfig} />;
  }

  // 8. Grafana
  if (!grafanaConfig) {
    return <GrafanaConfigDialog onComplete={setGrafanaConfig} />;
  }

  // 9. Prometheus
  if (!prometheusConfig) {
    return <PrometheusConfigDialog onComplete={setPrometheusConfig} />;
  }

  // 10. PagerDuty
  if (!pagerDutyConfig) {
    return <PagerDutyConfigDialog onComplete={setPagerDutyConfig} />;
  }

  // 11. GitHub Actions Runner
  if (!githubConfig) {
    return <GitHubActionsConfigDialog onComplete={setGithubConfig} />;
  }

  // 12. Configuration Summary
  if (!summary) {
    const services: ServiceSummary = {
      Docker: { enabled: dockerConfig.enabled },
      Vault: { enabled: vaultConfig.enabled },
      Grafana: { enabled: grafanaConfig.enabled },
      Prometheus: { enabled: prometheusConfig.enabled },
      PagerDuty: { enabled: pagerDutyConfig.enabled },
      'GitHub Actions': { enabled: githubConfig.enabled },
    };

    return (
      <ConfigSummaryDialog
        services={services}
        onProceed={(action) => {
          if (action === 'install' || action === 'save') {
            setSummary(true);
          }
        }}
      />
    );
  }

  // Final completion message
  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="green">
        Configuration complete!
      </Text>
    </Box>
  );
}
