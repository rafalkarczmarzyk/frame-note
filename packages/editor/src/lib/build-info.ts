import { version } from '../../../../package.json';
declare const __FRAMENOTE_BUILD__: {
  version: string;
  commit: string;
  dirty: boolean;
};
const info =
  typeof __FRAMENOTE_BUILD__ === 'undefined'
    ? { version, commit: 'unknown', dirty: false }
    : __FRAMENOTE_BUILD__;
export const appVersion = info.version;
export const appBuild = info.commit + (info.dirty ? '-dirty' : '');
