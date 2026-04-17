import { Box, Text } from 'ink';
import { useState } from 'react';
import PrerequisitePrompt from './components/PrerequisitePrompt.js';
import PagerDutyConfigDialog from './components/PagerDutyConfigDialog.js';
import GitHubActionsConfigDialog from './components/GitHubActionsConfigDialog.js';
import VaultConfigDialog from './components/VaultConfigDialog.js';
import GrafanaConfigDialog from './components/GrafanaConfigDialog.js';
import type { PrerequisiteStatus } from './types/config.js';
import type { PagerDutyConfig } from './components/PagerDutyConfigDialog.js';
import type { GitHubActionsConfig } from './components/GitHubActionsConfigDialog.js';
import type { VaultConfig } from './components/VaultConfigDialog.js';
import type { GrafanaConfig } from './components/GrafanaConfigDialog.js';

export default function App() {
  const [prerequisites, setPrerequisites] = useState<PrerequisiteStatus | null>(
    null
  );
  const [pagerDutyConfig, setPagerDutyConfig] =
    useState<PagerDutyConfig | null>(null);
  const [githubConfig, setGithubConfig] = useState<GitHubActionsConfig | null>(
    null
  );
  const [vaultConfig, setVaultConfig] = useState<VaultConfig | null>(null);
  const [grafanaConfig, setGrafanaConfig] = useState<GrafanaConfig | null>(
    null
  );

  const handlePrerequisitesComplete = (status: PrerequisiteStatus) => {
    setPrerequisites(status);
  };

  const handlePagerDutyComplete = (config: PagerDutyConfig) => {
    setPagerDutyConfig(config);
  };

  const handleGitHubComplete = (config: GitHubActionsConfig) => {
    setGithubConfig(config);
  };

  const handleVaultComplete = (config: VaultConfig) => {
    setVaultConfig(config);
  };

  const handleGrafanaComplete = (config: GrafanaConfig) => {
    setGrafanaConfig(config);
  };

  // Show prerequisite prompt
  if (!prerequisites) {
    return <PrerequisitePrompt onComplete={handlePrerequisitesComplete} />;
  }

  // Show PagerDuty configuration
  if (!pagerDutyConfig) {
    return <PagerDutyConfigDialog onComplete={handlePagerDutyComplete} />;
  }

  // Show GitHub Actions configuration
  if (!githubConfig) {
    return <GitHubActionsConfigDialog onComplete={handleGitHubComplete} />;
  }

  // Show Vault configuration
  if (!vaultConfig) {
    return <VaultConfigDialog onComplete={handleVaultComplete} />;
  }

  // Show Grafana configuration
  if (!grafanaConfig) {
    return <GrafanaConfigDialog onComplete={handleGrafanaComplete} />;
  }

  // Show completion message
  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="green">
        Configuration complete!
      </Text>
      <Text>
        Ansible:{' '}
        {prerequisites.ansible.installed
          ? `v${prerequisites.ansible.version}`
          : 'Skipped'}
      </Text>
      <Text>
        Terraform:{' '}
        {prerequisites.terraform.installed
          ? `v${prerequisites.terraform.version}`
          : 'Skipped'}
      </Text>
      <Text>
        PagerDuty: {pagerDutyConfig.enabled ? 'Configured' : 'Skipped'}
      </Text>
      <Text>
        GitHub Actions: {githubConfig.enabled ? 'Configured' : 'Skipped'}
      </Text>
      <Text>Vault: {vaultConfig.enabled ? 'Configured' : 'Skipped'}</Text>
      <Text>Grafana: {grafanaConfig.enabled ? 'Configured' : 'Skipped'}</Text>
    </Box>
  );
}
