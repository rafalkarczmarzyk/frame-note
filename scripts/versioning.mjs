import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import process from 'node:process';
import console from 'node:console';

const manifests = [
  'package.json',
  'apps/web/package.json',
  'apps/desktop/package.json',
  'packages/core/package.json',
  'packages/editor/package.json',
];
const parse = (version) => {
  const match =
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-(alpha|beta|rc))?$/u.exec(
      version,
    );
  if (!match)
    throw Error(
      'Expected X.Y.Z[-alpha|-beta|-rc], without a channel counter: ' + version,
    );
  return [
    ...match.slice(1, 4).map(Number),
    { alpha: 0, beta: 1, rc: 2 }[match[4]] ?? 3,
  ];
};
const [command = 'check', value] = process.argv.slice(2);
const root = JSON.parse(readFileSync(manifests[0], 'utf8'));
if (command === 'set') {
  parse(value);
  for (const file of manifests) {
    const data = JSON.parse(readFileSync(file, 'utf8'));
    data.version = value;
    writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
  }
  console.log('Synchronized product version: ' + value);
} else if (command === 'check') {
  const version = root.version;
  const parts = parse(version);
  for (const file of manifests) {
    if (JSON.parse(readFileSync(file, 'utf8')).version !== version)
      throw Error('Version mismatch: ' + file);
  }
  const changelog = readFileSync('CHANGELOG.md', 'utf8');
  if (
    !changelog.includes('## Unreleased') ||
    !new RegExp(
      '^## \\[?' + version.replaceAll('.', '\\.') + '(?:\\]| |$)',
      'mu',
    ).test(changelog)
  )
    throw Error('Missing changelog section for ' + version);
  const base = process.argv.find((arg) => arg.startsWith('--base='))?.slice(7);
  if (base) {
    const previous = parse(
      JSON.parse(
        execFileSync('git', ['show', base + ':package.json'], {
          encoding: 'utf8',
        }),
      ).version,
    );
    const changed = parts.findIndex((part, i) => part !== previous[i]);
    if (changed === -1 || parts[changed] < previous[changed])
      throw Error('Version must increase relative to ' + base);
    const tags = execFileSync('git', ['tag', '--list', 'v' + version], {
      encoding: 'utf8',
    }).trim();
    if (tags) throw Error('Version tag already exists: ' + tags);
  }
  console.log('Version manifests and changelog agree: ' + version);
} else
  throw Error(
    'Usage: pnpm version:set X.Y.Z[-channel] or pnpm check:version [--base=ref]',
  );
