# Caption font library

The picker includes 25 Google Fonts families and DSEG7 Classic. Stable family identifiers live in
`packages/core/src/fonts.ts`; presets never store font delivery URLs.
`Montserrat Variable` retains its existing identifier. Preset v1 now accepts arbitrary nonempty family names by explicit product
decision. Unknown/unloadable families retain their saved name, show Unavailable
inside the font selector, and render using Montserrat. Explicit selection changes
the saved family; loading and saving alone preserve it. Older readers may reject
these names.

## Delivery and variants

Montserrat continues to use the existing Fontsource package because it also styles
the interface. Its CSS and font files also supply interface headings.

The 24 added families are local WOFF2 files in `public/fonts/google`. They were
retrieved from the official [Google Fonts repository](https://github.com/google/fonts/tree/main/ofl)
on 2026-10-26 and losslessly repackaged from TTF into WOFF2 using FontTools.
Each family includes upstream METADATA.pb and OFL.txt. The checked-in manifest
`packages/core/src/google-fonts.json` records source URLs, WOFF2 SHA-256 hashes, weights,
styles and the glyph audit. Assets are checked in; building or running the app
requires no connection to Google or a font CDN.

CSS declares faces without downloading them. Font previews use IntersectionObserver
and load only when their row becomes visible. Preview text is “Leave your mark.”
for every family. While loading or on failure, the row shows explicit status text
rather than a preview in the wrong font. Choosing a font loads its actual selected
variant and caption text. Both the preview renderer and image exporter await font
readiness. An unavailable or failed font resolves explicitly to Montserrat in both preview
and export, with its original name and Unavailable badge retained in the selector.

Only real supplied 400/700 and italic variants are offered. Variable font weight
ranges supply both weights where supported. Families without Bold or Italic disable
that control and normalize the effective rendering variant, including imported
presets. Additional families are not fetched at application startup. Desktop bundles these assets for offline use. Web does not promise a first offline launch.

## Licenses and coverage

All 24 downloaded families carry SIL Open Font License 1.1, included beside each
family. Montserrat's OFL accompanies its installed Fontsource package. The previously
bundled RetiredDisplay assets and picker entry have been removed from current source.

An offline audit of the font cmap tables checked `ąćęłńóśźżĄĆĘŁŃÓŚŹŻ` in every
included face. Montserrat's Latin and Latin Extended subsets jointly cover these
letters. All added families except Prata have the full set. Prata lacks most Polish
letters. These are recorded audit
findings, not runtime validation or export restrictions. Per user feedback, the
picker does not show a Polish alphabet or interrupt the existing rendering flow.
Other scripts are not comprehensively audited.

To repeat the asset audit with Python, FontTools and Brotli installed:

```sh
python scripts/verify-fonts.py
```

## System fonts

The picker sorts all results alphabetically by display name, including category
and search results. Bundled and system families share one order; selection does
not move a family to the top.

Desktop adds a System category; All includes installed and bundled families.
Desktop font rows show a muted App or System badge. Hovering a source badge
explains whether the font is included with FrameNote or installed on this computer;
system fonts may be unavailable on another device or in the web app. Web hides source badges.
Selection uses the row highlight without a separate Selected badge on either platform.
On macOS the native catalog is read at startup; restart after installing fonts.
Only actual installed faces are used. Bundled families take precedence on name
collisions. Web does not enumerate local fonts or request font permissions.

Stories: `Pickers/FontPicker`; shared category control:
`Selection & feedback/CategoryFilter`.

## Segment date font

DSEG7 Classic Regular, Italic, Bold and Bold Italic (DSEG 0.46.0, keshikan) are bundled unchanged in
`public/fonts/dseg`, with SIL OFL 1.1. Source: https://github.com/keshikan/DSEG
(package https://registry.npmjs.org/dseg/-/dseg-0.46.0.tgz).
It is intended for segment digits and limited symbols, not general text or Polish
letters. Regular, Italic, Bold and Bold Italic are supplied. Quartz Date defaults to Bold Italic. The Quartz Date preset uses it locally in web
and desktop; older applications fall back to Montserrat if the font is unavailable.
