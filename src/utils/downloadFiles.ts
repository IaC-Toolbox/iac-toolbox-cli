import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

const REPO_OWNER = 'IaC-Toolbox';
const REPO_NAME = 'iac-toolbox-raspberrypi';
const BRANCH = 'main';

interface DownloadItem {
  path: string;
  type: 'file' | 'dir';
}

const ITEMS_TO_DOWNLOAD: DownloadItem[] = [
  { path: '.gitignore', type: 'file' },
  { path: 'scripts', type: 'dir' },
  { path: 'terraform/grafana-alerts', type: 'dir' },
  { path: 'ansible-configurations', type: 'dir' },
];

function httpsGet(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: { 'User-Agent': 'iac-toolbox-cli' }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function downloadFile(repoPath: string, localPath: string): Promise<void> {
  const url = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/${repoPath}`;
  const content = await httpsGet(url);

  const dir = path.dirname(localPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(localPath, content);
}

async function listRepoContents(repoPath: string): Promise<any[]> {
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${repoPath}?ref=${BRANCH}`;
  const data = await httpsGet(url);
  return JSON.parse(data);
}

async function downloadDirectory(repoPath: string, localPath: string): Promise<void> {
  const contents = await listRepoContents(repoPath);

  for (const item of contents) {
    const itemRepoPath = item.path;
    const itemLocalPath = path.join(localPath, path.basename(item.path));

    if (item.type === 'file') {
      await downloadFile(itemRepoPath, itemLocalPath);
    } else if (item.type === 'dir') {
      await downloadDirectory(itemRepoPath, itemLocalPath);
    }
  }
}

export async function downloadInfrastructureFiles(targetDir: string): Promise<void> {
  const fullPath = path.join(process.cwd(), targetDir);

  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }

  for (const item of ITEMS_TO_DOWNLOAD) {
    const localPath = path.join(fullPath, item.path);

    if (item.type === 'file') {
      await downloadFile(item.path, localPath);
    } else {
      await downloadDirectory(item.path, localPath);
    }
  }
}
