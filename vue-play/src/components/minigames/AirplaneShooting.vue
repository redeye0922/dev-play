<template>
  <div id="game-container">
    <h1>Airplane Shooting Game</h1>
    <canvas id="game-canvas" width="400" height="600"></canvas>
    <div id="controls">
      <button id="restart-btn">Restart</button>
      <button id="quit-btn" @click="quitGame">Quit</button>
    </div>
    <div id="score">Score: 0</div>
  </div>
</template>

<script>
export default {
  name: 'AirplaneShooting',
  data() {
    return {
      gameInitialized: false,
      player: null,
      bullets: [],
      enemies: [],
      score: 0,
      gameOver: false
    }
  },
  mounted() {
    this.loadBrython()
  },
  beforeDestroy() {
    this.cleanup('beforeDestroy')
  },
  destroyed() {
    this.cleanup('destroyed')
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
      if (this.gameInitialized) return

      const canvas = document.getElementById('game-canvas')
      const ctx = canvas.getContext('2d')
      this.player = { x: 180, y: 500, width: 40, height: 50, color: 'blue' }

      const drawPlayer = () => {
        ctx.fillStyle = this.player.color
        ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height)
      }

      const drawBullets = () => {
        ctx.fillStyle = 'red'
        for (const bullet of this.bullets) {
          ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height)
        }
      }

            const drawEnemies = () => {
        ctx.fillStyle = 'green'
        for (const enemy of this.enemies) {
          ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height)
        }
      }

      const updateGame = () => {
        if (!this.gameOver) {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          drawPlayer()
          drawBullets()
          drawEnemies()

          this.updateBullets()
          this.updateEnemies()

          requestAnimationFrame(updateGame)
        }
      }

      const moveLeft = () => {
        if (this.player.x > 0) {
          this.player.x -= 20
        }
      }

      const moveRight = () => {
        if (this.player.x < canvas.width - this.player.width) {
          this.player.x += 20
        }
      }

      const shootBullet = () => {
        const bullet = { x: this.player.x + 18, y: 480, width: 4, height: 20 }
        this.bullets.push(bullet)
      }

      document.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') moveLeft()
        if (event.key === 'ArrowRight') moveRight()
        if (event.key === ' ') shootBullet()
      })

      this.createEnemy()
      updateGame()

      const restartBtn = document.getElementById('restart-btn')
      restartBtn.addEventListener('click', this.restartGame)

      this.gameInitialized = true
    },
    updateBullets() {
      for (const bullet of this.bullets) {
        bullet.y -= 10
        if (bullet.y < 0) {
          this.bullets = this.bullets.filter(b => b !== bullet)
        }
      }
    },
    updateEnemies() {
      for (const enemy of this.enemies) {
        enemy.y += 5
        if (enemy.y > 600) {
          this.enemies = this.enemies.filter(e => e !== enemy)
        }
        for (const bullet of this.bullets) {
          if (this.checkCollision(bullet, enemy)) {
            this.bullets = this.bullets.filter(b => b !== bullet)
            this.enemies = this.enemies.filter(e => e !== enemy)
            this.score += 10
            document.getElementById('score').textContent = `Score: ${this.score}`
          }
        }
        if (this.checkCollision(this.player, enemy)) {
          this.gameOver = true
          ctx.fillStyle = 'red'
          ctx.font = '30px Arial'
          ctx.fillText('Game Over', 180, 300)
          document.getElementById('restart-btn').disabled = false
          return
        }
      }
    },
    checkCollision(obj1, obj2) {
      return obj1.x < obj2.x + obj2.width &&
             obj1.x + obj1.width > obj2.x &&
             obj1.y < obj2.y + obj2.height &&
             obj1.y + obj1.height > obj2.y
    },
    createEnemy() {
      if (!this.gameOver) {
        const x_position = Math.random() * 360
        const enemy = { x: x_position, y: 0, width: 40, height: 40 }
        this.enemies.push(enemy)
        setTimeout(this.createEnemy, 2000)
      }
    },
    restartGame() {
      this.player = { x: 180, y: 500, width: 40, height: 50, color: 'blue' }
      this.bullets = []
      this.enemies = []
      this.score = 0
      this.gameOver = false
      document.getElementById('score').textContent = 'Score: 0'
      document.getElementById('restart-btn').disabled = true
      this.initializeGame()
    },
    quitGame() {
      this.cleanup('quitGame')
      this.$router.push('/minigames')
    },
    cleanup(source) {
      console.log(`Cleaning up from ${source}`)
      const restartBtn = document.getElementById('restart-btn')
      const quitBtn = document.getElementById('quit-btn')

      if (restartBtn) {
        restartBtn.removeEventListener('click', this.restartGame)
      }
      if (quitBtn) {
        quitBtn.removeEventListener('click', this.quitGame)
      }

      // Brython 관련 리소스를 정리합니다.
      const brythonScripts = document.querySelectorAll('script[src*="brython"]')
      brythonScripts.forEach(script => script.remove())
      const brythonStdlibScripts = document.querySelectorAll('script[src*="brython_stdlib"]')
      brythonStdlibScripts.forEach(script => script.remove())

      // Brython 관련 DOM 요소도 제거합니다.
      const brythonElems = document.querySelectorAll('[type="text/python"]')
      brythonElems.forEach(elem => elem.remove())

      // Brython 객체를 제거합니다.
      if (typeof window.__BRYTHON__ !== 'undefined') {
        window.__BRYTHON__.$options = null
        window.__BRYTHON__.stdlib_path = null
        window.__BRYTHON__.py_namespaces = null
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
