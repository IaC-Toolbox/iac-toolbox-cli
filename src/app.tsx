import { Box, Text } from 'ink';
import { useState, useEffect } from 'react';
import DeviceTypeDialog from './components/DeviceTypeDialog.js';
import ConnectionDialog from './components/ConnectionDialog.js';
import DirectoryDialog from './components/DirectoryDialog.js';
import DownloadDialog from './components/DownloadDialog.js';
import PrerequisitePrompt from './components/PrerequisitePrompt.js';
import DockerConfigDialog from './components/DockerConfigDialog.js';
import VaultConfigDialog from './components/VaultConfigDialog.js';
import CloudflareConfigDialog from './components/CloudflareConfigDialog.js';
import GrafanaConfigDialog from './components/GrafanaConfigDialog.js';
import PrometheusConfigDialog from './components/PrometheusConfigDialog.js';
import PagerDutyConfigDialog from './components/PagerDutyConfigDialog.js';
import GitHubActionsConfigDialog from './components/GitHubActionsConfigDialog.js';
import ConfigSummaryDialog from './components/ConfigSummaryDialog.js';
import type { PrerequisiteStatus } from './types/config.js';
import type { VaultConfig } from './components/VaultConfigDialog.js';
import type { CloudflareConfig } from './components/CloudflareConfigDialog.js';
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
  const [cloudflareConfig, setCloudflareConfig] =
    useState<CloudflareConfig | null>(null);
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
  const [filesGenerated, setFilesGenerated] = useState(false);
  const [filePaths, setFilePaths] = useState<{
    configPath: string;
    envPath: string;
    inventoryPath: string;
  } | null>(null);

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
    return (
      <DirectoryDialog
        onSelect={(dir, useExisting) => {
          setDirectory(dir);
          // If using existing files, skip download
          if (useExisting) {
            setDownloaded(true);
          }
        }}
      />
    );
  }

  // 4. Download scripts (skip if using existing)
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

  // 8. Cloudflare Tunnel
  if (!cloudflareConfig) {
    return <CloudflareConfigDialog onComplete={setCloudflareConfig} />;
  }

  // 9. Grafana
  if (!grafanaConfig) {
    return <GrafanaConfigDialog onComplete={setGrafanaConfig} />;
  }

  // 10. Prometheus
  if (!prometheusConfig) {
    return <PrometheusConfigDialog onComplete={setPrometheusConfig} />;
  }

  // 11. PagerDuty
  if (!pagerDutyConfig) {
    return <PagerDutyConfigDialog onComplete={setPagerDutyConfig} />;
  }

  // 12. GitHub Actions Runner
  if (!githubConfig) {
    return <GitHubActionsConfigDialog onComplete={setGithubConfig} />;
  }

  // 13. Configuration Summary
  if (!summary) {
    const services: ServiceSummary = {
      Docker: { enabled: dockerConfig.enabled },
      Vault: { enabled: vaultConfig.enabled },
      'Cloudflare Tunnel': { enabled: cloudflareConfig.enabled },
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

  // 14. Generate config files
  useEffect(() => {
    if (summary && !filesGenerated && directory && connection) {
      const generateFiles = async () => {
        try {
          const { generateConfigFiles } = await import(
            './utils/configGenerator.js'
          );
          const wizardConfig = {
            deviceType,
            connection,
            directory,
            docker: dockerConfig!,
            vault: vaultConfig!,
            cloudflare: cloudflareConfig!,
            grafana: grafanaConfig!,
            prometheus: prometheusConfig!,
            pagerDuty: pagerDutyConfig!,
            githubRunner: githubConfig!,
          };
          const paths = await generateConfigFiles(wizardConfig);
          setFilePaths(paths);
          setFilesGenerated(true);
        } catch (error) {
          console.error('Failed to generate config files:', error);
        }
      };
      generateFiles();
    }
  }, [
    summary,
    filesGenerated,
    directory,
    connection,
    deviceType,
    dockerConfig,
    vaultConfig,
    cloudflareConfig,
    grafanaConfig,
    prometheusConfig,
    pagerDutyConfig,
    githubConfig,
  ]);

  // Final completion message
  if (filesGenerated && filePaths) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text bold color="green">
          ◆ Configuration saved!
        </Text>
        <Text>│</Text>
        <Text>│ Files created:</Text>
        <Text>│ - {filePaths.configPath}</Text>
        <Text>│ - {filePaths.envPath}</Text>
        <Text>│ - {filePaths.inventoryPath}</Text>
        <Text>│</Text>
        <Text>│ To install later, run:</Text>
        <Text>│ cd {directory} && ./scripts/install.sh</Text>
        <Text>└</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="green">
        Configuration complete!
      </Text>
    </Box>
  );
}
