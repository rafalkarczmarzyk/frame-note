import { createContext } from 'react';

export type Platform = 'web' | 'macos' | 'windows' | 'linux';

export const PlatformContext = createContext<Platform | undefined>(undefined);
