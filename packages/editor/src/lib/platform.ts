/** Platform services are installed once by the application entry point. */
export interface PlatformServices {
  saveFile(
    blob: Blob,
    name: string,
  ): Promise<'download-started' | 'saved' | 'cancelled'>;
  storage: Pick<Storage, 'getItem' | 'setItem'>;
}
export const browserPlatform: PlatformServices = {
  async saveFile(blob, name) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
    return 'download-started';
  },
  storage: {
    getItem: (key) => localStorage.getItem(key),
    setItem: (key, value) => localStorage.setItem(key, value),
  },
};
let services = browserPlatform;
export function configurePlatform(platform: PlatformServices) {
  services = platform;
}
export function platform() {
  return services;
}
