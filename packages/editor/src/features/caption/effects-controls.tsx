import { OpacityIcon } from '@/components/icons/opacity-icon';
import { useRef, useState } from 'react';
import {
  Plus,
  Blend,
  Trash2,
  ArrowRightLeft,
  ArrowUpDown,
  Expand,
  Sun,
  Moon,
  TypeOutline,
} from 'lucide-react';
import type { Caption, ImageDimensions } from '../../../../core/src/document';
import {
  createLayerEffect,
  type LayerEffect,
  type LayerEffectType,
} from '../../../../core/src/layer-effects';
import { pixelsPerUnit, sizingLabels } from '../../../../core/src/sizing';
import {
  captionColorLabel,
  type ColorSelectionSource,
} from '../../../../core/src/caption-colors';
import { InspectorSection } from '@/components/layout/inspector-section';
import { PickerList } from '@/components/ui/picker-list';
import { ColorSwatch } from '@/components/ui/color-swatch';
import { OrderedListActions } from '@/components/ui/ordered-list-actions';
import { ActionMenu } from '@/components/ui/action-menu';
import { RangeField } from '@/components/ui/range-field';
import { InlineInputGroup } from '@/components/ui/inline-input-group';
import { NumberField } from '@/components/ui/number-field';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { focusPickerAfterDelete } from '@/lib/picker-focus';
import { ColorControls } from './color-controls';

const effectLabels = {
  outline: 'Outline',
  shadow: 'Shadow',
  glow: 'Glow',
  blur: 'Blur',
};
const effectIcons = {
  outline: TypeOutline,
  shadow: Moon,
  glow: Sun,
  blur: OpacityIcon,
};
export function EffectsControls({
  caption,
  dimensions,
  onChange,
  disabled,
  onBrowseColors,
  colorSources,
  onColorSourceChange,
  onSelectionChange,
}: {
  caption: Caption;
  dimensions: ImageDimensions;
  onChange: (caption: Caption) => void;
  disabled: boolean;
  onBrowseColors: (id: string) => void;
  colorSources: Record<string, { value: string; source: ColorSelectionSource }>;
  onColorSourceChange: (
    id: string,
    source: ColorSelectionSource,
    value: string,
  ) => void;
  onSelectionChange: () => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const effects = caption.effects ?? [];
  const [selected, setSelected] = useState<string | null>(null);
  const choose = (id: string | null) => {
    setSelected(id);
    onSelectionChange();
  };
  const active = effects.find((effect) => effect.id === selected);
  const update = (next: LayerEffect[]) =>
    onChange({ ...caption, effects: next });
  const patch = (change: Partial<LayerEffect>) =>
    update(
      effects.map((effect) =>
        effect.id === selected ? { ...effect, ...change } : effect,
      ),
    );
  const move = (id: string, index: number) => {
    const item = effects.find((effect) => effect.id === id);
    if (!item || disabled) return;
    const next = effects.filter((effect) => effect.id !== id);
    next.splice(index, 0, item);
    update(next);
  };
  const removeEffect = (id: string) => {
    const index = effects.findIndex((effect) => effect.id === id);
    const next = effects.filter((effect) => effect.id !== id);
    update(next);
    if (selected === id)
      choose(next[Math.min(index, next.length - 1)]?.id ?? null);
  };
  const factor = pixelsPerUnit(caption.sizingUnit, dimensions);
  const amount = (effect: LayerEffect) => {
    const value = effect.type === 'outline' ? effect.spread : effect.blur;
    return `${value.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${sizingLabels[caption.sizingUnit]}`;
  };
  const summary = (effect: LayerEffect) => {
    return [
      effectLabels[effect.type],
      ...(effect.type === 'blur' ? [] : [captionColorLabel(effect.color)]),
      amount(effect),
    ].join(' · ');
  };
  const limit =
    Math.max(100, Math.max(dimensions.width, dimensions.height)) / factor;
  return (
    <div ref={root}>
      <InspectorSection title="Effects">
        <div className="space-y-3">
          <div className="layer-selector layer-selector-full">
            <PickerList
              itemNoun="effect"
              appearance="compact"
              reorderHandle="row"
              selectionTone="container"
              selectedLabel=""
              emptyText="Add an effect to begin."
              onChoose={choose}
              onMove={disabled ? undefined : move}
              items={effects.map((effect, index) => ({
                id: effect.id,
                label: effectLabels[effect.type],
                content: (
                  <span className="inline-flex items-center gap-2">
                    <span>{effectLabels[effect.type]}</span>
                    {effect.type !== 'blur' && (
                      <ColorSwatch value={effect.color} className="size-3" />
                    )}
                    <span>{amount(effect)}</span>
                  </span>
                ),
                leading: (() => {
                  const Icon = effectIcons[effect.type];
                  return (
                    <Icon className="mr-1 size-4 shrink-0" aria-hidden="true" />
                  );
                })(),
                tooltip: summary(effect),
                selected: effect.id === selected,
                muted: !effect.enabled,
                actions: (
                  <OrderedListActions
                    noun="Effect"
                    root={root}
                    index={index}
                    count={effects.length}
                    duplicateDisabled={effects.length >= 100}
                    visible={effect.enabled}
                    disabled={disabled}
                    onMove={(target) => move(effect.id, target)}
                    onToggleVisibility={() =>
                      update(
                        effects.map((item) =>
                          item.id === effect.id
                            ? { ...item, enabled: !item.enabled }
                            : item,
                        ),
                      )
                    }
                    onDuplicate={() => {
                      const copy = {
                        ...structuredClone(effect),
                        id: crypto.randomUUID(),
                      };
                      update([
                        ...effects.slice(0, index),
                        copy,
                        ...effects.slice(index),
                      ]);
                      choose(copy.id);
                    }}
                    onDelete={() => removeEffect(effect.id)}
                  />
                ),
              }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <ActionMenu
              label="Add effect"
              triggerClassName="px-2 whitespace-nowrap"
              tooltip="Effects apply to text, icons, graphics and separators. The background stays separate."
              disabled={disabled || effects.length >= 100}
              triggerIcon={
                <>
                  <Plus aria-hidden="true" />
                  Add effect
                </>
              }
              triggerAppearance={{ variant: 'outline', size: 'sm' }}
              items={(['outline', 'shadow', 'glow', 'blur'] as const).map(
                (type: LayerEffectType) => ({
                  label: effectLabels[type],
                  onSelect: () => {
                    const effect = createLayerEffect(type, caption, dimensions);
                    update([effect, ...effects]);
                    choose(effect.id);
                  },
                }),
              )}
            />
            <Tooltip content="Remove selected effect">
              <Button
                variant="outline"
                size="sm"
                className="px-2 whitespace-nowrap"
                disabled={disabled || !active}
                onClick={() => {
                  if (active) {
                    removeEffect(active.id);
                    focusPickerAfterDelete(root.current);
                  }
                }}
              >
                <Trash2 aria-hidden="true" />
                Remove effect
              </Button>
            </Tooltip>
          </div>
          {active && (
            <InspectorSection
              surface="selected"
              title={`${effectLabels[active.type]} settings`}
            >
              <div className="space-y-2">
                {active.type !== 'blur' && (
                  <ColorControls
                    key={active.id}
                    value={active.color}
                    onChange={(color) => patch({ color })}
                    disabled={disabled}
                    onBrowse={() => onBrowseColors(active.id)}
                    selectionSource={
                      colorSources[active.id]?.value === active.color
                        ? colorSources[active.id]?.source
                        : undefined
                    }
                    onSelectionSourceChange={(source, value) =>
                      onColorSourceChange(active.id, source, value)
                    }
                  />
                )}
                <RangeField
                  label="Opacity"
                  icon={<Blend aria-hidden="true" className="size-4" />}
                  tooltip="Opacity of this effect"
                  value={Math.round(active.opacity * 100)}
                  unit="%"
                  disabled={disabled}
                  onValueChange={(value) => patch({ opacity: value / 100 })}
                />
                <div
                  className={
                    active.type === 'shadow' || active.type === 'glow'
                      ? 'grid grid-cols-2 gap-2'
                      : 'space-y-2'
                  }
                >
                  {(active.type === 'blur'
                    ? (['blur'] as const)
                    : active.type === 'outline'
                      ? (['spread'] as const)
                      : (['x', 'y', 'spread', 'blur'] as const)
                  ).map((key) => {
                    const label = {
                      x: 'Offset X',
                      y: 'Offset Y',
                      spread:
                        active.type === 'outline' ? 'Thickness' : 'Spread',
                      blur: 'Blur',
                    }[key];
                    const Icon = {
                      x: ArrowRightLeft,
                      y: ArrowUpDown,
                      spread: Expand,
                      blur: OpacityIcon,
                    }[key];
                    return (
                      <InlineInputGroup
                        key={key}
                        label={label}
                        className="grid min-w-0 grid-cols-[1rem_minmax(0,1fr)]"
                      >
                        <Tooltip content={label}>
                          <Icon
                            aria-hidden="true"
                            className="size-4 shrink-0 text-content-secondary"
                          />
                        </Tooltip>
                        <NumberField
                          label={label}
                          tooltip={label}
                          hideLabel
                          className="px-1"
                          value={active[key]}
                          min={
                            key === 'blur' ||
                            (key === 'spread' && active.type === 'outline')
                              ? 0
                              : -limit
                          }
                          max={limit}
                          step={
                            key === 'spread' || key === 'blur'
                              ? caption.sizingUnit === 'px'
                                ? 0.1
                                : 0.02
                              : caption.sizingUnit === 'px'
                                ? 1
                                : 0.1
                          }
                          unit={sizingLabels[caption.sizingUnit]}
                          disabled={disabled}
                          onValueChange={(value) => patch({ [key]: value })}
                        />
                      </InlineInputGroup>
                    );
                  })}
                </div>
              </div>
            </InspectorSection>
          )}
        </div>
      </InspectorSection>
    </div>
  );
}
