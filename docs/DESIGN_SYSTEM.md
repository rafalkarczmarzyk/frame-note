# FrameNote design system

## Source of truth

The application and Storybook import the same components and `src/index.css`.
No parallel “demo” component library. `components/ui` contains domain-independent
controls, `components/layout` contains editor layout primitives, and `features`
composes them with photo/caption state. This is currently a reusable local library,
not a separately published npm package.

## Design tokens

The base colors live in `@theme` in `src/index.css`. They are also used by
photo captions; do not rename their `--color-*` variables as part of UI changes.
Section accents use semantic `section-*` roles: turquoise for Photo, rose-brown
for Caption, violet for Typography, yellow for Sizing and Margins, crimson for Position,
and primary for Export. They color icon badges only. Collapsed accordions show
only their title and icon, without summaries. Primary uses emerald (`#14CC60`) through `--accent-color`, with charcoal-dark button text.
The drag-and-drop background stays slate (`#9CAFB7`) independently of primary. Caption presets are independent of UI accents.
All 18 shared color recipes live in `:root` as private `--tone-*` values,
button hover recipes and the panel glass material. Components consume usage roles exposed by `@theme inline`.

| Area                                | Tailwind examples                                                                    |
| ----------------------------------- | ------------------------------------------------------------------------------------ |
| App, header, sidebar, workspace     | `bg-app-base`, `bg-header-base`, `bg-sidebar-base`, `bg-workspace-base`              |
| Accordion                           | `bg-accordion-base`, `text-accordion-label`, `text-accordion-icon`                   |
| Input, textarea, select, dimensions | `bg-input-base`, `text-input-text`, `text-input-unit`, `outline-input-focus-ring`    |
| Buttons                             | `bg-button-primary-base`, `text-button-primary-text`, `bg-button-secondary-base`     |
| Segments and anchors                | `bg-segment-base`, `bg-segment-selected`                                             |
| Slider                              | `bg-slider-track`, `bg-slider-fill`, `bg-slider-thumb`, `bg-slider-thumb-drag`       |
| Panel and menu                      | `bg-panel-base`, `bg-panel-header-base`, `bg-menu-base`, `shadow-panel`              |
| Text                                | `text-content-primary`, `text-content-secondary`, `text-content-muted`, `text-label` |

Role aliases may currently share a value but remain independently adjustable.
Input and button backgrounds must not reference each other's role. To change an
input background, edit `--input-base`, not the private shared recipe unless a
palette-wide change is intended. Primary/secondary background roles retain their
current colors; the consolidation mainly affects near-identical text, edges,
reflections and shadows. Shared text levels are 100%, 70% and 50%.

No local `color-mix()` or color opacity utilities (`text-…/70`, `bg-…/15`) in
components. Define a named role instead. Disabled element opacity, photo-caption
opacity, transforms and forced-colors system values remain legitimate exceptions.
Shadows, focus washes and reflections are effect tokens; they must also use the
shared recipes. See Design/Tokens → UsageTokens and ControlSurfaces in Storybook.

`pnpm check:tokens` checks these boundaries, missing CSS variables and accidental
literal/Tailwind palette colors. It runs inside `pnpm check`. It is an architecture
guard, not a contrast audit. See [COLOR_AUDIT.md](COLOR_AUDIT.md) for before/after counts.

## Control surfaces

Controls use macOS-inspired surface hierarchy with the existing FrameNote palette.
`src/index.css` owns shared `control-*` styles, which consume the usage-specific
color and effect tokens described above. Fields use a gently recessed surface; neutral
buttons and selected segments use raised surfaces. Accent color is reserved for
primary actions, slider progress and focus. Segments and anchors share a neutral
selected state. Controls use 8 px radii; groups and menus use 12 px.

Use `control-field` for field-like triggers such as the font picker so they match
Input and Select. Button outline is a neutral raised surface; IconButton is quiet.
All controls retain visible keyboard focus and disabled states. Invalid fields
use a dashed contrasting edge with an associated error message when applicable.
Blur is limited to floating menus and panels, with opaque fallbacks and reduced
transparency support. Motion respects reduced-motion preferences. This is a web
interpretation of Apple surface principles, not native Liquid Glass rendering.

## UI components

- Button, IconButton: primary/outline actions, explicit icon labels, focus states.
- Input, Textarea: shared styling with native props, refs, disabled states.
- Field: generates a label target and optional description/error relationship.
- HelperText: semantic `<small>` with 11 px text, an Info icon and separated
  multiline guidance. Used by Field hints and margin instructions; errors remain
  separate alerts.
- ColorSwatch: shared preview for preset tokens and normalized custom HEX.
- NumberInput: shared numeric editing with draft values, validation and disabled states.
- DimensionInput: a numeric input with a required, always-visible unit in its own
  reserved space; used for dimensions, percentages and multipliers.
- NumberField: a labeled wrapper that uses DimensionInput when `unit` is supplied,
  otherwise NumberInput. Supports a visually hidden label. Display rounds to six decimal
  places; this does not round domain values during unit conversion.
- Select: custom Radix popper with keyboard navigation and disabled options.
- Slider: Radix single-value slider, pointer and keyboard support. Optional `marks`
  accept `{ value, label? }` at arbitrary thresholds; out-of-range marks are omitted.
  Scale ticks align with the thumb center, do not snap values and do not change `step`.
  Keep labels short and spaced apart to avoid overlap.
- SegmentedControl: single selection, optional icons, keyboard navigation.
- AnchorPicker: reusable 3 × 3 grid, independent of the positioning calculation.
- MarginEditor: four independently editable edges around a diagram, with linked
  editing and edge highlighting. Link modes: None, Pairs (top/bottom and
  left/right) and All. Pairs copies top to bottom and left to right; All copies
  top to every edge, limited to preserve a one-pixel inner area. None keeps values.
- PickerList: selectable rows, descriptions, leading content, previews and selected labels.
- InlineNotice: informative, warning and error messages, using existing palette.

All controls accept a disabled state directly or through native field semantics.
Prefer explicit disabled props for Radix controls. Fields must have an associated
label or aria-label. Do not replace controls with feature-specific HTML copies.

## Document sizing and caption controls

CaptionControls appears after Caption and contains Sizing, Typography, Position and Margins,
followed by the workspace Export section. Sizing owns a document-wide `sizingUnit`:
`px`, `short-edge` or `long-edge`. Font size and all four margins use it. Values
refer to source-image dimensions, not the preview viewport. `domain/sizing.ts`
converts all lengths together when the unit changes, preserving pixel geometry
without rounding the stored values. Defaults: font size 2% of the short edge, four margins of 3%, Porcelain text,
line height 1.4× and bottom-left anchor.

Four margins define an inner image rectangle; all nine anchors place the measured
text block within that rectangle. Margin limits preserve at least one source pixel
of width/height. They do not guarantee that a very large text block fits; automatic
text wrapping/resizing is still outside the current scope.

Opacity uses a 0–100 slider and exact numeric field. Line height remains a font-size
multiplier (`×`), independent of document units. Export quality also remains a
percentage. The shared caption renderer applies the same sizing and inset geometry
in preview and export. Replacing a photo preserves the template, style, sizing
unit, position, margins and export quality in the mounted editor. Relative values
use the new photo dimensions; px values stay absolute. Reloading the application
resets these values; only accordion open/closed preferences are persisted.

Stories: Components/UI/MarginEditor covers independent, paired, fully linked, asymmetric, pixel
and disabled variants. Components/UI/CaptionControls covers all units and both
photo orientations; Screens/EditorWorkspace uses these same controls.

## Main sidebar and auxiliary panel

EditorWorkspace owns layout and the shared sidebar-width variable. ToolSidebar
participates in layout and is the permanent home of editing controls.
SidebarSection presents separated, rounded setting groups with a quiet header and
right-hand disclosure chevron. Titles use Advercase; the optional `icon` prop
adds a decorative leading icon; `iconTone` selects a section accent. Collapsed
sections show only icon, title and chevron, without a summary. Content retains
Montserrat. It uses native details/summary; persistence
can be scoped or disabled (e.g. Storybook does not write application preferences).

FloatingPanel is non-modal and absolutely positioned by its parent. Opening it
must not change the canvas dimensions. It accepts title, description, toolbar,
children, footer, onClose, surface and className. Header/footer stay fixed, content
scrolls independently. Glass has a solid fallback without backdrop-filter.
Escape inside the panel closes it; it does not trap focus or block the editor.

PhotoWorkspace owns the active content ('tags', 'fonts', 'colors', or closed). Switching
content replaces the same surface. Tag search and font search have independent
state. Caption cursor memory stays in the editor, not inside the panel.

## Storybook

```sh
pnpm storybook
pnpm build-storybook
```

Development: http://localhost:6006. Production application remains on port 3000.
Stories are organized by purpose, without Atomic Design categories:

- Design/Tokens: palette, typography and shared visual tokens.
- Components/UI: reusable controls from `components/ui`, plus Accordion (the
  sidebar section component).
- Components/Layout: workspace and panel components from `components/layout`.
- Components/Brand: the logo from `components/brand`.
- Screens: start screen states, EditorWorkspace compositions and TestPhotos
  stories using the real editor with original fixtures.

Stories remain alongside their components; screen stories live in `src/stories`.
Feature-specific components remain in `features`. New story titles should follow
this structure. Renaming categories changes Storybook URLs.

Autodocs
shows props and usage; controls allow changing args. Interactive stories exercise
select and slider behavior. The accessibility addon is available for inspecting
components; its presence is not a claim of a complete accessibility audit.

Screen previews use the same components as production. Screens/EditorWorkspace
composes UI with original photos but no caption rendering or JPEG export.
Screens/TestPhotos uses PhotoWorkspace with actual metadata, caption rendering and
export for BrightBackground, Macro, HeliconStack, NightPortrait and XmpPortrait.
Controlled examples maintain local state. Native disabled
and empty states are documented separately. The glass example deliberately puts
content behind the panel so transparency and the opaque fallback can be compared.

## Adding a control

1. Start with an existing primitive; keep feature data outside ui/layout.
2. Add or extend semantic tokens only when necessary. No inline HEX values.
3. Supply accessible labels, keyboard focus and disabled behavior.
4. Add stories for the useful states, and a composition when context matters.
5. Test nontrivial logic with unit tests; use stories for UI iteration.
6. Run `pnpm check`, `pnpm build-storybook`, and the export regression when
   caption behavior is affected. Do not regenerate export baselines for UI edits.

## Verification

Current verification: `pnpm check` passes 141 unit tests plus formatting, token
boundaries, lint, type checking and the application build. Playwright passes five
scenarios in Chromium and WebKit (10 tests), including custom color export and
portable helper templates. Storybook builds; the added photo/picker compositions
have been inspected in Chromium. This is not a complete accessibility audit.

Filled buttons accept `color="violet"`, `"turquoise"`, `"yellow"`, `"crimson"` or
`"rose-brown"`. Omit color to retain the current primary. Export JPG uses primary as the main application action. Color variants retain shared hover and disabled
behavior; outline buttons remain neutral.

## Caption color picker

Color opens a floating list like the font picker. It includes six neutrals and six
soft colors, with search, swatches and a selected indicator. Nine dedicated
`--color-caption-*` presets supplement Porcelain, Slate and Charcoal without
changing UI roles. Custom colors accept RGB or RRGGBB HEX, with or without a hash;
Apply color (or Enter) commits a normalized HEX value. Invalid drafts do not change
the caption. `resolveCaptionColor` resolves both legacy palette names and custom
HEX for the shared canvas preview/export path. The custom field stays outside the
scrollable list. Escape closes the panel and restores focus to the trigger.

## FrameNote metadata helpers

Helpers use unqualified tokens: `{author}`, `{camera}`, `{lens}`, `{shutter}`,
`{aperture}`, `{iso}`, `{focalLength}`, `{date}`, `{copyright}`, `{exposure}`.
The `caption-tags` domain module declares ordered source candidates and formats
values. Author prefers XMP creator, then EXIF Artist and IPTC By-line. Technical
fields prefer their EXIF equivalents, then XMP. Lens also falls back to XMP Lens.
Capture date falls back to IPTC DateCreated and XMP CreateDate, without time zone
conversion. Empty or unusable candidates are skipped. Exposure combines available
shutter, aperture and ISO values, with units and no empty separators. No stacking
comment detection is performed.

Helpers are derived without modifying source metadata. The resolver accepts both
helper names and existing qualified tokens. Known helpers with no value use the
existing missing-token warning, not a syntax error. New editor sessions start with
`{author}\n{lens}\n{exposure}`.

The picker groups helpers under **FrameNote**, always first; source groups follow
as **EXIF**, **XMP**, **IPTC**, then other namespaces. All original keys remain
insertable. Helper rows show the chosen source(s), or no-data text. Missing helpers
remain insertable for portable templates. Search covers keys, values, namespaces
and helper sources, retaining headings only for matching groups.

Helper source precedence and template examples: [Caption tags](CAPTION_TAGS.md).

## MVP caption editor prototype

Screens/CaptionEditorPrototype/Playground is an isolated Tiptap evaluation.
Its feature components live in `features/caption/editor-prototype`; it uses shared
Button, Textarea, HelperText and existing control/color tokens. Atomic inline
nodes render metadata badges and bare inline SVG icons sized to the surrounding
text. Icons have no visible label or surface; their names remain accessible and
available in tooltips. Selection uses an outline. Missing metadata has a dashed
edge and warning icon; missing SVG icons use a warning symbol. Plain text is the
clipboard interchange format. No photo renderer or production caption controls
are replaced in this stage.

## Multiple caption containers — MVP stage 2

PhotoWorkspace holds a CaptionLayout with a shared sizingUnit, an ordered collection
of containers and the active ID. Each container stores its own text, style and anchor. Margins and their link
mode are stored once in CaptionLayout, together with the sizing unit. Existing CaptionControls edit the active container; unit changes
convert every container together. Containers use SidebarSection, PickerList, Button
and IconButton; no separate naming field is required. Hovering a block on the canvas or its list row shows a thin dashed outline
on the canvas only. Selection persists independently without a permanent outline. Clicking canvas text and list rows shares selection.
The export adapter renders every container in list order and checks all their fonts
and missing fields. Screens/TestPhotos/MultipleCaptions demonstrates three blocks.

### Local and document settings

Selected container groups Caption, Typography and Position inside a subtly lighter
surface and a thin border (container-settings-base/container-settings-border tokens).
Document settings below a separator contain Sizing, Margins and Photo and remain
available for an empty layout. Global margins define the shared inset rectangle
for all anchored captions; changing selection never changes those values. Export
remains a separate section. CaptionControls supports local/global/all scopes so
stories and the application reuse the same controls.

Current sidebar order: Photo → Sizing → Margins → Containers → Selected container
(Caption, Typography, Position) → Export. Global controls precede the local group.
New containers prefer free corners counterclockwise, then edge centers, then the
center; duplicates retain their anchor. Container rows include the anchor icon.

### Auxiliary panel layout update

The production tag/font/color panel now participates in the workspace flex layout
between the preview and main sidebar, with a solid surface. Opening it resizes
the preview host and refits the full image instead of covering it. On narrow
screens panels stack and have a capped height with independent content scrolling.
FloatingPanel remains a reusable primitive for existing standalone stories.

## Custom positioning — MVP stage 3

Position offers Anchor/Custom. Custom coordinates are percentages of full photo
width and height and refer to the last selected anchor point of the text block.
Selecting a grid point returns to Anchor. Global margins do not move Custom
captions. Canvas dragging updates coordinates in source-image space, independent
of preview scale. A dashed outline remains visible during dragging. Duplicate
preserves Custom; adding a fresh container uses the next available anchor.
Screens/TestPhotos/CustomPosition demonstrates this mode.

## Production caption editor — MVP stage 4

CaptionEditor in features/caption/editor shares token extension, token view and
plain-text interchange with the isolated prototype. TokenContext supplies real
metadata and SVG assets; missing tokens show a warning without losing the key.
Inline SVG uses a monochrome CSS mask in the editor (no badge surface or visible
label), with the same accessible name and tooltip as the serialized token.
Browse icons opens the docked IconPickerPanel, built with existing controls.
Preview/export share inlineLayout, text measurements and tinted SVG rasterization.
Plain-text captions retain their original export rendering path. Caption selection
and dragging use the whole measured block, including inline icons. Examples:
Screens/TestPhotos/InlineIcons and the original CaptionEditorPrototype.

## Standalone SVG logo — MVP stage 5

Add logo uploads a validated SVG into the same ordered container collection.
LogoContent stores artwork, width in document units and original/single color mode;
height follows the source aspect ratio. Shared color/opacity live in caption style.
LogoControls reuses NumberField, SegmentedControl, Slider, Field, Button and the
color picker; CaptionControls hides Typography and provides the shared Position UI.
The list shows a thumbnail and filename with the same per-row actions and hover.
logoLayout computes the same geometry for canvas and JPG, including Custom.
Screens/TestPhotos/StandaloneLogo demonstrates a logo alongside a text caption.

## Quick and graphical caption colors

Typography offers QuickColors below the full color trigger: white, silver, gray,
dark gray and black, with selection rings and accessible button labels. Full
presets and custom HEX remain in the docked panel. A react-colorful HexColorPicker
adds saturation/brightness and hue controls with live caption updates; opacity
remains separate. GUI and HEX share the existing normalized RGB value model.

## Local settings organization

Selected container uses three accordions for both text and logos: Content,
Appearance and Layout. Text Content owns the editor and Tags/Icons actions;
logo Content owns the file and Replace SVG. Text Appearance orders Font,
Size/Weight, Color and Opacity; logo Appearance orders dimensions, color mode,
Color and Opacity. ColorControls shares quick swatches and the inline rainbow
picker, followed by a compact More colors trigger (palette and HEX stay docked).
Text Layout groups alignment and Line spacing before a subtle separator, then
Anchor/Custom positioning. Logo Layout contains positioning only. Global Photo,
Sizing, Margins, Containers and Export retain their current workspace order.

## Layout presets

Photo precedes Presets in the main sidebar. PresetControls reuses SidebarSection,
Field, Input, Select and Button. The saved name, explicit update/save-as actions,
unsaved indicator and import/export remain separate from photo export.
Errors are announced through an alert. Saved data is versioned and validated,
including SVG artwork. The preset does not include the photo or export quality.

Preset selection now opens a docked Choose a preset panel, using PickerList rows
with sibling IconButton actions. Built-in presets allow duplication; user presets
also allow rename and delete. Rename/create forms and file import/export live
in the panel footer. The sidebar retains the current name and explicit save action.

The sidebar uses a Saved preset dropdown for quick switching. Manage presets
opens the docked management panel. Save as new opens it with the naming form.
Choosing a preset keeps any currently open auxiliary panel open.

## Margin box model

MarginEditor uses a DevTools-inspired outer margin band around a central Caption
area. Four numeric values sit on their corresponding edges. On focus, the input
surface, unit and up/down steppers appear; they hide again when focus leaves. Relative units step by 0.1, pixels by 1; direct input keeps
fractional precision. Field labels remain accessible; hover/focus highlights
affected inner edges. None/Pairs/All
linking sits below the model. The diagram is schematic, not a scaled preview.
Canvas rulers and dragging margins remain outside this change.

## MVP verification update

The renderer preserves intentional blank source lines while dropping lines
containing only missing values. Empty metadata values count as missing.
The same resolution feeds canvas and JPG. Preset validation and SVG restoration
are exercised after browser reload and across landscape/portrait source images.
Current verification and its limits: [MVP_VERIFICATION.md](MVP_VERIFICATION.md).

## Compact text inspector

Text containers use always-visible InspectorSection groups: Content, Typography,
and Position. Small Montserrat headings and separators replace nested accordion
cards. The content editor grows from three lines to a capped scroll area; Tags
and Icons use small footer actions. Typography puts size, Bold (Regular/Bold),
and line spacing in one row, followed by alignment and a compact color disclosure.
The color disclosure contains quick colors and access to the full color panel;
Escape closes it and restores trigger focus. Opacity retains both slider and
numeric input in one row. Position retains Anchor/Custom semantics and source
geometry; anchor controls sit beside a short margins explanation. Logo controls
retain their existing appearance sections. Stories: CaptionControls /
CompactInspector and CustomInspector.

Position now keeps Anchor and Custom controls in two equal columns separated by
a vertical rule. The mode switch enables one column and disables/dims the other.
Inactive X/Y show the anchor's coordinates in photo percentages; the anchor grid
retains the last reference point in Custom mode. Mode changes preserve the
existing geometry rules.

The positioning mode is labeled **Manual** in the interface (Anchor / Manual);
the stored model continues to use `custom` for compatibility with presets.

The selected container inspector is a single persistent SidebarSection with
`surface="container"`, the standard display heading, icon and disclosure arrow.
Its inner Content, Typography and Position groups remain always visible while
expanded. Container rows use PickerList's `selectionTone="container"` to match
the inspector background with neutral text. Other pickers retain their selection
style. Hovering a block on the canvas or its list row shows its positioning mode
and anchor or X/Y plus “Drag to move” beside the canvas outline. This hint is
clamped within the photo, ignores pointer events and hides during dragging.
It belongs to the preview only and never enters the exported image.
The floating on-photo editing toolbar remains deferred for a separate decision.

## Photo margin rulers

The photo preview has horizontal and vertical rulers aligned with the displayed
image. Adaptive ticks show source-image values in the document unit. Markers
identify left/right and top/bottom margins. Hovering either ruler shows all four
full-image guides; hovering a marker or margin field highlights the linked edges
(None/Pairs/All) in the same accent as MarginEditor. Field focus takes priority
over hover. Guides update while numeric values change, ignore pointer events,
and are absent from exported JPGs and presets. Ruler handles use a 32 × 28 px (or transposed) target with L/R/T/B badges
and a live name/value tooltip on hover, focus and drag. Pointer capture keeps
movement active outside the ruler. Dragging respects linking, document units
and one-pixel inner-area limits; Escape or pointer cancellation restores the
original margins. Arrow keys move the handle by the input step (Shift ×10).
Active dragging takes precedence over field focus and hover.
Story: Screens/TestPhotos/MarginRulers.

Rulers rest at 60% opacity with only the triangular margin pointers visible.
Hovering either ruler or a margin input, focusing an input/handle, or dragging
restores full ruler opacity and reveals all letter badges. Invisible badges
retain the same handle hit areas.

MarginEditor places a compact RotateCcw + Reset action beside the unit label.
It restores all four default margins (3% of the short image edge, converted to
the current document unit), preserves the link mode and respects image limits.

### Isolated margin ruler stories

`Components/UI/MarginRulers` renders the production component over a neutral
light/dark surface, without PhotoWorkspace, image loading or export. Each example
has independent local state. Playground Controls set image width/height, preview
scale, document unit, initial margins, link mode, disabled state and optional
MarginEditor. Changing Controls resets that example's local session.

- Playground: adjustable isolated example.
- InteractionStates: resting, ruler hover, handle hover and keyboard focus next
  to one another, seeded through the component's real events.
- LinkModes and Units: side-by-side comparisons with equivalent pixel geometry
  for px / short-edge / long-edge units.
- Geometry: landscape, portrait, asymmetric margins and a small preview.
- Limits: zero margins, one-pixel inner height and nearby handles. These examples
  deliberately expose overlap and targeting problems for review.
- WithMarginInput: shared hover/focus, input values and Reset.
- Disabled: disabled ruler handles and MarginEditor.
- HoverAndFocus, DragAndCancel and InputAndReset: automated play assertions.
  The synthetic drag play substitutes pointer capture only; real browser pointer
  capture remains covered by `e2e/margin-rulers.spec.ts`.

The fixture scrolls when the chosen dimensions exceed the available width; it
does not silently change the requested scale. Screens/TestPhotos/MarginRulers
continues to cover integration with the actual editor.

### Individual ruler primitives

The editor composition now imports the same UI primitives documented separately:

- `Components/UI/Ruler`: one horizontal or vertical ruler, active/resting opacity,
  px scale, compact length, scale density and an interactive hover example.
  `length` and `pixelsPerUnit` are display-pixel values. This component renders
  ticks and its children; it owns no margins or document state.
- `Components/UI/MarginHandle`: one marker on an empty surface, triangle-only,
  letter, active, each side, hover/tooltip, keyboard focus, draggable, disabled
  and a long numeric value. `position` is the triangle tip's display coordinate.
  This is a controlled button/slider primitive forwarding pointer/keyboard props;
  document linking and geometry remain in MarginRulers. Its small standalone
  story controller supplies pointer capture and a simple value mapping.
- `Components/UI/MarginGuides`: overlay alone, neutral, one active edge, each
  paired axis, all edges, photo boundaries and nearly overlapping positions.
- `MarginTooltip` shares name/value rendering between the composition and the
  isolated handle stories.

These stories require no MarginPreviewProvider. The existing MarginRulers suite
continues to verify composition, real document units, input synchronization and
shared interaction priority; it is not replaced by the primitive stories.

### Compact margin editor

MarginEditor exposes `appearance="compact"`; the application uses this accepted
appearance. The previous default remains available in comparison stories. The compact
variant puts Individual / Paired / Linked above the four always-visible values;
these labels map to the existing none / pairs / all model without changing
linking semantics. Custom mode symbols are not supplied yet.

Its diagram grid is 134 px high, with the unit at the top-left and an icon + Reset label
at the bottom-right. The center retains the same highlighted edges, with no
photo icon or Caption area text. Header labels, helper paragraphs and native
title tooltips are omitted in this variant. Ruler name/value tooltips are removed from the application composition; letters,
triangles, accessible values and edge highlighting remain. NumberField forwards an
optional title to NumberInput so an empty title can suppress its default hint.

Components/UI/MarginEditor adds Compact, CompactPaired, CompactLinked,
CompactPixels, CompactLongEdge, CompactDisabled, CompactNarrow (220 px),
CompactFocused, CompactSidebar and CompactInteraction. The last example checks
linked edits and reset while retaining the selected link mode. The default
stories remain available for comparison.

The compact center rectangle has a fixed 3:2 aspect ratio (72 × 48 px), centered
in a 56 px row to leave space around focused inputs. Highlighted edges run the
full length of its border without corner gaps.

### Compact margins accepted in the application

CaptionControls now uses the reviewed compact MarginEditor: Individual / Paired /
Linked above the values, a 72 × 48 px center rectangle, full-length edge highlights,
unit in the top-left and icon + Reset in the bottom-right. The extra margins
helper paragraph is removed. MarginRulers no longer renders floating name/value
tooltips; handles retain letters, triangles, accessible values and shared edge
highlighting. Earlier review-only and tooltip descriptions above are historical.
The shared Tooltip proposal remains deferred in NICE_TO_HAVE.md.

### Sidebar order

The sidebar orders Photo → Presets → Sizing → Margins → Containers → Selected
container → Export. Global sizing and margin controls have no visible Document
heading or “Applies to all containers” description.

### Combined sizing and margins

Sizing & Margins shares one sidebar disclosure. The sizing unit selector precedes
the compact margin editor, without a pixel conversion hint or repeated unit label
in the diagram. Reset and individual input units remain available.
