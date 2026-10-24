---
name: react-svg-icons
description: Add or update SVG icons and brand assets as React components in FrameNote, including sizing, accessibility and Storybook previews. Use for supplied SVG artwork and custom icons; prefer Lucide for standard UI symbols.
---

# React SVG icons — FrameNote

## Components

- Check installed `lucide-react` exports for standard UI symbols before adding custom SVGs. Import only the icons used.
- Keep brand assets in `src/components/brand`, alongside `FrameNoteLogo` and `FrameNoteIcon`. New custom UI icons belong in `src/components/icons` when needed.
- Use PascalCase component names and kebab-case filenames. Follow existing names without adding an SVG suffix or renaming unrelated assets.
- Keep each custom asset as a standalone component accepting `SVGProps<SVGSVGElement>`; a shared SVG wrapper is unnecessary for the current assets.

## SVG conversion

- Preserve path geometry, transparency and intentional multicolor artwork. Convert SVG attributes to React syntax.
- Preserve a meaningful `viewBox`. If an icon retains the wide artboard of a full logotype, inspect the geometry and trim empty space without clipping strokes or changing the drawing. Use a square artboard only when it fits the mark.
- Set sensible default SVG `width` and `height` attributes so the asset stays bounded before utility CSS loads. Preserve proportions and allow caller overrides through SVG props or Tailwind classes. Avoid inline styles that prevent overrides.
- Use `currentColor` for monochrome fills and strokes. Preserve `fill="none"` and intentional multicolor fills. Call sites use semantic colors such as `text-content-primary` and `text-accent-color`.
- Forward SVG props to the root. If default classes are needed, destructure `className` and merge it with `cn()` from `@/lib/utils`; accept arbitrary caller classes.
- Hide decorative SVGs with `aria-hidden="true"` and `focusable="false"`. Informative assets need an accessible name and `role="img"`. Label icon-only buttons and links on the control and hide their nested decorative SVG.

## Storybook and verification

- Add stories beside the component: `Components/Brand/<Name>` for brand assets, `Components/UI/<Name>` for custom UI icons.
- Default and Accent stories use identical dimensions and differ only in color. Use a separately named story for size variants when useful or requested.
- Do not rely solely on a newly introduced Tailwind utility to constrain the story preview; retain explicit default SVG dimensions.
- Run `pnpm check` and `pnpm build-storybook`. Open changed stories and check actual rendered dimensions, proportions, clipping and colors. Confirm equal dimensions for Default and Accent.
- If development CSS appears stale, inspect generated styles or restart the local Storybook server before declaring the preview correct. A build alone does not verify visual output.
- Apply assets to application call sites only within the requested scope. Adding a brand icon does not imply replacing the logotype, changing the favicon or committing changes.
