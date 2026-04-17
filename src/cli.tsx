#!/usr/bin/env node
import { Command } from 'commander';
import { render } from 'ink';
import App from './app.js';
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
  .option('-c <name>=<value>', 'Set config variable');

program
  .command('init', { isDefault: true })
  .description('Start the interactive wizard')
  .action(() => {
    render(<App />, {
      exitOnCtrlC: true,
      patchConsole: false,
    });
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
