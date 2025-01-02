<template>
  <div id="game-container">
    <h1>Avoid Obstacles Game with Brython</h1>
    <canvas id="game-canvas" width="400" height="600"></canvas>
  </div>
</template>

<script>
export default {
  name: 'AvoidObstacles',
  data() {
    return {
      intervalId: null,
      gameOver: false
    }
  },
  mounted() {
    this.loadBrython();
  },
  beforeDestroy() {
    this.cleanup('beforeDestroy');
  },
  destroyed() {
    this.cleanup('destroyed');
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
        }
        document.head.appendChild(stdlib);
      }
      document.head.appendChild(script);
    },
    initializeGame() {
      const canvas = document.getElementById('game-canvas');
      const ctx = canvas.getContext('2d');

      let playerX = 180;
      const playerY = 500;
      const obstacles = [];

      const createObstacle = () => {
        if (!this.gameOver) {
          const xPosition = Math.floor(Math.random() * 361);
          obstacles.push([xPosition, 0]);
          setTimeout(createObstacle, 2000);
        }
      }

      const moveLeft = () => {
        playerX = Math.max(playerX - 20, 0);
      }

      const moveRight = () => {
        playerX = Math.min(playerX + 20, 360);
      }

      const checkCollision = (obstacle) => {
        const playerWidth = 40;
        const playerHeight = 40;
        const obstacleWidth = 40;
        const obstacleHeight = 40;

        return !(
          playerY > obstacle[1] + obstacleHeight ||
          playerY + playerHeight < obstacle[1] ||
          playerX > obstacle[0] + obstacleWidth ||
          playerX + playerWidth < obstacle[0]
        );
      }

      const update = () => {
        ctx.clearRect(0, 0, 400, 600);
        ctx.fillStyle = 'blue';
        ctx.fillRect(playerX, playerY, 40, 40);

        obstacles.forEach((obstacle, index) => {
          obstacle[1] += 5;
          ctx.fillStyle = 'red';
          ctx.fillRect(obstacle[0], obstacle[1], 40, 40);

          if (checkCollision(obstacle)) {
            this.gameOver = true;
            alert('게임 오버!');
            clearTimeout(this.intervalId);
          }

          if (obstacle[1] > 600) {
            obstacles.splice(index, 1);
          }
        });

        if (!this.gameOver) {
          this.intervalId = setTimeout(update, 50);
        }
      }

      document.addEventListener('keydown', this.handleKeydown = (event) => {
        if (event.key === 'ArrowLeft') {
          moveLeft();
        } else if (event.key === 'ArrowRight') {
          moveRight();
        }
      });

      this.gameOver = false;
      createObstacle();
      update();
    },
    restartGame() {
      this.initializeGame();
    },
    quitGame() {
      this.cleanup('quitGame');
      this.$router.push('/minigames');
    },
    cleanup(source) {
      console.log(`Cleaning up from ${source}`);
      clearTimeout(this.intervalId);
      this.intervalId = null;

      document.removeEventListener('keydown', this.handleKeydown);

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
#game-canvas {
  border: 1px solid black;
}
button {
  margin: 10px;
}
</style>
