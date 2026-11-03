# FrameNote licensing

Copyright (c) 2026 Rafał Karczmarzyk.

FrameNote's original software source code, build scripts, configuration and
documentation are licensed under **GNU GPL version 3 or, at your option, any
later version** (`GPL-3.0-or-later`). See [LICENSE](LICENSE) for the unmodified
license text. This declaration also covers original files whose formats do not
support comments. It does not replace third-party notices or the exceptions below.

You may use, modify and redistribute the software, including commercially, under
the GPL. It comes WITHOUT ANY WARRANTY, including implied warranties of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

## Photographs and other assets

The software license does **not** grant rights to photographs or other artwork.

- `public/images/*.jpg` and `tests/fixtures/*.jpg`: copyright Rafał Karczmarzyk;
  governed by [the separate photograph terms](licenses/PHOTOGRAPHS.txt).
  Screenshots and test baselines containing these photographs retain those terms
  for the photographic content. The included photographs are not freely licensed.
- `public/fonts/**`: SIL Open Font License 1.1; retain the supplied OFL.txt files.
  Montserrat from Fontsource retains its own OFL and copyright notices.
- Third-party dependencies retain their original licenses. Build-generated
  `legal/THIRD_PARTY_NOTICES.txt` contains their notices and complete license texts,
  including the Feather notices within Lucide. Bundled Electron/Chromium retains
  its additional license files; the Electron npm license alone does not cover it.
- `packages/editor/src/components/brand/github-mark.tsx`: GitHub mark from
  Primer Octicons, MIT license; see `licenses/third-party/octicons-LICENSE.txt`.
  Its notice is included in build-generated third-party notices.
- Other artwork and brand assets outside the font directory, including `canon.svg`,
  FrameNote logo/icon files, `film-tabletop.png`, `rt.png` and custom vector artwork:
  excluded from the blanket software license. No additional rights are granted
  here; their ownership and redistribution terms have not been established by
  this licensing task. Existing third-party rights and trademarks remain intact.
  The logotype and Canon asset were expressly excluded from further review.

The code is open source; this repository and its builds also contain assets with
separate restrictions. Do not describe every bundled asset as GPL or freely licensed.
Redistributors may need to replace or obtain permission for excluded assets.

Your own photographs, presets, text and exported images do not become GPL merely
because you process them with FrameNote. Rights to third-party material you insert
in an image remain subject to that material's own terms.

## Source for downloadable builds

New release downloads must include `FrameNote-<version>-source.tar.gz` alongside
the binaries, with matching checksums. It contains the tagged project, build
instructions, bundled JavaScript dependencies and pinned upstream source archives.
See [source distribution](docs/SOURCE_DISTRIBUTION.md). A missing required source
or notice fails release preparation; do not publish incomplete downloads.

This change does not rewrite historical commits or license old release artifacts
retroactively. Published archives and tags remain unchanged.

## Upstream notices and source overrides

`licenses/third-party/react-remove-scroll-bar-LICENSE.txt` supplies the MIT text
for react-remove-scroll-bar 2.3.8, whose npm package omits a LICENSE file.
Its package.json and README explicitly declare MIT. The full notice is preserved
from upstream commit `7301c160fda44cb8cf2b9fdfde61efad35736196`, where the author
added LICENSE. Recheck this fallback when upgrading.

Two npm gitHead commits are no longer downloadable. `licenses/source-overrides.json`
pins available upstream commits for react-remove-scroll-bar and react-style-singleton.
Source preparation verifies that their TypeScript modules reproduce the published
ES2019 JavaScript after parsing and normalizing formatting and comments; a mismatch
blocks the source archive. No unrelated current branch is substituted.
