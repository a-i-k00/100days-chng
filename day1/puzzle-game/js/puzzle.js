document.addEventListener('DOMContentLoaded', () => {
    // DOM要素の取得
    const imageUpload = document.getElementById('imageUpload');
    const startButton = document.getElementById('startButton');
    const restartButton = document.getElementById('restartButton');
    const difficultySelect = document.getElementById('difficultySelect');
    const puzzle = document.getElementById('puzzle');
    const previewImage = document.getElementById('previewImage');
    const messageElement = document.getElementById('message');

    // ゲーム状態を管理する変数
    let uploadedImage = null;
    let pieces = [];
    let correctPositions = [];
    let gridSize = 4; // デフォルトは4x4
    let selectedPiece = null;
    let isDragging = false;
    let dragStartX, dragStartY;
    let offsetX, offsetY;

    // イベントリスナーの設定
    imageUpload.addEventListener('change', handleImageUpload);
    startButton.addEventListener('click', startPuzzle);
    restartButton.addEventListener('click', startPuzzle);
    difficultySelect.addEventListener('change', () => {
        gridSize = parseInt(difficultySelect.value);
    });

    // 画像アップロード処理
    function handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        // 画像ファイルかどうかをチェック
        if (!file.type.match('image.*')) {
            alert('画像ファイルを選択してください。');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(event) {
            uploadedImage = new Image();
            uploadedImage.onload = function() {
                // プレビュー画像を表示
                previewImage.src = uploadedImage.src;
                startButton.disabled = false;
                messageElement.textContent = '';
            };
            uploadedImage.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }

    // パズル開始処理
    function startPuzzle() {
        if (!uploadedImage) return;
        
        // パズルをリセット
        puzzle.innerHTML = '';
        pieces = [];
        correctPositions = [];
        restartButton.disabled = false;
        
        // パズルのサイズを設定
        const puzzleSize = puzzle.offsetWidth;
        const pieceSize = puzzleSize / gridSize;
        
        // パズルピースを作成
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                const pieceIndex = y * gridSize + x;
                
                // 正しい位置を記録
                correctPositions.push({ x: x * pieceSize, y: y * pieceSize });
                
                // ピース要素を作成
                const piece = document.createElement('div');
                piece.className = 'puzzle-piece';
                piece.dataset.index = pieceIndex;
                
                // ピースのスタイルを設定
                piece.style.width = `${pieceSize}px`;
                piece.style.height = `${pieceSize}px`;
                piece.style.backgroundImage = `url(${uploadedImage.src})`;
                piece.style.backgroundSize = `${puzzleSize}px ${puzzleSize}px`;
                piece.style.backgroundPosition = `-${x * pieceSize}px -${y * pieceSize}px`;
                
                // ドラッグイベントを設定
                piece.addEventListener('mousedown', onPieceMouseDown);
                piece.addEventListener('touchstart', onPieceTouchStart, { passive: false });
                
                // ピースを追加
                puzzle.appendChild(piece);
                pieces.push({
                    element: piece,
                    x: 0,
                    y: 0,
                    correctX: x * pieceSize,
                    correctY: y * pieceSize
                });
            }
        }
        
        // パズルピースをシャッフル
        shufflePieces();
        
        // マウス/タッチイベントを追加
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        document.addEventListener('touchmove', onTouchMove, { passive: false });
        document.addEventListener('touchend', onTouchEnd);
    }

    // パズルピースをシャッフル
    function shufflePieces() {
        const puzzleSize = puzzle.offsetWidth;
        const positions = [...correctPositions];
        
        // Fisher-Yatesアルゴリズムでシャッフル
        for (let i = positions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [positions[i], positions[j]] = [positions[j], positions[i]];
        }
        
        // シャッフルした位置に配置
        pieces.forEach((piece, index) => {
            piece.x = positions[index].x;
            piece.y = positions[index].y;
            updatePiecePosition(piece);
            piece.element.classList.remove('correct');
        });
    }

    // ピースの位置を更新
    function updatePiecePosition(piece) {
        piece.element.style.left = `${piece.x}px`;
        piece.element.style.top = `${piece.y}px`;
    }

    // マウスダウンイベント
    function onPieceMouseDown(e) {
        e.preventDefault();
        const index = parseInt(this.dataset.index);
        selectedPiece = pieces[index];
        isDragging = true;
        
        // ドラッグ開始位置を保存
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        offsetX = selectedPiece.x;
        offsetY = selectedPiece.y;
        
        // 選択されたピースを最前面に
        this.style.zIndex = 100;
    }

    // タッチスタートイベント
    function onPieceTouchStart(e) {
        e.preventDefault();
        const index = parseInt(this.dataset.index);
        selectedPiece = pieces[index];
        isDragging = true;
        
        // ドラッグ開始位置を保存
        const touch = e.touches[0];
        dragStartX = touch.clientX;
        dragStartY = touch.clientY;
        offsetX = selectedPiece.x;
        offsetY = selectedPiece.y;
        
        // 選択されたピースを最前面に
        this.style.zIndex = 100;
    }

    // マウス移動イベント
    function onMouseMove(e) {
        if (!isDragging || !selectedPiece) return;
        
        // ピースの位置を更新
        const deltaX = e.clientX - dragStartX;
        const deltaY = e.clientY - dragStartY;
        
        selectedPiece.x = offsetX + deltaX;
        selectedPiece.y = offsetY + deltaY;
        
        // 範囲内に制限
        constrainToContainer(selectedPiece);
        updatePiecePosition(selectedPiece);
    }

    // タッチ移動イベント
    function onTouchMove(e) {
        if (!isDragging || !selectedPiece) return;
        e.preventDefault();
        
        // ピースの位置を更新
        const touch = e.touches[0];
        const deltaX = touch.clientX - dragStartX;
        const deltaY = touch.clientY - dragStartY;
        
        selectedPiece.x = offsetX + deltaX;
        selectedPiece.y = offsetY + deltaY;
        
        // 範囲内に制限
        constrainToContainer(selectedPiece);
        updatePiecePosition(selectedPiece);
    }

    // パズルコンテナ内に制限
    function constrainToContainer(piece) {
        const puzzleSize = puzzle.offsetWidth;
        const pieceSize = puzzleSize / gridSize;
        
        piece.x = Math.max(0, Math.min(piece.x, puzzleSize - pieceSize));
        piece.y = Math.max(0, Math.min(piece.y, puzzleSize - pieceSize));
    }

    // マウスアップイベント
    function onMouseUp() {
        if (!isDragging || !selectedPiece) return;
        dropPiece();
    }

    // タッチエンドイベント
    function onTouchEnd() {
        if (!isDragging || !selectedPiece) return;
        dropPiece();
    }

    // ピースをドロップする処理
    function dropPiece() {
        // ドロップした位置に最も近いグリッドにスナップ
        snapToGrid(selectedPiece);
        
        // 他のピースと重ならないようにする
        preventOverlap(selectedPiece);
        
        // 正しい位置にあるかチェック
        checkCorrectPosition(selectedPiece);
        
        // ゲーム完了チェック
        checkPuzzleComplete();
        
        // ドラッグ状態をリセット
        selectedPiece.element.style.zIndex = 10;
        selectedPiece = null;
        isDragging = false;
    }

    // グリッドにスナップ
    function snapToGrid(piece) {
        const puzzleSize = puzzle.offsetWidth;
        const pieceSize = puzzleSize / gridSize;
        
        // 最も近いグリッド位置を計算
        const gridX = Math.round(piece.x / pieceSize) * pieceSize;
        const gridY = Math.round(piece.y / pieceSize) * pieceSize;
        
        piece.x = gridX;
        piece.y = gridY;
        updatePiecePosition(piece);
    }

    // 他のピースと重ならないようにする
    function preventOverlap(piece) {
        const pieceIndex = parseInt(piece.element.dataset.index);
        
        for (let i = 0; i < pieces.length; i++) {
            if (i !== pieceIndex && pieces[i].x === piece.x && pieces[i].y === piece.y) {
                // ランダムな隣接セルに移動
                const puzzleSize = puzzle.offsetWidth;
                const pieceSize = puzzleSize / gridSize;
                const directions = [
                    { dx: -1, dy: 0 },
                    { dx: 1, dy: 0 },
                    { dx: 0, dy: -1 },
                    { dx: 0, dy: 1 }
                ];
                
                const availableDirections = directions.filter(dir => {
                    const newX = piece.x + dir.dx * pieceSize;
                    const newY = piece.y + dir.dy * pieceSize;
                    return newX >= 0 && newX < puzzleSize - pieceSize / 2 &&
                           newY >= 0 && newY < puzzleSize - pieceSize / 2;
                });
                
                if (availableDirections.length > 0) {
                    const randomDir = availableDirections[Math.floor(Math.random() * availableDirections.length)];
                    piece.x += randomDir.dx * pieceSize;
                    piece.y += randomDir.dy * pieceSize;
                    updatePiecePosition(piece);
                    // 再帰的に重なりをチェック
                    preventOverlap(piece);
                }
                break;
            }
        }
    }

    // 正しい位置にあるかチェック
    function checkCorrectPosition(piece) {
        const pieceIndex = parseInt(piece.element.dataset.index);
        const tolerance = 5; // 許容誤差（ピクセル）
        
        if (Math.abs(piece.x - piece.correctX) <= tolerance && 
            Math.abs(piece.y - piece.correctY) <= tolerance) {
            // 正しい位置にスナップ
            piece.x = piece.correctX;
            piece.y = piece.correctY;
            updatePiecePosition(piece);
            piece.element.classList.add('correct');
        } else {
            piece.element.classList.remove('correct');
        }
    }

    // パズルが完成したかチェック
    function checkPuzzleComplete() {
        const isComplete = pieces.every(piece => {
            return piece.element.classList.contains('correct');
        });
        
        if (isComplete) {
            messageElement.textContent = 'おめでとうございます！パズルが完成しました！';
        }
    }
}); 