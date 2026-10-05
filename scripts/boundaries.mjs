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
        const target = name.startsWith('.')
          ? path.normalize(path.join(path.dirname(file), name)).replaceAll('\\', '/')
          : name;
        const test = file.includes('.test.');
        if (
          !test &&
          (file.startsWith(root + '/workbench/') || file.startsWith(root + '/app/bootstrap/')) &&
          target.includes('/presentation/')
        )
          failures.push(file + ': application depends on presentation');
        if (
          !test &&
          file.includes('/presentation/') &&
          !file.includes('/contract/') &&
          target.includes('/app/')
        )
          failures.push(file + ': presentation bypasses its Application contract');
        if (
          file.includes('/presentation/shells/minimal/') &&
          /flexlayout|shells\/workbench/.test(target)
        )
          failures.push(file + ': Minimal depends on Workbench');

        if (
          name.startsWith('flexlayout-react') &&
          !file.includes('/presentation/shells/workbench/layout/')
        )
          failures.push(file + ': FlexLayout outside adapter');
        if (
          (target.includes('frontend/bindings') || name.startsWith('@wailsio/')) &&
          !file.includes('/platform/desktop-api/')
        )
          failures.push(file + ': raw desktop API outside platform');
        if (file.includes('/shared/') && /workbench|platform|app\//.test(name))
          failures.push(file + ': shared imports application');
        if (
          file.includes('/features/') &&
          /presentation\/shells|workbench\/layout|bindings|@wailsio/.test(target)
        )
          failures.push(file + ': feature imports infrastructure');
        if (file.includes('/app/router/') && name.includes('flexlayout'))
          failures.push(file + ': router owns layout');
      }
    }
  }
}
walk(root);
function checkBackend(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) checkBackend(file);
    else if (file.endsWith('.go')) {
      const source = fs.readFileSync(file, 'utf8');
      for (const block of source.matchAll(/import\s*(\([\s\S]*?\)|"[^"]+")/g))
        if (/presentation|flexlayout|react(?:\/|")/i.test(block[1]))
          failures.push(file + ': backend imports presentation');
    }
  }
}
checkBackend('internal');
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
