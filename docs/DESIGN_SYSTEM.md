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
The drag-and-drop overlay uses dark translucent glass and porcelain text,
independently of primary. Caption presets are independent of UI accents.
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
Blur is limited to floating menus/panels, the photo drop overlay and the start
screen footer, with opaque fallbacks and reduced transparency support. Motion
respects reduced-motion preferences. This is a web interpretation of Apple
surface principles, not native Liquid Glass rendering.

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

### Inline images — refactor stage 2

Production CaptionEditor now accepts SVG and PNG through Add image. Selecting
an image shows a lighter selected-element surface containing Relative to font /
Fixed height, Image height with unit and steppers, SVG color mode, Replace image
and Remove image. The green outline and remove action remain available while
editing the settings. Relative height steps by 0.25×; document dimensions step by
1 px or 0.1 in relative units. Existing Typography and Position controls remain
the production controls. PNG keeps original colors and alpha; SVG can use the
container color. The shared inline geometry expands rows for taller images.
Screens/TestPhotos/MixedImages uses the real FrameNote SVG and user PNG on a
photo. Containers offers only Add container. Every container uses the Container
inspector; images are added exclusively through Content → Add image.

### Layer terminology

The interface calls composition blocks Layers: Layers, Add layer, Layer,
Duplicate layer, Delete layer and Layer color. The Add layer action follows
the list. Internal container identifiers and preset field names remain unchanged.

### Layer stacking and visibility

Layers are listed front-to-back; the top row covers rows below it. Add layer
remains below the list and inserts a visible layer at the front. Storage retains
back-to-front order for the renderer. An eye control on the left of each row
shows/hides the layer; a separate grip supports pointer dragging with an insertion
line, cancellation and keyboard Arrow Up/Down, Home and End. Moving preserves
selection and geometry. Hidden layers remain selectable and editable, use muted
row text, and are excluded from preview, JPG and missing-data export warnings.
Presets preserve ordering and visibility; absent visibility means visible.
Story: Components/UI/PickerList/ReorderLayers.

### Panel keyboard focus — technical remediation

FloatingPanel owns non-modal focus entry and return for tags, fonts, colors,
icons and presets. It focuses a field or list item, with the dialog itself as
a fallback. Escape and the close action restore the opener when it exists,
otherwise the current caption editor or an available workspace button. Switching
panel content transfers focus without trapping it. ColorPickerPanel uses this
shared behavior. Components/Layout/FloatingPanel/KeyboardFocus demonstrates
entry and return. Screen reader behavior has not been manually verified.

### Layer list scrolling — technical remediation

PickerList detects its scrolling ancestor from overflow and dimensions. While
a grip has pointer capture, approaching the visible top or bottom edge starts
continuous scrolling even if the pointer stops moving. The insertion gap follows
the scrolling rows. Escape, pointer cancellation and lost capture cancel the
move; Arrow Up/Down, Home and End retain their existing behavior.
Components/UI/PickerList/LongReorderList demonstrates a constrained list.

### Application startup

The application opens into the empty editor. The canvas shows a neutral photo
icon, “Drop a photo here”, JPG/PNG guidance, Choose a photo and a local-processing
privacy note. A quiet footer at the bottom of the canvas contains the package
version, GitHub and Changelog links. Header and tools remain visible. There is
no photograph, splash modal, timer or dismiss action. Importing a photo replaces
this empty state with the production photo editor. The header logo is passive.

Screens/StartupRedesign renders the production App for EmptyEditor, DraggingPhoto
and CompactWindow. Review visual iterations directly in Storybook without full
tests/builds at the user's request. The photographic artwork concepts were
rejected for this startup state.

### Photo drop overlay

Dragging a file shows a full-window dark glass overlay over the current start
screen or editor. An 8 px backdrop blur and 40% dark tint retain context. A thin
2 px dashed porcelain outline sits inside the window edges. The centered
Advercase “Drop your photo.” prompt is followed by “Release to open · JPG or PNG”
and a small lock/privacy note. The overlay fades in over 180 ms with ease-out;
reduced motion disables the fade. The large standalone brand icon is removed.
Unsupported backdrop filtering and reduced transparency use a solid dark
fallback. Pointer events pass through; existing drop/cancel behavior is unchanged.
Story: Screens/StartupRedesign/DraggingPhoto.

### Layer list content previews

Layers uses the shared LayerList composition with a leftmost reorder grip, a
persistent visibility control, a passive content preview and a single actions
menu. Duplicate and Delete live in the menu, which supports arrow keys,
Home/End, Escape with focus return, Tab and outside dismissal. Deleting a layer
focuses the selected remaining row or Add layer when the list becomes empty.

Previews use the editor's template parser and show plain text, metadata badges
without braces, inline symbols and bounded SVG/PNG thumbnails. They use UI
styling independently of caption typography, flatten line breaks, and clamp to
two lines without splitting metadata names. A single graphic also shows its
asset name. Missing content keeps an explicit warning; empty content reads
Empty layer. Hidden rows retain selection and editing with muted content.
The secondary line shows the anchor or Manual, without a visible layer index.
A capped scrolling list keeps Add layer outside its scroll area.

Components/UI/LayerList includes ContentAndStates, Narrow, SingleLayer, Empty
and Actions. The examples cover matching templates at different positions,
long text/tags, missing metadata, SVG, PNG, inline icons and hidden layers.

The layer actions menu also offers Move up, Move down, Bring to front and Send
to back. These reuse the same front-to-back ordering as drag and keyboard moves,
preserve selection/geometry/visibility, and keep focus on the moved layer's menu
trigger. Unavailable directions are disabled at the top/bottom (all four for a
single layer), and arrow navigation skips them. Separators group ordering between
Duplicate and Delete. SingleLayer and OrderActions include interaction assertions.

Layer content previews sit inside a padded, rounded surface with a subtle border
and dedicated layer-preview background/border roles. This enclosure groups text,
badges and artwork while visibility, reordering, position and actions stay outside.
It remains a passive part of the layer selection button, with no extra tab stop.

Preview spacing uses 8 px enclosure padding and a wrapping flow with 4 px gaps
between items and rows. Items occupy 24 px rows; the preview caps at two complete
rows (52 px), with a separately reserved ellipsis when content overflows. Plain
text wraps at word boundaries, and metadata names truncate inside their badges.
This replaces inline margins and text line-clamping, which could crowd badges or
clip their edges at a line boundary.

The position summary now uses a fixed icon column to the right of the content
preview, inside the layer selection target and before its actions menu. Anchor
arrows/dot or the Manual move icon replace the secondary text line, reducing row
height. A native title and screen-reader text retain the full position label;
the indicator adds no tab stop and selecting it selects the layer.

### Layer controls layout proposal

LayerList and PickerList offer an opt-in controlsLayout="grid" variant for review.
It groups grip/visibility above position/actions in a 2 × 2 block to the left of
the preview, with 28 px control targets. The application retains the inline
layout pending review. Components/UI/LayerList includes GroupedControls,
GroupedControlsNarrow, GroupedOrderActions and ControlsComparison; both variants
share the same content preview, menu and reorder handlers.

### Compact layer list concept — Storybook only

CompactLayerListConcept proposes single-line text summaries with an always-visible
eye control, neutral selection, and a small thumbnail only for standalone artwork.
Metadata identifiers use text separated by middle dots, without braces or badges.
A fixed footer outside the list scroll shows the selected layer's position and
one actions menu. Whole-row native dragging and Arrow Up/Down, Home/End reorder
layers; operations preserve selection. The empty footer is disabled, and deleting
the last layer returns focus to Add layer.

CleanList, CleanListNarrow, CleanListEmpty, CleanListInteractions and
CleanListDeleteLast demonstrate this separate proposal. ControlsComparison now
compares the current application layout with this concept. The application has
not switched to the concept; native dragging here is a review implementation,
not a replacement for the production pointer-capture reorder behavior.

The compact concept now keeps an always-visible position icon at the right end
of every row (anchor arrow/dot or Manual move symbol). A native title and accessible
image label give its full meaning without selecting the layer. The footer retains
only selected-layer actions, labeled Layer actions, rather than repeating position.

### Accepted compact layer list — application

The application now uses LayerList appearance="compact", shared with the CleanList
stories. Each 40 px row contains an always-visible eye, a one-line template
summary (plain metadata names separated by middle dots), a position icon, and
its own action menu. Standalone graphics get a small thumbnail and filename.
Rows use neutral selection and muted hidden content; content has no nested card.
Layer actions and position remain available for every row without selecting it.

SidebarSection exposes contentPadding="none"; Layers opts out of the default
body padding, owns a small horizontal list inset, and pads Add layer separately.
The layer list has no height cap or scrolling area: the workspace sidebar handles
scrolling. Errors and the overlap warning keep their own padded spacing.

Reordering the compact list uses PickerList's existing pointer capture,
insertion indicators, auto-scroll, cancellation and Arrow Up/Down/Home/End.
A 4 px movement threshold distinguishes row dragging from selection. Dropping
preserves selection and suppresses the following native click. The separate grip
remains available for the historical preview variant and other reorder stories.
The earlier footer/native-drag concepts above are historical; CleanList is now
a review composition of the production component, not a second implementation.

### Switch and export metadata

Components/UI/Switch is the shared controlled boolean switch. Its label toggles
an associated button with role switch; Space/Enter, visible keyboard focus,
description association, disabled controls and disabled fieldsets are supported.
The glass thumb, inset track and emerald on state use central CSS material tokens.
Reduced motion disables transitions; forced colors retains visible state and thumb.
Stories cover On, Off, disabled on/off, description, long labels, a narrow parent,
keyboard/label interactions and disabled fieldsets. Application export uses the
same component for Remove all metadata and five metadata retention groups.

Remove all metadata defaults on. Disabling it reveals Author & copyright
(initially selected), Camera & exposure, Date & time, Location and Descriptions
& keywords. Choices remain in the workspace session across photo replacement,
independently of layout presets. The final prepared blob includes selected
supported fields as XMP, so download and displayed size remain synchronized.

Export separates Image quality, Metadata and Output file with visible semantic
borders and stronger headings. Retained metadata groups share an inset surface
with padded rows and separators; each description stays beside its own switch.

### Automatic text alignment

Typography starts its alignment control with a custom AlignAuto icon (text lines
and an A), followed by left, center and right. New layers default to Auto, which
follows the horizontal column of their retained anchor, including in Manual
position mode. Explicit alignment stays independent of position. Presets preserve
Auto or the explicit choice; preview and export share alignment resolution.

### Icon catalog

Design/Icons/Usage documents Lucide symbols and custom artwork together, grouped by
purpose with a preview, component name and usage description. Shared symbols
appear once with their multiple uses. Design/Icons/CustomArtwork lists all custom
icon and brand components: FrameNoteLogo, FrameNoteIcon, PhotoIcon, AlignAuto
and AutoAlign (the supplied filled artwork, with its original 10 × 8 viewBox).
Keep this catalog current when adding an icon or changing its meaning; individual
component stories remain available under Components.

### Numeric field steppers

Every NumberInput and DimensionInput always shows increase/decrease buttons.
NumberField supplies the field label for accessible button names. Buttons respect
the configured step, clamp at the field limits and remain disabled inside disabled
fieldsets. Compact margin fields retain their arrows even without focus.
Components/UI/NumberField/StepperLimits covers fractional steps and both limits.

### Typography rows and real italic

Font family has an external Type icon. Font size and line spacing share a row;
alignment and independent Bold/Italic toggles share the next. White, Black and
Custom color shortcuts precede a Colors button opening the floating color panel
directly. Opacity remains below. Montserrat loads real italic and bold italic;
Advercase has no italic asset and disables Italic. Switching to Advercase clears
italic. Presets preserve fontStyle; absent style means normal. Preview, inline
measurement, font readiness and export use the same effective font variant.

### Category filters and font library

CategoryFilter supplies shared single-select category chips, with All, configurable
labels, wrapping, arrow navigation and visible focus. Font, metadata and color
pickers combine categories with text search while retaining their own row content
and selection behavior. Search and category controls live in the fixed FloatingPanel
toolbar, outside the scrolling list, so scrollbar appearance cannot reflow chips.

FontPicker now offers the 25 curated Google Fonts families plus legacy Advercase.
Every preview uses the same “Leave your mark.” text, in the actual family after
loading. Only visible preview rows load, and caption preview/export await the chosen
variant. Unavailable Bold and Italic variants are disabled. Font identifiers remain
independent of asset paths and old presets retain their family names.
See [font delivery, license and coverage details](FONT_LIBRARY.md).

Stories: Components/UI/CategoryFilter, FontPicker, MetadataPicker and ColorPicker.

Font rows use PickerList density="dense": 8 px vertical padding, a 4 px preview
gap, a 20 px live sample, and no category/variant description. Category chips stay
in the fixed toolbar. Other picker lists retain their existing density.

### Numeric increment audit

Arrow buttons and Arrow Up/Down keys add the same increment to the current value,
without snapping manually entered or converted values to a grid based on `min`.
Both paths clamp at field limits. Text entry retains fractional precision.
The generic NumberInput/NumberField default is 1; domain fields set explicit steps.

| Field                                          | Increment                                           |
| ---------------------------------------------- | --------------------------------------------------- |
| Font size (all document units, also prototype) | 0.25                                                |
| Line spacing                                   | 0.1×                                                |
| Layer/logo opacity                             | 1 percentage point                                  |
| Manual X/Y                                     | 0.1 percentage point of the image                   |
| Margins                                        | 1 px or 0.1 in relative document units              |
| Logo width/height                              | 1 px or 0.1 in relative document units              |
| Inline image height                            | 0.25× font, 1 px, or 0.1 in relative document units |
| Prototype image height                         | 0.25× font or 1 px                                  |
| JPEG quality (slider)                          | 1 percentage point                                  |

NumberField/FontSizeStep and LineSpacingStep exercise the requested increments,
keyboard equivalence and preserving a manually entered value off the step grid.

### Compact application header

AppHeader uses a 56 px single-row toolbar with a smaller brand mark. The loaded
editor portals PresetControls into its left workspace slot: a bounded, truncated
preset selector, Modified status and a split Save preset button. Its primary
segment saves the current user preset or opens naming for a new copy; the attached
ChevronDown opens Save as new, Duplicate, Rename and Manage presets. Duplicate
requires a selected preset, and Rename requires a user preset. On narrow screens
the save segment retains its icon while its text hides. Photo import and primary
Export JPG stay on the right. Presets no longer occupies a sidebar section.
Management, naming, import/export, recovery and storage errors remain in the
existing docked panel. AppHeader stories expose the real preset controls,
including a long-name Modified example. Visual prototyping is currently verified
in preview; full checks wait for the user's acceptance of the design.

### Split button

Components/UI/SplitButton combines the shared Button with ActionMenu. It inherits
Button's primary/outline variants, default/small sizes and six palette choices.
The primary segment forwards native button props, including form/type and ref;
menuLabel names the independent arrow trigger. Menu actions never replace the
primary action. Items support optional icons, disabled actions and separators.
Global disabled and loading disable both segments; primaryDisabled/menuDisabled
control them independently, and an empty menu disables its trigger. Disabled
fieldsets retain native behavior. Loading announces aria-busy and respects reduced
motion. fullWidth expands the main segment; className belongs to the outer group.

Stories cover controls, both variants and sizes, palette, individual/global/form
disabled states, loading, icon-only content, full width, long labels, narrow
containers, mixed/empty menus, viewport-edge placement, interactive action feedback
and native form submission. PresetControls now uses this shared component.

The empty editor and loaded photo now share PresetToolbar: Default is selected
from startup and the split save action remains visible. Before a photo is opened,
preset controls and export are disabled. Export uses the same responsive icon/text
presentation in both states. Production layout initializes directly from the
built-in Default preset; custom initial layouts in review stories retain an
unselected preset rather than claiming they match Default.

### Photo import transition

Import shows PhotoLoadingIndicator above the existing workspace without adding
a layout row. The editor module preloads during idle time; photo replacement uses
a React transition and Suspense retains the empty editor as a spatially stable
fallback instead of replacing it with text. Header preset/export placeholders
remain mounted and hide when their live portal controls arrive. Loading continues
until the preview has dimensions, fonts and image assets and has painted; export
encoding is independent. Preview opacity transitions over 200 ms with a reduced
motion alternative. StartupRedesign/LoadingPreview demonstrates the indicator.

The photo loading indicator is now a prominent centered card with a 36 px spinner.
The canvas loader disappears once preview dimensions, fonts and image assets
are ready and painted, independently of JPG encoding. While the JPG is being
prepared, the disabled export button shows its own spinner and Preparing JPG…;
there is no minimum duration for the canvas loader. For
photos larger than 2048 px on the longer edge, loadPhoto asks createImageBitmap
for a resized preview; unsupported/failed resizing falls back to the original.
The canvas keeps original-coordinate geometry and export always uses the full
HTML image. Preview bitmaps close when their photo is disposed.

Components/UI/PhotoLoadingIndicator isolates the production loader for visual
refinement, with editable message text, both loading messages, a photograph
background, a narrow surface, long text and a visibility toggle. Changes to the
component immediately affect the application and StartupRedesign/LoadingPreview.

PhotoLoadingIndicator is mounted inside the photo canvas surface in both empty
and loaded workspaces. Its center follows the canvas rather than the whole app,
including sidebar resizing and the stacked narrow-window layout. The full-screen
LoadingPreview story targets the same canvas surface.

### Built-in preset library

Nine layouts are available: Default and Default dark (unchanged), Signature
(small author at bottom right), Compact EXIF (one exposure line), Camera & Lens
(author left, equipment and exposure right), Focus Stack (the former Macro name
with the same ID/layout), EXIF Icons (one row with bundled shutter/aperture/ISO
symbols), Astrophotography (author left, camera/lens/focal length/readable exposure
right) and Long Exposure (author left, readable exposure right). Fonts and margins
use relative document units and anchor alignment. EXIF Icons packages only its
three referenced SVGs. No photo or export preferences belong to a preset.

Screens/TestPhotos/BuiltinPresetLibrary compares all layouts on one fixture.
Individual Preset stories show portrait, bright, wildlife, stack and night photos.
LongExposureTenMinutes explicitly overrides ExposureTime to 600 seconds in memory
for a 10 min example; the original fixture is unchanged. The new shutterDuration
helper uses the same timer icon and source selection as shutter.

SelectOption supports separatorBefore, rendered as a Radix Separator before an
option (except the first). The preset selector uses this only at the boundary
between built-in and user presets; without user presets no separator appears.
Components/UI/Select/PresetGroups demonstrates the shared styling.

Photo file drops are accepted only within data-photo-canvas, in both empty and
loaded workspaces. Header/sidebar file drags use dropEffect none and do not import;
the global file guard still prevents the browser from navigating to dropped files.
PhotoDropOverlay is absolute inside the canvas, follows its size and leaves the
header/sidebar clear. Leaving the canvas, dropping elsewhere, Escape, dragend and
window blur dismiss it. StartupRedesign/DraggingPhoto uses the canvas overlay.

### Images dropped into Content

The Content InspectorSection is an explicit data-content-image-drop target.
CaptionEditor uses its entire enclosing section (including heading and actions),
or its own root in standalone examples. A canvas drop replaces the photo; a
Content drop inserts one SVG/PNG into the active layer at the retained editor
selection. Header and the rest of the sidebar still reject file drops.

ContentImageDropOverlay uses the shared drop glass/dashed treatment with compact
copy and covers only Content. Native capture handlers prevent ProseMirror from
moving the caret or performing its own file drop. The file picker and drop call
the same importer: validation, decoding, deduplication, the 100-image retention
limit and cancellation after document edits/layer removal remain shared. File
replacement through the existing picker retains its previous behavior. A busy
import ignores further drops; multiple files give an inline error. Leaving the
section, Escape, window blur and dragend dismiss the overlay.

Components/UI/ContentImageDrop provides Interactive, Overlay and Narrow examples.
The focused content-image-drop flow checks SVG/PNG insertion and rejects header
drops without replacing the photograph.

### Compact photo rulers

The visible ruler band is 18 px (shared rulerThickness), with unchanged 9 px
numerals, 4 px major ticks and 2 px minor ticks. Vertical numerals rotate along
the ruler so multi-digit values fit the narrower strip. The unit corner uses
the same dimensions. MarginHandle keeps its 32 × 28 px hit target (transposed
for vertical rulers); interactive letter labels sit just outside the band on
the photo side without intercepting the pointer. The photo fit reserves 28 px
per side, down from 40 px. MarginRulers and MarginHandle stories use the compact
geometry; photo/export coordinates and margin values remain unchanged.

The docked Manage presets panel uses the shared Input and CategoryFilter in
FloatingPanel.toolbar, above the independently scrolling list. Search matches
preset names case-insensitively and combines with All / Built-in / Your presets.
Empty groups disappear, with one clear empty-result message. Creating/importing,
duplicating or renaming reveals the resulting entry by resetting search/filter.
Search receives focus on browsing; naming actions retain focus in Preset name.
AppHeader/PresetBrowser opens the production panel for visual review.

### Header and layout editing before photo import

The header is 48 px high with 32 px controls and a 22 px brand mark. Photo import
sits next to the brand on the left; a flexible spacer pushes preset selection
and split save to the right, followed by a divider and Export JPG. The same
slots and responsive icon/text actions are used throughout startup and editing.

PhotoWorkspace now mounts before the first import with a nullable photo. Layout,
icons, active layer, preset selection/management and export preferences belong
to the workspace and survive the first photo and later replacements without
remounting its editor/sidebar. The empty canvas remains visible while all layout
controls, image uploads and preset create/update/duplicate/rename/delete/import/
export operate. Only image output requires a photo; no placeholder image is ever
encoded. Metadata values and canvas positioning resolve on import.

Before import, controls use a square reference for geometry-only calculations;
conversions between document units stay disabled until actual image dimensions
exist. Numerical values in the current unit and percent manual positions remain
editable. Missing-metadata warnings are deferred until a photo is present.
StartupRedesign/PresetsBeforePhoto opens the production preset browser in this
state. A focused flow verifies save before import, the 48 px header and retention
of both layout and the exact editor DOM node across first import/replacement.

### About FrameNote splash

The header brand is now an About FrameNote button. It opens an informational
version of the former Leave your mark photographic splash with the original
local bird asset, app version, local-processing note, GitHub and Changelog links.
It opens only on request and preserves the mounted editor and current layout.
The native modal dialog contains keyboard focus and closes with its close button,
Back to editor, Escape or a backdrop click, returning focus to the brand.
Its backdrop uses existing drop surface tokens and a reduced-transparency fallback.
Screens/AboutFrameNote includes open and closed previews.

Photo, Sizing & Margins and Export default to collapsed when no stored preference
exists. Native accordion toggles and the sidebar width persist in localStorage
for the same browser and origin; stored open/closed choices take precedence over
these defaults. The workspace stays mounted across first import and replacement.

Accordion state and sidebar width are now session-only UI state. They are neither
read from nor written to localStorage; old stored preferences are ignored. On
reload Photo, Sizing & Margins and Export start collapsed, other sections retain
their declared defaults, and the sidebar starts at 384 px. Resizing and toggling
remain available and survive photo imports in the mounted workspace. Preset
storage remains independent. The obsolete section-storage helpers were removed.

The tools sidebar resize range is 384–560 px, with 384 px as its default.
Pointer and keyboard changes share this lower bound so resizing cannot compress
the current controls below their supported desktop width. Narrow-window stacked
layouts continue to use the available window width.

### Caption color palette and custom picker

ColorPickerPanel contains sixteen caption tones in one compact 4 × 4 swatch grid,
without group headings, search or filters. The entire grid shares one glass
segmented-control surface; selection uses its raised segment treatment, without
a checkmark or persistent focus outline.
The selected name and HEX remain visible in its footer. Caption dark tones
have their own tokens independent of interface surfaces; legacy tokens still
resolve in existing layouts.

ColorControls provides White, Ivory, Dark gray, Blue charcoal (the application
background) and Black quick swatches, a rainbow Custom swatch, and a matching round palette-icon
button.
No color names occupy space in the sidebar. It shares these controls
between text and single-color graphics. Custom opens a native floating popover
above the sidebar with react-colorful and a HEX field. Valid RGB/RRGGBB values
apply live; incomplete or invalid input preserves the last valid color. Escape
and outside clicks dismiss the popover. Opacity stays a separate control.
Components/UI/ColorPicker documents palette selection and custom editing.

### Docked auxiliary sidebar surfaces

Solid FloatingPanel instances (colors, fonts, metadata, icons and presets) are
opaque workspace columns, never overlays on the photo. They have no outer border
or header/footer rules. The header is an inset rounded surface using the same
background as the main sidebar sections; footer content has its own inset rounded
surface. Spacing separates the independently scrolling content from these fixed
areas. Floating glass panels retain their existing overlay treatment.

The compact sidebar color row uses the shared glass segmented treatment, without
a green selection ring. Selection tracks the interaction source per layer during
the session: quick swatch, palette, or custom HEX/picker. A HEX matching a ready
color still selects Custom; picking even White from the palette selects Palette.
This UI source is independent of the saved color and resets when applying a preset.

### Shared Tooltip

Tooltip wraps one focusable React element without introducing a layout wrapper
(via Slot). Supply noninteractive `content` and keep an accessible label on an
icon-only trigger. Avoid native `title` on controls using Tooltip. It composes
existing descriptions and refs rather than replacing them. Hover opens after
450 ms (configurable `delay`); keyboard focus opens immediately. Hovering the
bubble keeps it visible; Escape, blur and activation dismiss it without moving
focus. Touch activation does not leave help open.

Manual native popovers keep tooltips above floating pickers and outside clipped
scroll containers. Placement follows scroll/resize, prefers above, flips below
and clamps to the viewport. The shared `glass-popover` material supplies the same tint and blur for Tooltip
and the custom color picker. Tooltips reduce the tint opacity to 22% (picker: 42%)
for a comparable glass appearance on smaller surfaces. Both have an opaque
reduced-transparency and unsupported-browser fallback. No interactive controls
belong inside a tooltip. For disabled controls, provide a separate focusable help
trigger if an explanation is needed.

Components/UI/Tooltip includes standard, long text, existing description and
viewport-edge examples. Quick color swatches show names; custom/palette actions
show their purpose, and palette swatches show name plus HEX.

### Photo actions

The header uses PhotoActions with the shared outline SplitButton at size sm.
The main action always reads Open photo; the arrow opens Photo actions with
Close photo disabled when no photo is loaded. Both segments are disabled during
import. Closing returns to the empty canvas, releases photo resources and clears
photo errors while retaining the mounted layout editor, presets and session UI.
Export requires a photo. Components/UI/PhotoActions covers empty, loaded,
importing and interactive states; AppHeader uses the same production control.
