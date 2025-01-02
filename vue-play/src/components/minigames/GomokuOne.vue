<template>
  <div id="game-container">
    <h1>Gomoku Game with Brython</h1>
    <canvas id="game-canvas" width="600" height="600"></canvas>
  </div>
</template>

<script>
export default {
  name: 'GomokuGame',
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

      const board = Array(15).fill(null).map(() => Array(15).fill(0))
      let currentPlayer = 1

      const drawGrid = () => {
        for (let i = 0; i < 15; i++) {
          ctx.moveTo(40 * i + 20, 20)
          ctx.lineTo(40 * i + 20, 580)
          ctx.moveTo(20, 40 * i + 20)
          ctx.lineTo(580, 40 * i + 20)
        }
        ctx.stroke()
      }

      const drawStone = (x, y, player) => {
        const color = player === 1 ? 'black' : 'white'
        ctx.beginPath()
        ctx.arc(40 * x + 20, 40 * y + 20, 15, 0, 2 * Math.PI)
        ctx.fillStyle = color
        ctx.fill()
        ctx.closePath()
      }

      const checkWinner = (x, y) => {
        const directions = [
          [1, 0], [0, 1], [1, 1], [1, -1]
        ]
        return directions.some(([dx, dy]) => {
          return countStones(x, y, dx, dy) + countStones(x, y, -dx, -dy) - 1 >= 5
        })
      }

      const countStones = (x, y, dx, dy) => {
        const player = board[y][x]
        let count = 0
        while (x >= 0 && x < 15 && y >= 0 && y < 15 && board[y][x] === player) {
          count++
          x += dx
          y += dy
        }
        return count
      }

      const handleClick = event => {
        const rect = canvas.getBoundingClientRect()
        const x = Math.floor((event.clientX - rect.left) / 40)
        const y = Math.floor((event.clientY - rect.top) / 40)
        if (x >= 0 && x < 15 && y >= 0 && y < 15 && board[y][x] === 0) {
          board[y][x] = currentPlayer
          drawStone(x, y, currentPlayer)
          if (checkWinner(x, y)) {
            ctx.fillStyle = 'red'
            ctx.font = '30px Arial'
            ctx.fillText(`Player ${currentPlayer} wins!`, 150, 300)
            canvas.removeEventListener('mousedown', handleClick)
          } else {
            currentPlayer = 3 - currentPlayer
            if (currentPlayer === 2) {
              setTimeout(computerMove, 500)  // 컴퓨터의 차례
            }
          }
        }
      }

      const computerMove = () => {
        // 간단한 AI 논리: 빈 칸 중 첫 번째로 발견된 칸에 돌을 놓습니다.
        for (let y = 0; y < 15; y++) {
          for (let x = 0; x < 15; x++) {
            if (board[y][x] === 0) {
              board[y][x] = currentPlayer
              drawStone(x, y, currentPlayer)
              if (checkWinner(x, y)) {
                ctx.fillStyle = 'red'
                ctx.font = '30px Arial'
                ctx.fillText(`Player ${currentPlayer} wins!`, 150, 300)
                canvas.removeEventListener('mousedown', handleClick)
              }
              currentPlayer = 3 - currentPlayer
              return
            }
          }
        }
      }

      canvas.addEventListener('mousedown', handleClick)
      drawGrid()
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
