#!/usr/bin/env node
import { render } from 'ink';
import App from './app.js';

// Parse command-line arguments
const args = process.argv.slice(2);
const command = args[0];

// Define flags
const hasVersionFlag = args.includes('-v') || args.includes('--version');
const hasHelpFlag = args.includes('-h') || args.includes('--help');

// Show version
if (hasVersionFlag) {
  console.log('iac-toolbox version 1.0.0');
  process.exit(0);
}

// Show help if no arguments, help command, or help flag
if (args.length === 0 || command === 'help' || hasHelpFlag) {
  console.log(`usage: iac-toolbox [-v | --version] [-h | --help] [-C <path>] [-c <name>=<value>] <command> [<args>]

These are common iac-toolbox commands used in various situations:

start infrastructure a working area
   init            Starts the interactive wizard

uninstall previously installed infrastructure
   uninstall       Removes the previously installed infra`);
  process.exit(0);
}

// Handle commands
if (command === 'init') {
  render(<App />, {
    exitOnCtrlC: true,
    patchConsole: false,
  });
} else if (command === 'uninstall') {
  console.log('Uninstall command not yet implemented');
  process.exit(1);
} else {
  console.error(`iac-toolbox: '${command}' is not a valid command. See 'iac-toolbox help'.`);
  process.exit(1);
}
