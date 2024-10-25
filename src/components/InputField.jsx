import React from 'react';
import AddButton from './AddButton';

// InputFieldコンポーネント：ユーザーのテキスト入力と新しいアイテムの追加を処理する
function InputField({ value, onChange, onAdd }) {
  return (
    <div　className="flex items-center space-x-2">
      {/* ユーザーのテキスト入力を受け取る入力フィールド */}
      <input
        type="text" // 入力タイプをテキストに指定
        value={value} // 入力フィールドに現在の値をバインド
        onChange={(e) => onChange(e.target.value)} // 入力値が変わったときにonChangeプロップを呼び出す
        placeholder="Enter new Idea" // ガイドとしてのプレースホルダーテキスト
        className="flex-1 mt-2 w-full placeholder-gray-400/70 dark:placeholder-gray-500 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-gray-700 focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-40" // 入力フィールドのスタイリング
      />
      {/* 入力された値を追加するためのボタン */}
      <AddButton onClick={onAdd} />
    </div>
  );
}

export default InputField;
