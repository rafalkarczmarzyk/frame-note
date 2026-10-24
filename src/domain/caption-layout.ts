import { createCaption, type Caption, type ImageDimensions } from './document';
import { convertSizing, type SizingUnit } from './sizing';

export interface CaptionContainer extends Omit<
  Caption,
  'sizingUnit' | 'position'
> {
  id: string;
  position: Pick<Caption['position'], 'anchor' | 'custom'>;
}

export interface CaptionLayout {
  sizingUnit: SizingUnit;
  margins: Caption['position']['margins'];
  marginLinkMode: Caption['position']['marginLinkMode'];
  containers: CaptionContainer[];
  activeId: string | null;
}

export function createCaptionLayout(
  caption = createCaption(),
  id = 'caption-1',
): CaptionLayout {
  const { sizingUnit, ...content } = structuredClone(caption);
  return {
    sizingUnit,
    margins: content.position.margins,
    marginLinkMode: content.position.marginLinkMode,
    containers: [
      {
        ...content,
        position: {
          anchor: content.position.anchor,
          ...(content.position.custom
            ? { custom: { ...content.position.custom } }
            : {}),
        },
        id,
      },
    ],
    activeId: id,
  };
}

export function containerCaption(
  layout: CaptionLayout,
  container: CaptionContainer,
): Caption {
  return {
    ...container,
    sizingUnit: layout.sizingUnit,
    position: {
      ...container.position,
      margins: layout.margins,
      marginLinkMode: layout.marginLinkMode,
    },
  };
}

export function updateCaption(
  layout: CaptionLayout,
  id: string,
  caption: Caption,
  dimensions: ImageDimensions,
): CaptionLayout {
  const containers = layout.containers.map((container) => {
    const converted =
      container.id === id
        ? caption
        : convertSizing(
            containerCaption(layout, container),
            caption.sizingUnit,
            dimensions,
          );
    const { sizingUnit: _unit, ...content } = converted;
    void _unit;
    return {
      ...content,
      position: {
        anchor: content.position.anchor,
        ...(content.position.custom
          ? { custom: { ...content.position.custom } }
          : {}),
      },
      id: container.id,
    };
  });
  return {
    ...layout,
    sizingUnit: caption.sizingUnit,
    margins: { ...caption.position.margins },
    marginLinkMode: caption.position.marginLinkMode,
    containers,
  };
}

/** Prefer corners, then edge centers, keeping counterclockwise direction. */
const anchorOrder: Caption['position']['anchor'][] = [
  'bottom-left',
  'bottom-center',
  'bottom-right',
  'center-right',
  'top-right',
  'top-center',
  'top-left',
  'center-left',
  'center',
];

function nextFreeAnchor(
  layout: CaptionLayout,
  current: Caption['position']['anchor'],
) {
  const occupied = new Set(
    layout.containers.map((container) => container.position.anchor),
  );
  const start = anchorOrder.indexOf(current);
  const ordered = Array.from(
    { length: anchorOrder.length },
    (_, index) => anchorOrder[(start + index + 1) % anchorOrder.length]!,
  );
  const groups = [
    ['bottom-left', 'bottom-right', 'top-right', 'top-left'],
    ['bottom-center', 'center-right', 'top-center', 'center-left'],
    ['center'],
  ];
  for (const group of groups) {
    const candidate = ordered.find(
      (anchor) => group.includes(anchor) && !occupied.has(anchor),
    );
    if (candidate) return candidate;
  }
  return current;
}

export function addCaption(
  layout: CaptionLayout,
  id: string,
  duplicate = false,
  dimensions?: ImageDimensions,
): CaptionLayout {
  const source = layout.containers.find(
    (container) => container.id === layout.activeId,
  );
  if (!source && !dimensions)
    throw new Error(
      'Photo dimensions are required when adding to an empty layout.',
    );
  const base = source
    ? containerCaption(layout, source)
    : convertSizing(createCaption(), layout.sizingUnit, dimensions!);
  const { sizingUnit: _unit, ...content } = structuredClone(base);
  void _unit;
  return {
    ...layout,
    activeId: id,
    containers: [
      ...layout.containers,
      {
        ...content,
        position: {
          ...(duplicate && content.position.custom
            ? { custom: { ...content.position.custom } }
            : {}),
          anchor:
            duplicate || !source
              ? content.position.anchor
              : nextFreeAnchor(layout, content.position.anchor),
        },
        template: duplicate ? content.template : 'Sample text',
        id,
      },
    ],
  };
}

export function removeCaption(
  layout: CaptionLayout,
  id: string,
): CaptionLayout {
  const index = layout.containers.findIndex((container) => container.id === id);
  const containers = layout.containers.filter(
    (container) => container.id !== id,
  );
  return {
    ...layout,
    containers,
    activeId:
      layout.activeId === id
        ? (containers[Math.min(index, containers.length - 1)]?.id ?? null)
        : layout.activeId,
  };
}
