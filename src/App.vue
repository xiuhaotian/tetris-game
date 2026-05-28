<template>
  <div class="min-h-screen bg-gradient-to-br from-dark-900 to-dark-800 flex items-center justify-center p-4">
    <div class="game-container">
      <div class="header mb-6 text-center">
        <h1 class="text-4xl font-bold text-white mb-2">🎮 俄罗斯方块</h1>
        <p class="text-gray-400">Tetris Classic</p>
      </div>
      
      <div class="game-layout flex gap-6 items-start justify-center">
        <div class="left-panel flex flex-col gap-4">
          <div class="score-panel bg-dark-700/60 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div class="mb-3">
              <p class="text-gray-400 text-sm">得分</p>
              <p class="text-3xl font-bold text-accent-red">{{ score }}</p>
            </div>
            <div class="mb-3">
              <p class="text-gray-400 text-sm">等级</p>
              <p class="text-2xl font-bold text-white">{{ level }}</p>
            </div>
            <div>
              <p class="text-gray-400 text-sm">消除行数</p>
              <p class="text-xl font-semibold text-gray-300">{{ lines }}</p>
            </div>
          </div>
          
          <div class="controls-panel bg-dark-700/60 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <p class="text-gray-400 text-sm mb-2">控制</p>
            <div class="text-xs text-gray-500 space-y-1">
              <p>⬅️ ➡️ 移动</p>
              <p>⬆️ 旋转</p>
              <p>⬇️ 加速</p>
              <p>空格 暂停</p>
            </div>
          </div>
        </div>
        
        <div class="game-board-container">
          <div 
            class="game-board relative border-2 border-white/20 rounded-lg overflow-hidden"
            :style="{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }"
          >
            <canvas ref="canvas" width="300" height="600"></canvas>
            
            <div 
              v-if="gameOver || !isPlaying"
              class="absolute inset-0 bg-dark-900/80 flex flex-col items-center justify-center rounded-lg"
            >
              <p v-if="gameOver" class="text-2xl font-bold text-accent-red mb-4">游戏结束</p>
              <p v-if="!isPlaying" class="text-2xl font-bold text-white mb-4">俄罗斯方块</p>
              <button 
                @click="startGame"
                class="px-6 py-3 bg-gradient-to-r from-accent-red to-pink-500 text-white font-bold rounded-lg hover:opacity-90 transition"
              >
                {{ gameOver ? '重新开始' : '开始游戏' }}
              </button>
            </div>
          </div>
        </div>
        
        <div class="right-panel flex flex-col gap-4">
          <div class="next-piece bg-dark-700/60 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <p class="text-gray-400 text-sm mb-3">下一个</p>
            <canvas ref="nextCanvas" width="120" height="120"></canvas>
          </div>
          
          <div class="stats bg-dark-700/60 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <p class="text-gray-400 text-sm mb-2">最高分</p>
            <p class="text-xl font-bold text-yellow-400">{{ highScore }}</p>
          </div>
        </div>
      </div>
      
      <div class="mobile-controls mt-6 md:hidden">
        <div class="grid grid-cols-3 gap-2 max-w-xs mx-auto">
          <button @click="moveLeft" class="p-4 bg-dark-700/60 rounded-lg border border-white/10 text-white text-2xl">⬅️</button>
          <button @click="rotate" class="p-4 bg-dark-700/60 rounded-lg border border-white/10 text-white text-2xl">🔄</button>
          <button @click="moveRight" class="p-4 bg-dark-700/60 rounded-lg border border-white/10 text-white text-2xl">➡️</button>
          <button @click="drop" class="p-4 bg-dark-700/60 rounded-lg border border-white/10 text-white text-2xl col-span-3">⬇️ 加速下落</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

const canvas = ref(null)
const nextCanvas = ref(null)
const score = ref(0)
const level = ref(1)
const lines = ref(0)
const highScore = ref(parseInt(localStorage.getItem('tetrisHighScore') || '0'))
const gameOver = ref(true)
const isPlaying = ref(false)

let ctx = null
let nextCtx = null
let gameLoop = null
let currentPiece = null
let nextPiece = null
let board = []
let dropInterval = 1000

const BOARD_WIDTH = 10
const BOARD_HEIGHT = 20
const BLOCK_SIZE = 30

const PIECES = [
  { shape: [[1,1,1,1]], color: '#00f5ff' }, // I
  { shape: [[1,1],[1,1]], color: '#ffff00' }, // O
  { shape: [[0,1,0],[1,1,1]], color: '#aa00ff' }, // T
  { shape: [[0,1,1],[1,1,0]], color: '#00ff00' }, // S
  { shape: [[1,1,0],[0,1,1]], color: '#ff0000' }, // Z
  { shape: [[1,0,0],[1,1,1]], color: '#0000ff' }, // J
  { shape: [[0,0,1],[1,1,1]], color: '#ff8800' }, // L
]

const initBoard = () => {
  board = Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0))
}

const createPiece = () => {
  const piece = PIECES[Math.floor(Math.random() * PIECES.length)]
  return {
    shape: piece.shape.map(row => [...row]),
    color: piece.color,
    x: Math.floor((BOARD_WIDTH - piece.shape[0].length) / 2),
    y: 0
  }
}

const drawBlock = (ctx, x, y, color, size = BLOCK_SIZE) => {
  ctx.fillStyle = color
  ctx.fillRect(x * size + 1, y * size + 1, size - 2, size - 2)
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
  ctx.fillRect(x * size + 1, y * size + 1, size - 2, 4)
  ctx.fillRect(x * size + 1, y * size + 1, 4, size - 2)
  
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
  ctx.fillRect(x * size + size - 5, y * size + 1, 4, size - 2)
  ctx.fillRect(x * size + 1, y * size + size - 5, size - 2, 4)
}

const drawBoard = () => {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
  ctx.fillRect(0, 0, BOARD_WIDTH * BLOCK_SIZE, BOARD_HEIGHT * BLOCK_SIZE)
  
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      if (board[y][x]) {
        drawBlock(ctx, x, y, board[y][x])
      }
    }
  }
  
  if (currentPiece) {
    currentPiece.shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          drawBlock(ctx, x + currentPiece.x, y + currentPiece.y, currentPiece.color)
        }
      })
    })
  }
}

const drawNextPiece = () => {
  nextCtx.fillStyle = 'rgba(0, 0, 0, 0.3)'
  nextCtx.fillRect(0, 0, 120, 120)
  
  if (nextPiece) {
    const size = 25
    nextPiece.shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          nextCtx.fillStyle = nextPiece.color
          nextCtx.fillRect(x * size + 1, y * size + 1, size - 2, size - 2)
        }
      })
    })
  }
}

const collides = (piece, offsetX, offsetY, newShape) => {
  const shape = newShape || piece.shape
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        const newX = x + piece.x + offsetX
        const newY = y + piece.y + offsetY
        
        if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
          return true
        }
        
        if (newY >= 0 && board[newY][newX]) {
          return true
        }
      }
    }
  }
  return false
}

const mergePiece = () => {
  currentPiece.shape.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell) {
        board[y + currentPiece.y][x + currentPiece.x] = currentPiece.color
      }
    })
  })
}

const clearLines = () => {
  let linesCleared = 0
  
  for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
    if (board[y].every(cell => cell !== 0)) {
      board.splice(y, 1)
      board.unshift(Array(BOARD_WIDTH).fill(0))
      linesCleared++
      y++
    }
  }
  
  if (linesCleared > 0) {
    const points = [0, 100, 300, 500, 800][linesCleared] * level.value
    score.value += points
    lines.value += linesCleared
    
    if (score.value > highScore.value) {
      highScore.value = score.value
      localStorage.setItem('tetrisHighScore', highScore.value.toString())
    }
    
    level.value = Math.floor(lines.value / 10) + 1
    dropInterval = Math.max(100, 1000 - (level.value - 1) * 100)
  }
}

const rotate = () => {
  if (!currentPiece || !isPlaying.value) return
  
  const rotated = currentPiece.shape[0].map((_, i) =>
    currentPiece.shape.map(row => row[i]).reverse()
  )
  
  if (!collides(currentPiece, 0, 0, rotated)) {
    currentPiece.shape = rotated
  }
}

const moveLeft = () => {
  if (currentPiece && isPlaying.value && !collides(currentPiece, -1, 0)) {
    currentPiece.x--
  }
}

const moveRight = () => {
  if (currentPiece && isPlaying.value && !collides(currentPiece, 1, 0)) {
    currentPiece.x++
  }
}

const drop = () => {
  if (currentPiece && isPlaying.value && !collides(currentPiece, 0, 1)) {
    currentPiece.y++
  }
}

const moveDown = () => {
  if (!isPlaying.value) return
  
  if (collides(currentPiece, 0, 1)) {
    mergePiece()
    clearLines()
    
    currentPiece = nextPiece
    nextPiece = createPiece()
    drawNextPiece()
    
    if (collides(currentPiece, 0, 0)) {
      gameOver.value = true
      isPlaying.value = false
      clearInterval(gameLoop)
    }
  } else {
    currentPiece.y++
  }
}

const update = () => {
  drawBoard()
  moveDown()
}

const startGame = () => {
  initBoard()
  score.value = 0
  level.value = 1
  lines.value = 0
  dropInterval = 1000
  gameOver.value = false
  isPlaying.value = true
  
  currentPiece = createPiece()
  nextPiece = createPiece()
  drawNextPiece()
  
  if (gameLoop) clearInterval(gameLoop)
  gameLoop = setInterval(update, dropInterval)
}

const handleKeydown = (e) => {
  if (!isPlaying.value && e.code !== 'Space') return
  
  switch(e.code) {
    case 'ArrowLeft':
      e.preventDefault()
      moveLeft()
      break
    case 'ArrowRight':
      e.preventDefault()
      moveRight()
      break
    case 'ArrowDown':
      e.preventDefault()
      drop()
      break
    case 'ArrowUp':
      e.preventDefault()
      rotate()
      break
    case 'Space':
      e.preventDefault()
      if (gameOver.value) {
        startGame()
      }
      break
  }
}

watch(level, (newLevel) => {
  if (gameLoop) {
    clearInterval(gameLoop)
    gameLoop = setInterval(update, dropInterval)
  }
})

onMounted(() => {
  ctx = canvas.value.getContext('2d')
  nextCtx = nextCanvas.value.getContext('2d')
  
  initBoard()
  drawBoard()
  drawNextPiece()
  
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (gameLoop) clearInterval(gameLoop)
})
</script>

<style scoped>
.game-container {
  max-width: 800px;
  width: 100%;
}

@media (max-width: 768px) {
  .game-layout {
    flex-direction: column;
    align-items: center;
  }
  
  .left-panel, .right-panel {
    flex-direction: row;
    width: 100%;
    justify-content: center;
  }
}
</style>
