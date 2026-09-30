import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';

export default tseslint.config(
  {
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      react,
    },
    rules: {
      /*
       * 以下はReactに関するルールで、下記3つにないもの
       * reactHooks.configs.recommended.rules
       * react.configs.recommended.rules
       * react.configs['jsx-runtime'].rules
       */

      // 短絡評価によるレンダリングをエラーとして報告
      'react/jsx-no-leaked-render': [
        'error',
        {
          validStrategies: ['ternary'],
        },
      ],
      // コンポーネントを関数宣言で記述
      'react/function-component-definition': [
        'error',
        { namedComponents: 'function-declaration' },
      ],
      // useStateの戻り値の命名規則を統一
      'react/hook-use-state': 'error',
      // boolean型のPropsをtrueで渡すときは省略する
      'react/jsx-boolean-value': ['error', 'never'],
      // dangerouslySetInnerHTMLを許可しない
      'react/no-danger': 'error',
    },
  },
);
