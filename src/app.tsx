import { Box, Text } from 'ink';
import { useState, useEffect } from 'react';
import DeviceTypeDialog from './components/DeviceTypeDialog.js';
import ConnectionDialog from './components/ConnectionDialog.js';
import DirectoryDialog from './components/DirectoryDialog.js';
import DownloadDialog from './components/DownloadDialog.js';
import IntegrationSelectDialog from './components/IntegrationSelectDialog.js';
import GitHubBuildWorkflowDialog from './components/GitHubBuildWorkflowDialog.js';
import type { GitHubBuildWorkflowConfig } from './components/GitHubBuildWorkflowDialog.js';
import WizardSummaryDialog from './components/WizardSummaryDialog.js';
import { writeIacToolboxYaml } from './utils/iacToolboxConfig.js';
import { saveCredentials } from './utils/credentials.js';

interface AppProps {
  profile?: string;
}

export default function App({ profile = 'default' }: AppProps) {
  // Steps 1-3: Device type, connection, directory, download (unchanged)
  const [deviceType, setDeviceType] = useState<string | null>(null);
  const [connection, setConnection] = useState<any>(null);
  const [directory, setDirectory] = useState<string | null>(null);
  const [downloaded, setDownloaded] = useState(false);

  // Step 4: Integration selection (new)
  const [selectedIntegrations, setSelectedIntegrations] = useState<
    string[] | null
  >(null);

  // Step 5: Per-module configuration (new)
  const [githubBuildWorkflowConfig, setGithubBuildWorkflowConfig] =
    useState<GitHubBuildWorkflowConfig | null>(null);
  const [moduleConfigComplete, setModuleConfigComplete] = useState(false);

  // Step 6: Summary + write
  const [summaryAction, setSummaryAction] = useState<
    'confirm' | 'cancel' | null
  >(null);
  const [filesWritten, setFilesWritten] = useState(false);
  const [writtenConfigPath, setWrittenConfigPath] = useState<string | null>(
    null,
  );

  // Mark module config complete when all selected integrations are configured
  useEffect(() => {
    if (selectedIntegrations === null) return;

    const needsGithubBuild =
      selectedIntegrations.includes('github_build_workflow');

    if (needsGithubBuild && githubBuildWorkflowConfig === null) return;

    // All selected modules are configured
    setModuleConfigComplete(true);
  }, [selectedIntegrations, githubBuildWorkflowConfig]);

  // Write files on confirm
  useEffect(() => {
    if (summaryAction !== 'confirm') return;
    if (filesWritten) return;
    if (!directory || !selectedIntegrations) return;

    const writeFiles = async () => {
      try {
        // Write iac-toolbox.yml
        const configPath = await writeIacToolboxYaml(directory, {
          selectedIntegrations,
          githubBuildWorkflow: githubBuildWorkflowConfig ?? undefined,
        });
        setWrittenConfigPath(configPath);

        // Write credentials
        if (githubBuildWorkflowConfig) {
          saveCredentials(
            { docker_hub_token: githubBuildWorkflowConfig.dockerHubToken },
            profile,
          );
        }

        setFilesWritten(true);
      } catch (error) {
        console.error('Failed to write files:', error);
      }
    };

    writeFiles();
  }, [
    summaryAction,
    filesWritten,
    directory,
    selectedIntegrations,
    githubBuildWorkflowConfig,
    profile,
  ]);

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

  // 5. Select integrations (new multi-select)
  if (selectedIntegrations === null) {
    return (
      <IntegrationSelectDialog
        onConfirm={(ids) => {
          setSelectedIntegrations(ids);
          // If no integrations need config, mark complete immediately
          if (!ids.includes('github_build_workflow')) {
            setModuleConfigComplete(true);
          }
        }}
      />
    );
  }

  // 6. Per-module configuration for selected integrations
  if (!moduleConfigComplete) {
    // GitHub Build Workflow config
    if (
      selectedIntegrations.includes('github_build_workflow') &&
      !githubBuildWorkflowConfig
    ) {
      return (
        <GitHubBuildWorkflowDialog
          onComplete={setGithubBuildWorkflowConfig}
        />
      );
    }
  }

  // 7. Summary screen
  if (summaryAction === null) {
    const configFilePath = `${directory}/iac-toolbox.yml`;
    return (
      <WizardSummaryDialog
        selectedIntegrations={selectedIntegrations}
        configFilePath={configFilePath}
        onConfirm={(action) => {
          if (action === 'cancel') {
            process.exit(0);
          }
          setSummaryAction(action);
        }}
      />
    );
  }

  // 8. Files written — show completion
  if (filesWritten && writtenConfigPath) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text bold color="green">
          {'◆ Configuration saved!'}
        </Text>
        <Text>{'│'}</Text>
        <Text>{'│ Files written:'}</Text>
        <Text>{'│ - '}{writtenConfigPath}</Text>
        <Text>{'│ - ~/.iac-toolbox/credentials'}</Text>
        <Text>{'│'}</Text>
        <Text>{'│ Docker will be installed automatically as a prerequisite.'}</Text>
        <Text>{'└'}</Text>
      </Box>
    );
  }

  // Writing files in progress
  return (
    <Box flexDirection="column" padding={1}>
      <Text>Writing configuration files...</Text>
    </Box>
  );
}
