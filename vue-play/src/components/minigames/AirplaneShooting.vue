<template>
  <div id="game-container">
    <h1>Airplane Shooting Game</h1>
    <canvas id="game-canvas" width="800" height="600"></canvas>
    <div id="controls">
      <button id="restart-btn">Restart</button>
      <button id="quit-btn">Quit</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AirplaneShooting',
  data() {
    return {
      gameInitialized: false,
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
      if (this.gameInitialized) return;

      const canvas = document.getElementById('game-canvas')
      const restartBtn = document.getElementById('restart-btn')
      const quitBtn = document.getElementById('quit-btn')

      if (!canvas || !restartBtn || !quitBtn) {
        console.error('Game elements not found')
        return
      }

      const ctx = canvas.getContext('2d')

      // 게임 초기화 로직을 여기에 추가합니다.

      restartBtn.addEventListener('click', this.restartGame)
      quitBtn.addEventListener('click', this.quitGame)

      this.gameInitialized = true
    },
    restartGame() {
      // 게임 재시작 로직을 여기에 추가합니다.
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
