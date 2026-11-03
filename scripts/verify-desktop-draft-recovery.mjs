// SPDX-FileCopyrightText: 2026 Rafał Karczmarzyk
// SPDX-License-Identifier: GPL-3.0-or-later
import process from 'node:process';
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
const run = process.env.BUILD_RUN;
const tag = process.env.RELEASE_TAG;
if (
  !/^\d+$/.test(run || '') ||
  !/^v\d+\.\d+\.\d+(?:-(alpha|beta|rc))?$/.test(tag || '')
)
  throw Error('Invalid run or tag');
const git = (args) => execFileSync('git', args, { encoding: 'utf8' });
const api = (path) =>
  JSON.parse(
    execFileSync('gh', ['api', '--paginate', '--slurp', path], {
      encoding: 'utf8',
    }),
  );
const repo = process.env.GITHUB_REPOSITORY;
const [build] = api(`repos/${repo}/actions/runs/${run}`);
const commit = git(['rev-parse', `${tag}^{commit}`]).trim();
if (
  build.head_sha !== commit ||
  build.event !== 'push' ||
  build.path !== '.github/workflows/desktop-release.yml'
)
  throw Error('Run is not the tagged desktop build');
git(['merge-base', '--is-ancestor', commit, 'origin/master']);
const jobs = api(
  `repos/${repo}/actions/runs/${run}/jobs?filter=latest`,
).flatMap((page) => page.jobs);
const names = [
  'validate',
  'source',
  'build (macos-15, mac-arm64)',
  'build (windows-2022, windows-x64)',
  'build (ubuntu-24.04, linux-x64)',
];
for (const name of names)
  if (!jobs.some((job) => job.name === name && job.conclusion === 'success'))
    throw Error('Missing successful job: ' + name);
for (const file of ['package.json', 'CHANGELOG.md'])
  writeFileSync(file, git(['show', `${commit}:${file}`]));
