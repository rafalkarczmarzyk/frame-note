# Caption font library

The picker includes the 25 requested Google Fonts families and the existing
Advercase. Stable family identifiers live in `src/domain/fonts.ts`; presets never
store font delivery URLs. `Montserrat Variable` and `Advercase` retain their
existing identifiers. Unknown families remain rejected by preset validation.

## Delivery and variants

Montserrat continues to use the existing Fontsource package because it also styles
the interface. Its existing CSS, font files and rendering are retained. Advercase
continues to use the supplied local files.

The 24 added families are local WOFF2 files in `public/fonts/google`. They were
retrieved from the official [Google Fonts repository](https://github.com/google/fonts/tree/main/ofl)
on 2026-10-26 and losslessly repackaged from TTF into WOFF2 using FontTools.
Each family includes upstream METADATA.pb and OFL.txt. The checked-in manifest
`src/domain/google-fonts.json` records source URLs, WOFF2 SHA-256 hashes, weights,
styles and the glyph audit. Assets are checked in; building or running the app
requires no connection to Google or a font CDN.

CSS declares faces without downloading them. Font previews use IntersectionObserver
and load only when their row becomes visible. Preview text is “Leave your mark.”
for every family. While loading or on failure, the row shows explicit status text
rather than a preview in the wrong font. Choosing a font loads its actual selected
variant and caption text. Both the preview renderer and image exporter await font
readiness. A failed font download prevents exporting with an accidental fallback.

Only real supplied 400/700 and italic variants are offered. Variable font weight
ranges supply both weights where supported. Families without Bold or Italic disable
that control and normalize the effective rendering variant, including imported
presets. Additional families are not fetched at application startup. The checked-in
assets are suitable for a future packaged desktop app; a web app still needs an
explicit cache/service worker before it can promise a first offline launch.

## Licenses and coverage

All 24 downloaded families carry SIL Open Font License 1.1, included beside each
family. Montserrat's OFL accompanies its installed Fontsource package. Advercase's
license was absent from the supplied archive and remains unresolved before
redistribution; this task preserves the existing asset and picker entry.

An offline audit of the font cmap tables checked `ąćęłńóśźżĄĆĘŁŃÓŚŹŻ` in every
included face. Montserrat's Latin and Latin Extended subsets jointly cover these
letters. All added families except Prata have the full set. Prata lacks most Polish
letters; legacy Advercase also has incomplete coverage. These are recorded audit
findings, not runtime validation or export restrictions. Per user feedback, the
picker does not show a Polish alphabet or interrupt the existing rendering flow.
Other scripts are not comprehensively audited.

To repeat the asset audit with Python, FontTools and Brotli installed:

```sh
python scripts/verify-fonts.py
```

## Category controls

`CategoryFilter` is a controlled, single-selection chip group built on the existing
Radix toggle group. It adds the configurable All option, wraps long labels and
supports arrow navigation, Space/Enter and visible focus. `filterByCategory` holds
the domain-independent category/search predicate.

Filters and search belong to FloatingPanel's fixed toolbar, outside its scrolling
content. Font categories are All, Sans-serif, Serif, Monospace and Display. Tag
categories follow the real metadata namespaces plus FrameNote helpers; no Custom
tag model is invented. Colors retain their exact values and the existing Neutrals
and Soft colors groups. Switching filters never updates the selected domain value.

Stories: Components/UI/CategoryFilter, FontPicker, MetadataPicker and ColorPicker.
These include stateful search/category interactions, empty results, keyboard
navigation, long labels, narrow layout and selection retention.
