import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { loadCredentials, type CredentialProfile } from './credentials.js';

/**
 * Default path for the non-sensitive configuration file, relative to
 * a project root directory.
 */
const CONFIG_FILE = 'infrastructure/iac-toolbox.yml';

export interface AnsibleRunOptions {
  /** Ansible playbook path (relative or absolute). */
  playbook: string;

  /** Project root directory that contains infrastructure/iac-toolbox.yml. */
  projectDir: string;

  /** Credential profile to use. Defaults to "default". */
  profile?: string;

  /** Extra arguments to pass to ansible-playbook. */
  extraArgs?: string[];

  /** Whether to actually execute (false = dry-run, returns command only). */
  dryRun?: boolean;
}

/**
 * Build the ansible-playbook command string, combining the non-sensitive
 * config file with credentials from ~/.iac-toolbox/credentials.
 *
 * Non-sensitive values come from infrastructure/iac-toolbox.yml via @file.
 * Secrets come from the credentials file and are passed as individual
 * --extra-vars, so they take highest precedence.
 */
export function buildAnsibleCommand(options: AnsibleRunOptions): string {
  const { playbook, projectDir, profile = 'default', extraArgs = [] } = options;

  const configPath = path.join(projectDir, CONFIG_FILE);
  const creds = loadCredentials(profile);

  const parts: string[] = ['ansible-playbook', playbook];

  // Non-sensitive config from file (if it exists)
  if (fs.existsSync(configPath)) {
    parts.push(`--extra-vars "@${configPath}"`);
  }

  // Secrets from credentials file — passed last for highest precedence
  const secretVars = buildSecretVars(creds);
  if (secretVars) {
    parts.push(`--extra-vars "${secretVars}"`);
  }

  // Any additional arguments
  parts.push(...extraArgs);

  return parts.join(' ');
}

/**
 * Convert a credential profile into a space-separated key=value string
 * suitable for Ansible --extra-vars.
 */
function buildSecretVars(creds: CredentialProfile): string {
  return Object.entries(creds)
    .filter(([, value]) => value && value.trim() !== '')
    .map(([key, value]) => `${key}=${escapeShellValue(value)}`)
    .join(' ');
}

/**
 * Escape a value for safe inclusion in a shell-quoted string.
 * Wraps in single quotes and escapes embedded single quotes.
 */
function escapeShellValue(value: string): string {
  // If value contains spaces or special chars, wrap in single quotes
  if (/[^a-zA-Z0-9_\-.:/]/.test(value)) {
    return `'${value.replace(/'/g, "'\\''")}'`;
  }
  return value;
}

/**
 * Run an Ansible playbook with combined config + credentials.
 *
 * Throws if the playbook execution fails.
 */
export function runAnsiblePlaybook(options: AnsibleRunOptions): string {
  const command = buildAnsibleCommand(options);

  if (options.dryRun) {
    return command;
  }

  try {
    const output = execSync(command, {
      cwd: options.projectDir,
      stdio: 'inherit',
      encoding: 'utf-8',
    });
    return output || '';
  } catch (error) {
    throw new Error(
      `Ansible playbook failed: ${error instanceof Error ? error.message : 'unknown error'}`
    );
  }
}

/**
 * Validate that required files exist before running a playbook.
 */
export function validateAnsibleSetup(projectDir: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  const configPath = path.join(projectDir, CONFIG_FILE);
  if (!fs.existsSync(configPath)) {
    errors.push(`Config file not found: ${configPath}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
