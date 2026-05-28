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
      </div>
      
      <div class="game-area">
        <div class="left-panel glass-panel">
          <div class="stat-card score-card">
            <div class="stat-icon">🏆</div>
            <div class="stat-content">
              <div class="stat-label">{{ t('score') }}</div>
              <div class="stat-value score">{{ displayScore.toLocaleString() }}</div>
            </div>
          </div>
          
          <div class="stat-card level-card">
            <div class="stat-icon">⚡</div>
            <div class="stat-content">
              <div class="stat-label">{{ t('level') }}</div>
              <div class="stat-value level">{{ level }}</div>
            </div>
          </div>
          
          <div class="stat-card lines-card">
            <div class="stat-icon">📊</div>
            <div class="stat-content">
              <div class="stat-label">{{ t('lines') }}</div>
              <div class="stat-value lines">{{ lines }}</div>
            </div>
          </div>
          
          <div class="stat-card highscore-card">
            <div class="stat-icon">👑</div>
            <div class="stat-content">
              <div class="stat-label">{{ t('highscore') }}</div>
              <div class="stat-value highscore">{{ highScore.toLocaleString() }}</div>
            </div>
          </div>
          
          <div class="combo-display" v-if="combo > 1">
            <div class="combo-text">{{ combo }}x COMBO!</div>
          </div>
        </div>
        
        <div class="board-section">
          <div class="board-wrapper">
            <canvas ref="gameCanvas" width="320" height="640"></canvas>
            <div class="board-overlay" v-if="!isPlaying"></div>
            <div class="board-edge top-left"></div>
            <div class="board-edge top-right"></div>
            <div class="board-edge bottom-left"></div>
            <div class="board-edge bottom-right"></div>
          </div>
          
          <button class="start-btn glass-btn" @click="startGame" v-if="!isPlaying && !gameOver">
            <span class="btn-icon">▶</span>
            <span class="btn-text">{{ t('start') }}</span>
            <div class="btn-glow"></div>
          </button>
          
          <button class="start-btn glass-btn restart" @click="startGame" v-if="gameOver">
            <span class="btn-icon">↻</span>
            <span class="btn-text">{{ t('restart') }}</span>
            <div class="btn-glow"></div>
          </button>
        </div>
        
        <div class="right-panel glass-panel">
          <div class="next-piece-container">
            <div class="next-label">{{ t('next') }}</div>
            <div class="next-canvas-wrapper">
              <canvas ref="nextCanvas" width="120" height="120"></canvas>
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
import { ref, onMounted, onUnmounted } from 'vue'

const gameCanvas = ref(null)
const nextCanvas = ref(null)
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

let ctx = null, nextCtx = null, bgCtx = null
let gameFrameId = null, bgFrameId = null
let currentPiece = null, nextPiece = null
let board = []
let dropInterval = 1000
let lastDropTime = 0
let particles = []
let stars = []
let touchStartX = 0, touchStartY = 0, touchStartTime = 0
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

const t = (key) => translations[currentLang.value][key] || key

const COLORS = {
  I: { main: '#00f5ff', dark: '#00a8b8', glow: '#00f5ff', light: '#80fcff' },
  O: { main: '#ffd700', dark: '#b89900', glow: '#ffd700', light: '#ffed80' },
  T: { main: '#bf5fff', dark: '#7a00e6', glow: '#bf5fff', light: '#d98fff' },
  S: { main: '#00ff88', dark: '#00b359', glow: '#00ff88', light: '#66ffaa' },
  Z: { main: '#ff4757', dark: '#cc2936', glow: '#ff4757', light: '#ff6b7a' },
  J: { main: '#4a90ff', dark: '#1a52cc', glow: '#4a90ff', light: '#7aadff' },
  L: { main: '#ff9f43', dark: '#cc7030', glow: '#ff9f43', light: '#ffb86c' }
}

const PIECES = [
  { type: 'I', shape: [[1,1,1,1]], color: COLORS.I },
  { type: 'O', shape: [[1,1],[1,1]], color: COLORS.O },
  { type: 'T', shape: [[0,1,0],[1,1,1]], color: COLORS.T },
  { type: 'S', shape: [[0,1,1],[1,1,0]], color: COLORS.S },
  { type: 'Z', shape: [[1,1,0],[0,1,1]], color: COLORS.Z },
  { type: 'J', shape: [[1,0,0],[1,1,1]], color: COLORS.J },
  { type: 'L', shape: [[0,0,1],[1,1,1]], color: COLORS.L }
]

const initBoard = () => {
  board = Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(0))
}

const createPiece = () => {
  const piece = PIECES[Math.floor(Math.random() * PIECES.length)]
  return {
    ...piece,
    shape: piece.shape.map(row => [...row]),
    x: Math.floor((BOARD_WIDTH - piece.shape[0].length) / 2),
    y: 0
  }
}

const drawBlock = (context, x, y, color, alpha = 1) => {
  const px = x * BLOCK_SIZE
  const py = y * BLOCK_SIZE
  
  context.save()
  context.globalAlpha = alpha
  
  if (alpha === 1) {
    context.shadowColor = color.glow
    context.shadowBlur = 12
  }
  
  const gradient = context.createLinearGradient(px, py, px + BLOCK_SIZE, py + BLOCK_SIZE)
  gradient.addColorStop(0, color.light)
  gradient.addColorStop(0.5, color.main)
  gradient.addColorStop(1, color.dark)
  
  context.fillStyle = gradient
  context.beginPath()
  context.roundRect(px + 2, py + 2, BLOCK_SIZE - 4, BLOCK_SIZE - 4, 5)
  context.fill()
  
  if (alpha === 1) {
    context.fillStyle = 'rgba(255,255,255,0.35)'
    context.beginPath()
    context.roundRect(px + 4, py + 4, BLOCK_SIZE - 8, 4, 2)
    context.fill()
    
    context.fillStyle = 'rgba(0,0,0,0.2)'
    context.beginPath()
    context.roundRect(px + 4, py + BLOCK_SIZE - 8, BLOCK_SIZE - 8, 4, 2)
    context.fill()
  }
  
  context.restore()
}

const drawBoard = (timestamp) => {
  ctx.fillStyle = '#0a0a15'
  ctx.fillRect(0, 0, BOARD_WIDTH * BLOCK_SIZE, BOARD_HEIGHT * BLOCK_SIZE)
  
  ctx.strokeStyle = 'rgba(50, 50, 80, 0.3)'
  ctx.lineWidth = 1
  for (let i = 0; i <= BOARD_WIDTH; i++) {
    ctx.beginPath()
    ctx.moveTo(i * BLOCK_SIZE, 0)
    ctx.lineTo(i * BLOCK_SIZE, BOARD_HEIGHT * BLOCK_SIZE)
    ctx.stroke()
  }
  for (let i = 0; i <= BOARD_HEIGHT; i++) {
    ctx.beginPath()
    ctx.moveTo(0, i * BLOCK_SIZE)
    ctx.lineTo(BOARD_WIDTH * BLOCK_SIZE, i * BLOCK_SIZE)
    ctx.stroke()
  }
  
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      if (board[y][x]) {
        const colorKey = Object.keys(COLORS).find(k => COLORS[k].main === board[y][x])
        if (colorKey) drawBlock(ctx, x, y, COLORS[colorKey])
      }
    }
  }
  
  if (currentPiece) {
    const ghostY = getGhostPosition()
    currentPiece.shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          ctx.save()
          ctx.strokeStyle = currentPiece.color.main
          ctx.globalAlpha = 0.35
          ctx.lineWidth = 2
          ctx.setLineDash([5, 5])
          ctx.strokeRect((x + currentPiece.x) * BLOCK_SIZE + 4, (y + ghostY) * BLOCK_SIZE + 4, BLOCK_SIZE - 8, BLOCK_SIZE - 8)
          ctx.restore()
        }
      })
    })
    
    currentPiece.shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) drawBlock(ctx, x + currentPiece.x, y + currentPiece.y, currentPiece.color)
      })
    })
  }
  
  particles = particles.filter(p => {
    p.life -= 0.018
    if (p.life > 0) {
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.25
      p.rotation += p.rotationSpeed
      
      ctx.save()
      ctx.globalAlpha = p.life
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rotation)
      ctx.fillStyle = p.color
      ctx.shadowColor = p.color
      ctx.shadowBlur = 12
      ctx.beginPath()
      const size = p.size * p.life
      ctx.arc(0, 0, size, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
      return true
    }
    return false
  })
  
  if (isPlaying.value && timestamp - lastDropTime >= dropInterval) {
    moveDown()
    lastDropTime = timestamp
  }
  
  if (displayScore.value < score.value) {
    displayScore.value += Math.ceil((score.value - displayScore.value) / 4)
  }
}

const getGhostPosition = () => {
  if (!currentPiece) return 0
  let ghostY = currentPiece.y
  while (!collides(currentPiece, 0, ghostY - currentPiece.y + 1)) ghostY++
  return ghostY
}

const drawNextPiece = () => {
  nextCtx.fillStyle = '#0a0a15'
  nextCtx.fillRect(0, 0, 120, 120)
  
  if (!nextPiece) return
  
  const blockSize = 24
  const offsetX = (120 - nextPiece.shape[0].length * blockSize) / 2
  const offsetY = (120 - nextPiece.shape.length * blockSize) / 2
  
  nextPiece.shape.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell) {
        const color = nextPiece.color
        const px = offsetX + x * blockSize
        const py = offsetY + y * blockSize
        
        nextCtx.shadowColor = color.glow
        nextCtx.shadowBlur = 10
        
        const gradient = nextCtx.createLinearGradient(px, py, px + blockSize, py + blockSize)
        gradient.addColorStop(0, color.light)
        gradient.addColorStop(0.5, color.main)
        gradient.addColorStop(1, color.dark)
        
        nextCtx.fillStyle = gradient
        nextCtx.beginPath()
        nextCtx.roundRect(px + 1, py + 1, blockSize - 2, blockSize - 2, 3)
        nextCtx.fill()
        
        nextCtx.fillStyle = 'rgba(255,255,255,0.3)'
        nextCtx.beginPath()
        nextCtx.roundRect(px + 2, py + 2, blockSize - 6, 3, 1)
        nextCtx.fill()
      }
    })
  })
}

const collides = (piece, offsetX, offsetY, shape) => {
  const s = shape || piece.shape
  for (let y = 0; y < s.length; y++) {
    for (let x = 0; x < s[y].length; x++) {
      if (s[y][x]) {
        const newX = x + piece.x + offsetX
        const newY = y + piece.y + offsetY
        
        if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) return true
        if (newY >= 0 && board[newY][newX]) return true
      }
    }
  }
  return false
}

const mergePiece = () => {
  currentPiece.shape.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell) {
        board[y + currentPiece.y][x + currentPiece.x] = currentPiece.color.main
        for (let i = 0; i < 4; i++) {
          particles.push({
            x: (x + currentPiece.x) * BLOCK_SIZE + BLOCK_SIZE / 2,
            y: (y + currentPiece.y) * BLOCK_SIZE + BLOCK_SIZE / 2,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8 - 3,
            size: Math.random() * 5 + 3,
            color: currentPiece.color.main,
            life: 1,
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 0.2
          })
        }
      }
    })
  })
}

const clearLines = () => {
  let cleared = 0
  const clearedColors = []
  
  for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
    if (board[y].every(cell => cell !== 0)) {
      clearedColors.push(...board[y].filter(c => c !== 0))
      board.splice(y, 1)
      board.unshift(Array(BOARD_WIDTH).fill(0))
      cleared++
      y++
    }
  }
  
  if (cleared > 0) {
    combo.value++
    if (comboTimer) clearTimeout(comboTimer)
    comboTimer = setTimeout(() => combo.value = 0, 2000)
    
    const pointsTable = [0, 100, 300, 500, 800]
    const points = pointsTable[Math.min(cleared, 4)] * level.value * (combo.value > 1 ? combo.value * 0.5 : 1)
    score.value += Math.floor(points)
    
    lines.value += cleared
    level.value = Math.floor(lines.value / 10) + 1
    dropInterval = Math.max(100, 1000 - (level.value - 1) * 80)
    
    if (score.value > highScore.value) {
      highScore.value = score.value
      localStorage.setItem('tetrisHighScore', highScore.value.toString())
      if (!achievements.value.includes(t('newRecord'))) achievements.value.push(t('newRecord'))
    }
    
    if (lines.value >= 10 && !achievements.value.includes(t('lines10'))) achievements.value.push(t('lines10'))
    if (lines.value >= 50 && !achievements.value.includes(t('lines50'))) achievements.value.push(t('lines50'))
    
    if (combo.value > 1) {
      showComboEffect.value = true
      comboEffectText.value = `${combo.value}x COMBO! +${Math.floor(points)}`
      setTimeout(() => showComboEffect.value = false, 800)
    }
  }
}

const rotate = () => {
  if (!currentPiece || !isPlaying.value) return
  const rotated = currentPiece.shape[0].map((_, i) => currentPiece.shape.map(row => row[i]).reverse())
  if (!collides(currentPiece, 0, 0, rotated)) currentPiece.shape = rotated
  else if (!collides(currentPiece, 1, 0, rotated)) { currentPiece.x++; currentPiece.shape = rotated }
  else if (!collides(currentPiece, -1, 0, rotated)) { currentPiece.x--; currentPiece.shape = rotated }
}

const moveLeft = () => { if (currentPiece && isPlaying.value && !collides(currentPiece, -1, 0)) currentPiece.x-- }
const moveRight = () => { if (currentPiece && isPlaying.value && !collides(currentPiece, 1, 0)) currentPiece.x++ }
const drop = () => {
  if (!currentPiece || !isPlaying.value) return
  while (!collides(currentPiece, 0, 1)) { currentPiece.y++; score.value += 2 }
}
const softDrop = () => { if (currentPiece && isPlaying.value && !collides(currentPiece, 0, 1)) currentPiece.y++; score.value += 1 }

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
      cancelAnimationFrame(gameFrameId)
    }
  } else {
    currentPiece.y++
  }
}

const gameLoop = (timestamp) => {
  if (!isPlaying.value) return
  drawBoard(timestamp)
  gameFrameId = requestAnimationFrame(gameLoop)
}

const initBackground = () => {
  bgCtx = bgCanvas.value.getContext('2d')
  const resize = () => {
    bgCanvas.value.width = window.innerWidth
    bgCanvas.value.height = window.innerHeight
    stars = Array.from({ length: 100 }, () => ({
      x: Math.random() * bgCanvas.value.width,
      y: Math.random() * bgCanvas.value.height,
      size: Math.random() * 2 + 0.3,
      speed: Math.random() * 0.25 + 0.05,
      opacity: Math.random() * 0.7 + 0.3,
      twinkleSpeed: (Math.random() - 0.5) * 0.02
    }))
  }
  
  resize()
  window.addEventListener('resize', resize)
  
  let lastBgUpdate = 0
  const animateBg = (timestamp) => {
    if (timestamp - lastBgUpdate >= 50) {
      bgCtx.fillStyle = '#050510'
      bgCtx.fillRect(0, 0, bgCanvas.value.width, bgCanvas.value.height)
      
      const nebula1 = bgCtx.createRadialGradient(
        bgCanvas.value.width * 0.2, bgCanvas.value.height * 0.3, 0,
        bgCanvas.value.width * 0.2, bgCanvas.value.height * 0.3, bgCanvas.value.width * 0.3
      )
      nebula1.addColorStop(0, 'rgba(191, 95, 255, 0.12)')
      nebula1.addColorStop(1, 'transparent')
      bgCtx.fillStyle = nebula1
      bgCtx.fillRect(0, 0, bgCanvas.value.width, bgCanvas.value.height)
      
      const nebula2 = bgCtx.createRadialGradient(
        bgCanvas.value.width * 0.8, bgCanvas.value.height * 0.7, 0,
        bgCanvas.value.width * 0.8, bgCanvas.value.height * 0.7, bgCanvas.value.width * 0.25
      )
      nebula2.addColorStop(0, 'rgba(74, 144, 255, 0.1)')
      nebula2.addColorStop(1, 'transparent')
      bgCtx.fillStyle = nebula2
      bgCtx.fillRect(0, 0, bgCanvas.value.width, bgCanvas.value.height)
      
      stars.forEach(star => {
        star.opacity += star.twinkleSpeed
        star.opacity = Math.max(0.2, Math.min(1, star.opacity))
        star.y += star.speed
        if (star.y > bgCanvas.value.height) star.y = 0
      
        bgCtx.save()
        bgCtx.globalAlpha = star.opacity
        bgCtx.fillStyle = '#fff'
        bgCtx.shadowColor = '#fff'
        bgCtx.shadowBlur = star.size * 2
        bgCtx.beginPath()
        bgCtx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        bgCtx.fill()
        bgCtx.restore()
      })
      
      lastBgUpdate = timestamp
    }
    
    bgFrameId = requestAnimationFrame(animateBg)
  }
  
  animateBg(0)
}

const checkMobile = () => {
  showMobileControls.value = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
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
  particles = []
  combo.value = 0
  achievements.value = []
  
  currentPiece = createPiece()
  nextPiece = createPiece()
  drawNextPiece()
  
  lastDropTime = performance.now()
  gameFrameId = requestAnimationFrame(gameLoop)
}

const handleKeydown = (e) => {
  if (!isPlaying.value && e.code !== 'Space') return
  
  switch(e.code) {
    case 'ArrowLeft': e.preventDefault(); moveLeft(); break
    case 'ArrowRight': e.preventDefault(); moveRight(); break
    case 'ArrowDown': e.preventDefault(); drop(); break
    case 'ArrowUp': e.preventDefault(); rotate(); break
    case 'Space': e.preventDefault(); drop(); break
    case 'KeyS': e.preventDefault(); softDrop(); break
    case 'KeyW': e.preventDefault(); rotate(); break
    case 'KeyA': e.preventDefault(); moveLeft(); break
    case 'KeyD': e.preventDefault(); moveRight(); break
  }
}

const handleTouchStart = (e) => {
  touchStartX = e.touches[0].clientX
  touchStartY = e.touches[0].clientY
  touchStartTime = Date.now()
}

const handleTouchEnd = (e) => {
  if (!isPlaying.value) return
  
  const touchEndX = e.changedTouches[0].clientX
  const touchEndY = e.changedTouches[0].clientY
  const touchDuration = Date.now() - touchStartTime
  
  const deltaX = touchEndX - touchStartX
  const deltaY = touchEndY - touchStartY
  const minSwipeDistance = 30
  const maxTapDuration = 200
  
  if (touchDuration < maxTapDuration && Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
    rotate()
    return
  }
  
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    if (Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) moveRight()
      else moveLeft()
    }
  } else {
    if (Math.abs(deltaY) > minSwipeDistance) {
      if (deltaY > 0) drop()
      else softDrop()
    }
  }
}

const preventScroll = (e) => {
  e.preventDefault()
}

onMounted(() => {
  ctx = gameCanvas.value.getContext('2d')
  nextCtx = nextCanvas.value.getContext('2d')
  
  const savedLang = localStorage.getItem('tetrisLang')
  if (savedLang) currentLang.value = savedLang
  
  initBoard()
  drawBoard(0)
  drawNextPiece()
  initBackground()
  checkMobile()
  
  window.addEventListener('keydown', handleKeydown)
  document.addEventListener('touchmove', preventScroll, { passive: false })
  document.addEventListener('wheel', preventScroll, { passive: false })
  
  const gameArea = document.querySelector('.game-area')
  if (gameArea) {
    gameArea.addEventListener('touchstart', handleTouchStart, { passive: true })
    gameArea.addEventListener('touchend', handleTouchEnd, { passive: true })
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('touchmove', preventScroll)
  document.removeEventListener('wheel', preventScroll)
  cancelAnimationFrame(gameFrameId)
  cancelAnimationFrame(bgFrameId)
  if (comboTimer) clearTimeout(comboTimer)
  
  const gameArea = document.querySelector('.game-area')
  if (gameArea) {
    gameArea.removeEventListener('touchstart', handleTouchStart)
    gameArea.removeEventListener('touchend', handleTouchEnd)
  }
})
</script>

<style scoped>
.game-wrapper {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background: #050510;
  touch-action: none;
}

.background-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  transform: translateZ(0);
  will-change: transform;
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
  z-index: 100;
  transition: all 0.3s ease;
  transform: translateZ(0);
  backdrop-filter: blur(12px);
}

.language-switcher:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: scale(1.05) translateZ(0);
}

.lang-icon { font-size: 1.2rem; }
.lang-text { color: rgba(255, 255, 255, 0.8); font-size: 0.9rem; }

.game-container {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  min-height: 100vh;
  padding-bottom: max(20px, env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.title-section {
  text-align: center;
  margin-bottom: 30px;
}

.game-title {
  font-size: 3rem;
  font-weight: 900;
  background: linear-gradient(135deg, #ff6b9d 0%, #c94bff 50%, #6b9dff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  letter-spacing: 4px;
  display: flex;
  align-items: center;
  gap: 15px;
  animation: titleGlow 3s ease-in-out infinite;
  transform: translateZ(0);
}

@keyframes titleGlow {
  0%, 100% { 
    filter: drop-shadow(0 0 15px rgba(201, 75, 255, 0.3));
  }
  50% { 
    filter: drop-shadow(0 0 35px rgba(107, 157, 255, 0.5));
  }
}

.title-icon { font-size: 2rem; animation: bounce 2s ease-in-out infinite; }
.title-icon:last-child { animation-delay: 1s; }

@keyframes bounce {
  0%, 100% { transform: translateY(0) translateZ(0); }
  50% { transform: translateY(-8px) translateZ(0); }
}

.game-subtitle {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.3);
  letter-spacing: 15px;
  margin-top: 5px;
}

.glass-panel {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  border-radius: 16px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transform: translateZ(0);
}

.glass-btn {
  background: linear-gradient(135deg, rgba(201, 75, 255, 0.4), rgba(107, 157, 255, 0.4));
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 30px;
  padding: 12px 30px;
  font-size: 1rem;
  font-weight: 700;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  overflow: hidden;
  transform: translateZ(0);
}

.glass-btn:hover {
  transform: scale(1.05) translateZ(0);
  box-shadow: 0 15px 40px rgba(201, 75, 255, 0.4);
}

.btn-glow {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: btnShine 2.5s ease-in-out infinite;
}

@keyframes btnShine {
  0% { transform: translateX(-100%); }
  50%, 100% { transform: translateX(200%); }
}

.btn-icon { font-size: 1.2rem; }

.game-area {
  display: flex;
  gap: 25px;
  align-items: flex-start;
}

.left-panel {
  padding: 20px;
  min-width: 150px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
  transform: translateZ(0);
}

.stat-card:hover {
  background: rgba(255, 255, 255, 0.04);
  transform: translateX(5px) translateZ(0);
}

.stat-icon { font-size: 1.8rem; }

.stat-label {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 2px;
}

.stat-value { font-size: 1.5rem; font-weight: 800; }
.stat-value.score { background: linear-gradient(135deg, #ff6b9d, #ff9dbd); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.stat-value.level { background: linear-gradient(135deg, #6b9dff, #9dbbff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.stat-value.lines { background: linear-gradient(135deg, #9dff6b, #bbff9d); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.stat-value.highscore { background: linear-gradient(135deg, #ffd700, #ffed4a); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }

.combo-display {
  text-align: center;
  padding: 12px;
  background: linear-gradient(135deg, rgba(255, 107, 157, 0.2), rgba(201, 75, 255, 0.2));
  border-radius: 10px;
  animation: pulse 0.5s ease-in-out infinite;
  transform: translateZ(0);
}

.combo-text {
  font-size: 1.3rem;
  font-weight: 900;
  background: linear-gradient(135deg, #ff6b9d, #c94bff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

@keyframes pulse {
  0%, 100% { transform: scale(1) translateZ(0); }
  50% { transform: scale(1.03) translateZ(0); }
}

.board-section {
  position: relative;
}

.board-wrapper {
  position: relative;
  width: 328px;
  height: 648px;
  padding: 4px;
  background: linear-gradient(135deg, rgba(201, 75, 255, 0.4), rgba(107, 157, 255, 0.4));
  border-radius: 12px;
  box-shadow: 0 0 60px rgba(201, 75, 255, 0.2);
  overflow: hidden;
  transform: translateZ(0);
}

.board-wrapper::before {
  content: '';
  position: absolute;
  inset: -2px;
  background: linear-gradient(45deg, #ff6b9d, #c94bff, #6b9dff, #ff6b9d);
  background-size: 400% 400%;
  border-radius: 14px;
  z-index: -1;
  opacity: 0.35;
  filter: blur(18px);
  animation: borderGlow 4s ease-in-out infinite;
}

@keyframes borderGlow {
  0%, 100% { 
    background-position: 0% 50%;
    opacity: 0.25; 
  }
  50% { 
    background-position: 100% 50%;
    opacity: 0.5; 
  }
}

.board-edge {
  position: absolute;
  width: 12px;
  height: 12px;
  border: 2px solid rgba(201, 75, 255, 0.6);
  z-index: 1;
}

.board-edge.top-left {
  top: 8px;
  left: 8px;
  border-right: none;
  border-bottom: none;
  border-radius: 6px 0 0 0;
}

.board-edge.top-right {
  top: 8px;
  right: 8px;
  border-left: none;
  border-bottom: none;
  border-radius: 0 6px 0 0;
}

.board-edge.bottom-left {
  bottom: 8px;
  left: 8px;
  border-right: none;
  border-top: none;
  border-radius: 0 0 0 6px;
}

.board-edge.bottom-right {
  bottom: 8px;
  right: 8px;
  border-left: none;
  border-top: none;
  border-radius: 0 0 6px 0;
}

canvas {
  display: block;
  border-radius: 8px;
  background: #0a0a15;
}

.board-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  border-radius: 8px;
  z-index: 5;
  backdrop-filter: blur(3px);
}

.start-btn {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  padding: 20px 50px;
  font-size: 1.4rem;
  white-space: nowrap;
}

.right-panel {
  padding: 20px;
  min-width: 160px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.next-label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 10px;
  text-align: center;
}

.next-canvas-wrapper {
  position: relative;
  display: inline-block;
}

.next-canvas-wrapper canvas {
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.next-glow {
  position: absolute;
  inset: -3px;
  background: linear-gradient(135deg, rgba(201, 75, 255, 0.3), rgba(107, 157, 255, 0.3));
  border-radius: 13px;
  z-index: -1;
  filter: blur(10px);
  opacity: 0.5;
}

.controls-title {
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 10px;
  text-align: center;
}

.control-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.control-item:last-child { border-bottom: none; }

.key-icon {
  background: rgba(255, 255, 255, 0.1);
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.action { color: rgba(255, 255, 255, 0.5); font-size: 0.8rem; }

.achievements-title {
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 8px;
  text-align: center;
}

.achievement {
  padding: 6px;
  background: rgba(255, 215, 0, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 6px;
  font-size: 0.8rem;
  color: rgba(255, 215, 0, 0.9);
  text-align: center;
  margin-bottom: 4px;
  animation: pop 0.3s ease-out;
  transform: translateZ(0);
}

@keyframes pop {
  0% { transform: scale(0.8) translateZ(0); opacity: 0; }
  50% { transform: scale(1.05) translateZ(0); }
  100% { transform: scale(1) translateZ(0); opacity: 1; }
}

.game-over-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  animation: fadeIn 0.3s ease-out;
  backdrop-filter: blur(5px);
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.overlay-content { text-align: center; }

.game-over-text {
  font-size: 2.5rem;
  font-weight: 900;
  color: #c41e3a;
  margin-bottom: 15px;
  text-shadow: 0 0 35px rgba(196, 30, 58, 0.8);
  transform: translateZ(0);
}

.final-score { color: rgba(255, 255, 255, 0.6); font-size: 0.9rem; margin-bottom: 8px; }

.final-score-value {
  font-size: 2.5rem;
  font-weight: 900;
  background: linear-gradient(135deg, #ffd700, #ffed4a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  transform: translateZ(0);
}

.combo-overlay {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 100;
  animation: comboAnim 0.8s ease-out forwards;
}

.combo-effect {
  font-size: 3rem;
  font-weight: 900;
  background: linear-gradient(135deg, #ff6b9d, #c94bff, #6b9dff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 50px rgba(201, 75, 255, 0.6);
  transform: translateZ(0);
}

@keyframes comboAnim {
  0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5) translateZ(0); }
  20% { opacity: 1; transform: translate(-50%, -50%) scale(1.15) translateZ(0); }
  80% { opacity: 1; transform: translate(-50%, -50%) scale(1) translateZ(0); }
  100% { opacity: 0; transform: translate(-50%, -50%) scale(1.3) translateZ(0); }
}

.mobile-controls {
  display: none;
  justify-content: center;
  gap: 12px;
  margin-top: 30px;
}

.mobile-btn {
  width: 70px;
  height: 70px;
  font-size: 1.8rem;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(8px);
  transform: translateZ(0);
}

.mobile-btn:active {
  transform: scale(0.9) translateZ(0);
  background: rgba(201, 75, 255, 0.3);
}

.mobile-btn.drop {
  background: linear-gradient(135deg, rgba(201, 75, 255, 0.4), rgba(107, 157, 255, 0.4));
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
  
  .mobile-controls { 
    display: flex; 
    padding-bottom: env(safe-area-inset-bottom);
  }
  
  .game-title { font-size: 2rem; }
  .title-icon { font-size: 1.5rem; }
  
  .language-switcher {
    top: max(10px, env(safe-area-inset-top));
    right: 10px;
    padding: 8px 12px;
  }
  
  .title-section {
    padding-top: max(10px, env(safe-area-inset-top));
  }
  
  .board-wrapper {
    max-width: 100vw;
    margin: 0 10px;
  }
}

@media (max-width: 600px) {
  .game-title { font-size: 1.5rem; }
  .stat-value { font-size: 1.2rem; }
  .mobile-btn { width: 60px; height: 60px; font-size: 1.5rem; }
}
</style>