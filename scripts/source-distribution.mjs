// SPDX-License-Identifier: GPL-3.0-or-later
import { execFileSync } from 'node:child_process';
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
import { Buffer } from 'node:buffer';
/* global fetch, AbortSignal */
import { verifyLegalMaterials } from './verify-legal-materials.mjs';
import { digest, repositoryRoot } from './legal-materials.mjs';
import ts from 'typescript';

const overrides = JSON.parse(
  await readFile(
    join(repositoryRoot, 'licenses/source-overrides.json'),
    'utf8',
  ),
);

export async function verifyPreferredSources(source, published) {
  const normalize = (text) =>
    ts
      .createPrinter({ removeComments: true })
      .printFile(
        ts.createSourceFile(
          'source.js',
          text,
          ts.ScriptTarget.Latest,
          true,
          ts.ScriptKind.JS,
        ),
      );
  const files = (await readdir(join(source, 'src'))).filter((file) =>
    /\.tsx?$/.test(file),
  );
  const modules = (await readdir(join(published, 'dist/es2019'))).filter(
    (file) => file.endsWith('.js'),
  );
  if (!files.length || files.length !== modules.length)
    throw Error('Incomplete preferred source override');
  for (const file of files) {
    const text = await readFile(join(source, 'src', file), 'utf8');
    const result = ts.transpileModule(text, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2019,
        module: ts.ModuleKind.ES2015,
        jsx: ts.JsxEmit.React,
        importHelpers: true,
        esModuleInterop: true,
      },
    }).outputText;
    const original = await readFile(
      join(published, 'dist/es2019', file.replace(/\.tsx?$/, '.js')),
      'utf8',
    );
    if (normalize(result) !== normalize(original))
      throw Error(
        'Preferred source does not reproduce published module: ' + file,
      );
  }
}

function repositoryIdentity(repository) {
  const url = typeof repository === 'string' ? repository : repository?.url;
  const normalized = url
    ?.replace(/^git\+ssh:\/\/git@github.com\//, 'https://github.com/')
    .replace(/^git:\/\/github.com\//, 'https://github.com/');
  const match = normalized?.match(
    /^(?:git\+)?https:\/\/(github\.com|code\.haverbeke\.berlin)\/([\w.-]+)\/([\w.-]+?)(?:\.git)?$/,
  );
  if (!match) throw Error('Missing pinned upstream source: ' + url);
  return {
    host: match[1],
    owner: match[2],
    name: match[3],
    url: `https://${match[1]}/${match[2]}/${match[3]}`,
  };
}

export function upstreamSourceUrl(repository, commit) {
  const repo = repositoryIdentity(repository);
  if (!/^[a-f0-9]{40}$/.test(commit ?? ''))
    throw Error('Missing pinned upstream source: ' + repo.url);
  return repo.host === 'github.com'
    ? `https://codeload.github.com/${repo.owner}/${repo.name}/tar.gz/${commit}`
    : `${repo.url}/archive/${commit}.tar.gz`;
}

const tagCache = new Map();
export function provenanceCommit(metadata, provenance) {
  const statement = JSON.parse(
    Buffer.from(provenance.bundle.dsseEnvelope.payload, 'base64').toString(
      'utf8',
    ),
  );
  const sha512 = metadata.dist?.integrity?.match(/^sha512-(.+)$/)?.[1];
  if (
    !sha512 ||
    !statement.subject?.some(
      (s) => s.digest?.sha512 === Buffer.from(sha512, 'base64').toString('hex'),
    )
  )
    throw Error('Source provenance does not match npm package integrity');
  const repository = repositoryIdentity(metadata.repository).url;
  const deps = statement.predicate?.buildDefinition?.resolvedDependencies ?? [];
  const dependency = deps.find((d) => d.uri?.startsWith(`git+${repository}@`));
  if (!/^[a-f0-9]{40}$/.test(dependency?.digest?.gitCommit ?? ''))
    throw Error('Missing source commit in npm provenance');
  return dependency.digest.gitCommit;
}

export async function sourceCommit(metadata) {
  const override = overrides[`${metadata.name}@${metadata.version}`];
  if (override) {
    if (repositoryIdentity(metadata.repository).url !== override.repository)
      throw Error('Source override repository mismatch');
    return override.commit;
  }
  if (/^[a-f0-9]{40}$/.test(metadata.gitHead ?? '')) return metadata.gitHead;
  const attestationUrl = metadata.dist?.attestations?.url;
  if (attestationUrl?.startsWith('https://registry.npmjs.org/')) {
    const data = JSON.parse(
      (await fetchBytes(attestationUrl)).toString('utf8'),
    );
    const provenance = data.attestations?.find(
      (a) => a.predicateType === 'https://slsa.dev/provenance/v1',
    );
    if (provenance) return provenanceCommit(metadata, provenance);
  }
  // npm provenance-based publications may omit gitHead. Resolve an exact
  // version tag to its immutable commit; never download a moving branch.
  const repository = repositoryIdentity(metadata.repository).url + '.git';
  if (!tagCache.has(repository)) {
    const output = execFileSync('git', ['ls-remote', '--tags', repository], {
      encoding: 'utf8',
      maxBuffer: 32 * 1024 * 1024,
    });
    tagCache.set(
      repository,
      new Map(
        output
          .trim()
          .split('\n')
          .map((line) => line.split(/\s+/))
          .map(([sha, ref]) => [ref, sha]),
      ),
    );
  }
  const tags = tagCache.get(repository);
  for (const name of [
    `${metadata.name}@${metadata.version}`,
    `v${metadata.version}`,
    metadata.version,
  ]) {
    const ref = `refs/tags/${name}`;
    const commit = tags.get(ref + '^{}') ?? tags.get(ref);
    if (commit) return commit;
  }
  throw Error(
    `No exact upstream source tag: ${metadata.name}@${metadata.version}`,
  );
}

async function fetchBytes(url) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(300000),
      });
      if (!response.ok)
        throw Error(`Source download failed (${response.status}): ${url}`);
      return Buffer.from(await response.arrayBuffer());
    } catch (error) {
      if (attempt === 2 || /\(40\d\)/.test(error.message)) throw error;
    }
  }
}

export async function prepareDependencySources(components, folder) {
  const upstream = join(folder, 'third-party/upstream');
  const npm = join(folder, 'third-party/npm');
  await mkdir(upstream, { recursive: true });
  await mkdir(npm, { recursive: true });
  const downloaded = new Map();
  const sources = [];
  for (const component of components) {
    process.stdout.write(
      `Preparing source: ${component.name}@${component.version}\n`,
    );
    const id = `${component.name.replaceAll('/', '__')}@${component.version}`;
    if (component.license === 'OFL-1.1') {
      await cp(resolve(component.directory), join(npm, id), {
        recursive: true,
        dereference: true,
        filter: (path) =>
          !relative(resolve(component.directory), path)
            .split(/[\\/]/)
            .includes('node_modules'),
      });
      sources.push({
        name: component.name,
        version: component.version,
        license: component.license,
        file: `npm/${id}`,
        note: 'Font files distributed separately under OFL, with their original license.',
      });
      continue;
    }
    const bytes = await fetchBytes(
      `https://registry.npmjs.org/${encodeURIComponent(component.name)}/${component.version}`,
    );
    const metadata = JSON.parse(bytes.toString('utf8'));
    if (
      metadata.name !== component.name ||
      metadata.version !== component.version
    )
      throw Error('Source metadata mismatch: ' + id);
    const url = upstreamSourceUrl(
      metadata.repository,
      await sourceCommit(metadata),
    );
    let source = downloaded.get(url);
    if (!source) {
      const file = `${digest(url).slice(0, 16)}.tar.gz`;
      const data = await readFile(join(upstream, file)).catch((error) => {
        if (error.code !== 'ENOENT') throw error;
        return fetchBytes(url);
      });
      if (data[0] !== 0x1f || data[1] !== 0x8b)
        throw Error('Invalid source archive: ' + url);
      await writeFile(join(upstream, file), data);
      execFileSync('tar', ['-tzf', join(upstream, file)], { stdio: 'ignore' });
      if (overrides[`${component.name}@${component.version}`]) {
        const unpacked = join(folder, 'third-party/verify-' + id);
        await mkdir(unpacked, { recursive: true });
        execFileSync('tar', [
          '-xzf',
          join(upstream, file),
          '--strip-components=1',
          '-C',
          unpacked,
        ]);
        await verifyPreferredSources(unpacked, resolve(component.directory));
      }
      source = { url, file: `upstream/${file}`, sha256: digest(data) };
      downloaded.set(url, source);
    }
    // Preserve the exact installed package as well as the preferred upstream
    // source. The latter is needed for packages shipping generated JS only.
    await cp(resolve(component.directory), join(npm, id), {
      recursive: true,
      dereference: true,
      filter: (path) =>
        !relative(resolve(component.directory), path)
          .split(/[\\/]/)
          .includes('node_modules'),
    });
    sources.push({
      name: component.name,
      version: component.version,
      license: component.license,
      ...source,
    });
  }
  return sources;
}

export async function createSourceDistribution() {
  const git = (args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
  if (git(['status', '--porcelain']))
    throw Error('Source releases require a clean checkout');
  const { version } = JSON.parse(await readFile('package.json', 'utf8'));
  const commit = git(['rev-parse', 'HEAD']);
  if (git(['rev-parse', `v${version}^{commit}`]) !== commit)
    throw Error('Source release must match its version tag');
  const components = verifyLegalMaterials('apps/desktop/renderer');
  const temporary = await mkdtemp(join(tmpdir(), 'framenote-source-'));
  const name = `FrameNote-${version}-source`;
  const folder = join(temporary, name);
  try {
    await mkdir(folder);
    const archive = join(temporary, 'project.tar');
    execFileSync('git', ['archive', '--format=tar', '-o', archive, commit]);
    execFileSync('tar', ['-xf', archive, '-C', folder]);
    await writeFile(
      join(folder, '.framenote-source.json'),
      JSON.stringify({ version, commit }, null, 2),
    );
    const sources = await prepareDependencySources(components, folder);
    await cp(
      'apps/desktop/renderer/legal',
      join(folder, 'third-party/notices'),
      { recursive: true },
    );
    await writeFile(
      join(folder, 'third-party/sources.json'),
      JSON.stringify(sources, null, 2) + '\n',
    );
    await mkdir('release/source', { recursive: true });
    const output = resolve(`release/source/${name}.tar.gz`);
    execFileSync('tar', ['-czf', output, '-C', temporary, name]);
    return output;
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  process.stdout.write((await createSourceDistribution()) + '\n');
