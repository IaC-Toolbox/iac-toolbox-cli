import * as fs from 'fs';
import * as path from 'path';
import { WizardConfig } from '../types/config.js';

export function writeConfigYaml(
  targetDir: string,
  config: WizardConfig
): void {
  const configPath = path.join(process.cwd(), targetDir, 'config.yaml');

  let yamlContent = '';

  // Docker configuration
  yamlContent += `docker:\n`;
  yamlContent += `  enabled: ${config.docker.enabled}\n`;
  yamlContent += `\n`;

  // Cloudflare configuration
  yamlContent += `cloudflare:\n`;
  yamlContent += `  enabled: ${config.cloudflare.enabled}\n`;
  if (config.cloudflare.enabled && config.cloudflare.mode) {
    yamlContent += `  mode: "${config.cloudflare.mode}"\n`;
  }

  fs.writeFileSync(configPath, yamlContent, 'utf-8');
}
