import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
const active = 'frontend/src/presentation/active.ts';
const original = readFileSync(active, 'utf8');
function run(task, env = {}) {
  const result = spawnSync('task', [task], { stdio: 'inherit', env: { ...process.env, ...env } });
  if (result.status !== 0) throw new Error(task + ' failed');
}
// Exercise the same static selection a product makes, then always restore it.
// Run this task with no development server; the alternate smoke owns its Vite process.
try {
  writeFileSync(
    active,
    "export {AppShell,createLayout,presentation} from './shells/workbench/preset';\n",
  );
  run('frontend-build');
  run('e2e', { PRESENTATION_TEST_SHELL: 'workbench', CI: '1' });
  writeFileSync(
    active,
    "export {AppShell,createLayout,presentation} from './shells/minimal/preset';\n",
  );
  run('frontend-build');
  const assets = readdirSync('frontend/dist/assets');
  if (
    assets.some(
      (file) =>
        /\.css$/.test(file) &&
        readFileSync('frontend/dist/assets/' + file, 'utf8').includes('.flexlayout__'),
    )
  )
    throw new Error('Minimal build includes docking styles');
  run('e2e', { PRESENTATION_TEST_SHELL: 'minimal', CI: '1' });
} finally {
  writeFileSync(active, original);
  run('frontend-build');
}
