import process from 'node:process';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
const version = JSON.parse(readFileSync('package.json', 'utf8')).version;
const tag = process.env.GITHUB_REF_NAME;
if (tag !== `v${version}`) throw Error('Tag/version mismatch');
const expected = [
  `FrameNote-${version}-mac-arm64.dmg`,
  `FrameNote-${version}-win-x64.exe`,
  `FrameNote-${version}-linux-x64.AppImage`,
].sort();
const actual = readdirSync('release-assets').sort();
if (JSON.stringify(actual) !== JSON.stringify(expected))
  throw Error('Incomplete or unexpected release assets: ' + actual);
const sums =
  expected
    .map(
      (name) =>
        `${createHash('sha256')
          .update(readFileSync(`release-assets/${name}`))
          .digest('hex')}  ${name}`,
    )
    .join('\n') + '\n';
writeFileSync('release-assets/SHA256SUMS', sums);
const changelog = readFileSync('CHANGELOG.md', 'utf8');
const section = changelog.split(`## [${version}]`)[1]?.split('\n## ')[0];
if (!section) throw Error('Missing release notes');
writeFileSync(
  'release-notes.md',
  section.replace(/^ - [^\n]+\n/, '') +
    '\n\nDownloads: macOS Apple Silicon (arm64), Windows x64, Linux x64.\n\nmacOS is ad hoc signed, not notarized; downloaded apps may require Open Anyway in Privacy & Security. Windows is unsigned and may display warnings or be blocked by security policies. Linux AppImage requires a compatible desktop environment.\n\nVerify downloads against SHA256SUMS. Native installation and functional testing on each system remain necessary.\n',
);
const gh = (args) => execFileSync('gh', args, { stdio: 'inherit' });
// Listing succeeds even when no release exists; authentication/network failures must fail closed.
const releases = JSON.parse(
  execFileSync(
    'gh',
    [
      'api',
      '--paginate',
      '--slurp',
      `repos/${process.env.GITHUB_REPOSITORY}/releases`,
    ],
    { encoding: 'utf8' },
  ),
).flat();
const existing = releases.find((r) => r.tag_name === tag);
if (existing && !existing.draft)
  throw Error('Refusing to modify a published release');
if (!existing) {
  gh([
    'release',
    'create',
    tag,
    '--verify-tag',
    '--draft',
    '--title',
    `FrameNote ${version}`,
    '--notes-file',
    'release-notes.md',
    ...(/-(alpha|beta|rc)$/.test(version) ? ['--prerelease'] : []),
  ]);
}
gh([
  'release',
  'upload',
  tag,
  ...expected.map((n) => `release-assets/${n}`),
  'release-assets/SHA256SUMS',
  '--clobber',
]);
