import fs from 'node:fs';
import path from 'node:path';
const root = 'frontend/src';
const failures = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (/\.tsx?$/.test(file)) {
      const text = fs.readFileSync(file, 'utf8');
      const imports = [...text.matchAll(/(?:from\s*|import\s*\()(['"])([^'"]+)\1/g)].map(
        (m) => m[2],
      );
      for (const name of imports) {
        if (name.startsWith('flexlayout-react') && !file.includes('/workbench/layout/'))
          failures.push(file + ': FlexLayout outside adapter');
        if (
          (name.includes('/bindings/') || name === '@wailsio/runtime') &&
          !file.includes('/platform/desktop-api/')
        )
          failures.push(file + ': raw desktop API outside platform');
        if (file.includes('/shared/') && /workbench|platform|app\//.test(name))
          failures.push(file + ': shared imports application');
        if (file.includes('/features/') && /workbench\/layout|bindings|@wailsio/.test(name))
          failures.push(file + ': feature imports infrastructure');
        if (file.includes('/app/router/') && name.includes('flexlayout'))
          failures.push(file + ': router owns layout');
      }
    }
  }
}
walk(root);
for (const file of ['package.json']) {
  const pkg = JSON.parse(fs.readFileSync(file));
  for (const [name, version] of Object.entries({ ...pkg.dependencies, ...pkg.devDependencies }))
    if (!/^\d+\.\d+\.\d+(?:-[\w.]+)?$/.test(version)) failures.push(name + ': version not pinned');
}
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('Architecture boundaries and pinned npm versions: passed');
