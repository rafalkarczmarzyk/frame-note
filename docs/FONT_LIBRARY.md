# Caption font library

The picker includes 25 Google Fonts families and 7-Segment. Stable family identifiers live in
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
and load only when their row becomes visible. Preview text is “Leave your mark.” for text families and a numeric date for
7-Segment. While loading or on failure, the row shows explicit status text
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

7-Segment v3.0 by Jan Bobrowski is bundled locally in `public/fonts/7-segment`
under SIL OFL. The original TTF comes from https://torinak.com/font/7segment.ttf;
author page: https://torinak.com/font/7-segment. WOFF2 is a lossless repackaging of
the original font. The accompanying OFL.txt records provenance and license terms.

Only Regular is supplied. Bold and Italic are disabled for this family, with no
synthetic faces. Quartz Date uses 7-Segment Regular. DSEG7 Classic and the temporary
FrameNote apostrophe font are no longer shipped. Existing presets that name
DSEG7 Classic retain their saved family/style values but resolve to 7-Segment
Regular in the editor, picker and export; their typography can therefore look
different. Unknown unrelated families retain the existing Unavailable behavior.

The original straight apostrophe U+0027, backtick U+0060 and prime U+2032 share
one upper-left segment glyph. The native upper-right segment U+F062 places the
mark closer to the following digits without changing tracking or glyph positions.
It is a font-specific private-use character, not a portable textual apostrophe.
ASCII hyphen U+002D, Unicode hyphens U+2010–U+2015 and minus U+2212 share one
middle-segment glyph. Overline U+203E and underscore U+005F use the upper/lower
horizontal segment and are visibly different. No glyph positions are modified.

In 7-Segment, an apostrophe before a two-digit year renders as the user-selected
U+F062, with native metrics and no spacing adjustment. The source format and preset
template keep their ordinary apostrophe. A literal U+F062 is also accepted in
custom patterns and encoded in preset v1; other fonts render it as an ordinary
apostrophe. Measuring, previewing, effects and export share this text resolution.

The only change to the built-in preset data is Quartz Date's fontFamily. Existing
weight/style values remain saved; 7-Segment's actual Regular face is used because
Bold/Italic are unavailable. Layout, formatting, colors, blending and effects are
unchanged. Temporary symbol and month-name comparison stories have been removed;
maintained DateFormat stories cover date/time editing and missing data. Montserrat is
explicitly loaded as fallback for characters absent from 7-Segment. Month names
and AM/PM have the limitations of segment letter shapes; Polish letters and curly
apostrophes are not native glyphs.
