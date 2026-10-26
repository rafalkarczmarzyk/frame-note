import type { ReactNode } from 'react';

/** Always-visible group within a compact container inspector. */
export function InspectorSection({
  title,
  children,
  imageDrop = false,
}: {
  title: string;
  children: ReactNode;
  imageDrop?: boolean;
}) {
  return (
    <section
      aria-label={title}
      data-content-image-drop={imageDrop || undefined}
      className="relative border-t border-border-subtle px-3 py-3"
    >
      <h3 className="mb-2 text-xs font-semibold text-content-secondary">
        {title}
      </h3>
      {children}
    </section>
  );
}
