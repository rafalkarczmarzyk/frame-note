import { SidebarSection } from '@/components/layout/sidebar-section';
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { useState } from 'react';
import type { Caption } from '../../domain/document';
import { anchors } from './layout';

const inputClass =
  'mt-2 w-full rounded-sm border bg-background px-2 py-2 text-xs focus-visible:outline-primary';

function Numeric({
  label,
  value,
  min,
  max,
  step = 0.01,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  const [draft, setDraft] = useState(String(value));
  return (
    <label className="block text-xs">
      {label}
      <input
        type="number"
        className={inputClass}
        value={draft}
        min={min}
        max={max}
        step={step}
        onBlur={() => setDraft(String(value))}
        onChange={(event) => {
          setDraft(event.target.value);
          if (event.target.value === '') return;
          const number = event.target.valueAsNumber;
          if (Number.isFinite(number) && number >= min && number <= max)
            onChange(number);
        }}
      />
    </label>
  );
}

export function CaptionControls({
  caption,
  onChange,
  disabled,
}: {
  caption: Caption;
  onChange: (caption: Caption) => void;
  disabled: boolean;
}) {
  const style = (patch: Partial<Caption['style']>) =>
    onChange({ ...caption, style: { ...caption.style, ...patch } });
  const position = (patch: Partial<Caption['position']>) =>
    onChange({ ...caption, position: { ...caption.position, ...patch } });
  return (
    <>
      <SidebarSection
        id="typography"
        title="Typography"
        summary={`${caption.style.fontFamily.replace(' Variable', '')}, ${caption.style.fontSizePercent}%`}
      >
        <fieldset disabled={disabled} className="space-y-4 disabled:opacity-70">
          <label className="block text-xs">
            Font
            <select
              aria-label="Font"
              className={inputClass}
              value={caption.style.fontFamily}
              onChange={(event) =>
                style({
                  fontFamily: event.target
                    .value as Caption['style']['fontFamily'],
                })
              }
            >
              <option value="Montserrat Variable">Montserrat</option>
              <option value="Advercase">Advercase</option>
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs">
              Weight
              <select
                className={inputClass}
                aria-label="Weight"
                value={caption.style.fontWeight}
                onChange={(event) =>
                  style({ fontWeight: Number(event.target.value) as 400 | 700 })
                }
              >
                <option value={400}>Regular</option>
                <option value={700}>Bold</option>
              </select>
            </label>
            <Numeric
              label="Size (% short edge)"
              value={caption.style.fontSizePercent}
              min={0.01}
              max={20}
              onChange={(fontSizePercent) => style({ fontSizePercent })}
            />
            <label className="block text-xs">
              Color
              <select
                className={inputClass}
                aria-label="Color"
                value={caption.style.color}
                onChange={(event) => style({ color: event.target.value })}
              >
                <option value="porcelain">Porcelain</option>
                <option value="charcoal">Charcoal</option>
                <option value="slate">Slate</option>
                <option value="tropical-mint">Tropical mint</option>
              </select>
            </label>
            <Numeric
              label="Opacity (%)"
              value={Math.round(caption.style.opacity * 100)}
              min={0}
              max={100}
              step={1}
              onChange={(value) => style({ opacity: value / 100 })}
            />
            <Numeric
              label="Line height"
              value={caption.style.lineHeight}
              min={0.5}
              max={3}
              onChange={(lineHeight) => style({ lineHeight })}
            />
            <div>
              <p id="text-align-label" className="text-xs">
                Text align
              </p>
              <div
                role="group"
                aria-labelledby="text-align-label"
                className="mt-2 flex h-9 overflow-hidden rounded-sm border"
              >
                {(
                  [
                    { value: 'left', label: 'Align left', Icon: AlignLeft },
                    {
                      value: 'center',
                      label: 'Align center',
                      Icon: AlignCenter,
                    },
                    { value: 'right', label: 'Align right', Icon: AlignRight },
                  ] as const
                ).map(({ value, label, Icon }) => (
                  <button
                    key={value}
                    type="button"
                    aria-label={label}
                    title={label}
                    aria-pressed={caption.style.textAlign === value}
                    onClick={() => style({ textAlign: value })}
                    className="flex flex-1 items-center justify-center border-r last:border-r-0 hover:bg-secondary hover:text-secondary-foreground focus-visible:z-10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground disabled:opacity-70"
                  >
                    <Icon
                      className="size-4"
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </fieldset>
      </SidebarSection>
      <SidebarSection
        id="position"
        title="Position"
        summary={caption.position.anchor.replaceAll('-', ' ')}
      >
        <fieldset disabled={disabled} className="space-y-4 disabled:opacity-70">
          <div>
            <p className="mb-2 text-xs">Anchor</p>
            <div
              className="grid w-28 grid-cols-3 gap-1"
              role="group"
              aria-label="Caption anchor"
            >
              {anchors.map((anchor) => (
                <button
                  key={anchor}
                  type="button"
                  aria-label={anchor}
                  aria-pressed={caption.position.anchor === anchor}
                  onClick={() => position({ anchor })}
                  className="flex h-8 items-center justify-center rounded-sm border text-lg aria-pressed:bg-primary aria-pressed:text-primary-foreground"
                >
                  ·
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Numeric
              label="Margin X (%)"
              value={caption.position.marginXPercent}
              min={0}
              max={50}
              onChange={(marginXPercent) => position({ marginXPercent })}
            />
            <Numeric
              label="Margin Y (%)"
              value={caption.position.marginYPercent}
              min={0}
              max={50}
              onChange={(marginYPercent) => position({ marginYPercent })}
            />
          </div>
          <p className="text-xs text-foreground/70">
            Size and margins use the photo’s shorter edge. Anchors move the
            block; text alignment controls lines inside it.
          </p>
        </fieldset>
      </SidebarSection>
    </>
  );
}
