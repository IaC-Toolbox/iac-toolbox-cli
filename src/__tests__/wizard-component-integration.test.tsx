import { describe, it, expect, jest } from '@jest/globals';
import { render } from 'ink-testing-library';
import DeviceTypeDialog from '../components/DeviceTypeDialog.js';
import IntegrationSelectDialog from '../components/IntegrationSelectDialog.js';
import DeviceProfileDialog from '../components/DeviceProfileDialog.js';

/**
 * Integration tests for wizard component flows.
 * Tests components working together in sequence to simulate the full wizard experience.
 */
describe('Wizard Component Integration', () => {
  it('completes device selection flow', async () => {
    const onSelect = jest.fn();

    // Step 1: Device profile
    const { stdin: stdin1, unmount: unmount1 } = render(
      <DeviceProfileDialog onSelect={onSelect} />
    );
    stdin1.write('\r'); // Select first option
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(onSelect).toHaveBeenCalledWith('devops-server');
    unmount1();

    // Step 2: Device type
    onSelect.mockClear();
    const { stdin: stdin2, unmount: unmount2 } = render(
      <DeviceTypeDialog onSelect={onSelect} />
    );
    stdin2.write('\r'); // Select remote
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(onSelect).toHaveBeenCalledWith('remote');
    unmount2();
  });

  it('completes integration selection flow', async () => {
    const onConfirm = jest.fn();

    // Integration selection with multiple toggles
    const { stdin, unmount } = render(
      <IntegrationSelectDialog onConfirm={onConfirm} />
    );

    // Select multiple integrations
    stdin.write(' '); // Toggle github_build_workflow
    await new Promise((resolve) => setTimeout(resolve, 50));
    stdin.write('\x1B[B'); // Down to next selectable
    await new Promise((resolve) => setTimeout(resolve, 50));
    stdin.write(' '); // Toggle cloudflare
    await new Promise((resolve) => setTimeout(resolve, 50));
    stdin.write('\r'); // Confirm
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(onConfirm).toHaveBeenCalledWith([
      'github_build_workflow',
      'cloudflare',
    ]);
    unmount();
  });

  it('handles device profile defaults for integration selection', async () => {
    const onConfirm = jest.fn();

    // DevOps server profile should pre-select certain integrations
    const { stdin, unmount } = render(
      <IntegrationSelectDialog
        defaultSelected={['vault', 'grafana']}
        onConfirm={onConfirm}
      />
    );

    stdin.write('\r'); // Confirm without changes
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(onConfirm).toHaveBeenCalledWith(['vault', 'grafana']);
    unmount();
  });

  it('allows changing pre-selected integrations', async () => {
    const onConfirm = jest.fn();

    const { stdin, unmount } = render(
      <IntegrationSelectDialog
        defaultSelected={['vault', 'grafana']}
        onConfirm={onConfirm}
      />
    );

    // Navigate to vault (already selected) and deselect
    stdin.write('\x1B[B\x1B[B'); // Navigate down to vault
    await new Promise((resolve) => setTimeout(resolve, 50));
    stdin.write(' '); // Toggle off
    await new Promise((resolve) => setTimeout(resolve, 50));
    stdin.write('\r'); // Confirm
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(onConfirm).toHaveBeenCalledWith(['grafana']);
    unmount();
  });

  it('validates complete wizard flow sequence', async () => {
    const callbacks = {
      onProfileSelect: jest.fn(),
      onDeviceTypeSelect: jest.fn(),
      onIntegrationConfirm: jest.fn(),
    };

    // Simulate complete wizard flow
    // 1. Profile selection
    const { stdin: stdin1, unmount: unmount1 } = render(
      <DeviceProfileDialog onSelect={callbacks.onProfileSelect} />
    );
    stdin1.write('\x1B[B'); // Down
    await new Promise((resolve) => setTimeout(resolve, 50));
    stdin1.write('\r'); // Select app-server
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(callbacks.onProfileSelect).toHaveBeenCalledWith('app-server');
    unmount1();

    // 2. Device type
    const { stdin: stdin2, unmount: unmount2 } = render(
      <DeviceTypeDialog onSelect={callbacks.onDeviceTypeSelect} />
    );
    stdin2.write('\x1B[B'); // Down
    await new Promise((resolve) => setTimeout(resolve, 50));
    stdin2.write('\r'); // Select local
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(callbacks.onDeviceTypeSelect).toHaveBeenCalledWith('local');
    unmount2();

    // 3. Integration selection
    const { stdin: stdin3, unmount: unmount3 } = render(
      <IntegrationSelectDialog
        defaultSelected={['github_build_workflow']}
        onConfirm={callbacks.onIntegrationConfirm}
      />
    );
    stdin3.write('\r'); // Confirm defaults
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(callbacks.onIntegrationConfirm).toHaveBeenCalledWith([
      'github_build_workflow',
    ]);
    unmount3();
  });
});
