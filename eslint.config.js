import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettier from 'eslint-config-prettier/flat';

export default defineConfig([
  globalIgnores([
    'dist',
    'node_modules',
    'playwright-report',
    'test-results',
    'coverage',
    'storybook-static',
    'playwright-visual-report',
    'visual-test-results',
    '**/renderer/**',
    'release',
  ]),
  js.configs.recommended,
  {
    files: ['apps/desktop/**/*.cjs'],
    languageOptions: { globals: globals.node },
  },
  tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [reactHooks.configs.flat.recommended, reactRefresh.configs.vite],
  },
  {
    files: ['src/**/*.stories.tsx'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
  prettier,
]);
