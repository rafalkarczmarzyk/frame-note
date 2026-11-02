import console from 'node:console';
import process from 'node:process';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
const tag = process.env.GITHUB_REF_NAME;
const version = JSON.parse(readFileSync('package.json', 'utf8')).version;
if (
  !/^v\d+\.\d+\.\d+(?:-(?:alpha|beta|rc))?$/.test(tag || '') ||
  tag !== `v${version}`
)
  throw Error('Release tag must match the product version exactly.');
execFileSync('git', ['merge-base', '--is-ancestor', 'HEAD', 'origin/master']);
execFileSync(process.execPath, ['scripts/versioning.mjs', 'check'], {
  stdio: 'inherit',
});
console.log(`Validated ${tag} on master`);
