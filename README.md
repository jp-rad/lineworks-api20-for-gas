# lineworks-api20-for-gas

# 開発環境の準備

## インストール

- git
- Docker
- [VS Code](https://code.visualstudio.com/download)

## クローンとVS Codeの起動

1. `git clone https://github.com/jp-rad/lineworks-api20-for-gas.git`
1. `lineworks-api20-for-gas`フォルダをVS Codeで開く
1. Dockerを起動する
1. VS Codeで`Reopen in Container`を実行し、Dockerコンテナーを起動する  
（初回、ダウンロードとインストールが行われるので、待つ）

## Google Apps Script の追加

[Google ドライブ](https://drive.google.com/drive/my-drive)を開き、`Google Apps Script`を追加します。

1. [Google ドライブ](https://drive.google.com/drive/my-drive)
1. `新規` > `その他` > `Google Apps Script`
1. `プロジェクトの設定`で、`スクリプト ID`をコピーする

## GASログインとGASクローン

1. VS Codeのメニュー `ターミナル` > `タスクの実行`で、`GAS ログイン`を選択する
1. VS Codeのメニュー `ターミナル` > `タスクの実行`で、`GAS クローン`を選択する
1. コピーした`スクリプト ID`を`スクリプト ID`に貼り付け、Enterキーを押下する
1. VS Codeのメニュー `ターミナル` > `タスクの実行`で、`GAS ビルドとプッシュ`を選択する

`Google Apps Script`を開くと、ローカルのソースコードが反映されていることを確認できます(洗い替え)。
