/** Background for the native macOS window controls and draggable app title. */
export function MacOSTitleBar() {
  return (
    <div
      data-window-titlebar
      className="app-window-titlebar flex h-7 shrink-0 items-center justify-center bg-header-base px-20 text-xs font-medium text-content-secondary"
    >
      FrameNote
    </div>
  );
}
