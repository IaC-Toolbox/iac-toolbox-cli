#!/usr/bin/env node
import { render } from 'ink';
import App from './app.js';

render(<App />, {
  exitOnCtrlC: true,
  patchConsole: false,
});
