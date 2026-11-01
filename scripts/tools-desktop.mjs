import { execFileSync } from 'node:child_process';
import { readdir } from 'node:fs/promises';
import { homedir, release } from 'node:os';
import { delimiter, dirname, join } from 'node:path';

// Keep the toolchain local to this process; never change global xcode-select.
export async function configureDesktopTools() {
  if (process.platform !== 'darwin')
    throw new Error('Desktop packaging requires macOS.');
  const query = (command, args, env = process.env) =>
    execFileSync(command, args, {
      encoding: 'utf8',
      timeout: 30_000,
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  const explicit = process.env.DEVELOPER_DIR;
  const candidates = [];
  if (explicit) candidates.push(explicit);
  else {
    try {
      candidates.push(query('xcode-select', ['-p']));
    } catch {
      /* Try installed Xcodes. */
    }
    for (const directory of [
      '/Applications',
      join(homedir(), 'Applications'),
    ]) {
      for (const name of (await readdir(directory).catch(() => [])).sort()) {
        if (/^Xcode.*\.app$/.test(name))
          candidates.push(join(directory, name, 'Contents/Developer'));
      }
    }
  }
  for (const developer of new Set(candidates)) {
    if (!explicit && developer.endsWith('/CommandLineTools')) continue;
    const env = { ...process.env, DEVELOPER_DIR: developer };
    try {
      const version = query('xcrun', ['xcodebuild', '-version'], env);
      const actool = query('xcrun', ['--find', 'actool'], env);
      const toolVersion = query(actool, ['--version'], env);
      const major = Number(
        toolVersion.match(
          /<key>short-bundle-version<\/key>\s*<string>(\d+)/,
        )?.[1],
      );
      process.env.DEVELOPER_DIR = developer;
      // Packager invokes actool by name, so expose the resolved tool as well.
      process.env.PATH = `${dirname(actool)}${delimiter}${process.env.PATH || ''}`;
      console.log(`Desktop toolchain: ${developer}\n${version}`);
      const composer = major >= 26 && Number(release().split('.')[0]) >= 25;
      if (!composer)
        console.warn(
          'Icon Composer requires macOS 26 and actool 26 or newer; using .icns.',
        );
      return composer;
    } catch (error) {
      const reason = error.stderr?.toString().trim() || error.message;
      if (explicit)
        throw new Error(`Cannot use DEVELOPER_DIR=${developer}: ${reason}`, {
          cause: error,
        });
      console.warn(`Cannot use Xcode at ${developer}: ${reason}`);
    }
  }
  console.warn(
    'Full Xcode is unavailable; using .icns. Install Xcode or set DEVELOPER_DIR to enable Icon Composer.',
  );
  return false;
}

export function verifyDesktopApp(app) {
  execFileSync(
    'codesign',
    ['--verify', '--deep', '--strict', '--verbose=2', app],
    { stdio: 'inherit' },
  );
}
