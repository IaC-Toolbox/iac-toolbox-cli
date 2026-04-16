export interface CloudflareConfig {
  enabled: boolean;
  mode?: 'token' | 'oauth';
}

export interface DockerConfig {
  enabled: boolean;
}

export interface WizardConfig {
  docker: DockerConfig;
  cloudflare: CloudflareConfig;
}
