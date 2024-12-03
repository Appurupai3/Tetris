class AdvancedTetris {
    constructor() {
        // 初始化遊戲畫布與參數
        this.canvas = document.getElementById('game-area');
        this.ctx = this.canvas.getContext('2d');
        this.blockSize = 20; // 方塊大小
        this.gameWidth = 300; // 遊戲畫面寬度
        this.gameHeight = 500; // 遊戲畫面高度
        this.rows = this.gameHeight / this.blockSize; // 行數
        this.cols = this.gameWidth / this.blockSize; // 列數
        this.gameBoard = this.createEmptyBoard(); // 遊戲板初始化
        this.currentBlock = null; // 當前方塊
        this.selectedBlock = null; // 被選中的方塊
        this.gameOver = true; // 遊戲是否結束
        this.isOpeningAnimation = true; // 是否播放開場動畫
        this.score = 0; // 分數
        this.gameSpeed = 1000; // 初始遊戲速度
        this.specialBlocks = this.create2024Blocks(); // 特殊方塊（2024字樣）
        this.currentSpecialBlock = null; // 當前特殊方塊
        this.permanentGrid = []; // 儲存永久格子狀態
        this.blockState = { // 方塊狀態
            ALIVE: 'alive',      // 活動中
            DRAGGING: 'dragging', // 拖曳中
            DEAD: 'dead'          // 落地後靜止
        };
        this.currentBlockStatus = this.blockState.ALIVE; // 當前方塊狀態
        this.setupEventListeners(); // 設定鍵盤與按鈕事件
        this.setupPermanentGrid(); // 初始化永久格子
        this.setupMouseSelection(); // 設定滑鼠拖曳事件
        this.isDragging = false;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;
    }

    createEmptyBoard() {
        // 建立空白的遊戲板
        return Array.from({ length: this.rows }, () =>
            Array.from({ length: this.cols }, () => ({ filled: false, color: null }))
        );
    }

    setupEventListeners() {
        // 設定鍵盤與按鈕事件
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        document.getElementById('leftButton').addEventListener('click', () => this.moveBlock('left'));
        document.getElementById('rightButton').addEventListener('click', () => this.moveBlock('right'));
        document.getElementById('rotateButton').addEventListener('click', () => this.rotateBlock());
        document.getElementById('startButton').addEventListener('click', () => this.startGame());
        document.getElementById('pauseButton').addEventListener('click', () => this.togglePause());
        document.getElementById('resetButton').addEventListener('click', () => this.resetGame());
        this.setupSpeedControl(); // 設定速度控制
    }

    setupMouseSelection() {
        // 設定滑鼠相關事件
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    }

    startGame() {
        // 開始遊戲
        if (!this.gameOver) return;
        this.drawOpeningAnimation(); // 播放開場動畫
        this.score = 0; // 重置分數
        this.gameBoard = this.createEmptyBoard(); // 清空遊戲板
        this.createBlock(); // 創建新方塊
        document.getElementById('score-display').textContent = `分數: ${this.score}`;
    }

    resetGame() {
        // 重置遊戲
        this.startGame();
    }

    togglePause() {
        // 暫停或繼續遊戲
        this.gameOver = !this.gameOver;
        if (!this.gameOver) this.gameLoop();
    }

    gameLoop() {
        // 只有在遊戲未結束、不是開場動畫、且當前方塊不在拖曳中時才下落
        if (this.gameOver || 
            this.isOpeningAnimation) return;
    
        this.moveBlock('down'); // 方塊向下移動
        this.draw(); // 繪製畫面
        setTimeout(this.gameLoop.bind(this), this.gameSpeed); // 根據速度調整循環頻率
    }

    createBlock() {
        // 創建隨機形狀的方塊
        const shapes = [
            [[1, 1, 1, 1]], // I 形狀
            [[1, 1], [1, 1]], // O 形狀
            [[0, 1, 1], [1, 1, 0]], // S 形狀
            [[1, 1, 0], [0, 1, 1]], // Z 形狀
            [[1, 0, 0], [1, 1, 1]], // L 形狀
            [[0, 0, 1], [1, 1, 1]], // J 形狀
            [[0, 1, 0], [1, 1, 1]]  // T 形狀
        ];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        const color = this.generateRandomColor(); // 隨機顏色

        this.currentBlock = {
            shape,
            x: Math.floor(this.cols / 2 - shape[0].length / 2),
            y: 0,
            color,
            status: this.blockState.ALIVE // 初始狀態為活動
        };

        if (!this.isValidMove(this.currentBlock, this.currentBlock.x, this.currentBlock.y)) {
            // 無法生成新方塊時結束遊戲
            this.gameOver = true;
            alert('遊戲結束！你的分數是：' + this.score);
        }
    }
    setupPermanentGrid() {
        // Create a 2D array to represent the permanent grid
        this.permanentGrid = [];
        for (let row = 0; row < this.rows; row++) {
          this.permanentGrid[row] = [];
          for (let col = 0; col < this.cols; col++) {
            this.permanentGrid[row][col] = false; // Initially all cells are empty
          }
        }
      }

    moveBlock(direction) {
        if (this.gameOver) return;

        let newX = this.currentBlock.x;
        let newY = this.currentBlock.y;

        switch (direction) {
            case 'left':
                newX--;
                break;
            case 'right':
                newX++;
                break;
            case 'down':
                newY++;
                break;
        }

        if (this.isValidMove(this.currentBlock, newX, newY)) {
            this.currentBlock.x = newX;
            this.currentBlock.y = newY;
        } else if (direction === 'down') {
            this.lockBlock();
            this.clearLines();
            this.createBlock();
        }

        this.draw();
    }

    rotateBlock() {
        if (this.gameOver) return;
    
        const rotatedShape = this.currentBlock.shape[0].map((_, index) =>
            this.currentBlock.shape.map(row => row[index]).reverse()
        );
    
        // 保留原方塊的顏色和位置信息
        const originalColor = this.currentBlock.color;
        const newX = this.currentBlock.x;
        const newY = this.currentBlock.y;
    
        // 嘗試向左、右、下調整位置，尋找合法的旋轉位置
        for (let i = 0; i < 4; i++) {
            const potentialBlock = {
                shape: rotatedShape,
                x: newX,
                y: newY,
                color: originalColor,  // 保留原顏色
                status: this.currentBlock.status  // 保留原狀態
            };
    
            if (this.isValidMove(potentialBlock, newX, newY)) {
                this.currentBlock = potentialBlock;
                break;
            }
    
            // 後續調整位置的邏輯保持不變
            newX++;
            if (this.isValidMove(potentialBlock, newX, newY)) {
                this.currentBlock = potentialBlock;
                break;
            }
    
            newX--;
            newY++;
            if (this.isValidMove(potentialBlock, newX, newY)) {
                this.currentBlock = potentialBlock;
                break;
            }
    
            // 如果都無法合法旋轉，恢復原狀
            newX--;
            newY--;
            rotatedShape.reverse();
            for (let j = 0; j < rotatedShape.length; j++) {
                rotatedShape[j].reverse();
            }
        }
    
        this.draw();
    }
    drawGameOverAnimation() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);
        
        this.ctx.fillStyle = 'red';
        this.ctx.font = 'bold 40px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.gameWidth / 2, this.gameHeight / 2);
    }
    setupSpeedControl() {
        document.getElementById('increaseSpeed').addEventListener('click', () => {
            if (this.gameSpeed > 100) this.gameSpeed -= 50;
        });

        document.getElementById('decreaseSpeed').addEventListener('click', () => {
            this.gameSpeed += 50;
        });
    }
    highlightSelectedBlock() {
        if (this.selectedBlock) {
            this.ctx.strokeStyle = 'red';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(
                this.selectedBlock.x * this.blockSize,
                this.selectedBlock.y * this.blockSize,
                this.selectedBlock.shape[0].length * this.blockSize,
                this.selectedBlock.shape.length * this.blockSize
            );
        }
    }
    

    isValidMove(block, newX, newY) {
        for (let y = 0; y < block.shape.length; y++) {
            for (let x = 0; x < block.shape[y].length; x++) {
                if (!block.shape[y][x]) continue;

                const boardX = newX + x;
                const boardY = newY + y;

                if (boardX < 0 || boardX >= this.cols || boardY >= this.rows) return false;
                if (boardY >= 0 && this.gameBoard[boardY][boardX].filled) return false;
            }
        }
        return true;
    }


    lockBlock() {
        for (let y = 0; y < this.currentBlock.shape.length; y++) {
            for (let x = 0; x < this.currentBlock.shape[y].length; x++) {
                if (this.currentBlock.shape[y][x]) {
                    const boardX = this.currentBlock.x + x;
                    const boardY = this.currentBlock.y + y;
                    if (boardY >= 0) {
                        this.gameBoard[boardY][boardX] = { 
                            filled: true, 
                            color: this.currentBlock.color 
                        };
                    }
                }
            }
        }
        this.currentBlock.status = this.blockState.DEAD;
        this.currentBlockStatus = this.blockState.DEAD;
    }

    clearLines() {
        let linesCleared = 0;
        for (let y = this.rows - 1; y >= 0; y--) {
            if (this.gameBoard[y].every(cell => cell.filled)) {
                this.gameBoard.splice(y, 1);
                this.gameBoard.unshift(Array.from({ length: this.cols }, () => ({ filled: false, color: null })));
                linesCleared++;
                y++;
            }
        }

        if (linesCleared > 0) {
            this.score += linesCleared * 10;
            document.getElementById('score-display').textContent = `分數: ${this.score}`;
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.gameWidth, this.gameHeight);
        this.drawGrid();
        this.drawBoard();
        this.drawCurrentBlock();
        this.highlightSelectedBlock(); // 确保在每次绘制时检查是否需要高亮
    }
    drawGrid() {
        this.ctx.strokeStyle = '#ccc';
        this.ctx.lineWidth = 1;
        for (let x = 0; x <= this.gameWidth; x += this.blockSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.gameHeight);
            this.ctx.stroke();
        }
        for (let y = 0; y <= this.gameHeight; y += this.blockSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.gameWidth, y);
            this.ctx.stroke();
        }
    }
    

    drawBoard() {
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (this.gameBoard[y][x].filled) {
                    this.ctx.fillStyle = this.gameBoard[y][x].color;
                    this.ctx.fillRect(x * this.blockSize, y * this.blockSize, this.blockSize, this.blockSize);
                    this.ctx.strokeStyle = 'black';
                    this.ctx.lineWidth = 2;
                    this.ctx.strokeRect(x * this.blockSize, y * this.blockSize, this.blockSize, this.blockSize);
                }
            }
        }
    }

    drawCurrentBlock() {
        if (!this.currentBlock) return;
        for (let y = 0; y < this.currentBlock.shape.length; y++) {
            for (let x = 0; x < this.currentBlock.shape[y].length; x++) {
                if (this.currentBlock.shape[y][x]) {
                    this.ctx.fillStyle = this.currentBlock.color;
                    this.ctx.fillRect((this.currentBlock.x + x) * this.blockSize, (this.currentBlock.y + y) * this.blockSize, this.blockSize, this.blockSize);
                    this.ctx.strokeStyle = 'black';
                    this.ctx.lineWidth = 2;
                    this.ctx.strokeRect((this.currentBlock.x + x) * this.blockSize, (this.currentBlock.y + y) * this.blockSize, this.blockSize, this.blockSize);
                }
            }
        }
    }

    drawOpeningAnimation() {
        let currentBlockIndex = 0;
        let opacity = 1;
        const animationInterval = setInterval(() => {
            // 清除畫布
            this.ctx.clearRect(0, 0, this.gameWidth, this.gameHeight);
    
            // 繪製網格
            this.drawGrid();
    
            // 設置透明度
            this.ctx.globalAlpha = opacity;
    
            // 當前的特殊方塊
            this.currentSpecialBlock = this.specialBlocks[currentBlockIndex];
    
            // 繪製特殊方塊（使用純色填充）
            this.drawSpecialBlockWithSolidColor(this.currentSpecialBlock);
    
            // 移動方塊
            this.currentSpecialBlock.y += 1;
            opacity -= 0.05;
    
            // 如果方塊超出畫布或透明度歸零，切換到下一個方塊
            if (this.currentSpecialBlock.y > this.rows || opacity <= 0) {
                currentBlockIndex++;
                opacity = 1;
    
                // 重置方塊位置
                this.currentSpecialBlock.y = 0;
            }
    
            // 如果所有方塊完成動畫，停止動畫並開始遊戲
            if (currentBlockIndex >= this.specialBlocks.length) {
                clearInterval(animationInterval);
                this.ctx.globalAlpha = 1;
                this.startGame();
            }
        }, 100);
    }
    

    generateRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
    generateRandomGradientColor() {
    const startColor = this.generateRandomColor();
    const endColor = this.generateRandomColor();
    
    // 創建線性漸層
    const gradient = this.ctx.createLinearGradient(
        0, 0, 
        this.blockSize, this.blockSize
    );
    gradient.addColorStop(0, startColor);
    gradient.addColorStop(1, endColor);
    
    return gradient;  // 返回漸層顏色
}
    isPointInsideBlock(x, y) {
        if (!this.currentBlock) return false;

        for (let blockY = 0; blockY < this.currentBlock.shape.length; blockY++) {
            for (let blockX = 0; blockX < this.currentBlock.shape[blockY].length; blockX++) {
                if (this.currentBlock.shape[blockY][blockX] &&
                    this.currentBlock.x + blockX === x &&
                    this.currentBlock.y + blockY === y) {
                    return true;
                }
            }
        }
        return false;
    }
    drawSpecialBlock(block) {
        for (let y = 0; y < block.shape.length; y++) {
            for (let x = 0; x < block.shape[y].length; x++) {
                if (block.shape[y][x]) {
                    // Set gradient fill
                    this.ctx.fillStyle = block.color;
                    
                    // Draw the block
                    this.ctx.fillRect(
                        (block.x + x) * this.blockSize,
                        (block.y + y) * this.blockSize,
                        this.blockSize,
                        this.blockSize
                    );
                    
                    // Add black border
                    this.ctx.strokeStyle = 'black';
                    this.ctx.lineWidth = 2;
                    this.ctx.strokeRect(
                        (block.x + x) * this.blockSize,
                        (block.y + y) * this.blockSize,
                        this.blockSize,
                        this.blockSize
                    );
                }
            }
        }
    }

    drawSpecialBlockWithSolidColor(block) {
        for (let y = 0; y < block.shape.length; y++) {
            for (let x = 0; x < block.shape[y].length; x++) {
                if (block.shape[y][x]) {
                    // 使用亮色生成器產生顏色
                    this.ctx.fillStyle = this.generateRandomColor();
    
                    // 繪製方塊
                    this.ctx.fillRect(
                        (block.x + x) * this.blockSize,
                        (block.y + y) * this.blockSize,
                        this.blockSize,
                        this.blockSize
                    );
    
                    // 添加黑色邊框
                    this.ctx.strokeStyle = 'black';
                    this.ctx.lineWidth = 2;
                    this.ctx.strokeRect(
                        (block.x + x) * this.blockSize,
                        (block.y + y) * this.blockSize,
                        this.blockSize,
                        this.blockSize
                    );
                }
            }
        }
    }
    create2024Blocks() {
        const digits = [
            [ // 2
                [1,1,1],
                [0,0,1],
                [0,1,0],
                [1,0,0],
                [1,1,1]
            ],
            [ // 0
                [0,1,1],
                [1,0,0,1],
                [1,0,0,1],
                [1,0,0,1],
                [0,1,1]
            ],
            [ // 2
                [1,1,1],
                [0,0,1],
                [0,1,0],
                [1,0,0],
                [1,1,1]
            ],
            [ // 4
                [1,0,1],
                [1,0,1],
                [1,1,1],
                [0,0,1],
                [0,0,1]
            ]
        ];

        return digits.map(digit => ({
            shape: digit,
            color: this.generateRandomGradientColor(),
            x: Math.floor(this.cols / 2 - digit[0].length / 2),
            y: 0
        }));
    }

    // Generate a random gradient color
    generateRandomGradientColor() {
        const startColor = this.generateRandomColor();
        const endColor = this.generateRandomColor();
        return `linear-gradient(to bottom right, ${startColor}, ${endColor})`;
    }

    // Opening animation for 2024 blocks
    drawOpeningAnimation() {
        this.gameOver=true;
        let currentBlockIndex = 0;
        const animationInterval = setInterval(() => {
            this.ctx.clearRect(0, 0, this.gameWidth, this.gameHeight);
    
            // 畫特殊方塊
            this.currentSpecialBlock = this.specialBlocks[currentBlockIndex];
            this.drawSpecialBlock(this.currentSpecialBlock);
    
            // 方塊向下移動
            this.currentSpecialBlock.y += 1;
    
            // 若方塊移出畫布，切換至下一個方塊
            if (this.currentSpecialBlock.y > this.rows) {
                currentBlockIndex++;
                this.currentSpecialBlock.y = 0; // 重置方塊位置
            }
    
            // 若所有方塊動畫結束，停止動畫並開始遊戲
            if (currentBlockIndex >= this.specialBlocks.length) {
                clearInterval(animationInterval);
                this.isOpeningAnimation = false; // 動畫完成
                this.gameOver=false;
                this.gameLoop();
            }
        }, 30);
    }
    handleMouseDown(event) {
        if (this.gameOver) return;

        // 取得滑鼠在畫布上的座標
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = Math.floor((event.clientX - rect.left) / this.blockSize);
        const mouseY = Math.floor((event.clientY - rect.top) / this.blockSize);

        // 檢查目前方塊是否存活且點擊在方塊內
        if (this.currentBlock && 
            this.currentBlock.status === this.blockState.ALIVE && 
            this.isPointInsideBlock(mouseX, mouseY)) {
            
            this.isDragging = true;
            this.currentBlock.status = this.blockState.DRAGGING;
            this.currentBlockStatus = this.blockState.DRAGGING;
            
            // 計算拖曳偏移量
            this.dragOffsetX = mouseX - this.currentBlock.x;
            this.dragOffsetY = mouseY - this.currentBlock.y;
        }
    }

    handleMouseMove(event) {
        if (!this.isDragging) return;

        // 取得滑鼠在畫布上的座標
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = Math.floor((event.clientX - rect.left) / this.blockSize);
        const mouseY = Math.floor((event.clientY - rect.top) / this.blockSize);

        // 計算新的方塊位置
        const newX = mouseX - this.dragOffsetX;
        const newY = mouseY - this.dragOffsetY;

        // 檢查移動是否合法
        if (this.isValidMove(this.currentBlock, newX, newY)) {
            this.currentBlock.x = newX;
            this.currentBlock.y = newY;
            this.draw();
        }
    }

    handleMouseUp() {
        if (!this.isDragging) return;

        this.isDragging = false;
        
        // 如果方塊無法繼續下移，則鎖定方塊
        if (!this.isValidMove(this.currentBlock, this.currentBlock.x, this.currentBlock.y + 1)) {
            this.lockBlock();
            this.clearLines();
            this.createBlock();
        }

        this.currentBlock.status = this.blockState.ALIVE;
        this.currentBlockStatus = this.blockState.ALIVE;
        this.draw();
    }
    highlightSelectedBlock() {
        // 只有在方塊為存活或拖曳狀態時才顯示紅色選擇框
        if (this.currentBlock && 
            (this.currentBlockStatus === this.blockState.DRAGGING)) {
            this.ctx.strokeStyle = 'red';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(
                this.currentBlock.x * this.blockSize,
                this.currentBlock.y * this.blockSize,
                this.currentBlock.shape[0].length * this.blockSize,
                this.currentBlock.shape.length * this.blockSize
            );
        }
    }
    dropBlockToBottom() {
        if (this.gameOver) return;
    
        // 持續向下移動直到不能再移動
        while (this.isValidMove(this.currentBlock, this.currentBlock.x, this.currentBlock.y + 1)) {
            this.currentBlock.y++;
        }
    
        // 鎖定方塊
        this.lockBlock();
        this.clearLines();
        this.createBlock();
    
        this.draw();
    }

    handleKeyPress(e) {
        switch (e.key) {
            case 'ArrowLeft':
                this.moveBlock('left');
                break;
            case 'ArrowRight':
                this.moveBlock('right');
                break;
            case 'ArrowDown':
                this.moveBlock('down');
                break;
            case 'ArrowUp':
                this.rotateBlock();
                break;
            case ' ':  // 空白鍵
                this.dropBlockToBottom();
                break;
        }
    }
}

const game = new AdvancedTetris();