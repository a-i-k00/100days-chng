document.addEventListener('DOMContentLoaded', () => {
    // DOM要素の取得
    const startBtn = document.getElementById('start-btn');
    const gameInstructions = document.getElementById('game-instructions');
    const gameArea = document.getElementById('game-area');
    const eraserArea = document.getElementById('eraser-area');
    const resultArea = document.getElementById('result-area');
    const shapesContainer = document.getElementById('shapes-container');
    const eraserCanvas = document.getElementById('eraser-canvas');
    const checkBtn = document.getElementById('check-btn');
    const resetBtn = document.getElementById('reset-btn');
    const playAgainBtn = document.getElementById('play-again-btn');
    const timeLeftSpan = document.getElementById('time-left');
    const targetShapePreview = document.getElementById('target-shape-preview');
    const findShapePreview = document.getElementById('find-shape-preview');
    const resultMessage = document.getElementById('result-message');
    const scoreSpan = document.getElementById('score');

    // ゲーム設定
    const SHAPE_TYPES = ['円', '四角', '三角', '六角形', '星'];
    const SHAPE_COLORS = ['#FF5733', '#33FF57', '#3357FF', '#FF33F5', '#F5FF33', '#33FFF5'];
    const MEMORIZE_TIME = 7; // 覚える時間を7秒に変更
    const SHAPES_COUNT = 12; // 図形の個数を12個に増加
    
    let shapes = []; // 生成された図形の情報を格納する配列
    let targetShape = null; // 探す対象の図形
    let timeLeft = MEMORIZE_TIME; // 残り時間
    let timerInterval = null; // タイマーのinterval ID
    let score = 0; // スコア
    let ctx = null; // キャンバスのコンテキスト
    let isErasing = false; // 消しゴムモードかどうか
    let hiddenShapes = []; // 隠された図形情報を格納する配列

    // ゲーム開始
    startBtn.addEventListener('click', startGame);
    
    // チェックボタン
    checkBtn.addEventListener('click', checkAnswer);
    
    // リセットボタン
    resetBtn.addEventListener('click', resetCanvas);
    
    // もう一度プレイボタン
    playAgainBtn.addEventListener('click', () => {
        resultArea.classList.add('hidden');
        gameInstructions.classList.remove('hidden');
        // スコアはリセットしない（累積スコアとする）
    });

    // ゲーム開始関数
    function startGame() {
        // UIの更新
        gameInstructions.classList.add('hidden');
        gameArea.classList.remove('hidden');
        resultArea.classList.add('hidden');
        
        // 図形を生成
        generateShapes();
        
        // ターゲットの図形を選択
        selectTargetShape();
        
        // タイマー開始
        startTimer();
    }

    // 図形生成関数
    function generateShapes() {
        // 既存の図形をクリア
        shapesContainer.innerHTML = '';
        shapes = [];
        
        // 新しい図形をランダムに生成
        for (let i = 0; i < SHAPES_COUNT; i++) {
            const shapeType = getRandomItem(SHAPE_TYPES);
            const color = getRandomItem(SHAPE_COLORS);
            const size = getRandomNumber(30, 60);
            const x = getRandomNumber(0, shapesContainer.offsetWidth - size);
            const y = getRandomNumber(0, shapesContainer.offsetHeight - size);
            
            // 図形情報を保存
            const shape = {
                type: shapeType,
                color: color,
                size: size,
                x: x,
                y: y
            };
            
            shapes.push(shape);
            
            // 図形要素を作成
            const shapeElement = document.createElement('div');
            shapeElement.className = 'shape';
            shapeElement.style.width = `${size}px`;
            shapeElement.style.height = `${size}px`;
            shapeElement.style.left = `${x}px`;
            shapeElement.style.top = `${y}px`;
            shapeElement.style.backgroundColor = color;
            
            // 図形の種類に応じてスタイルを設定
            setShapeStyle(shapeElement, shapeType, color, size);
            
            shapesContainer.appendChild(shapeElement);
        }
    }

    // 図形のスタイル設定（共通関数）
    function setShapeStyle(element, type, color, size) {
        switch (type) {
            case '円':
                element.style.borderRadius = '50%';
                break;
            case '四角':
                // デフォルトで四角なので何もしない
                break;
            case '三角':
                element.style.width = '0';
                element.style.height = '0';
                element.style.backgroundColor = 'transparent';
                element.style.borderLeft = `${size / 2}px solid transparent`;
                element.style.borderRight = `${size / 2}px solid transparent`;
                element.style.borderBottom = `${size}px solid ${color}`;
                break;
            case '六角形':
                element.style.clipPath = 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';
                break;
            case '星':
                element.style.clipPath = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
                break;
        }
    }

    // プレビュー図形の作成
    function createShapePreview(container, shape) {
        // 既存の内容をクリア
        container.innerHTML = '';
        
        // プレビュー用の図形要素を作成
        const previewElement = document.createElement('div');
        previewElement.style.width = '100%';
        previewElement.style.height = '100%';
        previewElement.style.backgroundColor = shape.color;
        previewElement.style.position = 'absolute';
        previewElement.style.top = '0';
        previewElement.style.left = '0';
        
        // 図形の種類に応じたスタイルを設定
        setShapeStyle(previewElement, shape.type, shape.color, 50);
        
        container.appendChild(previewElement);
    }

    // ターゲット図形選択関数
    function selectTargetShape() {
        targetShape = getRandomItem(shapes);
        // ターゲット図形のプレビューを作成
        createShapePreview(targetShapePreview, targetShape);
        createShapePreview(findShapePreview, targetShape);
    }

    // タイマー開始関数
    function startTimer() {
        timeLeft = MEMORIZE_TIME;
        timeLeftSpan.textContent = timeLeft;
        
        timerInterval = setInterval(() => {
            timeLeft--;
            timeLeftSpan.textContent = timeLeft;
            
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                switchToEraserMode();
            }
        }, 1000);
    }

    // 消しゴムモードに切り替え
    function switchToEraserMode() {
        gameArea.classList.add('hidden');
        eraserArea.classList.remove('hidden');
        
        // キャンバスの初期化
        setupCanvas();
    }

    // キャンバス初期化
    function setupCanvas() {
        eraserCanvas.width = shapesContainer.offsetWidth;
        eraserCanvas.height = shapesContainer.offsetHeight;
        ctx = eraserCanvas.getContext('2d');
        
        // 背景レイヤーを作成（灰色の背景）
        const backgroundLayer = document.createElement('canvas');
        backgroundLayer.width = eraserCanvas.width;
        backgroundLayer.height = eraserCanvas.height;
        const bgCtx = backgroundLayer.getContext('2d');
        bgCtx.fillStyle = 'rgba(80, 80, 80, 0.95)';
        bgCtx.fillRect(0, 0, backgroundLayer.width, backgroundLayer.height);
        
        // 図形レイヤーを作成
        const shapesLayer = document.createElement('canvas');
        shapesLayer.width = eraserCanvas.width;
        shapesLayer.height = eraserCanvas.height;
        drawShapesOnLayer(shapesLayer);
        
        // 最初は図形の上に背景を重ねる
        ctx.drawImage(shapesLayer, 0, 0); // 図形を描画
        ctx.drawImage(backgroundLayer, 0, 0); // 背景で覆う
        
        // マウスイベントの設定
        eraserCanvas.addEventListener('mousedown', startErasing);
        eraserCanvas.addEventListener('mousemove', erase);
        eraserCanvas.addEventListener('mouseup', stopErasing);
        eraserCanvas.addEventListener('mouseleave', stopErasing);
        
        // タッチイベントの設定（モバイル対応）
        eraserCanvas.addEventListener('touchstart', handleTouchStart);
        eraserCanvas.addEventListener('touchmove', handleTouchMove);
        eraserCanvas.addEventListener('touchend', handleTouchEnd);
    }

    // 図形レイヤーに図形を描画
    function drawShapesOnLayer(canvas) {
        const layerCtx = canvas.getContext('2d');
        hiddenShapes = [];
        
        // 全ての図形を描画
        shapes.forEach(shape => {
            layerCtx.save();
            layerCtx.fillStyle = shape.color;
            
            // 図形の種類に応じて描画
            switch (shape.type) {
                case '円':
                    layerCtx.beginPath();
                    layerCtx.arc(shape.x + shape.size / 2, shape.y + shape.size / 2, shape.size / 2, 0, Math.PI * 2);
                    layerCtx.fill();
                    // 光る効果を追加
                    layerCtx.shadowBlur = 10;
                    layerCtx.shadowColor = shape.color;
                    layerCtx.stroke();
                    break;
                case '四角':
                    layerCtx.fillRect(shape.x, shape.y, shape.size, shape.size);
                    // 光る効果を追加
                    layerCtx.shadowBlur = 10;
                    layerCtx.shadowColor = shape.color;
                    layerCtx.strokeRect(shape.x, shape.y, shape.size, shape.size);
                    break;
                case '三角':
                    layerCtx.beginPath();
                    layerCtx.moveTo(shape.x + shape.size / 2, shape.y);
                    layerCtx.lineTo(shape.x + shape.size, shape.y + shape.size);
                    layerCtx.lineTo(shape.x, shape.y + shape.size);
                    layerCtx.closePath();
                    layerCtx.fill();
                    // 光る効果を追加
                    layerCtx.shadowBlur = 10;
                    layerCtx.shadowColor = shape.color;
                    layerCtx.stroke();
                    break;
                case '六角形':
                    layerCtx.beginPath();
                    const hexRadius = shape.size / 2;
                    const hexCenterX = shape.x + hexRadius;
                    const hexCenterY = shape.y + hexRadius;
                    for (let i = 0; i < 6; i++) {
                        const angle = (Math.PI / 3) * i;
                        const hx = hexCenterX + hexRadius * Math.cos(angle);
                        const hy = hexCenterY + hexRadius * Math.sin(angle);
                        if (i === 0) layerCtx.moveTo(hx, hy);
                        else layerCtx.lineTo(hx, hy);
                    }
                    layerCtx.closePath();
                    layerCtx.fill();
                    // 光る効果を追加
                    layerCtx.shadowBlur = 10;
                    layerCtx.shadowColor = shape.color;
                    layerCtx.stroke();
                    break;
                case '星':
                    layerCtx.beginPath();
                    const starRadius = shape.size / 2;
                    const starCenterX = shape.x + starRadius;
                    const starCenterY = shape.y + starRadius;
                    for (let i = 0; i < 10; i++) {
                        const angle = (Math.PI / 5) * i - Math.PI / 2;
                        const radius = i % 2 === 0 ? starRadius : starRadius / 2;
                        const sx = starCenterX + radius * Math.cos(angle);
                        const sy = starCenterY + radius * Math.sin(angle);
                        if (i === 0) layerCtx.moveTo(sx, sy);
                        else layerCtx.lineTo(sx, sy);
                    }
                    layerCtx.closePath();
                    layerCtx.fill();
                    // 光る効果を追加
                    layerCtx.shadowBlur = 10;
                    layerCtx.shadowColor = shape.color;
                    layerCtx.stroke();
                    break;
            }
            
            layerCtx.restore();
            
            // 図形情報を保存（位置チェック用）
            hiddenShapes.push({
                ...shape,
                centerX: shape.x + shape.size / 2,
                centerY: shape.y + shape.size / 2
            });
        });
    }

    // 消しゴム開始
    function startErasing(e) {
        isErasing = true;
        erase(e);
    }

    // 消しゴム
    function erase(e) {
        if (!isErasing) return;
        
        const x = e.clientX - eraserCanvas.getBoundingClientRect().left;
        const y = e.clientY - eraserCanvas.getBoundingClientRect().top;
        
        // 背景だけを消す（下の図形が見えるようになる）
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.fill();
    }

    // 消しゴム停止
    function stopErasing() {
        isErasing = false;
    }

    // タッチイベントハンドラ
    function handleTouchStart(e) {
        e.preventDefault();
        isErasing = true;
        const touch = e.touches[0];
        erase({
            clientX: touch.clientX,
            clientY: touch.clientY
        });
    }

    function handleTouchMove(e) {
        e.preventDefault();
        if (!isErasing) return;
        const touch = e.touches[0];
        erase({
            clientX: touch.clientX,
            clientY: touch.clientY
        });
    }

    function handleTouchEnd(e) {
        e.preventDefault();
        stopErasing();
    }

    // キャンバスリセット
    function resetCanvas() {
        // キャンバスを完全に初期化
        setupCanvas();
    }

    // 回答チェック
    function checkAnswer() {
        // ターゲット図形の領域がどれだけ消されているかをチェック
        const targetCenterX = targetShape.x + targetShape.size / 2;
        const targetCenterY = targetShape.y + targetShape.size / 2;
        const radius = targetShape.size / 2;
        
        const imageData = ctx.getImageData(
            targetCenterX - radius, 
            targetCenterY - radius, 
            radius * 2, 
            radius * 2
        );
        
        const data = imageData.data;
        let erasedPixels = 0;
        let totalPixels = 0;
        
        // 図形の領域内で消された（透明な）ピクセルの割合を計算
        for (let i = 0; i < data.length; i += 4) {
            const alpha = data[i + 3];
            if (alpha === 0) {
                erasedPixels++;
            }
            totalPixels++;
        }
        
        const erasedRatio = erasedPixels / totalPixels;
        
        // 結果エリアを表示
        eraserArea.classList.add('hidden');
        resultArea.classList.remove('hidden');
        
        // 正解判定（30%以上消されていれば正解）
        if (erasedRatio > 0.3) {
            resultMessage.textContent = '正解！';
            score++;
            scoreSpan.textContent = score;
        } else {
            resultMessage.textContent = '不正解...';
        }
    }

    // ユーティリティ関数
    function getRandomItem(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    function getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}); 