import { builtinIcons } from './builtin-icons';
import { FloatingPanel } from '@/components/layout/floating-panel';
import { PickerList } from '@/components/ui/picker-list';
import { svgUrl, type SvgIcon } from './svg-icons';

export function IconPickerPanel({
  icons,
  onChoose,
  onClose,
  className,
}: {
  icons: readonly SvgIcon[];
  onChoose: (name: string) => void;
  onClose: () => void;
  className?: string;
}) {
  return (
    <FloatingPanel
      title="Inline icons"
      description="Choose an icon to insert. Icons inherit the caption size and color."
      onClose={onClose}
      surface="solid"
      className={className}
    >
      {['Built-in', 'Your SVGs'].map((group) => {
        const items = icons.filter(
          (icon) =>
            builtinIcons.some((builtin) => builtin.name === icon.name) ===
            (group === 'Built-in'),
        );
        if (!items.length) return null;
        return (
          <section key={group} aria-label={group} className="mb-4">
            <h3 className="px-3 py-2 text-xs text-label">{group}</h3>
            <PickerList
              items={items.map((icon) => ({
                id: icon.name,
                label: icon.name,
                description: `{icon:${icon.name}}`,
                leading: (
                  <span
                    aria-hidden="true"
                    className="inline-block size-5 shrink-0 bg-current"
                    style={{
                      maskImage: `url("${svgUrl(icon.svg)}")`,
                      maskSize: 'contain',
                      maskRepeat: 'no-repeat',
                      maskPosition: 'center',
                    }}
                  />
                ),
              }))}
              onChoose={onChoose}
              emptyText="No icons available."
            />
          </section>
        );
      })}
    </FloatingPanel>
  );
}
