<template>
  <div id="game-container">
    <h1>브라이썬을 이용한 오목 게임</h1>
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
            ctx.fillText(`플레이어 ${currentPlayer} 승리!`, 150, 300)
            canvas.removeEventListener('mousedown', handleClick)
          } else {
            currentPlayer = 3 - currentPlayer
            if (currentPlayer === 2) {
              setTimeout(computerMove, 500)
            }
          }
        }
      }

      const computerMove = () => {
        let bestMove = null
        let maxScore = -1
        let possibleMoves = []

        // 우선순위: 플레이어의 돌 근처에 돌을 놓기
        const userLastMove = getLastUserMove()
        if (userLastMove) {
          for (let y = userLastMove.y - 1; y <= userLastMove.y + 1; y++) {
            for (let x = userLastMove.x - 1; x <= userLastMove.x + 1; x++) {
              if (x >= 0 && x < 15 && y >= 0 && y < 15 && board[y][x] === 0) {
                board[y][x] = currentPlayer
                let score = evaluateMove(x, y)
                board[y][x] = 0

                if (score > maxScore) {
                  maxScore = score
                  bestMove = { x, y }
                  possibleMoves = [{ x, y }]
                } else if (score === maxScore) {
                  possibleMoves.push({ x, y }]
                }
              }
            }
          }
        }

        // 방어 우선: 플레이어의 3개 연속 돌을 막기
        if (!bestMove) {
          const userThreat = getUserThreat()
          if (userThreat) {
            bestMove = userThreat
          } else {
            for (let y = 0; y < 15; y++) {
              for (let x = 0; x < 15; x++) {
                if (board[y][x] === 0) {
                  board[y][x] = currentPlayer
                  let score = evaluateMove(x, y)
                  board[y][x] = 0

                  if (score > maxScore) {
                    maxScore = score
                    bestMove = { x, y }
                    possibleMoves = [{ x, y }]
                  } else if (score === maxScore) {
                    possibleMoves.push({ x, y }]
                  }
                }
              }
            }
          }
        }

        if (possibleMoves.length > 0) {
          const randomIndex = Math.floor(Math.random() * possibleMoves.length)
          bestMove = possibleMoves[randomIndex]
        }

        if (bestMove) {
          const { x, y } = bestMove
          board[y][x] = currentPlayer
          drawStone(x, y, currentPlayer)
          if (checkWinner(x, y)) {
            ctx.fillStyle = 'red'
            ctx.font = '30px Arial'
            ctx.fillText(`플레이어 ${currentPlayer} 승리!`, 150, 300)
            canvas.removeEventListener('mousedown', handleClick)
          }
          currentPlayer = 3 - currentPlayer
        }
      }

      const getUserThreat = () => {
        for (let y = 0; y < 15; y++) {
          for (let x = 0; x < 15; x++) {
            if (board[y][x] === 0 && hasUserThreat(x, y)) {
              return { x, y }
            }
          }
        }
        return null
      }

      const hasUserThreat = (x, y) => {
        const directions = [
          [1, 0], [0, 1], [1, 1], [1, -1]
        ]
        return directions.some(([dx, dy]) => {
          const startCount = countStones(x - dx, y - dy, -dx, -dy)
          const endCount = countStones(x + dx, y + dy, dx, dy)
          return (startCount + endCount - 1 >= 3) && (startCount >= 1 || endCount >= 1)
        })
      }

      const evaluateMove = (x, y) => {
        let score = 0
        const directions = [
          [1, 0], [0, 1], [1, 1], [1, -1]
        ]

        directions.forEach(([dx, dy]) => {
          let count = countStones(x, y, dx, dy) + countStones(x, y, -dx, -dy) - 1
          score += count
          if (countStones(x, y, dx, dy) > 0 || countStones(x, y, -dx, -dy) > 0) {
            score += 10
          }
        })

        const userLastMove = getLastUserMove()
        if (userLastMove) {
          const distance = Math.abs(x - userLastMove.x) + Math.abs(y - userLastMove.y)
          score += 100 - distance
        }

        return score
      }

      const getLastUserMove = () => {
        for (let y = 0; y < 15; y++) {
          for (let x = 0; x < 15; x++) {
            if (board[y][x] === 1) {
              return { x, y }
            }
          }
        }
        return null
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
  border: 1px
}
