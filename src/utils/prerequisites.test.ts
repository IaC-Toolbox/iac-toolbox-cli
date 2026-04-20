/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import {
  detectAnsible,
  detectTerraform,
  isBrewAvailable,
} from './prerequisites.js';
import { exec } from 'child_process';

jest.mock('child_process', () => ({
  exec: jest.fn(),
}));

describe('detectAnsible', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('detects installed Ansible with version', async () => {
    const execMock = exec as jest.MockedFunction<typeof exec>;
    execMock.mockImplementation(((...args: any[]) => {
      const callback = args[args.length - 1];
      if (typeof callback === 'function') {
        callback(null, { stdout: 'ansible [core 2.15.0]', stderr: '' });
      }
    }) as typeof exec);

    const result = await detectAnsible();

    expect(result.isInstalled).toBe(true);
    expect(result.version).toBe('2.15.0');
  });

  it('returns not installed when command fails', async () => {
    const execMock = exec as jest.MockedFunction<typeof exec>;
    execMock.mockImplementation(((...args: any[]) => {
      const callback = args[args.length - 1];
      if (typeof callback === 'function') {
        callback(new Error('Command not found'), null);
      }
    }) as typeof exec);

    const result = await detectAnsible();

    expect(result.isInstalled).toBe(false);
    expect(result.version).toBeNull();
  });
});

describe('detectTerraform', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('detects installed Terraform with version', async () => {
    const execMock = exec as jest.MockedFunction<typeof exec>;
    execMock.mockImplementation(((...args: any[]) => {
      const callback = args[args.length - 1];
      if (typeof callback === 'function') {
        callback(null, { stdout: 'Terraform v1.5.7', stderr: '' });
      }
    }) as typeof exec);

    const result = await detectTerraform();

    expect(result.isInstalled).toBe(true);
    expect(result.version).toBe('1.5.7');
  });

  it('returns not installed when command fails', async () => {
    const execMock = exec as jest.MockedFunction<typeof exec>;
    execMock.mockImplementation(((...args: any[]) => {
      const callback = args[args.length - 1];
      if (typeof callback === 'function') {
        callback(new Error('Command not found'), null);
      }
    }) as typeof exec);

    const result = await detectTerraform();

    expect(result.isInstalled).toBe(false);
    expect(result.version).toBeNull();
  });
});

describe('isBrewAvailable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns true when brew is available', async () => {
    const execMock = exec as jest.MockedFunction<typeof exec>;
    execMock.mockImplementation(((...args: any[]) => {
      const callback = args[args.length - 1];
      if (typeof callback === 'function') {
        callback(null, { stdout: '/usr/local/bin/brew', stderr: '' });
      }
    }) as typeof exec);

    const result = await isBrewAvailable();

    expect(result).toBe(true);
  });

  it('returns false when brew is not available', async () => {
    const execMock = exec as jest.MockedFunction<typeof exec>;
    execMock.mockImplementation(((...args: any[]) => {
      const callback = args[args.length - 1];
      if (typeof callback === 'function') {
        callback(new Error('Command not found'), null);
      }
    }) as typeof exec);

    const result = await isBrewAvailable();

    expect(result).toBe(false);
  });
});
