import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import path from 'path';
import fs from 'fs';
import { useState, useEffect } from 'react';

interface Props {
  onSelect: (directory: string) => void;
}

interface DirectoryOption {
  label: string;
  value: string;
}

type Step = 'choose' | 'confirm-override';

export default function DirectoryDialog({ onSelect }: Props) {
  const [step, setStep] = useState<Step>('choose');
  const [selectedDir, setSelectedDir] = useState<string | null>(null);
  const [dirExists, setDirExists] = useState(false);

  const infrastructureDir = path.join(process.cwd(), 'infrastructure');
  const currentDir = process.cwd();

  useEffect(() => {
    // Check if infrastructure directory exists
    if (fs.existsSync(infrastructureDir)) {
      setDirExists(true);
    }
  }, [infrastructureDir]);

  // Step 1: Choose directory
  if (step === 'choose') {
    const options: DirectoryOption[] = [
      {
        label: dirExists
          ? 'Yes (directory exists - will ask to override)'
          : 'Yes',
        value: infrastructureDir,
      },
      { label: 'No', value: currentDir },
    ];

    const handleSelect = (item: DirectoryOption) => {
      const resolvedPath = path.resolve(item.value);

      // Check if selected directory exists and has files
      if (
        fs.existsSync(resolvedPath) &&
        item.value === infrastructureDir &&
        dirExists
      ) {
        const files = fs.readdirSync(resolvedPath);
        if (files.length > 0) {
          setSelectedDir(resolvedPath);
          setStep('confirm-override');
          return;
        }
      }

      onSelect(resolvedPath);
    };

    return (
      <Box flexDirection="column" paddingY={1}>
        <Text bold>◆ Use `/infrastructure` directory?</Text>
        <Box paddingLeft={3}>
          <SelectInput items={options} onSelect={handleSelect} />
        </Box>
      </Box>
    );
  }

  // Step 2: Confirm override
  if (step === 'confirm-override' && selectedDir) {
    const options: DirectoryOption[] = [
      { label: 'Yes, override existing files', value: 'override' },
      { label: 'No, choose different directory', value: 'back' },
    ];

    const handleSelect = (item: DirectoryOption) => {
      if (item.value === 'override') {
        onSelect(selectedDir);
      } else {
        setStep('choose');
        setSelectedDir(null);
      }
    };

    return (
      <Box flexDirection="column" paddingY={1}>
        <Text bold color="yellow">
          ⚠ Directory already exists
        </Text>
        <Box paddingLeft={3}>
          <Text dimColor>{selectedDir} contains existing files.</Text>
        </Box>
        <Box paddingLeft={3} marginTop={1}>
          <Text bold>◆ Override existing files?</Text>
        </Box>
        <Box paddingLeft={3}>
          <SelectInput items={options} onSelect={handleSelect} />
        </Box>
      </Box>
    );
  }

  return null;
}
