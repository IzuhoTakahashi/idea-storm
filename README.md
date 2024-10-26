# Idea Storm

`Idea Storm`は、アイデアのブレインストーミングや整理に役立つ、直感的なマインドマップ作成アプリです。このアプリではノードの追加や編集、ノード間のリンクの自動生成をサポートしており、階層的に情報を整理できます。ユーザーは、新規マップ作成や保存、PNG/JPEG フォーマットでのエクスポート、履歴管理といった豊富な機能を使用できます。

## 主な機能

- **マップ作成**：階層構造を持つノードを生成し、アイデアを視覚的に整理可能。
- **ノードの色分け**：ノードは階層ごとに自動で色が変わり、分かりやすい構造に。
- **ズームとパン**：D3.js によるズーム機能で大きなマップも簡単に閲覧可能。
- **マップの保存と読み込み**：作成したマップを JSON 形式で保存し、後で再読み込み可能。
- **画像エクスポート**：PNG や JPEG 形式でマップをダウンロードでき、資料作成にも便利。
- **Undo/Redo**：履歴機能で操作の取り消しややり直しが可能。

## 使用方法

### 1. ノードの追加

- フッターにある入力フィールドにノードの名前を入力し、`Add`ボタンをクリックするか、`Enter`キーを押します。
- 親ノードが必要な場合、`親ノードを選択` ドロップダウンメニューから選択してください。

### 2. マップの操作

- **ズーム**：マウスホイールでズームイン・アウトが可能です。
- **パン**：SVG 領域をドラッグすることでマップを移動可能です。
- **ノードの操作**：ノードのダブルクリックでノードの編集、クリックで親ノードとして選択。

### 3. マップの保存・読み込み

- **新規マップの作成**：`File > New Map` でマップをリセット。
- **マップの保存**：`File > Save Map` で現在のマップを JSON 形式で保存。
- **マップの読み込み**：`File > Load Map` で保存した JSON ファイルを読み込むとマップが再現されます。

### 4. 画像エクスポート

- `File > Export (PNG)` または `File > Export (JPG)` で現在のマップを PNG または JPEG 形式でエクスポート可能です。

### 5. Undo/Redo 機能

- **Undo**：`Ctrl + Z`で直前の操作を取り消し。
- **Redo**：`Ctrl + Y`で操作をやり直し。

## 技術スタック

- **React**：UI 構築のためのフロントエンドライブラリ
- **D3.js**：ノードのズーム・パン機能とフォースレイアウトのためのデータ可視化ライブラリ
- **chroma-js**：ノードの色操作のためのライブラリ
- **html-to-image**：SVG 要素を画像としてエクスポートするためのツール
- **file-saver**：ファイル保存用のライブラリ

## 今後の改善点

- **ログイン機能**：ログインすることでマップのクラウド保存を可能にする機能
- **ノードの編集機能**：ノードのテキストを編集したり、ノードを削除する機能
- **ノードの詳細設定**：ノードのサイズや色をカスタマイズする機能
- **複数ユーザーの同時編集**：リアルタイムで共同編集できる機能の追加
- **ノード検索**：大量のノードから特定のノードを簡単に検索する機能
