// SPDX-License-Identifier: GPL-3.0-or-later
import { readFileSync, readdirSync, existsSync, realpathSync } from 'node:fs';
import { dirname, join, resolve, relative, sep } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath, URL } from 'node:url';

export const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));
const read = (file) => readFileSync(file, 'utf8');
export const digest = (value) =>
  createHash('sha256').update(value).digest('hex');

export function packageDirectory(file) {
  let directory = dirname(file.split('?')[0]);
  while (directory !== dirname(directory)) {
    if (existsSync(join(directory, 'package.json'))) {
      const manifest = JSON.parse(read(join(directory, 'package.json')));
      if (manifest.name && manifest.version) return directory;
    }
    directory = dirname(directory);
  }
  throw Error('Cannot locate package for ' + file);
}

export function packageNotice(directory) {
  const manifest = JSON.parse(read(join(directory, 'package.json')));
  const files = readdirSync(directory).filter((name) =>
    /^(licen[sc]e|copying|notice|copyright)(\.|$)/i.test(name),
  );
  let texts = files.map((name) => `${name}\n${read(join(directory, name))}`);
  if (
    !texts.length &&
    manifest.name === 'react-remove-scroll-bar' &&
    manifest.version === '2.3.8'
  ) {
    texts = [
      read(
        join(
          repositoryRoot,
          'licenses/third-party/react-remove-scroll-bar-LICENSE.txt',
        ),
      ),
    ];
  }
  if (!manifest.license || !texts.length)
    throw Error(
      `Missing license material: ${manifest.name}@${manifest.version}`,
    );
  const text = `${manifest.name}@${manifest.version}\nDeclared license: ${manifest.license}\n${texts.join('\n\n')}`;
  return {
    name: manifest.name,
    version: manifest.version,
    license: manifest.license,
    directory: relative(repositoryRoot, realpathSync(directory))
      .split(sep)
      .join('/'),
    noticeSha256: digest(text),
    text,
  };
}

export function legalFiles(directories = []) {
  const packages = [...new Set(directories.map((p) => realpathSync(p)))]
    .map(packageNotice)
    .sort((a, b) =>
      `${a.name}@${a.version}`.localeCompare(`${b.name}@${b.version}`),
    );
  const fonts = readdirSync(join(repositoryRoot, 'public/fonts/google')).map(
    (name) =>
      `Font: ${name}\n${read(join(repositoryRoot, 'public/fonts/google', name, 'OFL.txt'))}`,
  );
  fonts.push(
    `Font: 7-Segment (Jan Bobrowski)\n${read(join(repositoryRoot, 'public/fonts/7-segment/OFL.txt'))}`,
    `Font: Montserrat\n${read(join(repositoryRoot, 'public/fonts/montserrat/OFL.txt'))}`,
  );
  const files = {
    'LICENSE.txt': read(join(repositoryRoot, 'LICENSE')),
    'LICENSING.txt': read(join(repositoryRoot, 'LICENSING.md')),
    'PHOTOGRAPHS.txt': read(join(repositoryRoot, 'licenses/PHOTOGRAPHS.txt')),
    'native.json': '[]\n',
    'THIRD_PARTY_NOTICES.txt': [
      ...packages.map((p) => p.text),
      ...fonts,
      `GitHub mark — Primer Octicons\n${read(join(repositoryRoot, 'licenses/third-party/octicons-LICENSE.txt'))}`,
    ].join('\n\n' + '='.repeat(72) + '\n\n'),
    'components.json':
      JSON.stringify(
        packages.map((p) => ({
          name: p.name,
          version: p.version,
          license: p.license,
          directory: p.directory,
          noticeSha256: p.noticeSha256,
        })),
        null,
        2,
      ) + '\n',
  };
  if (
    !files['LICENSE.txt'].includes('GNU GENERAL PUBLIC LICENSE') ||
    !files['LICENSE.txt'].includes('Version 3, 29 June 2007')
  )
    throw Error('Missing GPLv3 text');
  return files;
}

// Development has no final chunk graph. Use installed root dependencies as a
// conservative superset; production notices use actual imported package roots.
function developmentPackages() {
  const seen = new Set();
  function visit(name, from) {
    let parent = from,
      directory;
    while (parent !== dirname(parent)) {
      const candidate = join(parent, 'node_modules', name);
      if (existsSync(candidate)) {
        directory = realpathSync(candidate);
        break;
      }
      parent = dirname(parent);
    }
    if (!directory) throw Error('Missing dependency ' + name);
    if (seen.has(directory)) return;
    seen.add(directory);
    const p = JSON.parse(read(join(directory, 'package.json')));
    for (const dep of Object.keys(p.dependencies ?? {})) visit(dep, directory);
  }
  const p = JSON.parse(read(join(repositoryRoot, 'package.json')));
  for (const name of Object.keys(p.dependencies)) visit(name, repositoryRoot);
  visit('zod', join(repositoryRoot, 'packages/core'));
  return [...seen];
}

export function legalMaterialsPlugin({ applicationPreview = false } = {}) {
  return {
    name: 'framenote-legal-materials',
    configureServer(server) {
      let files;
      server.middlewares.use('/legal', (req, res, next) => {
        try {
          files ??= legalFiles(developmentPackages());
          const file = files[(req.url ?? '').slice(1).split('?')[0]];
          if (file === undefined) return next();
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.end(file);
        } catch (error) {
          next(error);
        }
      });
    },
    generateBundle() {
      const dirs = applicationPreview
        ? developmentPackages()
        : [...this.getModuleIds()]
            .filter(
              (id) => id.includes('/node_modules/') && !id.startsWith('\0'),
            )
            .map(packageDirectory);
      // The native preset adapter also bundles Zod; include its notices in the
      // same local reader. Third-party font notices live alongside font files.
      dirs.push(resolve(repositoryRoot, 'packages/core/node_modules/zod'));
      dirs.push(
        resolve(repositoryRoot, 'node_modules/@fontsource-variable/montserrat'),
      );
      for (const [name, source] of Object.entries(legalFiles(dirs)))
        this.emitFile({ type: 'asset', fileName: `legal/${name}`, source });
    },
  };
}
