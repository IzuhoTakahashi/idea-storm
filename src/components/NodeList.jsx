// NodeList.js
import React from 'react';

function NodeList({ nodes }) {
  // ノードをレンダリングする関数（再帰的に子ノードもレンダリング）
  const renderNode = (node) => (
    <div key={node.id} className="ml-4">
      <div
        className="p-2 rounded shadow mb-2"
        style={{ backgroundColor: node.color }} // ノードの色を背景に設定
      >
        {node.text}
      </div>
      {/* 子ノードを再帰的にレンダリング */}
      {node.children.length > 0 && (
        <div className="ml-4">
          {node.children.map((childId) => {
            const childNode = nodes.find((n) => n.id === childId);
            return childNode && renderNode(childNode);
          })}
        </div>
      )}
    </div>
  );

  // ルートノード（parentIdがnullのノード）をフィルタリングして表示
  return (
    <div>
      {nodes
        .filter((node) => node.parentId === null)
        .map((node) => renderNode(node))}
    </div>
  );
}

export default NodeList;