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
        this.isOpeningAnimation = true; // 新增變數
        this.score = 0;
        this.gameSpeed = 500; // 初始速度
        this.specialBlocks = this.create2024Blocks();
        this.currentSpecialBlock = null;
        this.setupEventListeners();
        this.setupPermanentGrid();
        this.currentBlock = null;
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
      }
    
      startGame() {
        if (!this.gameOver) return; // 若動畫進行中，禁止開始遊戲
        this.drawOpeningAnimation();
        this.score = 0;
        this.gameBoard = this.createEmptyBoard();
        this.createBlock();
        document.getElementById('score-display').textContent = `分數: ${this.score}`;
    }


    resetGame() {
        this.startGame();
    }

    togglePause() {
        this.gameOver = !this.gameOver;
        if (!this.gameOver) {
            this.gameLoop();
        }
    }

    gameLoop() {
        if (this.gameOver || this.isOpeningAnimation) return; // 若動畫進行中或遊戲結束，不執行
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
        };

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
            this.gameSpeed = Math.max(100, this.gameSpeed - 50);
        });
        document.getElementById('decreaseSpeed').addEventListener('click', () => {
            this.gameSpeed = Math.min(1000, this.gameSpeed + 50);
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

                // Canvas boundaries
                if (boardX < 0 || boardX >= this.cols || boardY >= this.rows) {
                    return false;
                }

                // Block collision detection
                if (boardY >= 0 && this.gameBoard[boardY][boardX].filled) {
                    return false;
                }
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
                            color: this.currentBlock.color,
                        };
                    }
                }
            }
        }
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
        this.drawGrid(); // Always draw grid first
        this.drawBoard();
        this.drawCurrentBlock();
    }

    drawGrid() {
        this.ctx.strokeStyle = '#ccc'; // 網格線顏色
        this.ctx.lineWidth = 1; // 網格線寬度
      
        // 繪製垂直線
        for (let x = 0; x <= this.gameWidth; x += this.blockSize) {
          this.ctx.beginPath();
          this.ctx.moveTo(x, 0);
          this.ctx.lineTo(x, this.gameHeight);
          this.ctx.stroke();
        }
      
        // 繪製水平線
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
                    // Set gradient fill
                    this.ctx.fillStyle = this.gameBoard[y][x].color;
                    
                    // Draw the block
                    this.ctx.fillRect(
                        x * this.blockSize,
                        y * this.blockSize,
                        this.blockSize,
                        this.blockSize
                    );
                    
                    // Add black border
                    this.ctx.strokeStyle = 'black';
                    this.ctx.lineWidth = 2;
                    this.ctx.strokeRect(
                        x * this.blockSize,
                        y * this.blockSize,
                        this.blockSize,
                        this.blockSize
                    );
                }
            }
        }
    }

    drawCurrentBlock() {
        if (!this.currentBlock) return;

        for (let y = 0; y < this.currentBlock.shape.length; y++) {
            for (let x = 0; x < this.currentBlock.shape[y].length; x++) {
                if (this.currentBlock.shape[y][x]) {
                    // Set gradient fill
                    this.ctx.fillStyle = this.currentBlock.color;
                    
                    // Draw the block
                    this.ctx.fillRect(
                        (this.currentBlock.x + x) * this.blockSize,
                        (this.currentBlock.y + y) * this.blockSize,
                        this.blockSize,
                        this.blockSize
                    );
                    
                    // Add black border
                    this.ctx.strokeStyle = 'black';
                    this.ctx.lineWidth = 2;
                    this.ctx.strokeRect(
                        (this.currentBlock.x + x) * this.blockSize,
                        (this.currentBlock.y + y) * this.blockSize,
                        this.blockSize,
                        this.blockSize
                    );
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
    /*
    generateRandomGradientColor() {
        const startColor = this.generateRandomColor();
        const endColor = this.generateRandomColor();
        
        // Create a linear gradient
        const gradient = this.ctx.createLinearGradient(
            0, 0, 
            this.blockSize, this.blockSize
        );
        gradient.addColorStop(0, startColor);
        gradient.addColorStop(1, endColor);
        
        return gradient;
    }*/
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
    
    

    // Interactive mouse selection of blocks
    setupMouseSelection() {
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    }

    handleMouseDown(event) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        const blockX = Math.floor(mouseX / this.blockSize);
        const blockY = Math.floor(mouseY / this.blockSize);

        // Check if clicked inside the current block
        if (this.isPointInsideBlock(blockX, blockY)) {
            this.selectedBlock = this.currentBlock;
            this.highlightSelectedBlock();
        }
    }

    handleMouseMove(event) {
        if (this.selectedBlock) {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const blockX = Math.floor(mouseX / this.blockSize);

            // Move block horizontally with mouse
            this.selectedBlock.x = blockX - Math.floor(this.selectedBlock.shape[0].length / 2);
            this.draw();
        }
    }
    handleMouseUp() {
        this.selectedBlock = null;
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
        }
    }
}

const game = new AdvancedTetris();