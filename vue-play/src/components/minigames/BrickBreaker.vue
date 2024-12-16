<template>
  <div id="game-container">
    <h1>Brick Breaker Game with Brython</h1>
    <canvas id="game-canvas" width="600" height="400"></canvas>
    <div id="controls">
      <button id="restart-btn" @click="restartGame">다시하기</button>
      <button id="quit-btn" @click="quitGame">종료하기</button>
    </div>
    <div id="score">Score: 0</div>
  </div>
</template>

<script>
export default {
  name: 'BrickBreaker',
  mounted() {
    this.loadBrython()
  },
  methods: {
    loadBrython() {
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/brython@3.9.5/brython.min.js'
      script.onload = () => {
        const stdlib = document.createElement('script')
        stdlib.src = 'https://cdn.jsdelivr.net/npm/brython@3.9.5/brython_stdlib.js'
        stdlib.onload = () => {
          this.$nextTick(() => {
            this.initializeGame()
          })
        }
        document.head.appendChild(stdlib)
      }
      document.head.appendChild(script)
    },
    initializeGame() {
      const canvas = document.getElementById('game-canvas')
      const ctx = canvas.getContext('2d')

      let paddle_x = 250
      const paddle_y = 380
      const paddle_width = 100
      const paddle_height = 10
      let ball_x = 290
      let ball_y = 370
      const ball_radius = 10
      let ball_dx = 3
      let ball_dy = -3
      let bricks = []
      let score = 0
      let game_over = false

      const colors = ['blue', 'green', 'yellow', 'orange', 'red']

      const createBricks = () => {
        bricks = []
        for (let i = 0; i < 5; i++) {
          const row = []
          for (let j = 0; j < 10; j++) {
            const x1 = j * 60
            const y1 = i * 20
            const x2 = x1 + 58
            const y2 = y1 + 18
            row.push([x1, y1, x2, y2, colors[i]])
          }
          bricks.push(row)
        }
      }

      const moveLeft = () => {
        paddle_x = Math.max(paddle_x - 20, 0)
      }

      const moveRight = () => {
        paddle_x = Math.min(paddle_x + 20, canvas.width - paddle_width)
      }

      const update = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Draw paddle
        ctx.fillStyle = 'lime'
        ctx.fillRect(paddle_x, paddle_y, paddle_width, paddle_height)

        // Draw ball
        ctx.fillStyle = 'red'
        ctx.beginPath()
        ctx.arc(ball_x, ball_y, ball_radius, 0, 2 * 3.14159)
        ctx.fill()
        ctx.closePath()

        // Draw border
        ctx.strokeStyle = 'white'
        ctx.lineWidth = 2
        ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2) // 경계선 확실하게 설정

        // Move ball
        ball_x += ball_dx
        ball_y += ball_dy

        // Check for wall collisions
        if (ball_x - ball_radius <= 0 || ball_x + ball_radius >= canvas.width) {
          ball_dx *= -1
        }
        if (ball_y - ball_radius <= 0) {
          ball_dy *= -1
        }
        if (ball_y + ball_radius >= canvas.height) {
          game_over = true
          ctx.fillStyle = 'red'
          ctx.font = '30px Arial'
          ctx.fillText('Game Over', 250, 200)
          return
        }

        // Check for paddle collision
        if (paddle_x <= ball_x && ball_x <= paddle_x + paddle_width && paddle_y <= ball_y + ball_radius && ball_y + ball_radius <= paddle_y + paddle_height) {
          ball_dy *= -1
        }

        // Check for brick collisions
        for (const row of bricks) {
          for (const brick of row) {
            if (
              brick &&
              brick[0] <= ball_x &&
              ball_x <= brick[2] &&
              brick[1] <= ball_y - ball_radius &&
              ball_y - ball_radius <= brick[3]
            ) {
              row[row.indexOf(brick)] = null
              ball_dy *= -1
              score += 10
              document.getElementById('score').textContent = `Score: ${score}`
            }
          }
        }

        // Draw bricks
        for (const row of bricks) {
          for (const brick of row) {
            if (brick) {
              ctx.fillStyle = brick[4]
              ctx.fillRect(brick[0], brick[1], brick[2] - brick[0], brick[3] - brick[1])
            }
          }
        }

        // Check for game win
        if (bricks.every(row => row.every(brick => brick === null))) {
          game_over = true
          ctx.fillStyle = 'green'
          ctx.font = '30px Arial'
          ctx.fillText('You Win!', 250, 200)
          return
        }

        if (!game_over) {
          window.setTimeout(update, 30)
        }
      }

      const restartGame = () => {
        paddle_x = 250
        ball_x = 290
        ball_y = 370
        ball_dx = 3
        ball_dy = -3
        score = 0
        document.getElementById('score').textContent = `Score: ${score}`
        game_over = false
        createBricks()
        update()
      }

      const quitGame = () => {
        this.$router.push('/minigames')
      }

      document.addEventListener('keydown', event => {
        if (event.key === 'ArrowLeft') {
          moveLeft()
        } else if (event.key === 'ArrowRight') {
          moveRight()
        }
      })

      document.getElementById('restart-btn').addEventListener('click', restartGame)
      document.getElementById('quit-btn').addEventListener('click', quitGame)

      createBricks()
      update()
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
