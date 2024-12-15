<template>
  <div id="game-container">
    <h1>Airplane Shooting Game with Brython</h1>
    <canvas id="game-canvas" width="400" height="600"></canvas>
    <div id="controls">
      <button @click="restartGame">다시하기</button>
      <button @click="quitGame">종료하기</button>
    </div>
    <div id="score">Score: 0</div>
  </div>
</template>

<script>
export default {
  name: 'AirplaneShooting',
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
          this.initializeGame()
        }
        document.head.appendChild(stdlib)
      }
      document.head.appendChild(script)
    },
    initializeGame() {
      const canvas = document.getElementById('game-canvas')
      const ctx = canvas.getContext('2d')

      let playerX = 180
      const playerY = 500
      const bullets = []
      const enemies = []
      let score = 0
      let gameOver = false

      const moveLeft = () => {
        playerX = Math.max(playerX - 20, 0)
      }

      const moveRight = () => {
        playerX = Math.min(playerX + 20, 360)
      }

      const shootBullet = () => {
        bullets.push([playerX + 18, 480])
      }

      const createEnemy = () => {
        if (!gameOver) {
          const xPosition = Math.floor(Math.random() * 361)
          enemies.push([xPosition, 0])
          setTimeout(createEnemy, 2000)
        }
      }

      const update = () => {
        ctx.clearRect(0, 0, 400, 600)
        ctx.fillStyle = 'blue'
        ctx.fillRect(playerX, playerY, 40, 50)

        bullets.forEach((bullet, index) => {
          bullet[1] -= 10
          ctx.fillStyle = 'red'
          ctx.fillRect(bullet[0], bullet[1], 4, 20)
          if (bullet[1] < 0) {
            bullets.splice(index, 1)
          }
        })

        enemies.forEach((enemy, index) => {
          enemy[1] += 5
          ctx.fillStyle = 'green'
          ctx.fillRect(enemy[0], enemy[1], 40, 40)
          if (enemy[1] > 600) {
            enemies.splice(index, 1)
          }

          bullets.forEach((bullet, bIndex) => {
            if (bullet[0] >= enemy[0] && bullet[0] <= enemy[0] + 40 && bullet[1] <= enemy[1] + 40) {
              bullets.splice(bIndex, 1)
              enemies.splice(index, 1)
              score += 10
              document.getElementById('score').textContent = `Score: ${score}`
            }
          })

          if (playerX >= enemy[0] && playerX <= enemy[0] + 40 && playerY <= enemy[1] + 40) {
            gameOver = true
            ctx.fillStyle = 'red'
            ctx.font = '30px Arial'
            ctx.fillText('Game Over', 120, 300)
            return
          }
        })

        if (!gameOver) {
          setTimeout(update, 50)
        }
      }

      document.addEventListener('keydown', event => {
        if (event.key === 'ArrowLeft') {
          moveLeft()
        } else if (event.key === 'ArrowRight') {
          moveRight()
        } else if (event.key === ' ') {
          shootBullet()
        }
      })

      const restartGame = () => {
        playerX = 180
        score = 0
        document.getElementById('score').textContent = `Score: ${score}`
        bullets.length = 0
        enemies.length = 0
        gameOver = false
        update()
        createEnemy()
      }

      const quitGame = () => {
        alert('게임을 종료합니다.')
      }

      document.getElementById('restart-btn').addEventListener('click', restartGame)
      document.getElementById('quit-btn').addEventListener('click', quitGame)

      createEnemy()
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
  width: 400px;
  margin: 10px 0;
}
button {
  font-size: 16px;
}
</style>
