// SPDX-FileCopyrightText: 2026 Rafał Karczmarzyk
// SPDX-License-Identifier: GPL-3.0-or-later
import type { StorybookConfig } from '@storybook/react-vite';
// @ts-expect-error Build helper is plain JavaScript.
import { legalMaterialsPlugin } from '../scripts/legal-materials.mjs';
const config: StorybookConfig = {
  stories: [
    {
      directory: '../packages/editor/src',
      files: '**/*.stories.@(ts|tsx)',
      titlePrefix: '',
    },
  ],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: '@storybook/react-vite',
  staticDirs: ['../public'],
  viteFinal(config) {
    // Preview FrameNote's notices, not the independently licensed Storybook
    // tooling that surrounds the application stories.
    config.plugins = [
      ...(config.plugins ?? []).filter(
        (plugin) =>
          !(
            plugin &&
            typeof plugin === 'object' &&
            'name' in plugin &&
            plugin.name === 'framenote-legal-materials'
          ),
      ),
      legalMaterialsPlugin({ applicationPreview: true }),
    ];
    return config;
  },
  core: { disableTelemetry: true },
};
export default config;
