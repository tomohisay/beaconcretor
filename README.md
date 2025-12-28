# Adobe Analytics Beacon Creator

フォームベースでAdobe Analyticsのイメージリクエスト（ビーコン）を作成・送信するウェブアプリケーション

## 概要

Adobe Analyticsへのデータ送信をテストするためのツールです。フォームに値を入力し、指定したReport Suiteにビーコンを送信できます。

## デモ

ブラウザでindex.htmlを開くだけで使用できます。

## 機能

### 送信モード

| モード | 説明 |
|--------|------|
| 直接イメージリクエスト | ブラウザから直接Adobe Analyticsのエンドポイントにピクセル（1x1 GIF）リクエストを送信 |
| AppMeasurement.js | Adobe公式ライブラリを使用してビーコンを送信。ページビュー（s.t()）とリンクトラッキング（s.tl()）に対応 |

### 対応変数

#### 基本変数
- pageName（ページ名）
- channel（チャネル）
- server（サーバー）
- pageType（ページタイプ）
- pageURL（ページURL）
- referrer（参照元）
- campaign（キャンペーン）
- purchaseID（購入ID）
- transactionID（トランザクションID）
- visitorID（訪問者ID）
- characterSet（文字セット）

#### カスタム変数（動的追加可能）
- **eVar1〜eVar250**: コンバージョン変数
- **prop1〜prop75**: トラフィック変数
- **event1〜event1000**: カスタムイベント（値・シリアライゼーションID対応）

#### Commerce変数
- **products**: 完全な構文サポート
  - 形式: `カテゴリ;製品名;数量;価格;イベント;eVar`
- 標準イベント: purchase, prodView, scAdd, scRemove, scView, scCheckout

#### その他
- **list1, list2, list3**: リスト変数
- **contextData**: コンテキストデータ（キー・値ペア、動的追加可能）

### UI機能

- 変数の動的追加・削除（＋/−ボタン）
- リクエストプレビュー（URL形式 or JavaScriptコード）
- URL長警告（2048文字超過時）
- フォームクリア/リセット
- クリップボードにコピー
- **日本語/英語 UI切り替え**
- **設定自動保存**（Report Suite ID、Tracking Serverをlocalstorageに保存）
- **テンプレート機能**（よく使う変数セットを保存・読み込み）

## ファイル構成

```
beaconcretor/
├── index.html                 # メインUI
├── css/
│   └── styles.css            # スタイルシート
├── js/
│   ├── app.js                # アプリ初期化・イベント管理
│   ├── config.js             # 設定定数・パラメータマッピング
│   ├── i18n.js               # 多言語対応（日本語/英語）
│   ├── storage.js            # 設定保存・テンプレート管理
│   ├── dynamicFields.js      # eVar/prop/event動的追加
│   ├── variableBuilder.js    # 変数構築ロジック
│   ├── imageRequest.js       # 直接イメージリクエスト
│   ├── appMeasurement.js     # AppMeasurement.js連携
│   └── previewGenerator.js   # プレビュー生成
└── vendor/
    └── AppMeasurement.js     # Adobe公式ライブラリ（ユーザー配置）
```

## 技術仕様

### イメージリクエストURL形式

```
https://[trackingServer]/b/ss/[rsid]/1/JS-2.22.0-[random]?[params]
```

### クエリパラメータマッピング

| 変数 | パラメータ | 例 |
|------|-----------|-----|
| pageName | `pageName` | `pageName=Home%20Page` |
| channel | `ch` | `ch=Products` |
| server | `server` | `server=www.example.com` |
| campaign | `v0` | `v0=email_campaign` |
| eVar1-250 | `v1`-`v250` | `v1=value1` |
| prop1-75 | `c1`-`c75` | `c1=value1` |
| events | `events` | `events=event1%2Cevent2%3D5` |
| products | `products` | `products=%3Bproduct1%3B1%3B9.99` |
| list1-3 | `l1`-`l3` | `l1=a%2Cb%2Cc` |

### イベント構文

```
event1                    # 基本イベント
event2=5                  # 値付きイベント
event3:ABC123             # シリアライゼーションID付き
event4=10:XYZ789          # 値とシリアライゼーションID
```

### Products構文

```
category;product;quantity;price;events;evars
```

例:
```
;Product A;1;9.99;event1=2.5;eVar1=merch_value
Electronics;Laptop;1;999.99;;
```

## セットアップ

### ローカル環境

```bash
# リポジトリをクローン
git clone https://github.com/tomohisay/beaconcretor.git
cd beaconcretor

# ローカルサーバーを起動
python3 -m http.server 8080

# ブラウザで開く
open http://localhost:8080
```

### さくらインターネット等の静的ホスティング

1. すべてのファイルをFTPでアップロード
2. ブラウザでindex.htmlにアクセス

### AppMeasurement.jsの設定（オプション）

AppMeasurementモードを使用する場合：

1. Adobe Experience Cloudにログイン
2. Analytics > 管理者 > コードマネージャーからAppMeasurement.jsをダウンロード
3. `vendor/AppMeasurement.js`として配置

※ AppMeasurement.jsがなくても、直接イメージリクエストモードは動作します。

## 使い方

1. **設定を入力**
   - Report Suite ID（必須）
   - Tracking Server（必須）
   - Secure Tracking Server（オプション）

2. **送信モードを選択**
   - 直接イメージリクエスト or AppMeasurement.js

3. **変数を設定**
   - 基本変数を入力
   - 「+ 追加」ボタンでeVar、prop、イベント等を追加

4. **プレビューで確認**
   - 「プレビュー」ボタンで生成されるリクエストを確認

5. **ビーコンを送信**
   - 「ビーコン送信」ボタンでAdobe Analyticsに送信

## 技術的考慮事項

### CORS

直接イメージリクエストモードでは、CORSによりレスポンスの読み取りはブロックされますが、ビーコン自体はAdobe Analyticsに正常に送信されます。これは仕様通りの動作です。

### URL長制限

- URLが2048文字を超える場合は警告が表示されます
- AppMeasurementモードでは自動的にPOSTメソッドに切り替わります

### ブラウザ対応

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## ライセンス

MIT License

## 作者

tomohisay
