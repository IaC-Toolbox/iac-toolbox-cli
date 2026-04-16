import { Box } from 'ink';
import SelectDialog from './SelectDialog.js';

interface DirectoryDialogProps {
  onComplete: (useInfrastructureDir: boolean) => void;
}

export default function DirectoryDialog({
  onComplete,
}: DirectoryDialogProps) {
  const options = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' },
  ];

  return (
    <Box flexDirection="column">
      <SelectDialog
        title="Use `/infrastructure` directory?"
        options={options}
        onSelect={(value) => onComplete(value === 'yes')}
      />
    </Box>
  );
}
