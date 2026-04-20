<<<<<<< Updated upstream
import { describe, it, expect } from '@jest/globals';

describe('prerequisites utils', () => {
  it('placeholder test', () => {
    expect(true).toBe(true);
=======
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
    const execMock = exec as unknown as jest.Mock;
    execMock.mockImplementation(
      (
        _cmd: unknown,
        callback: (err: Error | null, result: { stdout: string } | null) => void
      ) => {
        callback(null, { stdout: 'ansible [core 2.15.0]' });
      }
    );

    const result = await detectAnsible();

    expect(result.isInstalled).toBe(true);
    expect(result.version).toBe('2.15.0');
  });

  it('returns not installed when command fails', async () => {
    const execMock = exec as unknown as jest.Mock;
    execMock.mockImplementation(
      (
        _cmd: unknown,
        callback: (err: Error | null, result: { stdout: string } | null) => void
      ) => {
        callback(new Error('Command not found'), null);
      }
    );

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
    const execMock = exec as unknown as jest.Mock;
    execMock.mockImplementation(
      (
        _cmd: unknown,
        callback: (err: Error | null, result: { stdout: string } | null) => void
      ) => {
        callback(null, { stdout: 'Terraform v1.5.7' });
      }
    );

    const result = await detectTerraform();

    expect(result.isInstalled).toBe(true);
    expect(result.version).toBe('1.5.7');
  });

  it('returns not installed when command fails', async () => {
    const execMock = exec as unknown as jest.Mock;
    execMock.mockImplementation(
      (
        _cmd: unknown,
        callback: (err: Error | null, result: { stdout: string } | null) => void
      ) => {
        callback(new Error('Command not found'), null);
      }
    );

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
    const execMock = exec as unknown as jest.Mock;
    execMock.mockImplementation(
      (
        _cmd: unknown,
        callback: (err: Error | null, result: { stdout: string } | null) => void
      ) => {
        callback(null, { stdout: '/usr/local/bin/brew' });
      }
    );

    const result = await isBrewAvailable();

    expect(result).toBe(true);
  });

  it('returns false when brew is not available', async () => {
    const execMock = exec as unknown as jest.Mock;
    execMock.mockImplementation(
      (
        _cmd: unknown,
        callback: (err: Error | null, result: { stdout: string } | null) => void
      ) => {
        callback(new Error('Command not found'), null);
      }
    );

    const result = await isBrewAvailable();

    expect(result).toBe(false);
>>>>>>> Stashed changes
  });
});
