import js from '@eslint/js';
import eslintReact from '@eslint-react/eslint-plugin';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import { reactRefresh } from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

import myTypescriptConfig from './nakurei-typescript-config.js';
import myReactConfig from './nakurei-react-config.js';
import myStylisticConfig from './nakurei-stylistic-config.js';

export default defineConfig(
  globalIgnores(['dist']),
  {
    extends: [...myStylisticConfig],
    files: ['**/*.{js,jsx,ts,tsx}'],
  },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
      eslintReact.configs['strict-type-checked'],
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite(),
      ...myTypescriptConfig,
      ...myReactConfig,
    ],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        // 自動JSXランタイムではJSXがReactを参照しないため、参照扱いを無効化
        jsxPragma: null,
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['src/**/*.{ts,js}'],
    rules: {
      // 1つの関数の行数を50以下に制限
      'max-lines-per-function': ['error', { max: 50 }],
    },
  },
);
