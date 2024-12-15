<template>
  <div id="game-container">
    <h1>Avoid Obstacles Game with Brython</h1>
    <canvas id="game-canvas" width="400" height="600"></canvas>
  </div>
</template>

<script>
export default {
  name: 'AvoidObstacles',
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
      const obstacles = []

      const createObstacle = () => {
        const xPosition = Math.floor(Math.random() * 361)
        obstacles.push([xPosition, 0])
        setTimeout(createObstacle, 2000)
      }

      const moveLeft = () => {
        playerX = Math.max(playerX - 20, 0)
      }

      const moveRight = () => {
        playerX = Math.min(playerX + 20, 360)
      }

      const update = () => {
        ctx.clearRect(0, 0, 400, 600)
        ctx.fillStyle = 'blue'
        ctx.fillRect(playerX, playerY, 40, 40)

        obstacles.forEach((obstacle, index) => {
          obstacle[1] += 5
          ctx.fillStyle = 'red'
          ctx.fillRect(obstacle[0], obstacle[1], 40, 40)
          if (obstacle[1] > 600) {
            obstacles.splice(index, 1)
          }
        })

        setTimeout(update, 50)
      }

      document.addEventListener('keydown', event => {
        if (event.key === 'ArrowLeft') {
          moveLeft()
        } else if (event.key === 'ArrowRight') {
          moveRight()
        }
      })

      createObstacle()
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
#game-canvas {
  border: 1px solid black;
}
</style>
