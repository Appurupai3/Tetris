class AdvancedTetris {
    constructor() {
        this.canvas = document.getElementById('game-area');
        this.ctx = this.canvas.getContext('2d');
        this.blockSize = 20;
        this.gameWidth = 300;
        this.gameHeight = 500;
        this.rows = this.gameHeight / this.blockSize;
        this.cols = this.gameWidth / this.blockSize;
        this.gameBoard = this.createEmptyBoard();
        this.currentBlock = null;
        this.selectedBlock = null;
        this.gameOver = true;
        this.isOpeningAnimation = true; // 開場動畫控制
        this.score = 0;
        this.gameSpeed = 500; // 初始遊戲速度
        this.specialBlocks = this.create2024Blocks();
        this.currentSpecialBlock = null;
        this.permanentGrid = []; // 永久格子儲存
        this.setupEventListeners();
        this.setupPermanentGrid();
        this.blockState = {
            ALIVE: 'alive',      // 正在落下
            DRAGGING: 'dragging', // 正在拖曳
            DEAD: 'dead'          // 已落地無法移動
        };
        this.currentBlockStatus = this.blockState.ALIVE;
        this.setupMouseSelection();
    }

    createEmptyBoard() {
        return Array.from({ length: this.rows }, () =>
            Array.from({ length: this.cols }, () => ({ filled: false, color: null }))
        );
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        document.getElementById('leftButton').addEventListener('click', () => this.moveBlock('left'));
        document.getElementById('rightButton').addEventListener('click', () => this.moveBlock('right'));
        document.getElementById('rotateButton').addEventListener('click', () => this.rotateBlock());
        document.getElementById('startButton').addEventListener('click', () => this.startGame());
        document.getElementById('pauseButton').addEventListener('click', () => this.togglePause());
        document.getElementById('resetButton').addEventListener('click', () => this.resetGame());
        this.setupSpeedControl();
    }
    setupMouseSelection() {
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    }
    
    startGame() {
        if (!this.gameOver) return;
        this.drawOpeningAnimation();
        this.score = 0;
        this.gameBoard = this.createEmptyBoard();
        this.createBlock();
        document.getElementById('score-display').textContent = `分數: ${this.score}`;
    }

    // 重置遊戲
    resetGame() {
        this.startGame();
    }

    // 暫停或繼續遊戲
    togglePause() {
        this.gameOver = !this.gameOver;
        if (!this.gameOver) this.gameLoop();
    }

    // 遊戲主循環
    gameLoop() {
        if (this.gameOver || this.isOpeningAnimation) return;
        this.moveBlock('down');
        this.draw();
        setTimeout(this.gameLoop.bind(this), this.gameSpeed);
    }
    createBlock() {
        const shapes = [
            [[1, 1, 1, 1]], // I
            [[1, 1], [1, 1]], // O
            [[0, 1, 1], [1, 1, 0]], // S
            [[1, 1, 0], [0, 1, 1]], // Z
            [[1, 0, 0], [1, 1, 1]], // L
            [[0, 0, 1], [1, 1, 1]], // J
            [[0, 1, 0], [1, 1, 1]], // T
        ];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        const color = this.generateRandomColor();

        this.currentBlock = {
            shape,
            x: Math.floor(this.cols / 2 - shape[0].length / 2),
            y: 0,
            color,
            status: this.blockState.ALIVE  // 初始狀態為存活
        };

        this.currentBlockStatus = this.blockState.ALIVE;

        if (!this.isValidMove(this.currentBlock, this.currentBlock.x, this.currentBlock.y)) {
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

        const originalBlock = this.currentBlock;
        this.currentBlock.shape = rotatedShape;

        if (!this.isValidMove(this.currentBlock, this.currentBlock.x, this.currentBlock.y)) {
            this.currentBlock = originalBlock;
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
        this.currentBlock.status = this.blockState.DEAD;  // 設置為死亡狀態
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
        if (this.gameOver || this.currentBlockStatus === this.blockState.DEAD) return;

        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        const blockX = Math.floor(mouseX / this.blockSize);
        const blockY = Math.floor(mouseY / this.blockSize);

        // 檢查是否點擊在當前方塊內且方塊為存活狀態
        if (this.isPointInsideBlock(blockX, blockY) && 
            this.currentBlockStatus === this.blockState.ALIVE) {
            this.selectedBlock = this.currentBlock;
            this.currentBlockStatus = this.blockState.DRAGGING;
            this.selectedBlock.status = this.blockState.DRAGGING;
            this.highlightSelectedBlock();
        }
    }

    handleMouseMove(event) {
        if (this.selectedBlock && 
            this.currentBlockStatus === this.blockState.DRAGGING) {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;

            const blockX = Math.floor(mouseX / this.blockSize);
            const blockY = Math.floor(mouseY / this.blockSize);

            // 嘗試移動方塊並驗證是否為合法移動
            const newBlock = {
                ...this.selectedBlock,
                x: blockX - Math.floor(this.selectedBlock.shape[0].length / 2),
                y: blockY - Math.floor(this.selectedBlock.shape.length / 2)
            };

            if (this.isValidMove(newBlock, newBlock.x, newBlock.y)) {
                this.currentBlock = newBlock;
                this.draw();
            }
        }
    }

    handleMouseUp() {
        if (this.currentBlockStatus === this.blockState.DRAGGING) {
            // 確認方塊位置
            if (this.isValidMove(this.currentBlock, this.currentBlock.x, this.currentBlock.y)) {
                this.currentBlockStatus = this.blockState.ALIVE;
                this.selectedBlock = null;
                this.draw();
            } else {
                // 如果移動不合法，恢復到原位
                this.currentBlock = this.selectedBlock;
                this.currentBlockStatus = this.blockState.ALIVE;
                this.selectedBlock = null;
                this.draw();
            }
        }
    }
    highlightSelectedBlock() {
        // 只有在方塊為存活或拖曳狀態時才顯示紅色選擇框
        if (this.currentBlock && 
            (this.currentBlockStatus === this.blockState.ALIVE || 
             this.currentBlockStatus === this.blockState.DRAGGING)) {
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
        }
    }
}

const game = new AdvancedTetris();