import React from 'react';

function Links({ nodes }) {
  return (
    <svg className="w-full h-full">
      {nodes.map((node) =>
        node.children.map((childId) => {
          const childNode = nodes.find((n) => n.id === childId);
          if (!childNode || node.x == null || node.y == null || childNode.x == null || childNode.y == null) {
            return null; // 座標が存在しない場合は何も描画しない
          }
          return (
            <line
              key={`${node.id}-${childId}`}
              x1={node.x}
              y1={node.y}
              x2={childNode.x}
              y2={childNode.y}
              stroke="#888"
              strokeWidth="2"
            />
          );
        })
      )}
    </svg>
  );
}

export default Links;
