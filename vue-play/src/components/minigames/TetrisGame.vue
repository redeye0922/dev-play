<template>
  <div id="game-container">
    <h1>Tetris Game with Brython</h1>
    <canvas id="game-canvas" width="300" height="600"></canvas>
    <div id="controls">
      <button @click="restartGame">다시하기</button>
      <button @click="quitGame">종료하기</button>
    </div>
    <div id="score">점수: 0</div>
    <div id="level">단계: 1</div>
  </div>
</template>

<script>
export default {
  name: 'TetrisGame',
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

      const WIDTH = 10
      const HEIGHT = 20
      const BLOCK_SIZE = 30

      let board = Array.from({ length: HEIGHT }, () => Array(WIDTH).fill(0))
      let currentBlock = null
      let blockPosition = [0, 3]
      let score = 0
      let level = 1
      let game_over_flag = false
      let move_timer_id = null

      const speed_by_level = { 1: 1000, 2: 900, 3: 800, 4: 700, 5: 600, 6: 500, 7: 400, 8: 300, 9: 200, 10: 100 }
      let game_speed = speed_by_level[level]

      const shapes = [
        [[1, 1, 1], [0, 1, 0]],
        [[1, 1, 1, 1]],
        [[1, 1], [1, 1]],
        [[1, 1, 0], [0, 1, 1]],
        [[0, 1, 1], [1, 1, 0]],
        [[1, 1, 1], [1, 0, 0]],
        [[1, 1, 1], [0, 0, 1]]
      ]

      const createBlock = () => {
        currentBlock = shapes[Math.floor(Math.random() * shapes.length)]
      }

      const rotateBlock = () => {
        currentBlock = currentBlock[0].map((_, index) =>
          currentBlock.map(row => row[index]).reverse()
        )
      }

      const drawBlock = (block, offset) => {
        block.forEach((row, y) => {
          row.forEach((cell, x) => {
            if (cell) {
              ctx.fillStyle = 'blue'
              ctx.fillRect((x + offset[1]) * BLOCK_SIZE, (y + offset[0]) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE)
            }
          })
        })
      }

      const drawBoard = () => {
        ctx.clearRect(0, 0, WIDTH * BLOCK_SIZE, HEIGHT * BLOCK_SIZE)
        board.forEach((row, y) => {
          row.forEach((cell, x) => {
            if (cell) {
              ctx.fillStyle = 'blue'
              ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE)
            }
          })
        })
        if (currentBlock) drawBlock(currentBlock, blockPosition)
        if (!game_over_flag) scheduleNextMove()
      }

      const validPosition = (block, offset) => {
        return block.every((row, y) =>
          row.every((cell, x) =>
            !cell || (
              x + offset[1] >= 0 && x + offset[1] < WIDTH &&
              y + offset[0] < HEIGHT && !board[y + offset[0]][x + offset[1]]
            )
          )
        )
      }

      const moveBlock = (dy, dx) => {
        const newPosition = [blockPosition[0] + dy, blockPosition[1] + dx]
        if (validPosition(currentBlock, newPosition)) {
          blockPosition = newPosition
          return true
        }
        return false
      }

      const dropBlock = () => {
        while (moveBlock(1, 0)) { }
        mergeBlock()
        clearLines()
        createBlock()
        blockPosition = [0, 3]
        scheduleNextMove()
      }

      const mergeBlock = () => {
        currentBlock.forEach((row, y) => {
          row.forEach((cell, x) => {
            if (cell) board[blockPosition[0] + y][blockPosition[1] + x] = 1
          })
        })
      }

      const clearLines = () => {
        const newBoard = board.filter(row => row.some(cell => !cell))
        const linesCleared = HEIGHT - newBoard.length
        if (linesCleared > 0) {
          score += 100 * linesCleared
          document.getElementById('score').textContent = `점수: ${score}`
          if (score >= 1000 * level) {
            level++
            game_speed = speed_by_level[level] || game_speed
            document.getElementById('level').textContent = `단계: ${level}`
          }
          board = [...Array(linesCleared).fill(Array(WIDTH).fill(0)), ...newBoard]
        }
      }

      const keyPressed = (event) => {
        if (game_over_flag) return
        if (event.key === 'ArrowLeft') moveBlock(0, -1)
        else if (event.key === 'ArrowRight') moveBlock(0, 1)
        else if (event.key === 'ArrowDown') moveBlock(1, 0)
        else if (event.key === 'ArrowUp') rotateBlock()
        else if (event.key === ' ') dropBlock()
        drawBoard()
      }

      const scheduleNextMove = () => {
        if (move_timer_id !== null) clearTimeout(move_timer_id)
        move_timer_id = setTimeout(update, game_speed)
      }

      const update = () => {
        if (game_over_flag) return
        if (!moveBlock(1, 0)) {
          mergeBlock()
          clearLines()
          createBlock()
          blockPosition = [0, 3]
          if (board[0].some(cell => cell)) {
            game_over_flag = true
            alert('게임 종료! 다시 시작하시겠습니까?', { confirmAction: startGame })
            return
          }
        }
        drawBoard()
      }

      const startGame = () => {
        board = Array.from
