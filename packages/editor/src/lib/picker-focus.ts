/** Restore focus after deleting a picker item, including the final item. */
export function focusPickerAfterDelete(root: HTMLElement | null) {
  requestAnimationFrame(() => {
    const target =
      root?.querySelector<HTMLButtonElement>(
        '[data-picker-choice][aria-pressed="true"]',
      ) ??
      root?.querySelector<HTMLButtonElement>('[data-picker-choice]') ??
      root?.querySelector<HTMLButtonElement>(
        'button[aria-label="Add effect"]',
      ) ??
      root
        ?.closest('details')
        ?.querySelector<HTMLButtonElement>('[data-add-layer]');
    target?.focus({ preventScroll: true });
  });
}
