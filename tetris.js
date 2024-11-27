const blockSize = 20, gameWidth = 300, gameHeight = 500, GAME_SPEED = 500;
const gameArea = document.getElementById('game-area');

// Canvas 與遊戲初始化
const canvas = document.createElement('canvas');
canvas.width = gameWidth;
canvas.height = gameHeight;
canvas.style.border = '2px solid black';
canvas.style.position = 'relative';
gameArea.appendChild(canvas);
const ctx = canvas.getContext('2d');

// 遊戲狀態
let gameBoard = Array.from({ length: gameHeight / blockSize }, () => 
    Array.from({ length: gameWidth / blockSize }, () => ({ filled: false, color: null }))
);
let currentBlock = null;
let gameOver = false;
let score = 0;

const SHAPES = {
    L: [[1, 0, 0], [1, 1, 1]],
    T: [[0, 1, 0], [1, 1, 1]],
    S: [[0, 1, 1], [1, 1, 0]],
    O: [[1, 1], [1, 1]],
    I: [[1, 1, 1, 1]],
};

// 工具函數
function updateScoreDisplay() {
    const scoreDisplay = document.getElementById('score-display');
    scoreDisplay.textContent = `分數 \n${score}`;
}

function createGrid() {
    for (let x = 0; x <= gameWidth; x += blockSize) {
        ctx.strokeStyle = 'lightgray';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, gameHeight);
        ctx.stroke();
    }
    for (let y = 0; y <= gameHeight; y += blockSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(gameWidth, y);
        ctx.stroke();
    }
}

function generateRandomColor() {
    const letters = '0123456789ABCDEF';
    return `#${Array.from({ length: 6 }).map(() => letters[Math.floor(Math.random() * 16)]).join('')}`;
}

// 方塊操作
function createBlock() {
    const shapeKeys = Object.keys(SHAPES);
    const shape = SHAPES[shapeKeys[Math.floor(Math.random() * shapeKeys.length)]];
    let x = Math.floor((gameWidth / 2 - shape[0].length * blockSize / 2) / blockSize) * blockSize;
    let y = 0;
    const color = generateRandomColor();

    const newBlock = { shape, x, y, color };

    // 嘗試放置方塊，如果無法放置，重新生成
    while (!isValidMove(newBlock, x, y)) {
        x = Math.floor((gameWidth / 2 - shape[0].length * blockSize / 2) / blockSize) * blockSize;
        y = 0;
        newBlock.x = x;
        newBlock.y = y;
    }

    if (!isValidMove(newBlock, x, y)) {
        gameOver = true;
        alert('遊戲結束');
        clearInterval(gameLoop);
        return null;
    }

    return newBlock;
}

function drawBlock(block) {
    // 清除整個畫布
    ctx.clearRect(0, 0, gameWidth, gameHeight);

    // 重新繪製網格
    createGrid();

    // 繪製已鎖定的方塊
    drawGameBoard();

    // 繪製當前移動的方塊
    block.shape.forEach((row, i) => {
        row.forEach((cell, j) => {
            if (cell) {
                ctx.fillStyle = block.color;
                ctx.fillRect(block.x + j * blockSize, block.y + i * blockSize, blockSize, blockSize);

                // 添加方塊邊框
                ctx.strokeStyle = 'black';
                ctx.strokeRect(block.x + j * blockSize, block.y + i * blockSize, blockSize, blockSize);
            }
        });
    });
}

function moveBlock(direction = 'down') {
    if (gameOver) return;

    const [dx, dy] = direction === 'left' ? [-1, 0] :
        direction === 'right' ? [1, 0] :
        [0, 1];

    const newX = currentBlock.x + dx * blockSize;
    const newY = currentBlock.y + dy * blockSize;

    if (isValidMove(currentBlock, newX, newY)) {
        currentBlock.x = newX;
        currentBlock.y = newY;
        drawBlock(currentBlock);
    } else if (direction === 'down') {
        lockBlock();
        clearFullRows();
        currentBlock = createBlock();
        drawBlock(currentBlock);
    }
}

// 邏輯與檢測
function isValidMove(block, newX, newY) {
    for (let i = 0; i < block.shape.length; i++) {
        for (let j = 0; j < block.shape[i].length; j++) {
            if (block.shape[i][j]) {
                const boardX = Math.floor((newX + j * blockSize) / blockSize);
                const boardY = Math.floor((newY + i * blockSize) / blockSize);
                if (boardX < 0 || boardX >= gameWidth / blockSize || boardY >= gameHeight / blockSize || gameBoard[boardY]?.[boardX].filled) {
                    return false;
                }
            }
        }
    }
    return true;
}

function lockBlock() {
    currentBlock.shape.forEach((row, i) => {
        row.forEach((cell, j) => {
            if (cell) {
                const boardX = Math.floor((currentBlock.x + j * blockSize) / blockSize);
                const boardY = Math.floor((currentBlock.y + i * blockSize) / blockSize);
                gameBoard[boardY][boardX] = { filled: true, color: currentBlock.color }; // 存儲顏色
            }
        });
    });
}

function rotateBlock() {
    if (gameOver) return;

    // 複製當前的方塊形狀
    const tempShape = currentBlock.shape.map(row => row.slice());

    // 判斷是否為 S 型方塊
    const isSBlock = JSON.stringify(tempShape) === JSON.stringify(SHAPES.S);

    let newShape;
    if (isSBlock) {
        // S 型方塊的特殊旋轉，需要考慮「牆壁踢」
        newShape = [
            [tempShape[1][0], tempShape[0][0]],
            [tempShape[1][1], tempShape[0][1]],
            [0, 1], // 額外的一行用於「牆壁踢」
        ];
    } else {
        // 其他形狀的旋轉，直接轉置矩陣
        newShape = [];
        for (let j = 0; j < tempShape[0].length; j++) {
            newShape.push([]);
            for (let i = tempShape.length - 1; i >= 0; i--) {
                newShape[j].push(tempShape[i][j]);
            }
        }
    }

    // 檢查旋轉後的方塊是否合法，考慮「牆壁踢」
    const newX = currentBlock.x;
    let newY = currentBlock.y;

    // 如果是 S 型方塊且旋轉後不合法，嘗試向下移動一格
    if (isSBlock && !isValidMove({ shape: newShape }, newX, newY)) {
        newY += blockSize;
    }

    if (isValidMove({ shape: newShape }, newX, newY)) {
        // 更新方塊形狀並重新繪製
        currentBlock.shape = newShape;
        drawBlock(currentBlock);
    }
}
function clearFullRows() {
    let rowsCleared = 0;
    for (let y = gameBoard.length - 1; y >= 0; y--) {
        if (gameBoard[y].every(cell => cell.filled)) {
            gameBoard.splice(y, 1);
            gameBoard.unshift(Array.from({ length: gameWidth / blockSize }, () => ({ filled: false, color: null })));
            rowsCleared++;
            y++;
        }
    }

    if (rowsCleared > 0) {
        score += rowsCleared * 10;
        updateScoreDisplay();
        
        ctx.clearRect(0, 0, gameWidth, gameHeight);
        createGrid();
        drawGameBoard();
        drawBlock(currentBlock);
    }
}

// 繪製整個遊戲畫面
function drawGameBoard() {
    for (let y = 0; y < gameBoard.length; y++) {
        for (let x = 0; x < gameBoard[y].length; x++) {
            if (gameBoard[y][x].filled) {
                ctx.fillStyle = gameBoard[y][x].color; // 使用存儲的顏色
                ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
                ctx.strokeStyle = 'black';
                ctx.strokeRect(x * blockSize, y * blockSize, blockSize, blockSize);
            }
        }
    }
}
function createGrid() {
    ctx.strokeStyle = 'lightgray';
    ctx.lineWidth = 0.5;
    
    // 垂直线
    for (let x = 0; x <= gameWidth; x += blockSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, gameHeight);
        ctx.stroke();
    }
    
    // 水平线
    for (let y = 0; y <= gameHeight; y += blockSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(gameWidth, y);
        ctx.stroke();
    }
}
// 遊戲主循環
currentBlock = createBlock();
if (currentBlock) {
    ctx.clearRect(0, 0, gameWidth, gameHeight); 
    createGrid(); 
    drawGameBoard(); 
    drawBlock(currentBlock);

    const gameLoop = setInterval(() => {
        if (!gameOver) {
            moveBlock('down');
        } else {
            clearInterval(gameLoop);
        }
    }, GAME_SPEED);
}
//const gameLoop = setInterval(() => moveBlock('down'), GAME_SPEED);

document.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') moveBlock('left');
    if (event.key === 'ArrowRight') moveBlock('right');
    if (event.key === 'ArrowDown') moveBlock('down');
    if (event.key === 'ArrowUp') rotateBlock();
});
// ... (原有程式碼)

// 按鈕事件監聽器
const startButton = document.getElementById('startButton');
const leftButton = document.getElementById('leftButton');
const rightButton = document.getElementById('rightButton');
const rotateButton = document.getElementById('rotateButton');
const resetButton = document.getElementById('resetButton');
const pauseButton = document.getElementById('pauseButton');

let isPaused = false;

startButton.addEventListener('click', () => {
    // 開始遊戲的邏輯，例如初始化遊戲狀態、啟動遊戲循環
    startGame();
});

leftButton.addEventListener('click', () => {
    if (!isPaused) {
        moveBlock('left');
    }
});

rightButton.addEventListener('click', () => {
    if (!isPaused) {
        moveBlock('right');
    }
});

rotateButton.addEventListener('click', () => {
    if (!isPaused) {
        rotateBlock();
    }
});

resetButton.addEventListener('click', () => {
    // 重置遊戲的邏輯，例如清空遊戲板、重置分數、重新開始遊戲
    resetGame();
});

pauseButton.addEventListener('click', () => {
    isPaused = !isPaused;
    if (isPaused) {
        clearInterval(gameLoop);
        pauseButton.textContent = '繼續';
    } else {
        gameLoop = setInterval(() => {
            if (!gameOver) {
                moveBlock('down');
            } else {
                clearInterval(gameLoop);
            }
        }, GAME_SPEED);
        pauseButton.textContent = '暫停';
    }
});

// ... (其他函數)

function startGame() {
    // 初始化遊戲狀態
    // ...
    // 啟動遊戲循環
    gameLoop = setInterval(() => {
        if (!gameOver) {
            moveBlock('down');
        } else {
            clearInterval(gameLoop);
        }
    }, GAME_SPEED);
}

function resetGame() {
    // 重置遊戲狀態
    // ...
    // 重新開始遊戲
    startGame();
}