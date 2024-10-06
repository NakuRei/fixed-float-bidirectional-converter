import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';

import myTypescriptConfig from './nakurei-typescript-config.js';
import myReactConfig from './nakurei-react-config.js';
import myStylisticConfig from './nakurei-stylistic-config.js';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [...myStylisticConfig],
    files: ['**/*.{js,jsx,ts,tsx}'],
  },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
      ...myTypescriptConfig,
      ...myReactConfig,
    ],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: { react: { version: '18.3' } },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      react,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      // README.mdに記載されているルールを全て有効化
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
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
