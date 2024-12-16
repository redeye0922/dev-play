<template>
  <div id="game-container">
    <h1>Tetris Game with Brython</h1>
    <canvas id="game-canvas" width="300" height="600"></canvas>
    <div id="controls">
      <button id="restart-btn" @click="startGame">다시하기</button>
      <button id="quit-btn" @click="quitGame">종료하기</button>
    </div>
    <div id="score">Score: 0</div>
    <div id="level">Level: 1</div>
  </div>
</template>

<script>
export default {
  name: 'TetrisGame',
  data() {
    return {
      eventListenersAdded: false,
      moveTimerId: null,
      tetrisKeydownHandler: null // Tetris 전용 키 다운 핸들러
    }
  },
  mounted() {
    console.log('TetrisGame mounted');
    this.loadBrython();
  },
  beforeDestroy() {
    console.log('TetrisGame beforeDestroy');
    this.cleanup('beforeDestroy');
  },
  destroyed() {
    console.log('TetrisGame destroyed');
  },
  beforeRouteLeave (to, from, next) {
    console.log('TetrisGame beforeRouteLeave');
    this.cleanup('beforeRouteLeave');
    next();
  },
  methods: {
    loadBrython() {
      console.log('Loading Brython');
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/brython@3.9.5/brython.min.js';
      script.onload = () => {
        console.log('Brython loaded');
        const stdlib = document.createElement('script');
        stdlib.src = 'https://cdn.jsdelivr.net/npm/brython@3.9.5/brython_stdlib.js';
        stdlib.onload = () => {
          console.log('Brython standard library loaded');
          this.$nextTick(() => {
            this.initializeGame();
          });
        };
        document.head.appendChild(stdlib);
      };
      document.head.appendChild(script);
    },
    initializeGame() {
      console.log('Initializing game');
      const canvas = document.getElementById('game-canvas');
      const ctx = canvas.getContext('2d');

      const WIDTH = 10;
      const HEIGHT = 20;
      const BLOCK_SIZE = 30;

      let board = Array.from({ length: HEIGHT }, () => Array(WIDTH).fill(0));
      let currentBlock = null;
      let blockPosition = [0, 3];
      let score = 0;
      let level = 1;
      let gameOverFlag = false;

      const speedByLevel = {1: 1000, 2: 900, 3: 800, 4: 700, 5: 600, 6: 500, 7: 400, 8: 300, 9: 200, 10: 100};
      let gameSpeed = speedByLevel[level];

      const shapes = [
        [[1, 1, 1], [0, 1, 0]],  // T shape
        [[1, 1, 1, 1]],           // I shape
        [[1, 1], [1, 1]],         // O shape
        [[1, 1, 0], [0, 1, 1]],   // S shape
        [[0, 1, 1], [1, 1, 0]],   // Z shape
        [[1, 1, 1], [1, 0, 0]],   // L shape
        [[1, 1, 1], [0, 0, 1]]    // J shape
      ];

      const createBlock = () => {
        console.log('Creating new block');
        currentBlock = shapes[Math.floor(Math.random() * shapes.length)];
      };

      const rotateBlock = () => {
        console.log('Rotating block');
        currentBlock = currentBlock[0].map((_, i) => currentBlock.map(row => row[i])).reverse();
      };

      const drawBlock = (block, offset) => {
        console.log('Drawing block', block, offset);
        block.forEach((row, y) => {
          row.forEach((cell, x) => {
            if (cell) {
              ctx.fillStyle = 'blue';
              ctx.fillRect((x + offset[1]) * BLOCK_SIZE, (y + offset[0]) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
          });
        });
      };

      const drawBoard = () => {
        console.log('Drawing board');
        ctx.clearRect(0, 0, WIDTH * BLOCK_SIZE, HEIGHT * BLOCK_SIZE);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 4; // 경계선 두께를 두껍게 설정
        ctx.strokeRect(0, 0, WIDTH * BLOCK_SIZE, HEIGHT * BLOCK_SIZE);
        board.forEach((row, y) => {
          row.forEach((cell, x) => {
            if (cell) {
              ctx.fillStyle = 'blue';
              ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
          });
        });
        if (currentBlock) {
          drawBlock(currentBlock, blockPosition);
        }
        if (!gameOverFlag) {
          this.scheduleNextMove();
        }
      };

      const validPosition = (block, offset) => {
        console.log('Checking block position', block, offset);
        return block.every((row, y) => {
          return row.every((cell, x) => {
            if (cell) {
              const newX = x + offset[1];
              const newY = y + offset[0];
              if (newX < 0 || newX >= WIDTH || newY < 0 || newY >= HEIGHT) {
                return false;
              }
              if (board[newY][newX]) {
                return false;
              }
              return true;  // cell이 true일 때만
            }
            return true;  // cell이 false일 때
          });
        });
      };

      const moveBlock = (dy, dx) => {
        console.log('Moving block', dy, dx);
        const newPosition = [blockPosition[0] + dy, blockPosition[1] + dx];
        if (validPosition(currentBlock, newPosition)) {
          blockPosition = newPosition;
          return true;
        }
        return false;
      };

      const dropBlock = () => {
        console.log('Dropping block');
        while (moveBlock(1, 0));
        mergeBlock();
        clearLines();
        createBlock();
        blockPosition = [0, 3];
        this.scheduleNextMove();
      };

      const mergeBlock = () => {
        console.log('Merging block');
        currentBlock.forEach((row, y) => {
          row.forEach((cell, x) => {
            if (cell) {
              board[blockPosition[0] + y][blockPosition[1] + x] = 1;
            }
          });
        });
      };

      const clearLines = () => {
        console.log('Clearing lines');
        const newBoard = board.filter(row => row.some(cell => cell === 0));
        const linesCleared = HEIGHT - newBoard.length;
        if (linesCleared > 0) {
          score += 100 * linesCleared;
          document.getElementById('score').textContent = `Score: ${score}`;
          if (score >= 1000 * level) {
            level += 1;
            gameSpeed = speedByLevel[level] || gameSpeed;
            document.getElementById('level').textContent = `Level: ${level}`;
          }
        }
        board = Array.from({ length: linesCleared }, () => Array(WIDTH).fill(0)).concat(newBoard);
      };

      const update = () => {
        console.log('Updating game state');
        if (gameOverFlag) return;
        if (!moveBlock(1, 0)) {
          mergeBlock();
          clearLines();
          createBlock();
          blockPosition = [0, 3];
          if (checkGameOver()) {
            gameOver();
            return;
          }
        }
        drawBoard();
      };

      this.scheduleNextMove = () => {
        console.log('Scheduling next move');
        if (this.moveTimerId !== null) {
          clearTimeout(this.moveTimerId);
          this.moveTimerId = null;  // 명확히 초기화
        }
        this.moveTimerId = setTimeout(update, gameSpeed);
      };

      const checkGameOver = () => {
        console.log('Checking for game over');
        return board[0].some(cell => cell === 1);
      };

      const gameOver = () => {
        console.log('Game over');
        gameOverFlag = true;
        alert('게임 종료! 다시 시작하시겠습니까?', confirmAction => {
          if (confirmAction) {
            startGame();
          }
        });
      };

      const startGame = () => {
        console.log('Starting new game');
        blockPosition = [0, 3];
        createBlock();
        score = 0;
        level = 1;
        board = Array.from({ length: HEIGHT }, () => Array(WIDTH).fill(0));
        gameSpeed = speedByLevel[level];
        gameOverFlag = false;
        drawBoard();
      };

      this.tetrisKeydownHandler = event => {
        console.log('Keydown event', event);
        if (event.key === 'ArrowLeft') {
          moveBlock(0, -1);
        } else if (event.key === 'ArrowRight') {
          moveBlock(0, 1);
        } else if (event.key === 'ArrowDown') {
          moveBlock(1, 0);
        } else if (event.key === 'ArrowUp') {
          rotateBlock();
        } else if (event.key === ' ') {
          dropBlock();
        }
        drawBoard();
      };

      const quitGame = () => {
        console.log('Quitting game');
        this.cleanup('quitGame');
        this.$router.push('/minigames');
      };

      document.addEventListener('keydown', this.tetrisKeydownHandler);
      this.eventListenersAdded = true;

      document.getElementById('restart-btn').addEventListener('click', startGame);
      document.getElementById('quit-btn').addEventListener('click', quitGame);

      startGame();
    },
    cleanup(source) {
      console.log(`Cleaning up from ${source}`);
      if (this.eventListenersAdded) {
        document.removeEventListener('keydown', this.tetrisKeydownHandler);
        this.eventListenersAdded = false;
      }
      if (this.moveTimerId !== null) {
        clearTimeout(this.moveTimerId);
        this.moveTimerId = null;
      }
      // Brython 관련 리소스를 정리합니다.
      const brythonScripts = document.querySelectorAll('script[src*="brython"]');
      brythonScripts.forEach(script => script.remove());
      const brythonStdlibScripts = document.querySelectorAll('script[src*="brython_stdlib"]');
      brythonStdlibScripts.forEach(script => script.remove());

      // Brython 관련 DOM 요소도 제거합니다.
      const brythonElems = document.querySelectorAll('[type="text/python"]');
      brythonElems.forEach(elem => elem.remove());

      // Brython 객체를 null로 설정
      if (typeof window.__BRYTHON__ !== 'undefined') {
        window.__BRYTHON__ = null;
      }
    }
  }
}
</script>

<style scoped>
#game-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}
#controls {
  display: flex;
  justify-content: space-around;
  width: 300px;
  margin: 10px 0;
}
button {
  font-size: 16px;
}
</style>
