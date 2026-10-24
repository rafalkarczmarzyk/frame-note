# FrameNote design system

## Source of truth

The application and Storybook import the same components and `src/index.css`.
No parallel “demo” component library. `components/ui` contains domain-independent
controls, `components/layout` contains editor layout primitives, and `features`
composes them with photo/caption state. This is currently a reusable local library,
not a separately published npm package.

## Design tokens

Palette HEX values are declared only in `@theme`: charcoal, slate, porcelain,
tropical-mint. Components use semantic roles such as primary, secondary,
foreground and background. Glass uses opacity and blur derived from these roles,
not new colors. Fonts are local: Montserrat for controls, Advercase for display.
SVG logos and Lucide icons inherit currentColor.

## UI components

- Button, IconButton: primary/outline actions, explicit icon labels, focus states.
- Input, Textarea: shared styling with native props, refs, disabled states.
- Field: generates a label target and optional description/error relationship.
- NumberField: controlled numeric values with a local draft for fractional edits.
- Select: custom Radix popper with keyboard navigation and disabled options.
- Slider: Radix single-value slider, pointer and keyboard support.
- SegmentedControl: single selection, optional icons, keyboard navigation.
- AnchorPicker: reusable 3 × 3 grid, independent of the positioning calculation.
- PickerList: selectable rows, descriptions, preview content and selected labels.
- InlineNotice: informative, warning and error messages, using existing palette.

All controls accept a disabled state directly or through native field semantics.
Prefer explicit disabled props for Radix controls. Fields must have an associated
label or aria-label. Do not replace controls with feature-specific HTML copies.

## Main sidebar and auxiliary panel

EditorWorkspace owns layout and the shared sidebar-width variable. ToolSidebar
participates in layout and is the permanent home of editing controls.
SidebarSection provides independent native details/summary sections; persistence
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
- Components/UI: reusable controls from `components/ui`.
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
