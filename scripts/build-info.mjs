// SPDX-FileCopyrightText: 2026 Rafał Karczmarzyk
// SPDX-License-Identifier: GPL-3.0-or-later
import { URL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
export function buildInfo() {
  const { version } = JSON.parse(
    readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
  );
  let commit = 'unknown',
    dirty = false;
  try {
    commit = execFileSync('git', ['rev-parse', '--short=7', 'HEAD'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    dirty = !!execFileSync('git', ['status', '--porcelain'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    const metadata = new URL('../.framenote-source.json', import.meta.url);
    if (existsSync(metadata)) {
      const source = JSON.parse(readFileSync(metadata, 'utf8'));
      if (source.version !== version || !/^[a-f0-9]{40}$/.test(source.commit))
        throw Error('Invalid source archive identity');
      commit = source.commit.slice(0, 7);
    }
  }
  return { version, commit, dirty };
}
