# 現場のお弁当注文サイト 公開ガイド（無料版・Vercel）

このガイドは、費用をかけずに公開したい場合の手順です。Vercel（Next.jsを作っている会社のホスティングサービス）と、Upstash Redis（無料で使えるデータ保存サービス）を組み合わせます。所要時間は20分程度です。

全体の流れは3ステップです。

1. GitHubにファイルを置く（すでに完了していればスキップ）
2. Vercelでサイトを公開する
3. データ保存用のUpstash Redisを接続する

---

## ステップ1：GitHubにファイルを置く

すでにGitHubのリポジトリに `bento-order-app` の中身（`app`、`components`、`lib`、`package.json` など）をアップロード済みであれば、このステップは完了しています。次に進んでください。

まだの場合は、以下の手順で行ってください。

1. https://github.com でアカウントを作成
2. 右上の「＋」→「New repository」で `bento-order-app` という名前のリポジトリを作成（Privateを選択）
3. お渡ししたzip（`bento-order-app-v3.zip` など）を展開し、`bento-order-app` フォルダを開く
4. リポジトリ画面の「Add file」→「Upload files」で、フォルダの中身（フォルダごとではなく中身）をドラッグ＆ドロップ
5. 「Commit changes」をクリック

---

## ステップ2：Vercelでサイトを公開する

### 2-1. Vercelアカウントを作る

1. https://vercel.com にアクセス
2. 「Sign Up」→「Continue with GitHub」を選び、GitHubアカウントでログイン・連携する

### 2-2. プロジェクトを作る

1. ダッシュボードの「Add New...」→「Project」をクリック
2. 「Import Git Repository」の一覧から、先ほどの `bento-order-app` を探して「Import」をクリック
3. 設定画面はそのままで問題ありません。「Deploy」ボタンをクリック
4. 数分待つと最初のデプロイが完了します（この時点ではまだ注文データやパスワードの設定をしていないので、あと少し設定が必要です）

### 2-3. 環境変数（パスワードなど）を設定する

1. プロジェクトのページで「Settings」タブ→「Environment Variables」を開く
2. 以下を1つずつ追加する（Nameに変数名、Valueに値を入力して「Save」）

| Name | Value |
|---|---|
| `ADMIN_PASSWORD` | 管理画面用の好きなパスワード |
| `SESSION_SECRET` | 適当な長いランダム文字列（英数字を30文字くらい適当に打ち込めばOK） |

---

## ステップ3：データ保存用のUpstash Redisを接続する

これを設定しないと、注文データが保存されません（一番大事な設定です）。

1. プロジェクトのページで「Storage」タブを開く
2. 「Create Database」または「Browse Marketplace」から、パートナー一覧の中の「Upstash」を探してクリック
3. 案内に沿って「Redis」を選択し、データベースを作成する（プラン選択画面では無料枠のものを選ぶ）
4. 作成できたら、そのデータベースをこのプロジェクト（`bento-order-app`）に接続する（Connect Project のような案内があります）
5. 接続すると、環境変数が自動的にプロジェクトに追加されます

### 3-1. 環境変数の名前を確認する

1. もう一度「Settings」→「Environment Variables」を開く
2. `UPSTASH_REDIS_REST_URL` と `UPSTASH_REDIS_REST_TOKEN` という名前の変数が追加されていればOKです
3. もし `KV_REST_API_URL` / `KV_REST_API_TOKEN` という名前で追加されていた場合も、このアプリはそのまま認識できるので変更不要です
4. どちらの名前も見当たらない場合は、Upstashのダッシュボード（console.upstash.com）でデータベースを開き、「REST API」の欄にある `UPSTASH_REDIS_REST_URL` と `UPSTASH_REDIS_REST_TOKEN` の値をコピーして、Vercelの環境変数に手動で追加してください

### 3-2. 再デプロイする

1. 「Deployments」タブを開く
2. 一番上のデプロイの右側「...」メニューから「Redeploy」を選ぶ
3. 数分待って完了したら公開完了です

### 3-3. URLを確認する

プロジェクトのトップページに `〇〇.vercel.app` のようなURLが表示されています。これがみんなに共有するURLです。

---

## ステップ4：実際に使う準備をする

1. サイトの右上「管理者ログイン」→ ステップ2-3で決めた `ADMIN_PASSWORD` でログイン
2. 「名前」タブ：サンプルの名前を削除し、現場のメンバーの名前を登録
3. 「メニュー」タブ：サンプルのメニューを削除し、実際のお弁当メニューを登録
4. 「画像」タブ：今週のメニュー表の写真をアップロード
5. 発行されたURLをLINEなどでメンバーに共有

### スマホのホーム画面に追加すると便利です

- **iPhone（Safari）**：URLを開く→下の共有ボタン→「ホーム画面に追加」
- **Android（Chrome）**：URLを開く→右上の「⋮」→「ホーム画面に追加」

---

## 料金について

VercelもUpstashも、今回のような小規模利用（7〜10人が毎朝数件ずつ注文する程度）であれば、無料枠の範囲に収まる見込みです。正式な金額・条件は下記でご確認ください。

- Vercel料金: https://vercel.com/pricing
- Upstash料金: https://upstash.com/pricing

## データの保存期間について

このアプリはデータを自動では消しません（容量が小さいのでずっと保存していても問題にならず、「注文したはずなのに」といった食い違いがあったときの記録としても使えます）。もし本当に定期的に消したい場合は、あとから管理画面に削除ボタンを追加することもできます。

## 困ったときは

| 症状 | 確認すること |
|---|---|
| デプロイが失敗する | Environment Variablesに `ADMIN_PASSWORD` / `SESSION_SECRET` が入っているか |
| 注文しても管理画面に反映されない・データが消える | `UPSTASH_REDIS_REST_URL` と `UPSTASH_REDIS_REST_TOKEN`（または `KV_REST_API_URL` / `KV_REST_API_TOKEN`）が設定され、再デプロイ済みか |
| 管理者パスワードを変えたい | VercelのEnvironment Variablesで `ADMIN_PASSWORD` を書き換えて「Redeploy」を押し直す |
| メニューや名前を追加・修正したい | 管理画面（`/admin`）から自由に編集できます。再デプロイは不要です |

作業を進めていて分からないところが出てきたら、どこで止まっているか教えてください。
