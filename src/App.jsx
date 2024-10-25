import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import chroma from 'chroma-js';
import { saveAs } from 'file-saver';
import { toPng, toJpeg } from 'html-to-image';

// アプリ全体のUIを担当するReactコンポーネント
function App() {
  // 履歴用の状態
  const [history, setHistory] = useState([[]]); // 初期状態として空のノードリストを設定
  const [historyIndex, setHistoryIndex] = useState(0);

  // ノードのリストを保持する状態変数
  const [nodes, setNodes] = useState([]);
  // 新しいノードのテキストを保持する状態変数
  const [newNode, setNewNode] = useState('');
  // 親ノードとして選択されたノードのIDを保持する状態変数
  const [selectedParent, setSelectedParent] = useState(null);
  const [backgroundPosition, setBackgroundPosition] = useState('0px 0px');
  const [zoomTransform, setZoomTransform] = useState(d3.zoomIdentity); // ズーム状態を保持

  const inputRef = useRef(null);
  const svgRef = useRef(null);
  const fileInputRef = useRef(null); // ファイル選択用のref

  // 初期色の設定
  const rootColor = '#ffffff';
  const levelOneColors = chroma.scale(['#ff0000', '#00ff00', '#0000ff', '#ffff00']).mode('lch').colors(10);

  // サブメニューの表示状態を管理するための状態変数
  const [fileMenuOpen, setFileMenuOpen] = useState(false);
  const [editMenuOpen, setEditMenuOpen] = useState(false);
  const [helpMenuOpen, setHelpMenuOpen] = useState(false);

  // メニューをトグルする関数
  const toggleFileMenu = () => {
    setFileMenuOpen(!fileMenuOpen);
    setEditMenuOpen(false);
    setHelpMenuOpen(false);
  };

  const toggleEditMenu = () => {
    setEditMenuOpen(!editMenuOpen);
    setFileMenuOpen(false);
    setHelpMenuOpen(false);
  };

  const toggleHelpMenu = () => {
    setHelpMenuOpen(!helpMenuOpen);
    setFileMenuOpen(false);
    setEditMenuOpen(false);
  };

  // すべてのメニュータブを閉じる関数
  const closeAllMenus = () => {
    setFileMenuOpen(false);
    setEditMenuOpen(false);
    setHelpMenuOpen(false);
  };

  // マップをリセットする関数
  const resetMap = () => {
    updateNodes([]); // ノードの状態を空にしてリセット
    setSelectedParent(null); // 親ノードもリセット
    closeAllMenus(); // メニューを閉じる
  };

  // マップを保存する関数
  const saveMap = () => {
    const mapData = {
      nodes: nodes.map((node) => ({
        id: node.id,
        text: node.text,
        parentId: node.parentId,
        children: nodes.filter((childNode) => childNode.parentId === node.id).map((child) => child.id),
        x: node.x,
        y: node.y,
        color: node.color,
        level: node.level,
        width: node.width,
        height: node.height
      }))
    };

    const blob = new Blob([JSON.stringify(mapData, null, 2)], { type: 'application/json' });
    saveAs(blob, 'mapData.json');
    closeAllMenus(); // メニューを閉じる
  };

  // マップを読み込む関数
  const loadMap = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data && Array.isArray(data.nodes)) {
            setNodes(data.nodes);
          } else {
            alert('Invalid map data');
          }
        } catch (error) {
          alert('Error parsing the file');
        }

        // ファイル入力をリセット
        event.target.value = '';
      };
      reader.readAsText(file);
      closeAllMenus(); // メニューを閉じる
    }
  };

  const exportMap = (format = 'png') => {
    // SVG要素の参照を使用して、その要素を画像化する
    if (svgRef.current) {
      const node = svgRef.current;

      // 画像化処理
      const exportFunc = format === 'png' ? toPng : toJpeg;
      exportFunc(node, { backgroundColor: '#ffffff' })
        .then((dataUrl) => {
          // ダウンロードリンクを作成してクリック
          const link = document.createElement('a');
          link.download = `map.${format}`;
          link.href = dataUrl;
          link.click();

          // メニューを閉じる
          closeAllMenus();
        })
        .catch((error) => {
          console.error('Error exporting map:', error);
          alert('Error exporting map. Please try again.');
        });
    }
  };

  // Load Mapボタンが押されたときにファイル選択をトリガーする関数
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Undo機能
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setNodes(history[historyIndex - 1]);
    }
  };

  // Redo機能
  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setNodes(history[historyIndex + 1]);
    }
  };

  // ノードの状態を更新する際に履歴を管理する
  const updateNodes = (newNodes) => {
    // 子ノードの情報を再構築
    const nodesWithChildren = newNodes.map((node) => ({
      ...node,
      children: newNodes.filter((childNode) => childNode.parentId === node.id).map((child) => child.id)
    }));

    // 履歴にノードを追加
    const newHistory = history.slice(0, historyIndex + 1);
    setHistory([...newHistory, nodesWithChildren]);
    setHistoryIndex(newHistory.length);
    setNodes(nodesWithChildren);
  };

  // 新しいノードを追加する関数
  const addNode = () => {
    if (newNode.trim()) {
      // 親ノードを取得 (selectedParentを数値に変換して検索)
      const parentNode = nodes.find((node) => node.id === Number(selectedParent));

      // 親ノードが見つからない場合のチェック
      if (selectedParent !== null && !parentNode) {
        console.error('Parent node not found for selectedParent ID:', selectedParent);
        return; // 親ノードが見つからなければ処理を終了
      }

      // 新しいノードの色を決定
      const newColor =
        selectedParent === null
          ? rootColor
          : parentNode.level === 0
          ? levelOneColors[Math.floor(Math.random() * levelOneColors.length)]
          : chroma(parentNode.color).saturate(-0.2).brighten(0.2).hex();

      // 新しいノードオブジェクトを作成
      const newNodeObject = {
        id: Date.now(),
        text: newNode,
        parentId: selectedParent,
        children: [],
        color: newColor,
        level: parentNode ? parentNode.level + 1 : 0,
        x: parentNode ? parentNode.x + Math.random() * 100 - 50 : 300,
        y: parentNode ? parentNode.y + Math.random() * 100 - 50 : 300,
        width: Math.min(20 + newNode.length * 15), // 文字数に応じたノードの幅を設定（最小20px、最大200px）
        height: 40 // デフォルトの高さ
      };

      setNodes((prevNodes) => {
        if (selectedParent !== null) {
          const updatedNodes = prevNodes
            .map((node) => {
              if (node.id === selectedParent) {
                return { ...node, children: [...node.children, newNodeObject.id] };
              }
              return node;
            })
            .concat(newNodeObject);

          return updatedNodes;
        } else {
          return [...prevNodes, newNodeObject];
        }
      });

      // 入力フィールドをリセット
      updateNodes([...nodes, newNodeObject]);
      setNewNode('');
      setSelectedParent(null);
    }
  };

  useEffect(() => {
    if (nodes.length >= 0) {
      // SVG 要素の選択
      const svg = d3.select(svgRef.current);
      const width = 800;
      const height = 800;

      // 既存の`g`を削除してから再描画する
      svg.selectAll('g').remove();

      // ズームとパンの設定
      const zoomHandler = d3.zoom().on('zoom', (event) => {
        // setZoomTransform(event.transform);
        // linkGroup.attr('transform', event.transform);
        // nodeGroup.attr('transform', event.transform);
        svg.selectAll('g').attr('transform', event.transform);

        // 背景の位置をズームに合わせて移動
        const { x, y } = event.transform;
        setBackgroundPosition(`${x}px ${y}px`);
      });

      // SVG全体にズームとパンを適用
      svg.call(zoomHandler).call(zoomHandler.transform, zoomTransform);

      // 線用のグループ
      const linkGroup = svg.append('g').attr('class', 'links');
      // ノード用のグループ
      const nodeGroup = svg.append('g').attr('class', 'nodes');

      const simulation = d3
        .forceSimulation(nodes)
        .force(
          'link',
          d3
            .forceLink(
              nodes.flatMap((node) =>
                node.children
                  .map((childId) => {
                    const childNode = nodes.find((n) => n.id === childId);
                    return { source: node.id, target: childNode ? childNode.id : null };
                  })
                  .filter((link) => link.target !== null)
              )
            )
            .id((d) => d.id)
            .distance(70)
        )
        .force('charge', d3.forceManyBody().strength(-100))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force(
          'collision',
          d3.forceCollide().radius((d) => Math.max(d.width, d.height) / 2 + 10)
        ) // ノードの半径 + マージン
        .on('tick', () => {
          // 線を描画（先に描画されるのでノードの下にくる）
          const links = linkGroup
            .selectAll('line')
            .data(
              nodes.flatMap((node) =>
                node.children
                  .map((childId) => {
                    const childNode = nodes.find((n) => n.id === childId);
                    if (!childNode) {
                      console.error(`Child node with ID ${childId} not found in tick for parent node ${node.id}`);
                    }
                    console.log(childNode);
                    return { source: node, target: childNode };
                  })
                  .filter((link) => link.target !== null)
              )
            )
            .join('line')
            .attr('stroke', '#000000')
            .attr('stroke-width', 3)
            .attr('x1', (d) => d.source.x)
            .attr('y1', (d) => d.source.y)
            .attr('x2', (d) => d.target.x)
            .attr('y2', (d) => d.target.y);

          // ノード（四角形）を描画
          const nodesRects = nodeGroup
            .selectAll('rect')
            .data(nodes)
            .join('rect')
            .attr('width', (d) => d.width)
            .attr('height', (d) => d.height)
            .attr('rx', 10)
            .attr('ry', 10)
            .attr('fill', (d) => d.color)
            .attr('stroke', '#000000')
            .attr('stroke-width', 2)
            .attr('x', (d) => d.x - d.width / 2)
            .attr('y', (d) => d.y - d.height / 2)
            .attr('cursor', 'pointer')
            .on('click', (event, d) => {
              setSelectedParent(d.id); // ノードがクリックされたらそのIDをselectedParentに設定
              console.log(`Node ${d.id} clicked!`); // デバッグ用
              inputRef.current.focus(); // ノードクリック後にテキスト入力欄にフォーカス
            });

          // テキストを描画
          const text = nodeGroup
            .selectAll('text')
            .data(nodes)
            .join('text')
            .attr('x', (d) => d.x)
            .attr('y', (d) => d.y) // 少し下にオフセットして、テキストが中央に来るように調整
            .attr('dy', '0.35em')
            .attr('text-anchor', 'middle')
            .attr('fill', '#000000')
            .style('white-space', 'pre-wrap')
            .text((d) => d.text)
            .attr('cursor', 'pointer')
            .on('click', (event, d) => {
              setSelectedParent(d.id); // テキストがクリックされたらそのIDをselectedParentに設定
              console.log(`Text ${d.id} clicked!`); // デバッグ用
              inputRef.current.focus(); // ノードクリック後にテキスト入力欄にフォーカス
            });
        });

      // メニュー外でのクリックイベントのみを検知してメニューを閉じる処理
      const handleClickOutside = (event) => {
        // メニュー内のクリックを無視するための条件
        if (fileMenuOpen || editMenuOpen || helpMenuOpen) {
          // メニュー内の要素
          const menuElements = document.querySelectorAll('.menu-element');
          const clickedInsideMenu = Array.from(menuElements).some((element) => element.contains(event.target));

          if (!clickedInsideMenu) {
            closeAllMenus();
          }
        }
      };

      // クリックイベントをdocumentに追加
      document.addEventListener('click', handleClickOutside);

      const handleKeyDown = (event) => {
        if (event.ctrlKey && event.key === 'z') {
          event.preventDefault(); // デフォルトの動作を防ぐ
          undo();
        }
        if (event.ctrlKey && event.key === 'y') {
          event.preventDefault(); // デフォルトの動作を防ぐ
          redo();
        }
      };
  
      // キーボードイベントを登録
      document.addEventListener('keydown', handleKeyDown);  

      // シミュレーションの終了時に停止
      return () => {
        simulation.stop();
        document.removeEventListener('click', handleClickOutside);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [nodes, fileMenuOpen, editMenuOpen, helpMenuOpen, historyIndex, history]);

  // ReactコンポーネントのUIを定義
  return (
    <div className="bg-white h-screen w-screen flex flex-col overflow-hidden">
      {/* Hidden file input for loading map */}
      <input type="file" ref={fileInputRef} accept=".json" style={{ display: 'none' }} onChange={loadMap} />

      {/* Header */}
      <header
        className="bg-gradient-to-r from-indigo-400 via-green-200 via-40% to-purple-300 p-3 fixed top-0 left-0 w-full z-10 flex items-center"
        style={{ minHeight: '4rem' }}
      >
        <div className="flex justify-between items-center w-full relative">
          {/* 左側のメニュー */}
          <div className="flex space-x-4 menu-element">
            <div className="relative">
              <button onClick={toggleFileMenu} className="text-black font-bold">
                File
              </button>
              {fileMenuOpen && (
                <div className="absolute bg-white shadow-lg p-4">
                  <ul>
                    <li className="hover:bg-gray-200 p-2" onClick={resetMap}>
                      New Map
                    </li>
                    <li className="hover:bg-gray-200 p-2" onClick={saveMap}>
                      Save Map
                    </li>
                    <li className="hover:bg-gray-200 p-2" onClick={triggerFileInput}>
                      Load Map
                    </li>
                    <li className="hover:bg-gray-200 p-2" onClick={() => exportMap('png')}>
                      Export (PNG)
                    </li>{' '}
                    {/* PNGエクスポートボタン */}
                    <li className="hover:bg-gray-200 p-2" onClick={() => exportMap('jpeg')}>
                      Export (JPG)
                    </li>{' '}
                    {/* JPGエクスポートボタン */}
                  </ul>
                </div>
              )}
            </div>
            <div className="relative">
              <button onClick={toggleEditMenu} className="text-black font-bold">
                Edit
              </button>
              {editMenuOpen && (
                <div className="absolute bg-white shadow-lg p-4">
                  <ul>
                    <li className="hover:bg-gray-200 p-2" onClick={undo}>
                      Undo
                    </li>
                    <li className="hover:bg-gray-200 p-2" onClick={redo}>
                      Redo
                    </li>
                    {/* <li className="hover:bg-gray-200 p-2">Node Settings</li> */}
                  </ul>
                </div>
              )}
            </div>
            {/* <div className="relative">
              <button onClick={toggleHelpMenu} className="text-black font-bold">
                Help
              </button>
              {helpMenuOpen && (
                <div className="absolute bg-white shadow-lg p-4">
                  <ul>
                    <li className="hover:bg-gray-200 p-2">Manual</li>
                    <li className="hover:bg-gray-200 p-2">FAQ</li>
                    <li className="hover:bg-gray-200 p-2">Version</li>
                  </ul>
                </div>
              )}
            </div> */}
          </div>

          {/* 中央に絶対配置されたタイトル */}
          <h1 className="text-4xl font-bold absolute left-1/2 transform -translate-x-1/2">Idea Storm</h1>

          {/* 右側のボタン */}
          <div className="menu-element">
            <button className="text-black font-bold">Profile</button>
          </div>
        </div>
      </header>

      {/* メインコンテンツエリア */}
      <div className="flex-1 mt-16 relative overflow-hidden">
        <svg
          ref={svgRef}
          id="node-graph"
          className="absolute w-full h-full"
          style={{
            cursor: 'grab',
            backgroundImage: 'radial-gradient(circle, gray 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            backgroundPosition: backgroundPosition
          }}
        >
          <g />
        </svg>
      </div>

      {/* フッターエリア */}
      <div className="h-16 bg-gray-200 flex items-center px-4 space-x-4">
        <select
          value={selectedParent || ''}
          onChange={(e) => setSelectedParent(e.target.value ? Number(e.target.value) : null)}
          className="border p-2 rounded"
        >
          <option value="">親ノードを選択</option>
          {nodes.map((node) => (
            <option key={node.id} value={node.id}>
              {node.text}
            </option>
          ))}
        </select>

        {/* ノードを追加するための入力フィールド */}
        <input
          ref={inputRef} // フォーカス用のrefを追加
          type="text"
          value={newNode}
          onChange={(e) => setNewNode(e.target.value)}
          placeholder="Enter new Idea"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              addNode(); // Enterキーが押されたらノード追加
            }
          }}
          className="flex-1 placeholder-gray-400/70 dark:placeholder-gray-500 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-gray-700 focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-40"
        />
        <button onClick={addNode} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Add
        </button>
      </div>
    </div>
  );
}

// Appコンポーネントを他のファイルからも使えるようにエクスポート
export default App;
