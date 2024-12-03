# Tetris 連結
https://appurupai3.github.io/Tetris/

# Tetris 遊戲需求

## HTML UI 元素 (10%)

- a. ✅HTML Canvas
- b. ✅按鈕：開始 (Start)、左 (Left)、右 (Right)、旋轉 (Rotate)、重置 (Reset)、暫停 (Pause)
- c. ✅設計你自己的區塊和遊戲面板、UI。

## 5個Tetris區塊和數字 (10%)

- a. ✅除了上述5個區塊，創建“2024”區塊，用於開場動畫。
- b. ✅使用隨機漸變顏色填充每個區塊的單位，範例如下所示。
- c. ✅區塊有三種狀態：存活 (alive)、存活且選中 (alive and selected)、死亡 (dead)（無法選擇）。

## 動畫 (15%)

- a. ✅開場動畫：飛行的“2024”，出現和消失（朝某個方向移動）5%
- b. Tetris區塊動畫：10%
  - ✅隨機創建其中一個5個Tetris區塊，並讓它出現在遊戲區域的上方。
  - ✅每秒自動向下移動1單位。
  - 每5秒創建下一個區塊。
  - ✅使用兩個按鈕來調整速度 (+/-)。

## 每個區塊可以檢測碰撞 (25%)

- a. ✅遊戲區域的底部和兩側是區塊無法穿過的邊界。5%
- b. ✅區塊之間無法穿透（即不能將區塊移動到無法穿過的地方）。20%
- c. ✅當區塊的底部達到畫布的底部或碰到其他死亡區塊時，區塊停止移動，並將其狀態設置為死亡。

## 互動式遊戲控制 (30%)

- a. ✅開始/暫停/重置按鈕。5%
- b. ✅左：將選中的區塊向左移動。2%
- c. ✅右：將選中的區塊向右移動。2%
- d. ✅旋轉：將選中的區塊順時針旋轉90度。3%
- e. ✅你可以使用鼠標選擇你想要控制的存活區塊。15%
  - ✅只有尚未死亡的區塊才能被選中。
  - ✅如果鼠標點擊區塊內部，該區塊會被選中。
  - ✅選中的區塊會隨著鼠標移動（拖動），直到鼠標被放開。
- f. ✅被選中的區塊應該用紅色粗邊框高亮顯示。3%

## 遊戲結束條件

- ✅當區塊死亡並位於天花板以上時，遊戲結束。顯示遊戲結束的標誌或動畫，發揮你的創意。5%

## 代碼和文檔可讀性

- ✅編寫註解並適當組織代碼。5%

## 上傳要求

- 上傳你的代碼和文檔（遊戲的截圖、任務清單、評估你完成的百分比，並詳細解釋如何使用你的程式）。
