import eslintReact from '@eslint-react/eslint-plugin';
import { defineConfig } from 'eslint/config';

export default defineConfig(
  {
    plugins: { '@eslint-react': eslintReact },
    rules: {
      // プリセットでは警告または無効のため、エラーとして報告
      '@eslint-react/jsx-no-comment-textnodes': 'error',
      '@eslint-react/dom-no-unsafe-target-blank': 'error',
      '@eslint-react/dom-no-unknown-property': 'error',
      '@eslint-react/no-missing-component-display-name': 'error',
      // useStateの戻り値の命名規則を統一
      '@eslint-react/use-state': 'error',
      // dangerouslySetInnerHTMLを許可しない
      '@eslint-react/dom-no-dangerously-set-innerhtml': 'error',

      'no-restricted-syntax': [
        'error',
        {
          selector: [
            'JSXExpressionContainer',
            'LogicalExpression[operator="&&"]',
          ].join(' > '),
          message: '短絡評価によるレンダリングは禁止です。三項演算子を使用してください。',
        },
        {
          selector: [
            'VariableDeclarator[id.name=/^[A-Z]/]',
            ':matches(ArrowFunctionExpression, FunctionExpression)',
          ].join(' > '),
          message: 'コンポーネントは関数宣言で記述してください。',
        },
        {
          selector: [
            'JSXAttribute',
            'JSXExpressionContainer',
            'Literal[value=true]',
          ].join(' > '),
          message: 'boolean型のPropsをtrueで渡すときは値を省略してください。',
        },
      ],

      // Hooksのルールは公式のeslint-plugin-react-hooksで検査するため、重複する移植版を無効化
      '@eslint-react/error-boundaries': 'off',
      '@eslint-react/exhaustive-deps': 'off',
      '@eslint-react/globals': 'off',
      '@eslint-react/immutability': 'off',
      '@eslint-react/purity': 'off',
      '@eslint-react/refs': 'off',
      '@eslint-react/rules-of-hooks': 'off',
      '@eslint-react/set-state-in-effect': 'off',
      '@eslint-react/set-state-in-render': 'off',
      '@eslint-react/static-components': 'off',
      '@eslint-react/unsupported-syntax': 'off',
      '@eslint-react/use-memo': 'off',
    },
  },
);
