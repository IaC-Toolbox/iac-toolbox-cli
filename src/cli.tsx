#!/usr/bin/env node
import { Command } from 'commander';
import { render } from 'ink';
import App from './app.js';
import CredentialSetDialog from './components/CredentialSetDialog.js';
import { validateArchitecture } from './validators/architecture.js';

// Pre-flight check: validate architecture
const validation = validateArchitecture();

if (validation.warning) {
  console.warn(`\n⚠️  ${validation.warning}\n`);
  console.log('Press Ctrl+C to exit or wait 3 seconds to continue...\n');

  // Give user time to cancel if they want
  await new Promise((resolve) => setTimeout(resolve, 3000));
}

const program = new Command();

program
  .name('iac-toolbox')
  .description('Infrastructure automation CLI for homelabs')
  .version('1.0.0', '-v, --version', 'Output the current version')
  .option('-C <path>', 'Run as if started in <path>')
  .option('-c <name>=<value>', 'Set config variable')
  .option('--profile <name>', 'Credential profile to use', 'default');

program
  .command('init', { isDefault: true })
  .description('Start the interactive wizard')
  .option('--profile <name>', 'Credential profile to use', 'default')
  .action((options) => {
    render(<App profile={options.profile} />, {
      exitOnCtrlC: true,
      patchConsole: false,
    });
  });

const credentials = program
  .command('credentials')
  .description('Manage API credentials');

credentials
  .command('set <key>')
  .description('Set a single credential value')
  .option('--profile <name>', 'Credential profile to use', 'default')
  .action((key: string, options: { profile: string }) => {
    render(
      <CredentialSetDialog credentialKey={key} profile={options.profile} />,
      {
        exitOnCtrlC: true,
        patchConsole: false,
      }
    );
  });

const cloudflare = program
  .command('cloudflare')
  .description('Manage Cloudflare Tunnel integration');

cloudflare
  .command('install')
  .description('Install or reinstall Cloudflare Tunnel')
  .action(() => {
    const { spawnSync } = require('child_process');
    const { loadCredentials } = require('./utils/credentials.js');
    const creds = loadCredentials('default');
    const env = { ...process.env, CLOUDFLARE_API_TOKEN: creds.cloudflare_api_token || '' };
    const result = spawnSync('bash', ['infrastructure/scripts/install.sh', '--cloudflared', '--local'], {
      env, stdio: 'inherit',
    });
    process.exit(result.status ?? 1);
  });

cloudflare
  .command('uninstall')
  .description('Remove Cloudflare Tunnel from this device')
  .action(() => {
    const { spawnSync } = require('child_process');
    const result = spawnSync('bash', ['infrastructure/scripts/uninstall-cloudflare.sh', '--local'], {
      stdio: 'inherit',
    });
    process.exit(result.status ?? 1);
  });

program
  .command('uninstall')
  .description('Remove the previously installed infra')
  .action(() => {
    console.log('Uninstall functionality coming soon...');
    process.exit(0);
  });

// Show help if no command provided
if (process.argv.length === 2) {
  program.help();
}

program.parse();
