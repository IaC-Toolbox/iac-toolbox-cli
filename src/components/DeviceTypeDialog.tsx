import { Box, Text } from 'ink';
import SelectDialog from './SelectDialog.js';

type DeviceType = 'raspberry-pi' | 'aws-ec2';

interface DeviceTypeDialogProps {
  onComplete: (deviceType: DeviceType) => void;
}

export default function DeviceTypeDialog({
  onComplete,
}: DeviceTypeDialogProps) {
  const options = [
    { value: 'raspberry-pi', label: 'Raspberry Pi ARM64' },
    { value: 'aws-ec2', label: 'AWS EC2 x64 - coming soon', disabled: true },
  ];

  return (
    <Box flexDirection="column">
      <Text bold>┌  Iac-Toolbox Setup</Text>
      <Text>│</Text>
      <SelectDialog
        title="Choose device type"
        options={options}
        onSelect={(value) => onComplete(value as DeviceType)}
      />
    </Box>
  );
}
