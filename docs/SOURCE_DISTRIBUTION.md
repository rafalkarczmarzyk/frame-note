# Building and redistributing FrameNote

The original software is GPL-3.0-or-later. See [LICENSING.md](../LICENSING.md)
for the separate photograph terms and artwork exclusions. Do not apply the GPL
notice to those assets or remove dependency notices.

## Source archives

Every new downloadable release must offer `FrameNote-<version>-source.tar.gz`
next to the binary packages, covered by the release SHA256SUMS. The GitHub
automatic source ZIP alone is not the prepared source distribution.

The prepared archive includes:

- The exact tagged project tree, LICENSE, manifests, lockfile, scripts and assets.
- `.framenote-source.json`, identifying the source commit and version even without Git.
- `third-party/npm/`: exact installed JavaScript packages used by the build.
- `third-party/upstream/`: preferred source archives pinned to the npm release's
  upstream Git commit, including source for generated package distributions.
- `third-party/sources.json`: component versions, source URLs and SHA-256 hashes.
- `third-party/notices/`: generated full dependency notices and font licenses.

Source commits come from npm gitHead, matching npm provenance, or an exact
version tag resolved to a commit. Two reviewed overrides additionally require
matching TypeScript-to-JavaScript reproduction. OFL font files retain their
separate license and are preserved in their original npm package form.

The source command deliberately fails if an upstream source cannot be pinned or
downloaded. Resolve the missing component source before publishing; do not remove
this check or substitute an unrelated current branch. Source publication does not
grant additional rights to excluded assets.

## Rebuild

Extract the archive and use the Node.js version in `.nvmrc` and pnpm version in
`package.json`. Run `corepack enable`, `pnpm install --frozen-lockfile`, then
`pnpm build` for web or `pnpm desktop:compile` for the desktop renderer and adapter. On macOS Apple
Silicon, `pnpm desktop:build` also packages a standalone `FrameNote.app`.
Dependency installation and Electron installation require network access; the
source archive is not an offline package-manager cache.

Desktop packaging is platform-specific: `pnpm desktop:dist` prepares the current
system's CI target, while `pnpm desktop:package` is the local macOS path.
The Electron binary installer must run first (`node node_modules/electron/install.js`).
See [desktop prerequisites](DEVELOPMENT.md#local-macos-packaging) for signing, system and architecture limits.
Rebuilding does not promise byte-identical signatures or binary archives.

`third-party/npm` preserves the distributed package form; upstream archives
preserve the source form for inspection, modification and upstream builds.
Third-party components keep their original licenses. Build tools obtained during
installation are independent tools, rather than bundled FrameNote runtime code.

## Electron runtime

Electron/Chromium is an unmodified separately packaged runtime. Its original
LICENSE and LICENSES.chromium.html are preserved and copied into the application's
local legal reader by both packaging paths. Those notices include licenses other
than MIT; retain the original files when redistributing.

Electron source and its Chromium/Node/FFmpeg dependencies are obtained using the
[Electron source build instructions](https://www.electronjs.org/docs/latest/development/build-instructions-gn).
Use the exact Electron version in the release lockfile, not the latest release.
The JavaScript source archive does not claim to contain the complete Electron
native source checkout. Before publishing, review the native distribution's
notices and satisfy any source requirements for its copyleft components; the
native compliance review described in the audit remains a release prerequisite.

## Preparing a release

From a clean tagged checkout, build the desktop renderer, then run
`node scripts/source-distribution.mjs`. CI runs this in its separate source job.
The publisher requires the source archive as a fourth asset and checks the
remote SHA-256 of every upload before publishing. Recovery requires a successful
source job as well as all three binary build jobs.

Local development changes are marked dirty in About. Its source link identifies
the base commit; it does not claim uncommitted edits exist on GitHub.
