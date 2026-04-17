import { Box, Text } from 'ink';
import { useState } from 'react';
import PrerequisitePrompt from './components/PrerequisitePrompt.js';
import PagerDutyConfigDialog from './components/PagerDutyConfigDialog.js';
import type { PrerequisiteStatus } from './types/config.js';
import type { PagerDutyConfig } from './components/PagerDutyConfigDialog.js';

export default function App() {
  const [prerequisites, setPrerequisites] = useState<PrerequisiteStatus | null>(
    null
  );
  const [pagerDutyConfig, setPagerDutyConfig] = useState<PagerDutyConfig | null>(
    null
  );

  const handlePrerequisitesComplete = (status: PrerequisiteStatus) => {
    setPrerequisites(status);
  };

  const handlePagerDutyComplete = (config: PagerDutyConfig) => {
    setPagerDutyConfig(config);
  };

  // Show prerequisite prompt
  if (!prerequisites) {
    return <PrerequisitePrompt onComplete={handlePrerequisitesComplete} />;
  }

  // Show PagerDuty configuration
  if (!pagerDutyConfig) {
    return <PagerDutyConfigDialog onComplete={handlePagerDutyComplete} />;
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
        PagerDuty:{' '}
        {pagerDutyConfig.enabled ? 'Configured' : 'Skipped'}
      </Text>
    </Box>
  );
}
