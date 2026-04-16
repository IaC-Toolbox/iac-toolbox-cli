import SelectDialog, { SelectOption } from './SelectDialog.js';

interface DockerConfigDialogProps {
  onComplete: (enabled: boolean) => void;
}

const options: SelectOption[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'skip', label: 'Skip for now' },
];

export default function DockerConfigDialog({
  onComplete,
}: DockerConfigDialogProps) {
  const handleSelect = (value: string) => {
    const enabled = value === 'yes';
    onComplete(enabled);
  };

  return (
    <SelectDialog
      title="Install Docker?"
      options={options}
      onSelect={handleSelect}
    />
  );
}
