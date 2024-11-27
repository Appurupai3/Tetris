# Tetris
1. HTML UI Elements: (10%)
a. HTML Canvas
b. Buttons: Start, Left, Right, Rotate, Reset, Pause
c. Design your own blocks and game panels, UIs.
2. 5 Tetris Blocks and numbers (10%)

- general Tetris blocks as shown above.
a. Except the above 5 blocks, create blocks “2024” for opening animation
b. Use random gradient color to fill each unit of a block, examples are shown
below.

c. The block has three statuses: alive, alive and selected, dead (cannot be selected).
3. Animation (15%)
a. Opening animation: flying 2024, appear and disappear (moving to a direction)
5%
b. Tetris block animation: 10%
• Randomly create one of the 5 Tetris blocks, and make it appear at the
top of the game area.
• Automatically Move 1 unit downward each second.
• The next block will be created after 5 sec.
• Use two buttons to adjust the speed (+/-)

4. Each Block can detect the collision of each other. (25%)
a. The bottom and the two sides of the game area are the boundaries that blocks
cannot go through. 5%
b. Blocks cannot go through (penetrate) each other. (i.e., you cannot move the
block to somewhere it cannot go through.). 20%
c. The block stops moving when its bottom reach the bottom of the canvas or hit
other dead blocks. The block’s status is then set to dead.
5. Interactive game control with the buttons and mouse: (30%)
a. Start/Pause/Reset button. 5%
b. Left: move the selected block to the left 2%
c. Right: move the selected block to the right. 2%
d. Rotate: rotate the selected blocks 90 degree clockwise. 3%
e. You can use mouse to select which alive block you would like to control 15%
• Only blocks which are not dead yet can be selected.
• The block is selected if the mouse clicked inside the block.
• The selected block will move (dragged) along the mouse until the
mouse is released.

f. The selected block should be highlighted with a red bold bounding box. 3%
6. The game is over when the block died at a place higher than the ceiling. Show a game
over sign or animation use your creativity 5%

7. Code and document readability: write comments and organize your code properly. 5%

Upload your code and document (screen shots of your game, check list of your tasks,
evaluate how much percentage you finished and explain the detail of how to use your program.)
