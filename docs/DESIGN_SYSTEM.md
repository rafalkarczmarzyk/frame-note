# FrameNote design system

## Source of truth

The application and Storybook import the same components and `src/index.css`.
No parallel “demo” component library. `components/ui` contains domain-independent
controls, `components/layout` contains editor layout primitives, and `features`
composes them with photo/caption state. This is currently a reusable local library,
not a separately published npm package.

## Design tokens

The five active base colors live in `@theme` in `src/index.css`. They are also used by
photo captions; do not rename their `--color-*` variables as part of UI changes.
Five section accents use semantic `section-*` roles: turquoise for Photo, rose-brown
for Caption, violet for Typography, yellow for Sizing and Margins, crimson for Position,
and primary for Export. They color icon badges only. Collapsed accordions show
only their title and icon, without summaries. Primary uses emerald (`#14CC60`) through `--accent-color`, with charcoal-dark button text.
The drag-and-drop background stays slate (`#9CAFB7`) independently of primary. Caption options remain unchanged.
All 18 shared color recipes live in `:root` as private `--tone-*` values and the
panel glass material. Components consume usage roles exposed by `@theme inline`.

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
- PickerList: selectable rows, descriptions, preview content and selected labels.
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
without rounding the stored values. The default remains percent of the short edge.

Four margins define an inner image rectangle; all nine anchors place the measured
text block within that rectangle. Margin limits preserve at least one source pixel
of width/height. They do not guarantee that a very large text block fits; automatic
text wrapping/resizing is still outside the current scope.

Opacity uses a 0–100 slider and exact numeric field. Line height remains a font-size
multiplier (`×`), independent of document units. Export quality also remains a
percentage. The shared caption renderer applies the same sizing and inset geometry
in preview and export. Captions are not persisted; replacing a photo still resets
settings, including the sizing unit.

Stories: Components/UI/MarginEditor covers independent, paired, fully linked, asymmetric, pixel
and disabled variants. Components/UI/CaptionControls covers all units and both
photo orientations; Screens/EditorWorkspace uses these same controls.

## Main sidebar and auxiliary panel

EditorWorkspace owns layout and the shared sidebar-width variable. ToolSidebar
participates in layout and is the permanent home of editing controls.
SidebarSection presents separated, rounded setting groups with a quiet header and
right-hand disclosure chevron. Titles use Advercase; the optional `icon` prop
adds a decorative leading icon. Summaries and content retain Montserrat. It uses native details/summary; persistence
can be scoped or disabled (e.g. Storybook does not write application preferences).

FloatingPanel is non-modal and absolutely positioned by its parent. Opening it
must not change the canvas dimensions. It accepts title, description, toolbar,
children, footer, onClose, surface and className. Header/footer stay fixed, content
scrolls independently. Glass has a solid fallback without backdrop-filter.
Escape inside the panel closes it; it does not trap focus or block the editor.

PhotoWorkspace owns the active content ('tags', 'fonts', or closed). Switching
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
- Screens: start screen states and editor previews with landscape/portrait photos.

Stories remain alongside their components; screen stories live in `src/stories`.
Feature-specific components remain in `features`. New story titles should follow
this structure. Renaming categories changes Storybook URLs.

Autodocs
shows props and usage; controls allow changing args. Interactive stories exercise
select and slider behavior. The accessibility addon is available for inspecting
components; its presence is not a claim of a complete accessibility audit.

Screen previews use the same components as production. Editor stories display
the original test photos without caption rendering or background JPEG export. Controlled examples maintain local state. Native disabled
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

The Storybook production build passes. All 40 stories were loaded in Chromium:
each rendered visible content with no visible Storybook error or uncaught page
error. Select and Slider interaction stories reached their asserted states
(Bold selected and slider value 1). This is a rendering and interaction smoke
check, not a complete visual or accessibility audit.

Filled buttons accept `color="violet"`, `"turquoise"`, `"yellow"`, `"crimson"` or
`"rose-brown"`. Omit color to retain the current primary. Export JPG uses primary as the main application action. Color variants retain shared hover and disabled
behavior; outline buttons remain neutral.
