import process from 'node:process';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
const version = JSON.parse(readFileSync('package.json', 'utf8')).version;
const tag = process.env.RELEASE_TAG || process.env.GITHUB_REF_NAME;
if (tag !== `v${version}`) throw Error('Tag/version mismatch');
const expected = [
  `FrameNote-${version}-mac-arm64.dmg`,
  `FrameNote-${version}-win-x64.exe`,
  `FrameNote-${version}-linux-x86_64.AppImage`,
].sort();
const actual = readdirSync('release-assets').sort();
if (JSON.stringify(actual) !== JSON.stringify(expected))
  throw Error('Incomplete or unexpected release assets: ' + actual);
const publish = process.argv.includes('--publish');
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

// Keep the release private until all uploads are present and verified.
const uploaded = JSON.parse(
  execFileSync('gh', ['release', 'view', tag, '--json', 'url,isDraft,assets'], {
    encoding: 'utf8',
  }),
);
const names = [...expected, 'SHA256SUMS'];
if (!uploaded.isDraft || uploaded.assets.length !== names.length)
  throw Error('Unexpected release state or asset count');
for (const name of names) {
  const asset = uploaded.assets.find((item) => item.name === name);
  const bytes = readFileSync(`release-assets/${name}`);
  const digest = 'sha256:' + createHash('sha256').update(bytes).digest('hex');
  if (
    !asset ||
    asset.state !== 'uploaded' ||
    asset.size !== bytes.length ||
    asset.digest !== digest
  )
    throw Error('Uploaded asset verification failed: ' + name);
}
if (publish)
  gh([
    'release',
    'edit',
    tag,
    '--draft=false',
    '--prerelease=false',
    '--latest',
  ]);
if (process.env.GITHUB_STEP_SUMMARY)
  writeFileSync(
    process.env.GITHUB_STEP_SUMMARY,
    `## FrameNote ${version}\n\n[${publish ? 'Open published release' : 'Review release draft'}](${uploaded.url})\n`,
    { flag: 'a' },
  );
