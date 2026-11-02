// Check before resolving or launching Electron: macOS can abort in
// _RegisterApplication inside Codex's Seatbelt environment.
export function assertDesktopTestEnvironment(platform, env) {
  if (platform !== 'darwin')
    throw new Error('Desktop smoke tests require a macOS graphical session.');
  if (env.CODEX_SANDBOX === 'seatbelt' || env.APP_SANDBOX_CONTAINER_ID)
    throw new Error(
      'Desktop test blocked before launching Electron: this macOS process is sandboxed. ' +
        'Run pnpm test:desktop from a terminal in the logged-in graphical session. ' +
        'In Codex, request elevated execution for pnpm test:desktop before the first attempt. ' +
        'Do not unset sandbox markers or retry Electron in this environment.',
    );
}
