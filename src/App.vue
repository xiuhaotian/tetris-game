<template>
  <div class="game-wrapper" ref="gameWrapper">
    <canvas ref="bgCanvas" class="background-canvas"></canvas>
    
    <div class="language-switcher" @click="toggleLanguage">
      <span class="lang-icon">{{ currentLang === 'zh' ? '🇨🇳' : '🇬🇧' }}</span>
      <span class="lang-text">{{ currentLang === 'zh' ? '中文' : 'English' }}</span>
    </div>
    
    <div class="game-container">
      <div class="title-section">
        <h1 class="game-title">
          <span class="title-icon">🎮</span>
          {{ t('title') }}
          <span class="title-icon">✨</span>
        </h1>
        <p class="game-subtitle">T E T R I S</p>
        <div class="title-glow"></div>
      </div>
      
      <div class="game-area">
        <div class="left-panel glass-panel">
          <div class="stat-card score-card">
            <div class="stat-icon">🏆</div>
            <div class="stat-content">
              <div class="stat-label">{{ t('score') }}</div>
              <div class="stat-value score">{{ displayScore.toLocaleString() }}</div>
            </div>
            <div class="stat-glow score-glow"></div>
          </div>
          
          <div class="stat-card level-card">
            <div class="stat-icon">⚡</div>
            <div class="stat-content">
              <div class="stat-label">{{ t('level') }}</div>
              <div class="stat-value level">{{ level }}</div>
            </div>
            <div class="stat-glow level-glow"></div>
          </div>
          
          <div class="stat-card lines-card">
            <div class="stat-icon">📊</div>
            <div class="stat-content">
              <div class="stat-label">{{ t('lines') }}</div>
              <div class="stat-value lines">{{ lines }}</div>
            </div>
            <div class="stat-glow lines-glow"></div>
          </div>
          
          <div class="stat-card highscore-card">
            <div class="stat-icon">👑</div>
            <div class="stat-content">
              <div class="stat-label">{{ t('highscore') }}</div>
              <div class="stat-value highscore">{{ highScore.toLocaleString() }}</div>
            </div>
            <div class="stat-glow highscore-glow"></div>
          </div>
          
          <div class="combo-display" v-if="combo > 1">
            <div class="combo-text">{{ combo }}x COMBO!</div>
            <div class="combo-particles"></div>
          </div>
        </div>
        
        <div class="board-section">
          <div class="board-3d-container">
            <div class="board-perspective">
              <div class="board-frame glass-panel">
                <div class="board-inner">
                  <canvas ref="gameCanvas" width="320" height="640"></canvas>
                  <div class="board-scanline"></div>
                </div>
                <div class="board-glow-effect"></div>
              </div>
            </div>
          </div>
          
          <button class="start-btn glass-btn" @click="startGame" v-if="!isPlaying && !gameOver">
            <span class="btn-icon">▶</span>
            <span class="btn-text">{{ t('start') }}</span>
            <div class="btn-particles"></div>
          </button>
          
          <button class="start-btn glass-btn restart" @click="startGame" v-if="gameOver">
            <span class="btn-icon">↻</span>
            <span class="btn-text">{{ t('restart') }}</span>
            <div class="btn-particles"></div>
          </button>
        </div>
        
        <div class="right-panel glass-panel">
          <div class="next-piece-container">
            <div class="next-label">{{ t('next') }}</div>
            <div class="next-canvas-wrapper">
              <canvas ref="nextCanvas" width="140" height="140"></canvas>
              <div class="next-glow"></div>
            </div>
          </div>
          
          <div class="controls-section">
            <div class="controls-title">{{ t('controls') }}</div>
            <div class="control-item">
              <span class="key-icon">←→</span>
              <span class="action">{{ t('move') }}</span>
            </div>
            <div class="control-item">
              <span class="key-icon">↑</span>
              <span class="action">{{ t('rotate') }}</span>
            </div>
            <div class="control-item">
              <span class="key-icon">↓</span>
              <span class="action">{{ t('speed') }}</span>
            </div>
            <div class="control-item">
              <span class="key-icon">空格</span>
              <span class="action">{{ t('drop') }}</span>
            </div>
          </div>
          
          <div class="achievements-section" v-if="achievements.length > 0">
            <div class="achievements-title">{{ t('achievements') }}</div>
            <div class="achievement-list">
              <div class="achievement" v-for="ach in achievements" :key="ach">
                {{ ach }}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="game-over-overlay" v-if="gameOver">
        <div class="overlay-content">
          <div class="game-over-text">{{ t('gameover') }}</div>
          <div class="final-score">{{ t('finalscore') }}</div>
          <div class="final-score-value">{{ score.toLocaleString() }}</div>
        </div>
      </div>
      
      <div class="mobile-controls" v-if="showMobileControls">
        <button class="mobile-btn" @touchstart.prevent="moveLeft">←</button>
        <button class="mobile-btn" @touchstart.prevent="rotate">↻</button>
        <button class="mobile-btn" @touchstart.prevent="moveRight">→</button>
        <button class="mobile-btn drop" @touchstart.prevent="hardDrop">⬇</button>
      </div>
    </div>
    
    <div class="combo-overlay" v-if="showComboEffect">
      <div class="combo-effect">{{ comboEffectText }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const gameCanvas = ref(null)
const nextCanvas = ref(null)
const gameWrapper = ref(null)
const bgCanvas = ref(null)

const score = ref(0)
const displayScore = ref(0)
const level = ref(1)
const lines = ref(0)
const highScore = ref(parseInt(localStorage.getItem('tetrisHighScore') || '0'))
const gameOver = ref(false)
const isPlaying = ref(false)
const combo = ref(0)
const showMobileControls = ref(false)
const achievements = ref([])
const currentLang = ref('zh')

const showComboEffect = ref(false)
const comboEffectText = ref('')

let ctx = null
let nextCtx = null
let bgCtx = null
let gameLoop = null
let bgAnimationFrame = null
let currentPiece = null
let nextPiece = null
let board = []
let dropInterval = 1000
let particlesArray = []
let starsArray = []
let comboTimer = null

const BOARD_WIDTH = 10
const BOARD_HEIGHT = 20
const BLOCK_SIZE = 32

const translations = {
  zh: {
    title: '俄罗斯方块',
    score: '得分',
    level: '等级',
    lines: '消除行数',
    highscore: '最高分',
    start: '开始游戏',
    restart: '再来一局',
    next: '下一个',
    controls: '操作指南',
    move: '移动',
    rotate: '旋转',
    speed: '加速',
    drop: '硬降',
    achievements: '成就',
    gameover: '游戏结束',
    finalscore: '最终得分',
    newRecord: '🏆 新纪录!',
    lines10: '📊 10行大师',
    lines50: '🔥 50行达人'
  },
  en: {
    title: 'TETRIS',
    score: 'Score',
    level: 'Level',
    lines: 'Lines',
    highscore: 'High Score',
    start: 'Start',
    restart: 'Restart',
    next: 'Next',
    controls: 'Controls',
    move: 'Move',
    rotate: 'Rotate',
    speed: 'Speed',
    drop: 'Drop',
    achievements: 'Achievements',
    gameover: 'Game Over',
    finalscore: 'Final Score',
    newRecord: '🏆 New Record!',
    lines10: '📊 10 Lines Master',
    lines50: '🔥 50 Lines Expert'
  }
}

const t = computed(() => (key) => translations[currentLang.value][key] || key)

const COLORS = {
  I: { 
    main: '#00f5ff', 
    light: '#80fcff', 
    dark: '#00b8c4', 
    glow: 'rgba(0, 245, 255, 0.8)',
    gradient: ['#00f5ff', '#00d4e0', '#00a8b8']
  },
  O: { 
    main: '#ffd700', 
    light: '#ffed80', 
    dark: '#cca300', 
    glow: 'rgba(255, 215, 0, 0.8)',
    gradient: ['#ffd700', '#e6c200', '#b89900']
  },
  T: { 
    main: '#bf5fff', 
    light: '#d98fff', 
    dark: '#9933ff', 
    glow: 'rgba(191, 95, 255, 0.8)',
    gradient: ['#bf5fff', '#9933ff', '#7a00e6']
  },
  S: { 
    main: '#00ff88', 
    light: '#66ffaa', 
    dark: '#00cc66', 
    glow: 'rgba(0, 255, 136, 0.8)',
    gradient: ['#00ff88', '#00e673', '#00b359']
  },
  Z: { 
    main: '#ff4757', 
    light: '#ff6b7a', 
    dark: '#cc3945', 
    glow: 'rgba(255, 71, 87, 0.8)',
    gradient: ['#ff4757', '#e63946', '#cc2936']
  },
  J: { 
    main: '#4a90ff', 
    light: '#7aadff', 
    dark: '#3373cc', 
    glow: 'rgba(74, 144, 255, 0.8)',
    gradient: ['#4a90ff', '#3373e6', '#1a52cc']
  },
  L: { 
    main: '#ff9f43', 
    light: '#ffb86c', 
    dark: '#cc7f36', 
    glow: 'rgba(255, 159, 67, 0.8)',
    gradient: ['#ff9f43', '#e68a3d', '#cc7030']
  },
}

const PIECES = [
  { type: 'I', shape: [[1,1,1,1]], color: COLORS.I },
  { type: 'O', shape: [[1,1],[1,1]], color: COLORS.O },
  { type: 'T', shape: [[0,1,0],[1,1,1]], color: COLORS.T },
  { type: 'S', shape: [[0,1,1],[1,1,0]], color: COLORS.S },
  { type: 'Z', shape: [[1,1,0],[0,1,1]], color: COLORS.Z },
  { type: 'J', shape: [[1,0,0],[1,1,1]], color: COLORS.J },
  { type: 'L', shape: [[0,0,1],[1,1,1]], color: COLORS.L },
]

class Star {
  constructor(canvas) {
    this.x = Math.random() * canvas.width
    this.y = Math.random() * canvas.height
    this.size = Math.random() * 2 + 0.5
    this.speed = Math.random() * 0.5 + 0.1
    this.opacity = Math.random()
    this.twinkleSpeed = Math.random() * 0.02 + 0.01
    this.color = this.getStarColor()
  }
  
  getStarColor() {
    const colors = [
      'rgba(255, 255, 255, 1)',
      'rgba(200, 220, 255, 1)',
      'rgba(255, 240, 200, 1)',
      'rgba(255, 200, 255, 1)',
      'rgba(200, 255, 255, 1)',
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }
  
  update(canvas) {
    this.opacity += this.twinkleSpeed
    if (this.opacity > 1 || this.opacity < 0.3) {
      this.twinkleSpeed = -this.twinkleSpeed
    }
    this.y += this.speed
    if (this.y > canvas.height) {
      this.y = 0
      this.x = Math.random() * canvas.width
    }
  }
  
  draw(ctx) {
    ctx.save()
    ctx.globalAlpha = this.opacity
    ctx.fillStyle = this.color
    ctx.shadowBlur = this.size * 3
    ctx.shadowColor = this.color
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
}

class Particle3D {
  constructor(x, y, color) {
    this.x = x
    this.y = y
    this.color = color
    this.size = Math.random() * 8 + 4
    this.speedX = (Math.random() - 0.5) * 12
    this.speedY = (Math.random() - 0.5) * 12 - 5
    this.gravity = 0.4
    this.life = 1
    this.decay = 0.015 + Math.random() * 0.01
    this.rotation = Math.random() * Math.PI * 2
    this.rotationSpeed = (Math.random() - 0.5) * 0.3
    this.trail = []
  }
  
  update() {
    this.trail.push({ x: this.x, y: this.y, life: 0.5 })
    if (this.trail.length > 8) {
      this.trail.shift()
    }
    
    this.x += this.speedX
    this.y += this.speedY
    this.speedY += this.gravity
    this.life -= this.decay
    this.rotation += this.rotationSpeed
    
    this.trail.forEach(t => t.life -= 0.05)
  }
  
  draw(ctx) {
    ctx.save()
    
    this.trail.forEach((t, i) => {
      ctx.globalAlpha = t.life * 0.3
      ctx.fillStyle = this.color
      ctx.beginPath()
      ctx.arc(t.x, t.y, this.size * 0.3, 0, Math.PI * 2)
      ctx.fill()
    })
    
    ctx.globalAlpha = this.life
    ctx.translate(this.x, this.y)
    ctx.rotate(this.rotation)
    
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size)
    gradient.addColorStop(0, this.color)
    gradient.addColorStop(0.5, this.color)
    gradient.addColorStop(1, 'transparent')
    
    ctx.fillStyle = gradient
    ctx.shadowBlur = 20
    ctx.shadowColor = this.color
    ctx.beginPath()
    ctx.arc(0, 0, this.size, 0, Math.PI * 2)
    ctx.fill()
    
    ctx.restore()
  }
}

class LineClearEffect {
  constructor(y, colors) {
    this.y = y
    this.colors = colors
    this.progress = 0
    this.speed = 0.1
    this.particles = []
  }
  
  update() {
    this.progress += this.speed
    
    if (this.progress > 0.3 && this.particles.length < 100) {
      const color = this.colors[Math.floor(Math.random() * this.colors.length)]
      const x = Math.random() * (BOARD_WIDTH * BLOCK_SIZE)
      this.particles.push(new Particle3D(x, this.y * BLOCK_SIZE + 16, color))
    }
    
    this.particles = this.particles.filter(p => {
      p.update()
      return p.life > 0
    })
  }
  
  draw(ctx) {
    if (this.progress < 1) {
      const width = BOARD_WIDTH * BLOCK_SIZE * this.progress
      const startX = (BOARD_WIDTH * BLOCK_SIZE - width) / 2
      const gradient = ctx.createLinearGradient(startX, 0, startX + width, 0)
      gradient.addColorStop(0, 'transparent')
      gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)')
      gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.8)')
      gradient.addColorStop(1, 'transparent')
      
      ctx.save()
      ctx.fillStyle = gradient
      ctx.fillRect(startX, this.y * BLOCK_SIZE, width, BLOCK_SIZE)
      ctx.restore()
    }
    
    this.particles.forEach(p => p.draw(ctx))
  }
  
  isDone() {
    return this.progress > 1.5 && this.particles.length === 0
  }
}

let lineClearEffects = []

const initBoard = () => {
  board = Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0))
}

const createPiece = () => {
  const piece = PIECES[Math.floor(Math.random() * PIECES.length)]
  return {
    type: piece.type,
    shape: piece.shape.map(row => [...row]),
    color: piece.color,
    x: Math.floor((BOARD_WIDTH - piece.shape[0].length) / 2),
    y: 0,
    rotation: 0
  }
}

const drawBlock3D = (ctx, x, y, colorSet, size = BLOCK_SIZE, alpha = 1, isGhost = false) => {
  const px = x * size
  const py = y * size
  
  ctx.save()
  ctx.globalAlpha = alpha
  
  if (!isGhost) {
    ctx.shadowBlur = 20
    ctx.shadowColor = colorSet.glow
  }
  
  const gradient = ctx.createLinearGradient(px, py, px + size, py + size)
  gradient.addColorStop(0, colorSet.gradient[0])
  gradient.addColorStop(0.5, colorSet.gradient[1])
  gradient.addColorStop(1, colorSet.gradient[2])
  
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.roundRect(px + 2, py + 2, size - 4, size - 4, 6)
  ctx.fill()
  
  if (!isGhost) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
    ctx.beginPath()
    ctx.roundRect(px + 4, py + 4, size - 10, 6, 3)
    ctx.fill()
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.beginPath()
    ctx.roundRect(px + 4, py + size - 10, size - 8, 6, 3)
    ctx.fill()
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'
    ctx.beginPath()
    ctx.roundRect(px + 4, py + 4, 6, size - 8, 3)
    ctx.fill()
  }
  
  ctx.restore()
}

const drawBoard = () => {
  ctx.fillStyle = 'rgba(5, 5, 10, 0.95)'
  ctx.fillRect(0, 0, BOARD_WIDTH * BLOCK_SIZE, BOARD_HEIGHT * BLOCK_SIZE)
  
  const gridGradient = ctx.createLinearGradient(0, 0, 0, BOARD_HEIGHT * BLOCK_SIZE)
  gridGradient.addColorStop(0, 'rgba(30, 30, 50, 0.1)')
  gridGradient.addColorStop(1, 'rgba(20, 20, 40, 0.2)')
  ctx.fillStyle = gridGradient
  ctx.fillRect(0, 0, BOARD_WIDTH * BLOCK_SIZE, BOARD_HEIGHT * BLOCK_SIZE)
  
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    ctx.strokeStyle = 'rgba(100, 100, 150, 0.1)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, y * BLOCK_SIZE)
    ctx.lineTo(BOARD_WIDTH * BLOCK_SIZE, y * BLOCK_SIZE)
    ctx.stroke()
  }
  
  for (let x = 0; x < BOARD_WIDTH; x++) {
    ctx.strokeStyle = 'rgba(100, 100, 150, 0.1)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(x * BLOCK_SIZE, 0)
    ctx.lineTo(x * BLOCK_SIZE, BOARD_HEIGHT * BLOCK_SIZE)
    ctx.stroke()
  }
  
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      if (board[y][x]) {
        const colorKey = Object.keys(COLORS).find(k => 
          COLORS[k].main === board[y][x] || 
          COLORS[k].gradient[0] === board[y][x]
        )
        if (colorKey) {
          drawBlock3D(ctx, x, y, COLORS[colorKey])
        } else {
          const defaultColor = {
            main: board[y][x],
            gradient: [board[y][x], board[y][x], board[y][x]],
            glow: board[y][x]
          }
          drawBlock3D(ctx, x, y, defaultColor)
        }
      }
    }
  }
  
  lineClearEffects = lineClearEffects.filter(effect => {
    effect.update()
    effect.draw(ctx)
    return !effect.isDone()
  })
  
  if (currentPiece) {
    const ghostY = getGhostPosition()
    currentPiece.shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          ctx.save()
          ctx.globalAlpha = 0.15
          ctx.strokeStyle = currentPiece.color.main
          ctx.lineWidth = 2
          ctx.setLineDash([4, 4])
          ctx.strokeRect(
            (x + currentPiece.x) * BLOCK_SIZE + 4,
            (y + ghostY) * BLOCK_SIZE + 4,
            BLOCK_SIZE - 8,
            BLOCK_SIZE - 8
          )
          ctx.restore()
        }
      })
    })
    
    currentPiece.shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          drawBlock3D(ctx, x + currentPiece.x, y + currentPiece.y, currentPiece.color)
        }
      })
    })
  }
}

const getGhostPosition = () => {
  if (!currentPiece) return 0
  let ghostY = currentPiece.y
  while (!collides(currentPiece, 0, ghostY - currentPiece.y + 1)) {
    ghostY++
  }
  return ghostY
}

const drawNextPiece = () => {
  nextCtx.fillStyle = 'rgba(10, 10, 20, 0.8)'
  nextCtx.fillRect(0, 0, 140, 140)
  
  if (nextPiece) {
    const blockSize = 30
    const offsetX = (140 - nextPiece.shape[0].length * blockSize) / 2
    const offsetY = (140 - nextPiece.shape.length * blockSize) / 2
    
    nextPiece.shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          const color = nextPiece.color
          const px = offsetX + x * blockSize
          const py = offsetY + y * blockSize
          
          nextCtx.shadowBlur = 15
          nextCtx.shadowColor = color.glow
          
          const gradient = nextCtx.createLinearGradient(px, py, px + blockSize, py + blockSize)
          gradient.addColorStop(0, color.gradient[0])
          gradient.addColorStop(1, color.gradient[2])
          
          nextCtx.fillStyle = gradient
          nextCtx.beginPath()
          nextCtx.roundRect(px + 2, py + 2, blockSize - 4, blockSize - 4, 4)
          nextCtx.fill()
          
          nextCtx.fillStyle = 'rgba(255, 255, 255, 0.3)'
          nextCtx.beginPath()
          nextCtx.roundRect(px + 3, py + 3, blockSize - 8, 4, 2)
          nextCtx.fill()
        }
      })
    })
  }
}

const createParticles3D = (x, y, color, count = 15) => {
  for (let i = 0; i < count; i++) {
    const px = x * BLOCK_SIZE + BLOCK_SIZE / 2
    const py = y * BLOCK_SIZE + BLOCK_SIZE / 2
    particlesArray.push(new Particle3D(px, py, color))
  }
}

const updateParticles = () => {
  particlesArray = particlesArray.filter(p => p.life > 0)
  particlesArray.forEach(p => {
    p.update()
    p.draw(ctx)
  })
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
        board[y + currentPiece.y][x + currentPiece.x] = currentPiece.color.gradient[0]
        createParticles3D(x + currentPiece.x, y + currentPiece.y, currentPiece.color.main, 5)
      }
    })
  })
}

const clearLines = () => {
  let clearedCount = 0
  let clearedColors = []
  
  for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
    if (board[y].every(cell => cell !== 0)) {
      clearedColors = [...clearedColors, ...board[y].filter(c => c !== 0)]
      lineClearEffects.push(new LineClearEffect(y, clearedColors))
      
      board.splice(y, 1)
      board.unshift(Array(BOARD_WIDTH).fill(0))
      clearedCount++
      y++
    }
  }
  
  if (clearedCount > 0) {
    combo.value++
    
    if (comboTimer) clearTimeout(comboTimer)
    comboTimer = setTimeout(() => {
      combo.value = 0
    }, 2000)
    
    const pointsTable = [0, 100, 300, 500, 800]
    const comboBonus = combo.value > 1 ? combo.value * 0.5 : 1
    const points = Math.floor(pointsTable[Math.min(clearedCount, 4)] * level.value * comboBonus)
    score.value += points
    
    lines.value += clearedCount
    level.value = Math.floor(lines.value / 10) + 1
    dropInterval = Math.max(100, 1000 - (level.value - 1) * 80)
    
    if (score.value > highScore.value) {
      highScore.value = score.value
      localStorage.setItem('tetrisHighScore', highScore.value.toString())
      
      if (!achievements.value.includes(t.value('newRecord'))) {
        achievements.value.push(t.value('newRecord'))
      }
    }
    
    if (lines.value >= 10 && !achievements.value.includes(t.value('lines10'))) {
      achievements.value.push(t.value('lines10'))
    }
    if (lines.value >= 50 && !achievements.value.includes(t.value('lines50'))) {
      achievements.value.push(t.value('lines50'))
    }
    
    if (combo.value > 1) {
      showComboEffect.value = true
      comboEffectText.value = `${combo.value}x COMBO! +${points}`
      setTimeout(() => {
        showComboEffect.value = false
      }, 1000)
    }
    
    if (gameLoop) {
      clearInterval(gameLoop)
      gameLoop = setInterval(update, dropInterval)
    }
  }
}

const rotate = () => {
  if (!currentPiece || !isPlaying.value) return
  
  const rotated = currentPiece.shape[0].map((_, i) =>
    currentPiece.shape.map(row => row[i]).reverse()
  )
  
  if (!collides(currentPiece, 0, 0, rotated)) {
    currentPiece.shape = rotated
  } else if (!collides(currentPiece, 1, 0, rotated)) {
    currentPiece.x++
    currentPiece.shape = rotated
  } else if (!collides(currentPiece, -1, 0, rotated)) {
    currentPiece.x--
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

const hardDrop = () => {
  if (!currentPiece || !isPlaying.value) return
  while (!collides(currentPiece, 0, 1)) {
    currentPiece.y++
    score.value += 2
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
  updateParticles()
  moveDown()
}

const animateScore = () => {
  if (displayScore.value < score.value) {
    displayScore.value += Math.ceil((score.value - displayScore.value) / 10)
  }
}

const initBackground = () => {
  bgCtx = bgCanvas.value.getContext('2d')
  
  const resize = () => {
    bgCanvas.value.width = window.innerWidth
    bgCanvas.value.height = window.innerHeight
  }
  
  resize()
  window.addEventListener('resize', resize)
  
  starsArray = []
  for (let i = 0; i < 150; i++) {
    starsArray.push(new Star(bgCanvas.value))
  }
  
  const animateBg = () => {
    bgCtx.fillStyle = 'rgba(5, 5, 10, 1)'
    bgCtx.fillRect(0, 0, bgCanvas.value.width, bgCanvas.value.height)
    
    const gradient = bgCtx.createRadialGradient(
      bgCanvas.value.width * 0.3, bgCanvas.value.height * 0.3, 0,
      bgCanvas.value.width * 0.3, bgCanvas.value.height * 0.3, bgCanvas.value.width * 0.6
    )
    gradient.addColorStop(0, 'rgba(30, 20, 60, 0.3)')
    gradient.addColorStop(1, 'transparent')
    bgCtx.fillStyle = gradient
    bgCtx.fillRect(0, 0, bgCanvas.value.width, bgCanvas.value.height)
    
    const gradient2 = bgCtx.createRadialGradient(
      bgCanvas.value.width * 0.7, bgCanvas.value.height * 0.7, 0,
      bgCanvas.value.width * 0.7, bgCanvas.value.height * 0.7, bgCanvas.value.width * 0.5
    )
    gradient2.addColorStop(0, 'rgba(20, 40, 60, 0.2)')
    gradient2.addColorStop(1, 'transparent')
    bgCtx.fillStyle = gradient2
    bgCtx.fillRect(0, 0, bgCanvas.value.width, bgCanvas.value.height)
    
    starsArray.forEach(star => {
      star.update(bgCanvas.value)
      star.draw(bgCtx)
    })
    
    bgAnimationFrame = requestAnimationFrame(animateBg)
  }
  
  animateBg()
}

const checkMobile = () => {
  showMobileControls.value = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

const toggleLanguage = () => {
  currentLang.value = currentLang.value === 'zh' ? 'en' : 'zh'
  localStorage.setItem('tetrisLang', currentLang.value)
}

const startGame = () => {
  initBoard()
  score.value = 0
  displayScore.value = 0
  level.value = 1
  lines.value = 0
  dropInterval = 1000
  gameOver.value = false
  isPlaying.value = true
  particlesArray = []
  combo.value = 0
  lineClearEffects = []
  achievements.value = []
  
  currentPiece = createPiece()
  nextPiece = createPiece()
  drawNextPiece()
  
  if (gameLoop) clearInterval(gameLoop)
  gameLoop = setInterval(update, dropInterval)
  setInterval(animateScore, 50)
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
      hardDrop()
      break
  }
}

onMounted(() => {
  ctx = gameCanvas.value.getContext('2d')
  nextCtx = nextCanvas.value.getContext('2d')
  
  const savedLang = localStorage.getItem('tetrisLang')
  if (savedLang) {
    currentLang.value = savedLang
  }
  
  initBoard()
  drawBoard()
  drawNextPiece()
  initBackground()
  checkMobile()
  
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (gameLoop) clearInterval(gameLoop)
  if (bgAnimationFrame) cancelAnimationFrame(bgAnimationFrame)
  if (comboTimer) clearTimeout(comboTimer)
})
</script>

<style scoped>
.game-wrapper {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

.background-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.language-switcher {
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 100;
  backdrop-filter: blur(10px);
}

.language-switcher:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: scale(1.05);
}

.lang-icon {
  font-size: 1.2rem;
}

.lang-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  font-weight: 500;
}

.game-container {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  min-height: 100vh;
}

.title-section {
  text-align: center;
  margin-bottom: 30px;
  position: relative;
}

.game-title {
  font-size: 3.5rem;
  font-weight: 900;
  background: linear-gradient(135deg, #ff6b9d 0%, #c94bff 50%, #6b9dff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  letter-spacing: 6px;
  animation: titleGlow 3s ease-in-out infinite;
  display: flex;
  align-items: center;
  gap: 15px;
}

.title-icon {
  font-size: 2.5rem;
  animation: iconBounce 2s ease-in-out infinite;
}

.title-icon:last-child {
  animation-delay: 1s;
}

@keyframes titleGlow {
  0%, 100% { 
    filter: drop-shadow(0 0 20px rgba(201, 75, 255, 0.5));
  }
  50% { 
    filter: drop-shadow(0 0 40px rgba(107, 157, 255, 0.8));
  }
}

@keyframes iconBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.game-subtitle {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.3);
  letter-spacing: 20px;
  margin-top: 10px;
  font-weight: 300;
}

.title-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  height: 150px;
  background: radial-gradient(ellipse, rgba(201, 75, 255, 0.2), transparent 70%);
  z-index: -1;
  filter: blur(40px);
}

.glass-panel {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.glass-btn {
  background: linear-gradient(135deg, rgba(201, 75, 255, 0.3), rgba(107, 157, 255, 0.3));
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 30px;
  padding: 15px 40px;
  font-size: 1.2rem;
  font-weight: 700;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 10px;
}

.glass-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 15px 40px rgba(201, 75, 255, 0.4);
}

.glass-btn .btn-icon {
  font-size: 1.5rem;
}

.glass-btn .btn-particles {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transform: translateX(-100%);
  animation: btnShine 2s ease-in-out infinite;
}

@keyframes btnShine {
  0%, 100% { transform: translateX(-100%); }
  50% { transform: translateX(100%); }
}

.game-area {
  display: flex;
  gap: 30px;
  align-items: flex-start;
}

.left-panel {
  padding: 25px;
  min-width: 160px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.stat-card {
  position: relative;
  padding: 20px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  gap: 15px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateX(5px);
  background: rgba(255, 255, 255, 0.05);
}

.stat-icon {
  font-size: 2rem;
}

.stat-content {
  flex: 1;
}

.stat-label {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 800;
}

.stat-value.score {
  background: linear-gradient(135deg, #ff6b9d, #ff9dbd);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-value.level {
  background: linear-gradient(135deg, #6b9dff, #9dbbff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-value.lines {
  background: linear-gradient(135deg, #9dff6b, #bbff9d);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-value.highscore {
  background: linear-gradient(135deg, #ffd700, #ffed4a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-glow {
  position: absolute;
  inset: -2px;
  border-radius: 18px;
  opacity: 0;
  transition: opacity 0.3s ease;
  filter: blur(10px);
}

.stat-card:hover .stat-glow {
  opacity: 0.3;
}

.score-glow { background: linear-gradient(135deg, #ff6b9d, #ff9dbd); }
.level-glow { background: linear-gradient(135deg, #6b9dff, #9dbbff); }
.lines-glow { background: linear-gradient(135deg, #9dff6b, #bbff9d); }
.highscore-glow { background: linear-gradient(135deg, #ffd700, #ffed4a); }

.combo-display {
  text-align: center;
  padding: 15px;
  background: linear-gradient(135deg, rgba(255, 107, 157, 0.2), rgba(201, 75, 255, 0.2));
  border-radius: 12px;
  animation: comboPulse 0.5s ease-in-out infinite;
}

.combo-text {
  font-size: 1.5rem;
  font-weight: 900;
  background: linear-gradient(135deg, #ff6b9d, #c94bff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

@keyframes comboPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.board-section {
  position: relative;
}

.board-3d-container {
  perspective: 1000px;
}

.board-perspective {
  transform: rotateX(5deg);
  transform-style: preserve-3d;
}

.board-frame {
  position: relative;
  padding: 6px;
  background: linear-gradient(135deg, rgba(201, 75, 255, 0.3), rgba(107, 157, 255, 0.3));
  border-radius: 16px;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 0 100px rgba(201, 75, 255, 0.2);
}

.board-inner {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
}

.board-scanline {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    transparent 50%,
    rgba(255, 255, 255, 0.02) 50%
  );
  background-size: 100% 4px;
  pointer-events: none;
  animation: scanline 8s linear infinite;
}

@keyframes scanline {
  0% { background-position: 0 0; }
  100% { background-position: 0 100%; }
}

.board-glow-effect {
  position: absolute;
  inset: -3px;
  background: linear-gradient(45deg, #ff6b9d, #c94bff, #6b9dff, #ff6b9d);
  border-radius: 18px;
  z-index: -1;
  filter: blur(20px);
  opacity: 0.4;
  animation: boardGlow 4s ease-in-out infinite;
}

@keyframes boardGlow {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.5; }
}

canvas {
  display: block;
  border-radius: 10px;
}

.start-btn {
  position: absolute;
  bottom: -70px;
  left: 50%;
  transform: translateX(-50%);
}

.right-panel {
  padding: 25px;
  min-width: 180px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.next-piece-container {
  text-align: center;
}

.next-label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 3px;
  margin-bottom: 15px;
}

.next-canvas-wrapper {
  position: relative;
  display: inline-block;
}

.next-canvas-wrapper canvas {
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.next-glow {
  position: absolute;
  inset: -5px;
  background: linear-gradient(135deg, rgba(201, 75, 255, 0.3), rgba(107, 157, 255, 0.3));
  border-radius: 16px;
  z-index: -1;
  filter: blur(15px);
  opacity: 0.5;
}

.controls-section {
  margin-top: 10px;
}

.controls-title {
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 15px;
  text-align: center;
}

.control-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.control-item:last-child {
  border-bottom: none;
}

.key-icon {
  background: rgba(255, 255, 255, 0.1);
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.action {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.85rem;
}

.achievements-section {
  margin-top: 10px;
}

.achievements-title {
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 10px;
  text-align: center;
}

.achievement {
  padding: 8px;
  background: rgba(255, 215, 0, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 8px;
  font-size: 0.85rem;
  color: rgba(255, 215, 0, 0.9);
  text-align: center;
  margin-bottom: 5px;
  animation: achievementPop 0.5s ease-out;
}

@keyframes achievementPop {
  0% { transform: scale(0.8); opacity: 0; }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}

.game-over-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.overlay-content {
  text-align: center;
}

.game-over-text {
  font-size: 3rem;
  font-weight: 900;
  color: #c41e3a;
  margin-bottom: 20px;
  text-shadow: 0 0 30px rgba(196, 30, 58, 0.8);
}

.final-score {
  color: rgba(255, 255, 255, 0.6);
  font-size: 1rem;
  margin-bottom: 10px;
}

.final-score-value {
  font-size: 3rem;
  font-weight: 900;
  background: linear-gradient(135deg, #ffd700 0%, #ffed4a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.combo-overlay {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 100;
  animation: comboOverlay 1s ease-out forwards;
}

.combo-effect {
  font-size: 4rem;
  font-weight: 900;
  background: linear-gradient(135deg, #ff6b9d, #c94bff, #6b9dff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 60px rgba(201, 75, 255, 0.8);
  animation: comboText 1s ease-out forwards;
}

@keyframes comboOverlay {
  0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
  20% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
  80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  100% { opacity: 0; transform: translate(-50%, -50%) scale(1.5); }
}

@keyframes comboText {
  0% { opacity: 0; transform: scale(0.5); }
  20% { opacity: 1; transform: scale(1.2); }
  80% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(1.5); }
}

.mobile-controls {
  display: none;
  justify-content: center;
  gap: 15px;
  margin-top: 40px;
}

.mobile-btn {
  width: 80px;
  height: 80px;
  font-size: 2rem;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}

.mobile-btn:active {
  transform: scale(0.9);
  background: rgba(201, 75, 255, 0.3);
  border-color: rgba(201, 75, 255, 0.5);
}

.mobile-btn.drop {
  background: linear-gradient(135deg, rgba(201, 75, 255, 0.3), rgba(107, 157, 255, 0.3));
  border-color: rgba(201, 75, 255, 0.5);
}

@media (max-width: 900px) {
  .game-area {
    flex-direction: column;
    align-items: center;
  }
  
  .left-panel, .right-panel {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    min-width: auto;
  }
  
  .stat-card {
    padding: 15px;
  }
  
  .mobile-controls {
    display: flex;
  }
  
  .game-title {
    font-size: 2.5rem;
  }
  
  .title-icon {
    font-size: 2rem;
  }
  
  .game-subtitle {
    font-size: 1rem;
    letter-spacing: 15px;
  }
  
  .language-switcher {
    top: 15px;
    right: 15px;
    padding: 8px 12px;
  }
}

@media (max-width: 600px) {
  .game-container {
    padding: 15px;
  }
  
  .game-title {
    font-size: 2rem;
    letter-spacing: 3px;
  }
  
  .stat-card {
    padding: 12px;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
  
  .stat-icon {
    font-size: 1.5rem;
  }
  
  .mobile-btn {
    width: 70px;
    height: 70px;
    font-size: 1.8rem;
  }
}
</style>