# HacKit Security - セキュリティプロジェクト

このリポジトリは、2025年8月2日〜4日に開催されたHacKitというハッカソンイベントの、セキプロチームのリポジトリです。

## 使用技術
- HTML、CSS、JavaScript
- Node.js、Express
- Firebase Authentication
- Nodemailer（メール送信）
- Cloudflare

## 機能
- ユーザー認証（ログイン・サインアップ）
- パスワードリセット機能（メール送信）
- パスワード変更機能
- セキュリティ機能

## インストール手順
npm install


## アクセス
- メインサイト: http://localhost:3000
- ログイン: http://localhost:3000/login.html
- 新規登録: http://localhost:3000/signup.html
- パスワードリセット: http://localhost:3000/password-reset.html
- パスワード変更: http://localhost:3000/password-change.html

## ファイル構成
- `server.js` - Expressサーバー（メール送信機能）
- `firebase-config.js` - Firebase設定ファイル
- `firebase-config-example.js` - Firebase設定サンプル
- `login.html` / `login.js` - ログイン画面
- `signup.html` / `signup.js` - サインアップ画面
- `password-reset.html` / `password-reset.js` - パスワードリセット画面
- `password-reset-confirm.html` / `password-reset-confirm.js` - パスワードリセット確認画面
- `password-change.html` / `password-change.js` - パスワード変更画面

## 元の要件
- index.html: 地図を表示し、ピンが号館ごとに刺されている。ピンを押すとその号館で思っている不満を見ることができるページに飛ぶ
- ranking.html: 場所ごとカテゴリーごとでソート
- post.html: 投稿機能