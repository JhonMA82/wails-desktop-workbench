import { spawnSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { chromium } from '@playwright/test';
const metrics = {
  platform: os.platform(),
  arch: os.arch(),
  cpus: os.cpus().length,
  versions: { go: '1.26.1', bun: '1.3.10', wails: 'v3.0.0-beta.27' },
  results: {},
};
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'workbench-baseline-'));
function measure(name, command, args, options = {}) {
  const start = performance.now();
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
    ...options,
  });
  metrics.results[name] = {
    seconds: Number(((performance.now() - start) / 1000).toFixed(3)),
    exitCode: result.status,
  };
  fs.writeFileSync('build/' + name + '.log', (result.stdout ?? '') + (result.stderr ?? ''));
  if (result.status !== 0) throw new Error(name + ' failed; see build/' + name + '.log');
  console.log(name, metrics.results[name]);
}
try {
  const install = path.join(temporary, 'install');
  fs.mkdirSync(install);
  for (const f of ['package.json', 'bun.lock']) fs.copyFileSync(f, path.join(install, f));
  measure('cold-install', 'bun', ['install', '--frozen-lockfile'], {
    cwd: install,
    env: { ...process.env, BUN_INSTALL_CACHE_DIR: path.join(temporary, 'bun-cache') },
    timeout: 120000,
  });
  measure('cold-build', 'task', ['build'], {
    env: { ...process.env, GOCACHE: path.join(temporary, 'go-cache') },
    timeout: 120000,
  });
  measure('incremental-build', 'task', ['build']);
  let server;
  let browser;
  const appbar = 'frontend/src/workbench/shell/AppBar.tsx',
    original = fs.readFileSync(appbar, 'utf8');
  try {
    const start = performance.now();
    server = spawn('task', ['web'], { stdio: 'ignore', detached: true });
    let ready = false;
    for (let i = 0; i < 150; i++) {
      try {
        const response = await fetch('http://127.0.0.1:5173');
        if (response.ok) {
          ready = true;
          break;
        }
      } catch {}
      await new Promise((r) => setTimeout(r, 100));
    }
    if (!ready) throw new Error('dev server timeout');
    metrics.results['dev-startup'] = {
      seconds: Number(((performance.now() - start) / 1000).toFixed(3)),
      scope: 'Vite HTTP ready, not native window startup',
    };
    browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto('http://127.0.0.1:5173/?preview=1');
    await page.getByRole('heading', { name: /Your next technical/ }).waitFor();
    const hmrStart = performance.now();
    fs.writeFileSync(appbar, original.replace('>WORKBENCH<', '>WORKBENCH HMR<'));
    await page.getByText('WORKBENCH HMR', { exact: true }).waitFor();
    metrics.results['frontend-hmr'] = {
      seconds: Number(((performance.now() - hmrStart) / 1000).toFixed(3)),
      scope: 'AppBar React module edit to visible update',
    };
  } finally {
    fs.writeFileSync(appbar, original);
    if (browser) await browser.close();
    if (server?.pid)
      try {
        process.kill(-server.pid, 'SIGTERM');
      } catch {}
  }
  measure('verify', 'task', ['verify']);
} finally {
  fs.writeFileSync('build/baseline.json', JSON.stringify(metrics, null, 2) + '\n');
  fs.rmSync(temporary, { recursive: true, force: true });
}
