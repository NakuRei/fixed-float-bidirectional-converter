# CI の検証範囲に関する評価

調査日: 2026-10-03

## 指摘の要約

> 現在もビルドだけで、テストと lint は実行されません。`verify` スクリプトも未追加です。ローカルと CI で同じ検証を実行できるようにする改善が残っています。

## 変更前の実装

- `.github/workflows/build.yml:3` は main 向けの pull_request と workflow_dispatch で実行される。
- 同ファイルの依存関係インストールは `npm ci`、検証は `npm run build` のみ。Node は `.tool-versions` の `node 24` を参照し、npm キャッシュを利用する。インストール時に `HUSKY: 0` を指定する。
- `package.json:8` の build は `tsc -b && vite build`。TypeScript の型検査も行うため、ビルドだけという指摘を「型検査もない」と解釈するのは誤り。
- `tsconfig.app.json` は src、tests、vitest-setup.ts を含み、`tsconfig.node.json` は vite.config.ts を含む。
- `package.json:9` に `lint: eslint .`、同ファイルの12行目に `test: vitest --run` が既にある。test は watch せず終了する。verify はない。
- `.husky/pre-commit` と lint-staged は、ステージした対象ファイルへの `eslint --fix` と関連テストを実行する。CI は Husky を無効化しており、このフックは全体検証の代わりにならない。
- `.github/workflows/deploy.yml` は main への push と手動実行で動作し、`npm run build` の後に dist を公開する。lint・テストを条件にする処理や build.yml への依存はない。

## 公式資料

- [GitHub: Building and testing Node.js](https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs) は、ローカルで使うビルド・テストコマンドを workflow から実行する構成を説明している。
- [npm 11: npm ci](https://docs.npmjs.com/cli/v11/commands/npm-ci/) は、自動実行環境向けのインストール方法として説明している。lock と package.json が一致しなければ失敗し、package.json や lock を書き換えない。既存の CI はこの方式を採用済み。
- [Vitest: Command Line Interface](https://vitest.dev/guide/cli.html#vitest-run) は run を watch しない一回実行とし、lint-staged にも `--run` を付けるよう説明している。インストール済みの Vitest 5.0.3 の CLI 実装でも、run オプションが watch を無効化することを確認した。
- [ESLint: Command Line Interface Reference](https://eslint.org/docs/latest/use/command-line-interface#exit-codes) は、lint エラーなら終了コード1、設定や内部の問題なら2で終了することを説明している。既存コマンドの失敗をそのまま CI の失敗として扱える。
- [GitHub: About protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches#require-status-checks-before-merging) は、マージの条件としてステータスチェックを要求する設定を説明している。CI を実行する設定と、その成功をマージ条件にする設定は別に確認する。

## 推奨案

package.json の test に `.only` を許可しないことを明示し、検証を順に実行する verify を追加する。

```json
"test": "vitest --run --allowOnly=false",
"verify": "npm run lint && npm test && npm run build"
```

verify の成功は、lint、対象を `.only` で絞らないテスト実行、型検査、本番ビルドの成功を表す。各段階の失敗は npm のコマンド表示と出力から確認でき、個別の lint、test、build で再確認できる。開発時の watch 実行には既存の test:watch を利用する。

PR 検証の役割に合わせ、build.yml は verify.yml、workflow 名は Verify、ジョブ ID は verify に改名する。最後のステップを、次の内容に置き換える。

```yaml
- name: Verify
  run: npm run verify
```

deploy.yml のビルドステップでも同じ verify を使えば、検証成功後に、その実行で生成した dist を公開できる。verify が本番ビルドを行うので、その後に再度 build を実行する段階は設けない。既存の npm ci、Node 設定、キャッシュ、インストール時の HUSKY 設定を利用する。依存関係のインストールは verify に含めず、準備段階として明示する。

PR 検証と公開の workflow は、トリガーと必要な権限が異なるため分ける。検証の定義は共通コマンドに置き、公開の権限やイベントの条件を各検証コマンドに持ち込まない。既存名を保つことを目的にはしない。改名時に GitHub 側の必須チェックが旧名を参照している場合は、その参照も更新する。

## 初回調査時の実行結果

ローカル環境は Node v24.21.0、npm 11.19.0。既にインストールされていた依存関係を利用した。`npm ls --depth=0` は成功し、Vitest 5.0.3、ESLint 10.11.0、TypeScript 6.0.3、Vite 8.3.2 を確認した。

| コマンド | 結果 |
| --- | --- |
| `npm run lint` | 終了コード0。lint エラーなし。既存の jsx-sort-props ルールについてプラグインの非推奨通知あり。 |
| `npm test` | 終了コード0。6ファイル・164テストすべて成功。実行時間2.61秒。 |
| `npm run build` | 終了コード0。TypeScript の型検査と Vite の本番ビルドが成功。 |

各コマンドは個別に実行した。verify の追加や GitHub Actions 上の実行、依存関係の再インストールは行っていない。テストの `.only`・`.skip`・`.todo` 指定は今回の検索では見つからなかった。

## 複数の観点からの評価

### 改善する根拠

型検査と本番ビルドの成功だけでは、変換結果、入力検証、入力変更後の表示、アクセシブルな名前やエラーの関連付けを確認するテストの成功は保証されない。既存テストはこれらの振る舞いを実際に検証している。また、既存 ESLint ルールは TypeScript の型検査と異なる制約を検証している。両方を CI に追加する意義がある。

今回の全テストは2.61秒で成功し、lint とビルドも成功した。現在のコードを検証対象にするために、先にテストや lint エラーを修正する必要はない。単一ジョブで既存コマンドを実行する構成が、追加の依存関係インストールやジョブ間の成果物受け渡しを増やさずに目的を達成する。

公開 workflow は独立しているので、PR 側だけを改善しても、main の状態や手動実行で選んだ対象を公開前に lint・テストで検証する条件にはならない。deploy.yml でも verify を使えば、その実行で検証とビルドを終えた成果物を公開できる。PR と公開時に同じ検証を繰り返すコストはあるが、公開時の対象を直接確認できる利点を優先する。

### 留保と代替案

verify という名前のスクリプトが必須の標準というわけではない。workflow に lint、test、build を別々のステップとして記載しても、検証範囲は改善できる。ただし、今回の目的にはローカルと CI の実行内容を共通化することが含まれるので、package.json の一行に集約する方法を推奨する。GitHub の資料が説明しているのはローカルコマンドの再利用であり、verify という名前の義務ではない。

直列実行では最初の失敗で停止するため、同じ実行で後続コマンドの失敗をまとめて確認できない。独立ジョブなら複数の失敗を確認しやすいが、今回の実測と単一の Node 24 設定からは、そのために構成を増やす必要性は確認できなかった。時間が問題になったときに、改めて分割を検討すればよい。

coverage スクリプトはあるが、vite.config.ts にカバレッジの閾値はない。検証範囲の共通化を達成するには、まず通常の全テストで十分。カバレッジの必須化や閾値、E2E テスト、OS・Node のマトリクスは今回の提案から自動的に必要になるものではない。build に既存の型検査が含まれるので、同じ型検査を別コマンドで二度実行する必要もない。

## 判定と理由

**Claim is valid — 改善すべき指摘。**

テストと lint が PR の CI にないこと、verify がないことは実装から確認できる。既存の検証を再利用するだけで不足を埋められ、現在のコードに対する各検証も成功している。これは外部のチーム方針が分からないと結論が反転する問題ではない。ただし、現在の build が型検査も行う点と、verify 自体は共通化の手段である点は区別する。

## 推奨する次の作業と完了条件

1. package.json の test に `--allowOnly=false` を明示し、verify を追加する。
2. build.yml を verify.yml に改名し、workflow 名を Verify、ジョブ ID を verify にする。PR 検証と deploy.yml の `npm run build` ステップを `npm run verify` に置き換える。
3. ローカルで `npm run verify` を実行し、lint・全テスト・型検査・本番ビルドのすべてが成功することを確認する。
4. PR の GitHub Actions で成功を確認し、いずれかの検証が失敗した場合に CI が失敗すること、公開用 workflow が検証成功を条件に dist のアップロードへ進む構成になっていることを確認する。
5. 新しい Verify が PR 上で成功した後、マージ前に GitHub 側の main の必須チェックを build から verify に切り替える。新 workflow が GitHub 上で実行できる状態になる前には変更しない。実装・再確認段階の結果は末尾に記録する。

調査段階ではこの報告だけを変更した。実装後の結果は末尾に記録する。

## 修正方針の再考で確認した点

インストール済みの Vitest 5.0.3 は allowOnly の既定値が `!isCI` である。したがって、watch を無効化しただけでは、ローカルと CI の失敗条件まで一致するとは限らない。[Vitest の allowOnly の公式説明](https://main.vitest.dev/config/allowonly) でも、この既定値と `--allowOnly=false` による明示的な指定が説明されている。

プロジェクト外の一時ディレクトリに、成功する `.only` 付きテストと、失敗する通常のテストを一つずつ用意し、インストール済みの Vitest 5.0.3 で反例を確認した。

| 実行条件 | 終了コード | 結果 |
| --- | --- | --- |
| CI 環境変数なし・既定の run | 0 | `.only` の1件だけ成功し、失敗する通常テストはスキップされた。 |
| CI=true・既定の run | 1 | `.only` の残存を検出して失敗した。 |
| CI 環境変数なし・`--allowOnly=false` | 1 | ローカルでも `.only` の残存を検出して失敗した。 |

この反例から、通常の test スクリプトに `--allowOnly=false` を指定する方針に修正した。一時ディレクトリは削除済み。実際のプロジェクトでも `npm test -- --allowOnly=false` を実行し、6ファイル・164テストすべてが成功した。実行時間は2.19秒。この再考段階では package.json 自体は未変更だった。

また、既存の build ジョブ名を残すという先の推奨は、実際の GitHub 側の依存を確認していない。検証の役割に合う Verify という workflow 名・verify というジョブ名を基本とし、旧名を参照する必須チェックが実在する場合は、その参照の更新を移行作業として扱うのが適切。

## 実装と検証

package.json に verify を追加し、通常の test に `--allowOnly=false` を指定した。PR の workflow を verify.yml に改名し、workflow 名を Verify、ジョブ ID を verify に変更した。PR 検証と公開用 workflow は、ともに `npm run verify` を呼び出す。公開は verify が生成した dist を使う。

- `npm run verify` は終了コード0。lint、6ファイル・164テスト、TypeScript の型検査、Vite の本番ビルドがすべて成功した。
- 変更した npm test を使い、CI 環境変数のないローカルで `.only` 付きの一時テストが終了コード1になることを確認した。一時ファイルは削除した。
- 両 workflow の YAML をパースし、重複キーや構文エラーがないことを確認した。
- GitHub の main に適用されるルールセット Protect main（ID 1219780）には、build を必須チェックとして指定するルールが実在した。厳密なチェックと GitHub Actions の integration_id 15368 を指定している。確認時点では未完了の PR はなく、ルールセットを更新する管理権限も確認した。
- [GitHub の repository ruleset 更新 API](https://docs.github.com/en/rest/repos/rules#update-a-repository-ruleset) を使い、必須チェックの参照を build から verify に変更した。更新直前に設定を再取得し、最初の取得後に変更されていないことを確認した。
- 更新後のルールセットを再取得し、チェック名以外の保護設定が維持されていることを確認した。API が pull_request の required_reviewers に空配列を補う形式差はあったが、追加のレビュー担当者を要求する設定はない。レビュー・署名・バイパス・対象ブランチ・チェックの厳密性・integration_id は維持されている。
- この実装段階では、ソースの変更がローカルにある状態で、GitHub 側の必須チェックだけ先に verify に切り替えていた。後述の再確認でこの順序を修正した。

## 実装の再確認

検証の入口と責務は明確である。verify は lint、通常の test、型検査を含む本番ビルドを一行で合成する。PR と公開の workflow は同じ入口を呼び、公開はその実行で生成した dist を使う。通常の test は `.only` を拒否し、開発時の対象を絞った watch 実行は別の入口である。独自の実行基盤や旧ジョブ名の別名は追加していない。

ただし、GitHub 側の移行の順序に問題があった。再確認時点では GitHub の有効な workflow と main のファイルは Build/build.yml のままで、必須チェックだけが verify に切り替わっていた。新 workflow の push 前に必須チェックを変更すると、旧 workflow を使う PR で必要なチェックが揃わなくなる。

必須チェックを公開済みの build に戻し、新しい Verify が PR 上で成功してから verify に切り替える順序に修正した。ローカルの verify.yml とジョブ ID verify は維持する。移行のための旧名の別名や追加ジョブは設けない。[GitHub の pull_request イベントの説明](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#pull_request)では、PR の作成・更新で workflow が実行され、既定の checkout と検証は PR のマージ結果を対象にすることが説明されている。

GitHub 側を再取得し、現在の必須チェックが build であることと、チェック名以外の保護設定が維持されていることを確認した。ローカルの実装コードに追加の修正は必要なかった。実装段階で確認した verify の成功（164テスト、lint、型検査、本番ビルド）と `.only` の拒否は引き続き適用できる。GitHub 上での新 workflow の成功確認と、その後の必須チェックの切替が移行の残作業である。
