document.addEventListener('DOMContentLoaded', () => {
    // DOM要素の取得
    const imageUpload = document.getElementById('imageUpload');
    const startButton = document.getElementById('startButton');
    const restartButton = document.getElementById('restartButton');
    const difficultySelect = document.getElementById('difficultySelect');
    const puzzle = document.getElementById('puzzle');
    const previewImage = document.getElementById('previewImage');
    const messageElement = document.getElementById('message');
    const timerDisplay = document.getElementById('timerDisplay');
    const timerBar = document.getElementById('timerBar');
    const timerElement = document.querySelector('.timer');

    // ゲーム状態を管理する変数
    let uploadedImage = null;
    let pieces = [];
    let correctPositions = [];
    let gridSize = 4; // デフォルトは4x4
    let selectedPiece = null;
    let isDragging = false;
    let dragStartX, dragStartY;
    let offsetX, offsetY;
    let completedPieces = 0;
    let timerInterval = null;
    let timeLeft = 180; // 3分（180秒）
    let isGameActive = false;
    let puzzleSize = 0;
    let pieceSize = 0;

    // イベントリスナーの設定
    imageUpload.addEventListener('change', handleImageUpload);
    startButton.addEventListener('click', startPuzzle);
    restartButton.addEventListener('click', startPuzzle);
    difficultySelect.addEventListener('change', () => {
        gridSize = parseInt(difficultySelect.value);
    });
    
    // ウィンドウリサイズ時にパズルサイズを再計算
    window.addEventListener('resize', () => {
        if (pieces.length > 0) {
            recalculatePuzzleSize();
        }
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
                
                // アップロード成功アニメーション
                previewImage.style.opacity = '0';
                setTimeout(() => {
                    previewImage.style.opacity = '1';
                    previewImage.style.transform = 'scale(1.05)';
                    setTimeout(() => {
                        previewImage.style.transform = 'scale(1)';
                    }, 300);
                }, 100);
            };
            uploadedImage.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }

    // パズルサイズを再計算
    function recalculatePuzzleSize() {
        puzzleSize = puzzle.offsetWidth;
        pieceSize = puzzleSize / gridSize;
        
        // 各ピースのサイズと背景サイズを更新
        pieces.forEach((piece, index) => {
            const x = index % gridSize;
            const y = Math.floor(index / gridSize);
            
            piece.element.style.width = `${pieceSize}px`;
            piece.element.style.height = `${pieceSize}px`;
            piece.element.style.backgroundSize = `${puzzleSize}px ${puzzleSize}px`;
            piece.element.style.backgroundPosition = `-${x * pieceSize}px -${y * pieceSize}px`;
            
            // 正しい位置情報も更新
            piece.correctX = x * pieceSize;
            piece.correctY = y * pieceSize;
            
            // 現在の位置をグリッドに合わせて調整
            if (!isDragging || piece !== selectedPiece) {
                piece.x = Math.round(piece.x / pieceSize) * pieceSize;
                piece.y = Math.round(piece.y / pieceSize) * pieceSize;
                updatePiecePosition(piece);
            }
        });
        
        // 正しい位置の配列も更新
        correctPositions = [];
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                correctPositions.push({ x: x * pieceSize, y: y * pieceSize });
            }
        }
    }

    // パズル開始処理
    function startPuzzle() {
        if (!uploadedImage) return;
        
        // タイマーをリセット
        stopTimer();
        resetTimer();
        
        // パズルをリセット
        puzzle.innerHTML = '';
        pieces = [];
        correctPositions = [];
        completedPieces = 0;
        restartButton.disabled = false;
        messageElement.textContent = '';
        isGameActive = true;
        
        // パズルのサイズを設定
        puzzleSize = puzzle.offsetWidth;
        pieceSize = puzzleSize / gridSize;
        
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
                piece.style.opacity = '0';
                piece.style.transform = 'scale(0.8)';
                
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
                
                // ピースのアニメーション登場（遅延付き）
                setTimeout(() => {
                    piece.style.opacity = '1';
                    piece.style.transform = 'scale(1)';
                }, 50 * pieceIndex);
            }
        }
        
        // パズルピースをシャッフル（アニメーション後）
        setTimeout(() => {
            shufflePieces();
            // タイマー開始
            startTimer();
        }, 50 * pieces.length + 500);
        
        // マウス/タッチイベントを追加
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        document.addEventListener('touchmove', onTouchMove, { passive: false });
        document.addEventListener('touchend', onTouchEnd);
    }

    // タイマー開始
    function startTimer() {
        timerInterval = setInterval(updateTimer, 1000);
        updateTimerDisplay();
    }
    
    // タイマー停止
    function stopTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }
    
    // タイマーリセット
    function resetTimer() {
        timeLeft = 180; // 3分
        updateTimerDisplay();
        timerBar.style.width = '100%';
        timerElement.classList.remove('timer-warning', 'timer-danger');
    }
    
    // タイマー更新
    function updateTimer() {
        if (timeLeft > 0) {
            timeLeft--;
            updateTimerDisplay();
            
            // プログレスバー更新
            const percentage = (timeLeft / 180) * 100;
            timerBar.style.width = `${percentage}%`;
            
            // 残り時間に応じた警告表示
            if (timeLeft <= 30 && timeLeft > 10) {
                timerElement.classList.add('timer-warning');
                timerElement.classList.remove('timer-danger');
            } else if (timeLeft <= 10) {
                timerElement.classList.remove('timer-warning');
                timerElement.classList.add('timer-danger');
            }
        } else {
            // 時間切れ
            stopTimer();
            gameOver();
        }
    }
    
    // タイマー表示更新
    function updateTimerDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // ゲームオーバー処理
    function gameOver() {
        if (!isGameActive) return;
        
        isGameActive = false;
        messageElement.textContent = '時間切れです！もう一度チャレンジしましょう！';
        messageElement.style.color = 'transparent';
        messageElement.style.background = 'linear-gradient(45deg, #ff5252, #ffcc00)';
        messageElement.style.backgroundClip = 'text';
        messageElement.style.webkitBackgroundClip = 'text';
        messageElement.style.opacity = '0';
        
        // 効果アニメーション
        setTimeout(() => {
            messageElement.style.opacity = '1';
            messageElement.style.transform = 'scale(1.2)';
            setTimeout(() => {
                messageElement.style.transform = 'scale(1)';
            }, 300);
        }, 200);
        
        // ピースを一時的に無効化
        pieces.forEach(piece => {
            piece.element.style.opacity = '0.5';
            piece.element.style.pointerEvents = 'none';
        });
    }

    // パズルピースをシャッフル
    function shufflePieces() {
        const positions = [...correctPositions];
        
        // Fisher-Yatesアルゴリズムでシャッフル
        for (let i = positions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [positions[i], positions[j]] = [positions[j], positions[i]];
        }
        
        // シャッフルした位置に配置（アニメーション付き）
        pieces.forEach((piece, index) => {
            // シャッフル前に一瞬浮かせる
            piece.element.style.transform = 'scale(0.95) translateZ(20px)';
            piece.element.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.5)';
            piece.element.style.zIndex = '50';
            
            setTimeout(() => {
                piece.x = positions[index].x;
                piece.y = positions[index].y;
                
                // アニメーションで新しい位置に移動
                piece.element.style.transition = 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                updatePiecePosition(piece);
                
                // アニメーション終了後に通常状態に戻す
                setTimeout(() => {
                    piece.element.style.transform = '';
                    piece.element.style.boxShadow = '';
                    piece.element.style.zIndex = '10';
                    piece.element.style.transition = 'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.2s ease';
                    piece.element.classList.remove('correct');
                }, 500);
            }, 100);
        });
    }

    // ピースの位置を更新
    function updatePiecePosition(piece) {
        piece.element.style.left = `${piece.x}px`;
        piece.element.style.top = `${piece.y}px`;
    }

    // マウスダウンイベント
    function onPieceMouseDown(e) {
        if (!isGameActive) return;
        e.preventDefault();
        const index = parseInt(this.dataset.index);
        selectedPiece = pieces[index];
        isDragging = true;
        
        // 選択されたピースのz-indexを一時的に上げる
        pieces.forEach(p => {
            p.element.style.zIndex = p === selectedPiece ? 100 : 10;
        });
        
        // ドラッグ開始位置を保存
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        offsetX = selectedPiece.x;
        offsetY = selectedPiece.y;
        
        // 選択されたピースのエフェクト
        this.style.transform = 'scale(1.1)';
        this.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.5), 0 0 15px rgba(66, 220, 219, 0.7)';
        this.style.filter = 'brightness(1.2)';
        
        // ピックアップエフェクト音（オプション）
        playSound('pickup');
    }

    // タッチスタートイベント
    function onPieceTouchStart(e) {
        if (!isGameActive) return;
        e.preventDefault();
        const index = parseInt(this.dataset.index);
        selectedPiece = pieces[index];
        isDragging = true;
        
        // 選択されたピースのz-indexを一時的に上げる
        pieces.forEach(p => {
            p.element.style.zIndex = p === selectedPiece ? 100 : 10;
        });
        
        // ドラッグ開始位置を保存
        const touch = e.touches[0];
        dragStartX = touch.clientX;
        dragStartY = touch.clientY;
        offsetX = selectedPiece.x;
        offsetY = selectedPiece.y;
        
        // 選択されたピースのエフェクト
        this.style.transform = 'scale(1.1)';
        this.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.5), 0 0 15px rgba(66, 220, 219, 0.7)';
        this.style.filter = 'brightness(1.2)';
        
        // ピックアップエフェクト音（オプション）
        playSound('pickup');
    }

    // マウス移動イベント
    function onMouseMove(e) {
        if (!isDragging || !selectedPiece || !isGameActive) return;
        
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
        if (!isDragging || !selectedPiece || !isGameActive) return;
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
        piece.x = Math.max(0, Math.min(piece.x, puzzleSize - pieceSize));
        piece.y = Math.max(0, Math.min(piece.y, puzzleSize - pieceSize));
    }

    // マウスアップイベント
    function onMouseUp() {
        if (!isDragging || !selectedPiece || !isGameActive) return;
        dropPiece();
    }

    // タッチエンドイベント
    function onTouchEnd() {
        if (!isDragging || !selectedPiece || !isGameActive) return;
        dropPiece();
    }

    // ピースをドロップする処理
    function dropPiece() {
        // ドロップした位置に最も近いグリッドにスナップ
        snapToGrid(selectedPiece);
        
        // 他のピースと重ならないようにする
        const hasOverlap = preventOverlap(selectedPiece);
        
        // 重なりがあった場合は、再度スナップ処理
        if (hasOverlap) {
            setTimeout(() => {
                snapToGrid(selectedPiece);
            }, 50);
        }
        
        // 正しい位置にあるかチェック
        const wasCorrect = checkCorrectPosition(selectedPiece);
        
        // ドロップ時のエフェクトを明示的にリセット
        selectedPiece.element.style.transform = '';
        selectedPiece.element.style.boxShadow = '';
        selectedPiece.element.style.filter = '';
        selectedPiece.element.style.transition = 'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.2s ease';
        
        if (wasCorrect) {
            // 正解エフェクト
            setTimeout(() => {
                selectedPiece.element.style.transition = 'all 0.3s cubic-bezier(0.68, -0.6, 0.32, 1.6)';
                selectedPiece.element.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    selectedPiece.element.style.transform = '';
                    selectedPiece.element.style.transition = 'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.2s ease';
                }, 300);
            }, 10);
            playSound('correct');
        } else {
            // 通常のドロップエフェクト
            playSound('drop');
        }
        
        // ゲーム完了チェック
        checkPuzzleComplete();
        
        // ドラッグ状態をリセット
        selectedPiece = null;
        isDragging = false;
    }

    // グリッドにスナップ
    function snapToGrid(piece) {
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
        let hasOverlap = false;
        
        for (let i = 0; i < pieces.length; i++) {
            if (i !== pieceIndex && pieces[i].x === piece.x && pieces[i].y === piece.y) {
                hasOverlap = true;
                
                // 重なったピースを一時的に浮かせる
                pieces[i].element.style.transform = 'scale(0.9) translateZ(-10px)';
                pieces[i].element.style.zIndex = '5';
                setTimeout(() => {
                    pieces[i].element.style.transform = '';
                    pieces[i].element.style.zIndex = '10';
                }, 300);
                
                // ランダムな隣接セルに移動
                const directions = [
                    { dx: -1, dy: 0 },
                    { dx: 1, dy: 0 },
                    { dx: 0, dy: -1 },
                    { dx: 0, dy: 1 }
                ];
                
                const availableDirections = directions.filter(dir => {
                    const newX = pieces[i].x + dir.dx * pieceSize;
                    const newY = pieces[i].y + dir.dy * pieceSize;
                    
                    // 範囲内かチェック
                    if (newX < 0 || newX >= puzzleSize || newY < 0 || newY >= puzzleSize) {
                        return false;
                    }
                    
                    // 他のピースとの重なりをチェック
                    for (let j = 0; j < pieces.length; j++) {
                        if (j !== i && j !== pieceIndex && 
                            Math.abs(pieces[j].x - newX) < 1 && Math.abs(pieces[j].y - newY) < 1) {
                            return false;
                        }
                    }
                    
                    return true;
                });
                
                if (availableDirections.length > 0) {
                    // 使用可能な方向からランダムに選択
                    const randomDir = availableDirections[Math.floor(Math.random() * availableDirections.length)];
                    pieces[i].x += randomDir.dx * pieceSize;
                    pieces[i].y += randomDir.dy * pieceSize;
                    
                    // アニメーションで移動
                    pieces[i].element.style.transition = 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                    updatePiecePosition(pieces[i]);
                    
                    // アニメーション終了後に遷移を戻す
                    setTimeout(() => {
                        pieces[i].element.style.transition = 'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.2s ease';
                    }, 300);
                }
                
                break;
            }
        }
        
        return hasOverlap;
    }

    // 正しい位置にあるかチェック
    function checkCorrectPosition(piece) {
        const pieceIndex = parseInt(piece.element.dataset.index);
        const tolerance = 5; // 許容誤差（ピクセル）
        const wasCorrectBefore = piece.element.classList.contains('correct');
        
        if (Math.abs(piece.x - piece.correctX) <= tolerance && 
            Math.abs(piece.y - piece.correctY) <= tolerance) {
            // 正しい位置にスナップ
            piece.x = piece.correctX;
            piece.y = piece.correctY;
            updatePiecePosition(piece);
            
            if (!wasCorrectBefore) {
                piece.element.classList.add('correct');
                completedPieces++;
                
                // 進捗表示（オプション）
                const totalPieces = gridSize * gridSize;
                const progressPercentage = Math.floor((completedPieces / totalPieces) * 100);
                console.log(`進捗: ${progressPercentage}% (${completedPieces}/${totalPieces})`);
            }
            return true;
        } else {
            if (wasCorrectBefore) {
                piece.element.classList.remove('correct');
                completedPieces--;
            }
            return false;
        }
    }

    // パズルが完成したかチェック
    function checkPuzzleComplete() {
        const isComplete = pieces.every(piece => {
            return piece.element.classList.contains('correct');
        });
        
        if (isComplete) {
            // タイマーを停止
            stopTimer();
            isGameActive = false;
            
            // 完成時の演出
            messageElement.textContent = 'おめでとうございます！パズルが完成しました！';
            messageElement.style.opacity = '0';
            
            // パズル全体を強調表示
            puzzle.style.boxShadow = '0 0 50px rgba(66, 220, 219, 0.8)';
            puzzle.style.transform = 'scale(1.02)';
            
            // 各ピースに完成エフェクト
            pieces.forEach((piece, index) => {
                setTimeout(() => {
                    piece.element.style.transform = 'scale(1.1)';
                    setTimeout(() => {
                        piece.element.style.transform = '';
                    }, 200);
                }, 50 * index);
            });
            
            // 完成メッセージのフェードイン
            setTimeout(() => {
                messageElement.style.opacity = '1';
                messageElement.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    messageElement.style.transform = 'scale(1)';
                }, 300);
                
                // 完成した音を再生
                playSound('complete');
            }, 500);
        }
    }
    
    // サウンドエフェクト（オプション）
    function playSound(type) {
        // 音を鳴らしたい場合は実装
        // 現時点では実装しないが、希望があれば音声ファイルを用意して実装可能
    }
}); 