import stylistic from '@stylistic/eslint-plugin';
import stylisticTs from '@stylistic/eslint-plugin-ts';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    plugins: {
      '@stylistic': stylistic,
      '@stylistic/ts': stylisticTs,
    },
    rules: {
      // 括弧の前後の改行を強制
      '@stylistic/array-bracket-newline': ['error', { multiline: true }],
      // 括弧内のスペースを禁止
      '@stylistic/array-bracket-spacing': ['error', 'never'],
      // 配列要素間の改行ルールを統一
      '@stylistic/array-element-newline': ['error', 'consistent'],
      // アロー関数に必ず括弧をつける
      '@stylistic/arrow-parens': ['error', 'always'],
      // アロー関数の前後に必ずスペース
      '@stylistic/arrow-spacing': [
        'error', {
          before: true,
          after: true,
        },
      ],
      // ブロックの前後に必ずスペース
      '@stylistic/block-spacing': ['error', 'always'],
      // ブロックのスタイルを強制
      '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: true }],
      // 改行時に必ずカンマを入れる
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
      // カンマの後に必ずスペース
      '@stylistic/comma-spacing': [
        'error', {
          before: false,
          after: true,
        },
      ],
      // カンマは行末につける
      '@stylistic/comma-style': ['error', 'last'],
      // computed propertiesのスペースは禁止
      '@stylistic/computed-property-spacing': ['error', 'never'],
      // ドットの位置をプロパティと同じ行に強制
      '@stylistic/dot-location': ['error', 'property'],
      // ファイルの最後で必ず改行(LF)
      '@stylistic/eol-last': ['error', 'always'],
      // 関数の引数を改行スタイルの統一
      '@stylistic/function-call-argument-newline': ['error', 'consistent'],
      // 関数名と引数の括弧の間にスペースを禁止
      '@stylistic/function-call-spacing': ['error', 'never'],
      // 関数の引数の改行スタイルを統一
      '@stylistic/function-paren-newline': ['error', 'consistent'],
      // generator関数のスペースを強制
      '@stylistic/generator-star-spacing': [
        'error',
        {
          before: true,
          after: false,
        },
      ],
      // アロー関数の改行スタイルを強制
      '@stylistic/implicit-arrow-linebreak': ['error', 'beside'],
      // インデントは2スペース
      '@stylistic/indent': ['error', 2],
      // 二項演算子のインデントも2スペース
      '@stylistic/indent-binary-ops': ['error', 2],
      // JSXの子要素の前後にスペースを強制
      '@stylistic/jsx-child-element-spacing': 'error',
      // JSXの閉じ括弧の位置を強制
      '@stylistic/jsx-closing-bracket-location': ['error', 'line-aligned'],
      // JSXの閉じタグの位置を強制
      '@stylistic/jsx-closing-tag-location': ['error', 'line-aligned'],
      // JSXの{}の有無を強制
      '@stylistic/jsx-curly-brace-presence': 'error',
      // JSXの{}の前後にスペースを禁止
      '@stylistic/jsx-curly-spacing': [
        'error',
        {
          when: 'never',
          children: true,
        },
      ],
      // JSXの{}の改行スタイルを統一
      '@stylistic/jsx-curly-newline': ['error', 'consistent'],
      // JSXの=の前後にスペースを禁止
      '@stylistic/jsx-equals-spacing': ['error', 'never'],
      // JSXのpropsの改行スタイルを強制
      '@stylistic/jsx-first-prop-new-line': ['error', 'multiline-multiprop'],
      // 関数引数の要素に改行があるなら改行を強制
      '@stylistic/jsx-function-call-newline': ['error', 'multiline'],
      // JSXのインデントは2スペース
      '@stylistic/jsx-indent': ['error', 2],
      // JSXのpropsのインデントも2スペース
      '@stylistic/jsx-indent-props': ['error', 2],
      // 1行に1つのpropsを強制
      '@stylistic/jsx-max-props-per-line': ['error', { maximum: 1 }],
      // JSXの改行を強制
      '@stylistic/jsx-newline': [
        'error',
        {
          prevent: true,
          allowMultilines: true,
        },
      ],
      // JSXの1行1要素を強制
      '@stylistic/jsx-one-expression-per-line': [
        'error',
        { allow: 'single-child' },
      ],
      // JSXのコンポーネント名をPascalCaseに強制
      '@stylistic/jsx-pascal-case': 'error',
      // JSXのpropsの複数スペースを禁止
      '@stylistic/jsx-props-no-multi-spaces': 'error',
      // JSXの引用符をダブルクォートに強制
      '@stylistic/jsx-quotes': ['error', 'prefer-double'],
      // 自己終了タグを強制
      '@stylistic/jsx-self-closing-comp': [
        'error',
        {
          component: true,
          html: true,
        },
      ],
      // JSXのpropsのソートを強制
      '@stylistic/jsx-sort-props': 'error',
      '@stylistic/jsx-tag-spacing': [
        'error',
        {
          closingSlash: 'never',
          beforeSelfClosing: 'always',
          afterOpening: 'never',
          beforeClosing: 'never',
        },
      ],
      // JSXの複数行を括弧で囲む
      '@stylistic/jsx-wrap-multilines': [
        'error', {
          declaration: 'parens-new-line',
          assignment: 'parens-new-line',
          return: 'parens-new-line',
          arrow: 'parens-new-line',
          condition: 'parens-new-line',
          logical: 'parens-new-line',
          prop: 'parens-new-line',
          propertyValue: 'parens',
        },
      ],
      // オブジェクトのキーの前後のスペースを強制
      '@stylistic/key-spacing': [
        'error',
        {
          beforeColon: false,
          afterColon: true,
          mode: 'strict',

        },
      ],
      // キーワードの前後にスペースを強制
      '@stylistic/keyword-spacing': [
        'error', {
          before: true,
          after: true,
        },
      ],
      // 行コメントの位置を上に強制
      '@stylistic/line-comment-position': ['error', { position: 'above' }],
      // 改行コードは必ずLF
      '@stylistic/linebreak-style': ['error', 'unix'],
      // Blockコメントの前に空行を強制
      '@stylistic/lines-around-comment': [
        'error',
        {
          beforeBlockComment: true,
          allowBlockStart: true,
          allowClassStart: true,
          allowObjectStart: true,
          allowObjectStart: true,
          allowArrayStart: true,
        },
      ],
      // クラスメンバーの間に空行を強制
      '@stylistic/lines-between-class-members': ['error', 'always'],
      // 1行の文字数を80文字に制限
      '@stylistic/max-len': [
        'error',
        {
          code: 80,
          ignoreUrls: true,
          ignorePattern: '^import .*',
        },
      ],
      // 1行に1つのステートメントのみ許可
      '@stylistic/max-statements-per-line': ['error', { max: 1 }],
      // 区切り文字のスタイルをセミコロンに統一
      '@stylistic/member-delimiter-style': [
        'error', {
          multiline: {
            delimiter: 'semi',
            requireLast: true,
          },
          singleline: {
            delimiter: 'semi',
            requireLast: false,
          },
          multilineDetection: 'brackets',
        },
      ],
      // 複数行のコメントのスタイルを統一
      '@stylistic/multiline-comment-style': ['error', 'starred-block'],
      // 三項演算子の改行スタイルを統一
      '@stylistic/multiline-ternary': ['error', 'always-multiline'],
      // 引数のないコンストラクタでも括弧を強制
      '@stylistic/new-parens': 'error',
      // メソッドのチェーン数を制限
      '@stylistic/newline-per-chained-call': [
        'error',
        { ignoreChainWithDepth: 2 },
      ],
      // アロー演算子と混合しやすい比較演算子に括弧を強制
      '@stylistic/no-confusing-arrow': 'error',
      // 余分な括弧をエラーとして報告させる
      '@stylistic/no-extra-parens': [
        'error',
        'all',
        {
          nestedBinaryExpressions: false,
          ignoreJSX: 'all',
        },
      ],
      // 余分なセミコロンをエラーとして報告させる
      '@stylistic/no-extra-semi': 'error',
      // 小数点の前後に必ず数値を入れる
      '@stylistic/no-floating-decimal': 'error',
      // 論理演算子の混合に括弧を強制
      '@stylistic/no-mixed-operators': 'error',
      // インデントでスペースとタブの混在を禁止
      '@stylistic/no-mixed-spaces-and-tabs': 'error',
      // 連続スペースの禁止
      '@stylistic/no-multi-spaces': 'error',
      // 連続した空行を禁止
      '@stylistic/no-multiple-empty-lines': [
        'error',
        {
          max: 1,
          maxEOF: 1,
          maxBOF: 0,
        },
      ],
      // タブの使用を禁止
      '@stylistic/no-tabs': 'error',
      // 行末の空白文字を禁止
      '@stylistic/no-trailing-spaces': 'error',
      // ドットや括弧の前のスペースを禁止
      '@stylistic/no-whitespace-before-property': 'error',
      // 中括弧の改行スタイルを強制
      '@stylistic/object-curly-newline': ['error', { consistent: true }],
      // オブジェクトリテラルの中括弧のスペースを強制
      '@stylistic/object-curly-spacing': ['error', 'always'],
      // オブジェクトリテラルのプロパティの改行スタイルを強制
      '@stylistic/object-property-newline': 'error',
      // 改行時の演算子の位置を強制
      '@stylistic/operator-linebreak': ['error', 'before'],
      // ブロックの前後に空行を入れない
      '@stylistic/padded-blocks': ['error', 'never'],
      // シングルクォートを強制
      '@stylistic/quotes': ['error', 'single'],
      // プロパティ名のクオートのルールを統一
      '@stylistic/quote-props': ['error', 'as-needed'],
      // `...`の後にスペースを入れない
      '@stylistic/rest-spread-spacing': ['error', 'never'],
      // セミコロンを必ずつける
      '@stylistic/semi': ['error', 'always'],
      // セミコロンの前にスペースを入れない
      'semi-spacing': [
        'error', {
          before: false,
          after: true,
        },
      ],
      // セミコロンを行末に強制
      '@stylistic/semi-style': ['error', 'last'],
      // ブロックの開始波括弧の前にスペースを強制
      '@stylistic/space-before-blocks': ['error', 'always'],
      '@stylistic/ts/space-before-blocks': ['error', 'always'],
      // 関数名または関数キーワードと開始括弧の間にスペースは入れない
      '@stylistic/space-before-function-paren': ['error', 'never'],
      // 括弧内のスペースを禁止
      '@stylistic/space-in-parens': ['error', 'never'],
      // 中置演算子（e.g. +, *）の前後にスペースを強制
      '@stylistic/space-infix-ops': 'error',
      '@stylistic/ts/space-infix-ops': 'error',
      // 単語演算子の前後にスペースを強制、記号演算子の前後のスペースを禁止
      '@stylistic/space-unary-ops': [
        'error', {
          words: true,
          nonwords: false,
        },
      ],
      // コメント記号の前後にスペースを強制
      '@stylistic/spaced-comment': ['error', 'always'],
      // switch文のcase句とdefault句のコロン後にスペースを強制
      '@stylistic/switch-colon-spacing': [
        'error', {
          after: true,
          before: false,
        },
      ],
      // テンプレート・リテラルの中括弧内にスペースを入れない
      '@stylistic/template-curly-spacing': ['error', 'never'],
      // タグ関数とテンプレートリテラルの間にスペースを入れない
      '@stylistic/template-tag-spacing': ['error', 'never'],
      // 型アノテーションと関数型の周囲のスペースを統一
      '@stylistic/ts/type-annotation-spacing': 'error',
      // 型ジェネリック内のスペースを統一
      '@stylistic/type-generic-spacing': 'error',
      // 名前付きタプルの型宣言の前にスペースを入れる
      '@stylistic/type-named-tuple-spacing': 'error',
      // 関数式を括弧で囲む
      '@stylistic/wrap-iife': ['error', 'outside'],
      // 正規表現前後に括弧を強制
      '@stylistic/wrap-regex': 'error',
      // yield*式ではyieldと*の間にスペースを強制
      '@stylistic/yield-star-spacing': [
        'error',
        {
          before: true,
          after: false,
        },
      ],
    },
  },
);
