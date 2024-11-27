// 遊戲設定與 DOM 操作
const blockSize = 20, gameWidth = 300, gameHeight = 500, GAME_SPEED = 500;
const gameArea = document.getElementById('game-area');

// SVG 與遊戲初始化
const svg = createSVG(gameWidth, gameHeight);
gameArea.appendChild(svg);

createGrid(svg, gameWidth, gameHeight, blockSize);

// 形狀定義
const SHAPES = {
    L: [[1, 0, 0], [1, 1, 1]],
    T: [[0, 1, 0], [1, 1, 1]],
    S: [[0, 1, 1], [1, 1, 0]], 
    O: [[1, 1], [1, 1]],
    I: [[1, 1, 1, 1]],
};

// 遊戲狀態
let gameBoard = Array.from({ length: gameHeight / blockSize }, () => Array(gameWidth / blockSize).fill(0));
let currentBlock = null;
let gameOver = false;
let score = 0;

// 工具函數
function createSVG(width, height) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('style', 'border: 2px solid black; position: relative;');
    return svg;
}
function updateScoreDisplay() {
  const scoreDisplay = document.getElementById('score-display');
  scoreDisplay.textContent = `分數 \n${score}`;
}

function createGrid(svg, width, height, blockSize) {
    for (let x = 0; x <= width; x += blockSize) {
        svg.appendChild(createLine(x, 0, x, height));
    }
    for (let y = 0; y <= height; y += blockSize) {
        svg.appendChild(createLine(0, y, width, y));
    }
}

function createLine(x1, y1, x2, y2) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('stroke', 'lightgray');
    line.setAttribute('stroke-width', '0.5');
    return line;
}

function generateRandomColor() {
    const letters = '0123456789ABCDEF';
    return `#${Array.from({ length: 6 }).map(() => letters[Math.floor(Math.random() * 16)]).join('')}`;
}

// 方塊操作
function createBlock() {
    const shapeKeys = Object.keys(SHAPES);
    const shape = SHAPES[shapeKeys[Math.floor(Math.random() * shapeKeys.length)]];
    const x = Math.floor((gameWidth / 2 - shape[0].length * blockSize / 2) / blockSize) * blockSize;
    const y = 0;
    const color = generateRandomColor();

    const newBlock = { shape, x, y, color, rects: [] };

    if (!isValidMove(newBlock, x, y)) {
        gameOver = true;
        alert('Game Over');
        clearInterval(gameLoop);
    }

    return newBlock;
}

function drawBlock(block) {
    // 清除舊的方塊
    block.rects.forEach(row => row.forEach(rect => rect && svg.removeChild(rect)));
    block.rects = [];

    block.shape.forEach((row, i) => {
        block.rects[i] = [];
        row.forEach((cell, j) => {
            if (cell) {
                const rect = createRect(block.x + j * blockSize, block.y + i * blockSize, block.color);
                svg.appendChild(rect);
                block.rects[i][j] = rect;
            }
        });
    });
}

function createRect(x, y, color) {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('width', blockSize);
    rect.setAttribute('height', blockSize);
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('fill', color);
    rect.setAttribute('stroke', 'black');
    return rect;
}

// 移動方塊
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
                if (boardX < 0 || boardX >= gameWidth / blockSize || boardY >= gameHeight / blockSize || gameBoard[boardY]?.[boardX]) {
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
                gameBoard[boardY][boardX] = 1;
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
    for (let y = gameBoard.length - 1; y >= 0; y--) {
        if (gameBoard[y].every(cell => cell === 1)) {
            gameBoard.splice(y, 1);
            gameBoard.unshift(Array(gameWidth / blockSize).fill(0));
            score += 10; // 每清除一行加 10 分
            updateScoreDisplay()

            Array.from(svg.querySelectorAll('rect')).forEach(rect => {
                const rectY = parseInt(rect.getAttribute('y'));
                if (rectY === y * blockSize) {
                    svg.removeChild(rect);
                } else if (rectY < y * blockSize) {
                    rect.setAttribute('y', rectY + blockSize);
                }
            }
            
            );

            y++;
        }
    }
}

// 遊戲主循環
currentBlock = createBlock();
drawBlock(currentBlock);

const gameLoop = setInterval(() => moveBlock('down'), GAME_SPEED);

document.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') moveBlock('left');
    if (event.key === 'ArrowRight') moveBlock('right');
    if (event.key === 'ArrowDown') moveBlock('down');
    if (event.key === 'ArrowUp') rotateBlock();
});
