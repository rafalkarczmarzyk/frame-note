import {
  containerCaption,
  type CaptionLayout,
} from '../../../../core/src/caption-layout';
import { resolveCaptionColor } from '../../../../core/src/caption-colors';
import type { MetadataField } from '../../../../core/src/metadata';
import { resolveCaptionContent } from './inline-content';
import type { SvgIcon } from './svg-icons';

/** One resolution path for the active preview and every photo in a batch. */
export function resolveLayout(
  layout: CaptionLayout,
  fields: readonly MetadataField[],
  icons: readonly SvgIcon[],
) {
  return layout.containers
    .filter((container) => container.visible !== false)
    .map((container) => {
      const caption = containerCaption(layout, container);
      const resolved = resolveCaptionContent(
        caption.template,
        fields,
        icons,
        caption.images,
      );
      const color = resolveCaptionColor(caption.style.color, (name) =>
        getComputedStyle(document.documentElement).getPropertyValue(
          `--color-${name}`,
        ),
      );
      return { id: container.id, caption, ...resolved, color };
    });
}
