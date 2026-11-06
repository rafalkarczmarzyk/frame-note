# 7-Segment v3.0 — Jan Bobrowski

Source: https://torinak.com/font/7-segment
Original TTF: https://torinak.com/font/7segment.ttf
Retrieved: 2026-11-06. License: SIL OFL, see OFL.txt.

The original Regular face is unmodified. WOFF2 is a lossless FontTools repackaging.
No Bold or Italic faces are supplied or synthesized.

## Asset hashes

- 7segment.ttf: `cc88da1060cb47d69dd7dd861fda4853afc0dd9180b91d28177641dc4c375dbb`
- 7segment.woff2: `75164a35c3d06bc955e62def8d3493e8c305df9511b5e2d2bcc803d33c66fdc2`

## Native symbol audit

- U+0027, U+0060, U+2032 and U+F066 map to quotesingle (upper-left segment).
- U+F062 is the separate upper-right segment. Its position is native to the font.
- U+002D, U+2010–U+2015, U+2212 and U+F067 map to hyphen (middle segment).
- U+203E is the top segment; U+005F is the bottom segment.
- All ASCII letters are present; Polish diacritics and U+2019 are absent.

Private-use symbols are specific to this font. The user selected U+F062 as the
short-year mark and U+002D as the date hyphen. 7-Segment rendering uses U+F062 for
an apostrophe before a two-digit year. Existing preset templates, style settings
and literal apostrophes remain saved unchanged; only fontFamily changes in Quartz
Date. The renderer
uses an ordinary apostrophe for this marker when another font family is selected.
No glyph positions or advance widths are changed.
