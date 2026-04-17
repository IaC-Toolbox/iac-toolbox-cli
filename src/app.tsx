import { Box, Text } from 'ink';
import { useState } from 'react';
import PrerequisitePrompt from './components/PrerequisitePrompt.js';
import type { PrerequisiteStatus } from './types/config.js';

export default function App() {
  const [prerequisites, setPrerequisites] = useState<PrerequisiteStatus | null>(
    null
  );

  const handlePrerequisitesComplete = (status: PrerequisiteStatus) => {
    setPrerequisites(status);
  };

  // Show prerequisite prompt
  if (!prerequisites) {
    return <PrerequisitePrompt onComplete={handlePrerequisitesComplete} />;
  }

  // Show completion message
  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="green">
        Prerequisites configured!
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
    </Box>
  );
}
