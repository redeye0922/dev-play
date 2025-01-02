<template>
  <div id="game-container">
    <h1>Brick Breaker Game with Brython</h1>
    <canvas id="game-canvas" width="600" height="400"></canvas>
    <div id="controls">
      <button id="restart-btn">Restart</button>
      <button id="quit-btn" @click="quitGame">Quit</button>
    </div>
    <div id="score">Score: 0</div>
  </div>
</template>

<script>
export default {
  name: 'BrickBreaker',
  data() {
    return {
      gameInitialized: false,
      paddle_x: 250,
      paddle_y: 380,
      paddle_width: 100,
      paddle_height: 10,
      ball_x: 290,
      ball_y: 370,
      ball_radius: 10,
      ball_dx: 3,
      ball_dy: -3,
      bricks: [],
      score: 0,
      game_over: false,
      updateInterval: null
    };
  },
  created() {
    console.log("BrickBreaker 컴포넌트 생성됨");
    this.loadBrython();
  },
  mounted() {
    console.log("BrickBreaker 컴포넌트 마운트됨");
    window.addEventListener('beforeunload', this.cleanup);
  },
  beforeDestroy() {
    console.log("BrickBreaker 컴포넌트 파괴 전 정리 작업");
    this.cleanup();
  },
  destroyed() {
    console.log("BrickBreaker 컴포넌트 파괴됨");
    this.cleanup();
  },
  methods: {
    loadBrython() {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/brython@3.9.5/brython.min.js';
      script.onload = () => {
        const stdlib = document.createElement('script');
        stdlib.src = 'https://cdn.jsdelivr.net/npm/brython@3.9.5/brython_stdlib.js';
        stdlib.onload = () => {
          this.$nextTick(() => {
            this.initializeGame();
          });
        };
        document.head.appendChild(stdlib);
      };
      document.head.appendChild(script);
    },
    initializeGame() {
      if (this.gameInitialized) return;

      console.log("게임 초기화");
      const canvas = document.getElementById('game-canvas');
      if (!canvas) {
        console.error('Canvas element not found in the DOM.');
        return;
      }
      const ctx = canvas.getContext('2d');

      this.createBricks();

      const update = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw paddle
        ctx.fillStyle = 'lime';
        ctx.fillRect(this.paddle_x, this.paddle_y, this.paddle_width, this.paddle_height);

        // Draw ball
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(this.ball_x, this.ball_y, this.ball_radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();

        // Draw border
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2); // 경계선 확실하게 설정

        // Move ball
        this.ball_x += this.ball_dx;
        this.ball_y += this.ball_dy;

        // Check for wall collisions
        if (this.ball_x - this.ball_radius <= 0 || this.ball_x + this.ball_radius >= canvas.width) {
          this.ball_dx *= -1;
        }
        if (this.ball_y - this.ball_radius <= 0) {
          this.ball_dy *= -1;
        }
        if (this.ball_y + this.ball_radius >= canvas.height) {
          this.game_over = true;
          ctx.fillStyle = 'red';
          ctx.font = '30px Arial';
          ctx.fillText('Game Over', 250, 200);
          return;
        }

        // Check for paddle collision
        if (
          this.paddle_x <= this.ball_x &&
          this.ball_x <= this.paddle_x + this.paddle_width &&
          this.paddle_y <= this.ball_y + this.ball_radius &&
          this.ball_y + this.ball_radius <= this.paddle_y + this.paddle_height
        ) {
          this.ball_dy *= -1;
        }

        // Check for brick collisions
        for (const row of this.bricks) {
          for (const brick of row) {
            if (
              brick &&
              brick[0] <= this.ball_x &&
              this.ball_x <= brick[2] &&
              brick[1] <= this.ball_y - this.ball_radius &&
              this.ball_y - this.ball_radius <= brick[3]
            ) {
              row[row.indexOf(brick)] = null;
              this.ball_dy *= -1;
              this.score += 10;

              const scoreElement = document.getElementById('score');
              if (scoreElement) {
                scoreElement.textContent = `Score: ${this.score}`;
              }
            }
          }
        }

        // Draw bricks
        for (const row of this.bricks) {
          for (const brick of row) {
            if (brick) {
              ctx.fillStyle = brick[4];
              ctx.fillRect(brick[0], brick[1], brick[2] - brick[0], brick[3] - brick[1]);
            }
          }
        }

        // Check for game win
        if (this.bricks.every((row) => row.every((brick) => brick === null))) {
          this.game_over = true;
          ctx.fillStyle = 'green';
          ctx.font = '30px Arial';
          ctx.fillText('You Win!', 250, 200);
          return;
        }

        if (!this.game_over) {
          this.updateInterval = requestAnimationFrame(update);
        }
      };

      document.addEventListener('keydown', this.handleKeydown);
      document.getElementById('restart-btn').addEventListener('click', this.restartGame);
      document.getElementById('quit-btn').addEventListener('click', this.quitGame);

      this.gameInitialized = true;
      update();
    },
    createBricks() {
      const colors = ['blue', 'green', 'yellow', 'orange', 'red'];
      this.bricks = [];
      for (let i = 0; i < 5; i++) {
        const row = [];
        for (let j = 0; j < 10; j++) {
          const x1 = j * 60;
          const y1 = i * 20;
          const x2 = x1 + 58;
          const y2 = y1 + 18;
          row.push([x1, y1, x2, y2, colors[i]]);
        }
        this.bricks.push(row);
      }
    },
    moveLeft() {
      this.paddle_x = Math.max(this.paddle_x - 20, 0);
    },
    moveRight() {
      this.paddle_x = Math.min(this.paddle_x + 20, 600 - this.paddle_width);
    },
    handleKeydown(event) {
      if (event.key === 'ArrowLeft') {
        this.moveLeft();
      } else if (event.key === 'ArrowRight') {
        this.moveRight();
      }
    },
    restartGame() {
      console.log("게임 재시작");
      this.paddle_x = 250;
      this.ball_x = 290;
      this.ball_y = 370;
      this.ball_dx = 3;
      this.ball_dy = -3;
      this.score = 0;

      const scoreElement = document.getElementById('score');
      if (scoreElement) {
        scoreElement.textContent = `Score: ${this.score}`;
      }
      this.game_over = false;
      this.createBricks();
      this.initializeGame();
    },
    quitGame() {
      this.cleanup('quitGame');
      this.$router.push('/minigames');
    },
    cleanup(source) {
      console.log(`Cleaning up from ${source}`);
      window.removeEventListener('beforeunload', this.cleanup);
      document.removeEventListener('keydown', this.handleKeydown);

      const restartBtn = document.getElementById('restart-btn');
      const quitBtn = document.getElementById('quit-btn');
      if (restartBtn) {
        restartBtn.removeEventListener('click', this.restartGame);
      }
      if (quitBtn) {
        quitBtn.removeEventListener('click', this.quitGame);
      }

      // Brython 관련 리소스를 정리합니다.
      const brythonScripts = document.querySelectorAll('script[src*="brython"]');
      brythonScripts.forEach(script => script.remove());
      const brythonStdlibScripts = document.querySelectorAll('script[src*="brython_stdlib"]');
      brythonStdlibScripts.forEach(script => script.remove());

      // Brython 관련 DOM 요소도 제거합니다.
      const brythonElems = document.querySelectorAll('[type="text/python"]');
      brythonElems.forEach(elem => elem.remove());

      // Brython 객체를 제거합니다.
      if (typeof window.__BRYTHON__ !== 'undefined') {
        window.__BRYTHON__.$options = null;
        window.__BRYTHON__.stdlib_path = null;
        window.__BRYTHON__.py_namespaces = null;
      }
      }

      // 애니메이션 프레임을 취소합니다.
      if (this.updateInterval) {
        cancelAnimationFrame(this.updateInterval);
        this.updateInterval = null;
      }
      console.log("Cleanup 완료");
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
  width: 600px;
  margin: 10px 0;
}
button {
  font-size: 16px;
}
</style>

