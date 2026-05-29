<template>
  <div class="game-wrapper" ref="gameWrapper">
    <canvas ref="bgCanvas" class="bg-canvas"></canvas>

    <div class="lang-switch" @click="toggleLanguage">
      <span>{{ currentLang === 'zh' ? '🇨🇳' : '🇬🇧' }}</span>
    </div>

    <div class="game-container">
      <div class="top-bar">
        <div class="title-row">
          <h1 class="title">{{ t('title') }}</h1>
          <span class="subtitle">TETRIS</span>
        </div>
      </div>

      <div class="main-area">
        <div class="side-panel left-panel">
          <div class="stat">
            <span class="stat-icon">🏆</span>
            <div class="stat-body">
              <span class="stat-label">{{ t('score') }}</span>
              <span class="stat-val score-val">{{ displayScore.toLocaleString() }}</span>
            </div>
          </div>
          <div class="stat">
            <span class="stat-icon">⚡</span>
            <div class="stat-body">
              <span class="stat-label">{{ t('level') }}</span>
              <span class="stat-val level-val">{{ level }}</span>
            </div>
          </div>
          <div class="stat">
            <span class="stat-icon">📊</span>
            <div class="stat-body">
              <span class="stat-label">{{ t('lines') }}</span>
              <span class="stat-val lines-val">{{ lines }}</span>
            </div>
          </div>
          <div class="stat">
            <span class="stat-icon">👑</span>
            <div class="stat-body">
              <span class="stat-label">{{ t('highscore') }}</span>
              <span class="stat-val high-val">{{ highScore.toLocaleString() }}</span>
            </div>
          </div>
          <div class="combo-badge" v-if="combo > 1">{{ combo }}x</div>
        </div>

        <div class="board-section">
          <div class="board-frame" :class="{ shake: shaking }">
            <div class="board-glow"></div>
            <canvas ref="gameCanvas" width="320" height="640"></canvas>
            <div class="board-overlay" v-if="!isPlaying"></div>
            <div class="scanlines"></div>
            <div class="board-corners">
              <span class="corner tl"></span><span class="corner tr"></span>
              <span class="corner bl"></span><span class="corner br"></span>
            </div>
          </div>

          <div class="start-btn-wrap" v-if="!isPlaying">
            <button class="start-btn" @click="startGame">
              <span class="btn-symbol">{{ gameOver ? '↻' : '▶' }}</span>
              <span class="btn-label">{{ gameOver ? t('restart') : t('start') }}</span>
            </button>
          </div>
        </div>

        <div class="side-panel right-panel">
          <div class="next-box">
            <div class="panel-label">{{ t('next') }}</div>
            <div class="next-frame">
              <canvas ref="nextCanvas" width="120" height="120"></canvas>
            </div>
          </div>

          <div class="char-box">
            <div class="panel-label">{{ stageNames[currentLang][characterStage] }}</div>
            <div class="char-canvas-wrap">
              <PixelCharacter :stage="characterStage" :action="characterAction" :character="selectedCharacter" />
            </div>
            <div class="char-selector">
              <button v-for="ch in characterList" :key="ch.id"
                :class="['char-btn', { active: selectedCharacter === ch.id }]"
                @click="selectedCharacter = ch.id">
                {{ ch.label }}
              </button>
            </div>
          </div>

          <div class="ctrl-box">
            <div class="panel-label">{{ t('controls') }}</div>
            <div class="ctrl-grid">
              <div class="ctrl-item"><span class="key-cap">← →</span><span>{{ t('move') }}</span></div>
              <div class="ctrl-item"><span class="key-cap">↑</span><span>{{ t('rotate') }}</span></div>
              <div class="ctrl-item"><span class="key-cap">↓</span><span>{{ t('speed') }}</span></div>
              <div class="ctrl-item"><span class="key-cap">␣</span><span>{{ t('drop') }}</span></div>
            </div>
          </div>

          <div class="achieve-box" v-if="achievements.length > 0">
            <div class="achieve-item" v-for="ach in achievements" :key="ach">{{ ach }}</div>
          </div>
        </div>
      </div>


    </div>

    <div class="game-over-overlay" v-if="gameOver">
      <div class="go-content">
        <div class="go-title">{{ t('gameover') }}</div>
        <div class="go-score">{{ t('finalscore') }}</div>
        <div class="go-num">{{ score.toLocaleString() }}</div>
      </div>
    </div>

    <div class="combo-pop" v-if="showComboEffect">
      <span class="combo-text">{{ comboEffectText }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import PixelCharacter from './components/PixelCharacter.vue'

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
const achievements = ref([])
const currentLang = ref('zh')
const shaking = ref(false)

const showComboEffect = ref(false)
const comboEffectText = ref('')

const selectedCharacter = ref('sayaka')
const characterList = [
  { id: 'sayaka', label: 'Sayaka' },
  { id: 'tomoko', label: 'Tomoko' },
  { id: 'himiko', label: 'Himiko' },
]

const stageNames = computed(() => {
  if (selectedCharacter.value === 'tomoko') {
    return {
      zh: ['水手服', '便服A', '便服B', '内衣', '裸体', '全裸'],
      en: ['School Uniform', 'Casual Wear', 'Casual Outfit', 'Underwear', 'Nude', 'Fully Nude'],
    }
  }
  if (selectedCharacter.value === 'himiko') {
    return {
      zh: ['校服', '便服A', '便服B', '内衣', '裸体', '全裸'],
      en: ['School Uniform', 'Casual Fit', 'Casual Outfit', 'Underwear', 'Nude', 'Fully Nude'],
    }
  }
  return {
    zh: ['JK制服', '衬衫+裙子', '便服', '内衣', '裸体', '全裸'],
    en: ['JK Uniform', 'Blouse & Skirt', 'Casual Dress', 'Underwear', 'Nude', 'Fully Nude'],
  }
})
const stageThresholds = [0, 500, 1500, 3000, 5000, 8000]
const characterStage = computed(() => {
  for (let i = stageThresholds.length - 1; i >= 0; i--)
    if (score.value >= stageThresholds[i]) return i
  return 0
})
const characterAction = ref('idle')

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
let actionTimer = null

const BOARD_WIDTH = 10
const BOARD_HEIGHT = 20
const BLOCK_SIZE = 32

const translations = {
  zh: {
    title: '俄罗斯方块', score: '得分', level: '等级', lines: '消除',
    highscore: '最高分', start: '开始游戏', restart: '再来一局',
    next: '下一个', controls: '操作', move: '移动', rotate: '旋转',
    speed: '加速', drop: '硬降', achievements: '成就',
    gameover: '游戏结束', finalscore: '最终得分',
    newRecord: '🏆 新纪录!', lines10: '📊 10行大师', lines50: '🔥 50行达人'
  },
  en: {
    title: 'TETRIS', score: 'Score', level: 'Level', lines: 'Lines',
    highscore: 'High Score', start: 'Start', restart: 'Restart',
    next: 'Next', controls: 'Controls', move: 'Move', rotate: 'Rotate',
    speed: 'Speed', drop: 'Drop', achievements: 'Achievements',
    gameover: 'Game Over', finalscore: 'Final Score',
    newRecord: '🏆 New Record!', lines10: '📊 10 Lines', lines50: '🔥 50 Lines'
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
  const px = x * BLOCK_SIZE, py = y * BLOCK_SIZE
  const s = BLOCK_SIZE
  context.save()
  context.globalAlpha = alpha

  if (alpha === 1) {
    context.shadowColor = color.glow
    context.shadowBlur = 6
  }

  // Main fill
  context.fillStyle = color.main
  context.fillRect(px + 1, py + 1, s - 2, s - 2)

  // Pixel highlight (top + left)
  context.fillStyle = color.light
  context.fillRect(px + 1, py + 1, s - 2, 2)
  context.fillRect(px + 1, py + 1, 2, s - 2)

  // Pixel shadow (bottom + right)
  context.fillStyle = color.dark
  context.fillRect(px + 1, py + s - 3, s - 2, 2)
  context.fillRect(px + s - 3, py + 1, 2, s - 2)

  // Inner dimple for retro depth
  context.fillStyle = 'rgba(255,255,255,0.08)'
  context.fillRect(px + 5, py + 5, s - 12, s - 12)

  context.restore()
}

const drawBoard = (timestamp) => {
  ctx.fillStyle = '#0a0a15'
  ctx.fillRect(0, 0, BOARD_WIDTH * BLOCK_SIZE, BOARD_HEIGHT * BLOCK_SIZE)

  // Pixel grid
  ctx.fillStyle = 'rgba(40,40,70,0.15)'
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      if ((x + y) % 2 === 0) {
        ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE)
      }
    }
  }

  for (let y = 0; y < BOARD_HEIGHT; y++)
    for (let x = 0; x < BOARD_WIDTH; x++)
      if (board[y][x]) {
        const k = Object.keys(COLORS).find(k => COLORS[k].main === board[y][x])
        if (k) drawBlock(ctx, x, y, COLORS[k])
      }

  if (currentPiece) {
    const ghostY = getGhostPosition()
    currentPiece.shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          const gx = (x + currentPiece.x) * BLOCK_SIZE
          const gy = (y + ghostY) * BLOCK_SIZE
          ctx.save()
          ctx.globalAlpha = 0.2
          ctx.fillStyle = currentPiece.color.main
          ctx.fillRect(gx + 1, gy + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2)
          ctx.fillStyle = currentPiece.color.light
          ctx.fillRect(gx + 1, gy + 1, BLOCK_SIZE - 2, 2)
          ctx.fillRect(gx + 1, gy + 1, 2, BLOCK_SIZE - 2)
          ctx.fillStyle = currentPiece.color.dark
          ctx.fillRect(gx + 1, gy + BLOCK_SIZE - 3, BLOCK_SIZE - 2, 2)
          ctx.fillRect(gx + BLOCK_SIZE - 3, gy + 1, 2, BLOCK_SIZE - 2)
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
      p.x += p.vx; p.y += p.vy; p.vy += 0.25; p.rotation += p.rotationSpeed
      ctx.save()
      ctx.globalAlpha = p.life
      ctx.translate(p.x, p.y); ctx.rotate(p.rotation)
      ctx.fillStyle = p.color; ctx.shadowColor = p.color; ctx.shadowBlur = 8
      if (p.pixel) {
        const size = p.size * p.life
        ctx.fillRect(-size / 2, -size / 2, size, size)
      } else {
        ctx.beginPath(); ctx.arc(0, 0, p.size * p.life, 0, Math.PI * 2); ctx.fill()
      }
      ctx.restore()
      return true
    }
    return false
  })

  if (isPlaying.value && timestamp - lastDropTime >= dropInterval) {
    moveDown(); lastDropTime = timestamp
  }
  if (displayScore.value < score.value)
    displayScore.value += Math.ceil((score.value - displayScore.value) / 4)
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
  const bs = 24
  const ox = (120 - nextPiece.shape[0].length * bs) / 2
  const oy = (120 - nextPiece.shape.length * bs) / 2
  nextPiece.shape.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell) {
        const c = nextPiece.color, px = ox + x * bs, py = oy + y * bs
        nextCtx.shadowColor = c.glow; nextCtx.shadowBlur = 6
        nextCtx.fillStyle = c.main
        nextCtx.fillRect(px + 1, py + 1, bs - 2, bs - 2)
        nextCtx.fillStyle = c.light
        nextCtx.fillRect(px + 1, py + 1, bs - 2, 2)
        nextCtx.fillRect(px + 1, py + 1, 2, bs - 2)
        nextCtx.fillStyle = c.dark
        nextCtx.fillRect(px + 1, py + bs - 3, bs - 2, 2)
        nextCtx.fillRect(px + bs - 3, py + 1, 2, bs - 2)
      }
    })
  })
}

const collides = (piece, offsetX, offsetY, shape) => {
  const s = shape || piece.shape
  for (let y = 0; y < s.length; y++)
    for (let x = 0; x < s[y].length; x++)
      if (s[y][x]) {
        const nx = x + piece.x + offsetX, ny = y + piece.y + offsetY
        if (nx < 0 || nx >= BOARD_WIDTH || ny >= BOARD_HEIGHT) return true
        if (ny >= 0 && board[ny][nx]) return true
      }
  return false
}

const mergePiece = () => {
  currentPiece.shape.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell) {
        board[y + currentPiece.y][x + currentPiece.x] = currentPiece.color.main
        for (let i = 0; i < 6; i++)
          particles.push({
            x: (x + currentPiece.x) * BLOCK_SIZE + BLOCK_SIZE / 2,
            y: (y + currentPiece.y) * BLOCK_SIZE + BLOCK_SIZE / 2,
            vx: (Math.random() - 0.5) * 10, vy: (Math.random() - 0.5) * 8 - 3,
            size: Math.random() * 5 + 2, color: currentPiece.color.main,
            life: 1, rotation: 0, rotationSpeed: (Math.random() - 0.5) * 0.2,
            pixel: false,
          })
      }
    })
  })
}

const clearLines = () => {
  let cleared = 0
  for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
    if (board[y].every(c => c !== 0)) {
      board.splice(y, 1); board.unshift(Array(BOARD_WIDTH).fill(0)); cleared++; y++
    }
  }
  if (cleared > 0) {
    combo.value++
    if (comboTimer) clearTimeout(comboTimer)
    comboTimer = setTimeout(() => combo.value = 0, 2000)

    // Screen shake!
    shaking.value = true
    setTimeout(() => shaking.value = false, 250)

    // Pixel particles on line clear
    for (let i = 0; i < cleared * 20; i++) {
      const hue = Math.floor(Math.random() * 360)
      particles.push({
        x: Math.random() * BOARD_WIDTH * BLOCK_SIZE,
        y: BOARD_HEIGHT * BLOCK_SIZE + 10,
        vx: (Math.random() - 0.5) * 12,
        vy: -Math.random() * 10 - 4,
        size: Math.random() * 4 + 2,
        life: 1,
        rotation: 0,
        rotationSpeed: (Math.random() - 0.5) * 0.3,
        color: `hsl(${hue}, 100%, 60%)`,
        pixel: true,
      })
    }

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
    updateStage()
  }
}

const rotate = () => {
  if (!currentPiece || !isPlaying.value) return
  const r = currentPiece.shape[0].map((_, i) => currentPiece.shape.map(row => row[i]).reverse())
  if (!collides(currentPiece, 0, 0, r)) currentPiece.shape = r
  else if (!collides(currentPiece, 1, 0, r)) { currentPiece.x++; currentPiece.shape = r }
  else if (!collides(currentPiece, -1, 0, r)) { currentPiece.x--; currentPiece.shape = r }
}

const moveLeft = () => { if (currentPiece && isPlaying.value && !collides(currentPiece, -1, 0)) currentPiece.x-- }
const moveRight = () => { if (currentPiece && isPlaying.value && !collides(currentPiece, 1, 0)) currentPiece.x++ }
const drop = () => {
  if (!currentPiece || !isPlaying.value) return
  while (!collides(currentPiece, 0, 1)) { currentPiece.y++; score.value += 2 }
}
const softDrop = () => { if (currentPiece && isPlaying.value && !collides(currentPiece, 0, 1)) currentPiece.y++; score.value += 1 }
const hardDrop = () => drop()

const moveDown = () => {
  if (!isPlaying.value) return
  if (collides(currentPiece, 0, 1)) {
    mergePiece(); clearLines()
    currentPiece = nextPiece; nextPiece = createPiece(); drawNextPiece()
    if (collides(currentPiece, 0, 0)) { gameOver.value = true; isPlaying.value = false; cancelAnimationFrame(gameFrameId) }
  } else currentPiece.y++
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
      x: Math.random() * bgCanvas.value.width, y: Math.random() * bgCanvas.value.height,
      size: Math.random() * 2 + 0.3, speed: Math.random() * 0.25 + 0.05,
      opacity: Math.random() * 0.7 + 0.3, twinkleSpeed: (Math.random() - 0.5) * 0.02
    }))
  }
  resize()
  window.addEventListener('resize', resize)
  let lastBg = 0
  const animate = (ts) => {
    if (ts - lastBg >= 50) {
      bgCtx.fillStyle = '#050510'; bgCtx.fillRect(0, 0, bgCanvas.value.width, bgCanvas.value.height)
      const n1 = bgCtx.createRadialGradient(bgCanvas.value.width * 0.2, bgCanvas.value.height * 0.3, 0, bgCanvas.value.width * 0.2, bgCanvas.value.height * 0.3, bgCanvas.value.width * 0.3)
      n1.addColorStop(0, 'rgba(191,95,255,0.12)'); n1.addColorStop(1, 'transparent')
      bgCtx.fillStyle = n1; bgCtx.fillRect(0, 0, bgCanvas.value.width, bgCanvas.value.height)
      const n2 = bgCtx.createRadialGradient(bgCanvas.value.width * 0.8, bgCanvas.value.height * 0.7, 0, bgCanvas.value.width * 0.8, bgCanvas.value.height * 0.7, bgCanvas.value.width * 0.25)
      n2.addColorStop(0, 'rgba(74,144,255,0.1)'); n2.addColorStop(1, 'transparent')
      bgCtx.fillStyle = n2; bgCtx.fillRect(0, 0, bgCanvas.value.width, bgCanvas.value.height)
      stars.forEach(s => {
        s.opacity += s.twinkleSpeed; s.opacity = Math.max(0.2, Math.min(1, s.opacity))
        s.y += s.speed; if (s.y > bgCanvas.value.height) s.y = 0
        bgCtx.save(); bgCtx.globalAlpha = s.opacity; bgCtx.fillStyle = '#fff'
        bgCtx.shadowColor = '#fff'; bgCtx.shadowBlur = s.size * 2
        bgCtx.beginPath(); bgCtx.arc(s.x, s.y, s.size, 0, Math.PI * 2); bgCtx.fill(); bgCtx.restore()
      })
      lastBg = ts
    }
    bgFrameId = requestAnimationFrame(animate)
  }
  animate(0)
}

const toggleLanguage = () => {
  currentLang.value = currentLang.value === 'zh' ? 'en' : 'zh'
  localStorage.setItem('tetrisLang', currentLang.value)
}

const updateStage = () => {
  const newStage = characterStage.value
  if (newStage > 0) {
    characterAction.value = 'cheer'
    setTimeout(() => { characterAction.value = 'idle' }, 1500)
  }
}

const startGame = () => {
  initBoard(); score.value = 0; displayScore.value = 0; level.value = 1
  lines.value = 0; dropInterval = 1000; gameOver.value = false; isPlaying.value = true
  particles = []; combo.value = 0; achievements.value = []
  characterAction.value = 'idle'
  currentPiece = createPiece(); nextPiece = createPiece(); drawNextPiece()
  lastDropTime = performance.now(); gameFrameId = requestAnimationFrame(gameLoop)
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
  touchStartX = e.touches[0].clientX; touchStartY = e.touches[0].clientY; touchStartTime = Date.now()
}

const handleTouchEnd = (e) => {
  if (!isPlaying.value) return
  const endX = e.changedTouches[0].clientX, endY = e.changedTouches[0].clientY
  const dur = Date.now() - touchStartTime, dx = endX - touchStartX, dy = endY - touchStartY
  if (dur < 200 && Math.abs(dx) < 10 && Math.abs(dy) < 10) { rotate(); return }
  if (Math.abs(dx) > Math.abs(dy)) {
    if (Math.abs(dx) > 30) { if (dx > 0) moveRight(); else moveLeft() }
  } else {
    if (Math.abs(dy) > 30) { if (dy > 0) drop(); else softDrop() }
  }
}

const preventScroll = (e) => e.preventDefault()

onMounted(() => {
  ctx = gameCanvas.value.getContext('2d'); nextCtx = nextCanvas.value.getContext('2d')
  const savedLang = localStorage.getItem('tetrisLang')
  if (savedLang) currentLang.value = savedLang
  initBoard(); drawBoard(0); drawNextPiece(); initBackground()

  actionTimer = setInterval(() => {
    if (isPlaying.value && Math.random() > 0.65) {
      const actions = ['idle', 'wave', 'jump', 'dance']
      characterAction.value = actions[Math.floor(Math.random() * (actions.length - 1)) + 1]
      setTimeout(() => { characterAction.value = 'idle' }, 1000)
    }
  }, 4000)

  window.addEventListener('keydown', handleKeydown)
  document.addEventListener('touchmove', preventScroll, { passive: false })
  document.addEventListener('wheel', preventScroll, { passive: false })
  const area = document.querySelector('.game-wrapper')
  if (area) {
    area.addEventListener('touchstart', handleTouchStart, { passive: true })
    area.addEventListener('touchend', handleTouchEnd, { passive: true })
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('touchmove', preventScroll)
  document.removeEventListener('wheel', preventScroll)
  cancelAnimationFrame(gameFrameId); cancelAnimationFrame(bgFrameId)
  if (comboTimer) clearTimeout(comboTimer)
  if (actionTimer) clearInterval(actionTimer)
})
</script>

<style scoped>
/* ── Base ── */
.game-wrapper {
  min-height: 100vh; min-height: 100dvh;
  position: relative; overflow: hidden; background: #050510;
  touch-action: none;
  display: flex; align-items: center; justify-content: center;
}
.bg-canvas {
  position: fixed; inset: 0; width: 100%; height: 100%;
  z-index: 0; transform: translateZ(0);
}
.lang-switch {
  position: fixed; top: 16px; right: 16px; z-index: 100;
  width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px; cursor: pointer; font-size: 1.2rem;
  backdrop-filter: blur(12px); transition: 0.2s;
  image-rendering: pixelated;
}
.lang-switch:hover { background: rgba(255,255,255,0.12); transform: scale(1.1); }

/* ── Container ── */
.game-container {
  position: relative; z-index: 1;
  display: flex; flex-direction: column; align-items: center;
  padding: 8px 16px; gap: 8px;
  width: 100%; max-width: 860px;
  height: 100dvh; max-height: 100dvh;
  box-sizing: border-box;
  background-image:
    radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px);
  background-size: 16px 16px;
}
.top-bar { flex-shrink: 0; text-align: center; }
.title-row { display: flex; align-items: baseline; gap: 14px; justify-content: center; }
.title {
  font-family: 'ZCOOL QingKe HuangYou', 'PingFang SC', sans-serif;
  font-size: 2rem; font-weight: 400; margin: 0;
  background: linear-gradient(135deg, #ff6b9d, #c94bff, #6b9dff);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  letter-spacing: 6px;
  filter: drop-shadow(0 0 20px rgba(201,75,255,0.3));
}
.subtitle {
  font-family: 'Press Start 2P', monospace;
  font-size: 0.5rem; color: rgba(255,255,255,0.12); letter-spacing: 2px;
}

/* ── Main Area ── */
.main-area {
  display: flex; gap: 10px; align-items: flex-start;
  flex: 1; min-height: 0; width: 100%;
  justify-content: center;
}

/* ── Side Panels ── */
.side-panel {
  display: flex; flex-direction: column; gap: 6px;
  flex-shrink: 0;
}
.left-panel { width: 110px; gap: 4px; }
.right-panel { width: 180px; gap: 6px; }

.stat {
  position: relative;
  display: flex; align-items: center; gap: 8px;
  padding: 6px 8px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 6px;
  overflow: hidden;
  transition: border-color 0.2s;
}
.stat::before {
  content: ''; position: absolute; top: 0; left: 2px; right: 2px; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
}
.stat-icon { font-size: 1rem; flex-shrink: 0; opacity: 0.7; }
.stat-body { min-width: 0; }
.stat-label {
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 0.55rem; font-weight: 600; color: rgba(255,255,255,0.3);
  letter-spacing: 2px; display: block; line-height: 1;
}
.stat-val {
  font-family: 'Press Start 2P', 'Orbitron', monospace;
  font-size: 0.75rem; font-weight: 400; display: block; line-height: 1.5;
  letter-spacing: 0.5px;
  image-rendering: pixelated;
}
.score-val { background: linear-gradient(135deg,#ff6b9d,#ff9dbd); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.level-val { background: linear-gradient(135deg,#6b9dff,#9dbbff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.lines-val { background: linear-gradient(135deg,#9dff6b,#bbff9d); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.high-val { background: linear-gradient(135deg,#ffd700,#ffed4a); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

.combo-badge {
  text-align: center; padding: 3px 6px;
  background: rgba(255,107,157,0.1);
  border: 1px solid rgba(255,107,157,0.2);
  border-radius: 4px;
  font-family: 'Press Start 2P', monospace;
  font-size: 0.6rem; font-weight: 400;
  color: #ff6b9d;
  animation: pulse 0.5s ease-in-out infinite;
}

/* ── Board ── */
.board-section { position: relative; flex-shrink: 0; }
.board-frame {
  position: relative; width: 328px; height: 648px; padding: 3px;
  background: linear-gradient(135deg, rgba(201,75,255,0.35), rgba(107,157,255,0.35));
  border-radius: 10px; overflow: hidden;
}
.board-glow {
  position: absolute; inset: -3px;
  background: linear-gradient(45deg, #ff6b9d, #c94bff, #6b9dff, #ff6b9d);
  background-size: 300% 300%; border-radius: 13px; z-index: -1;
  opacity: 0.25; filter: blur(15px);
  animation: borderGlow 4s ease-in-out infinite;
}
@keyframes borderGlow {
  0%,100% { background-position: 0% 50%; opacity: 0.15; }
  50% { background-position: 100% 50%; opacity: 0.4; }
}
.board-frame canvas { display: block; border-radius: 7px; background: #0a0a15; width: 100%; height: 100%; }
.board-corners { position: absolute; inset: 0; pointer-events: none; z-index: 1; }
.corner {
  position: absolute; width: 14px; height: 14px;
  border-color: rgba(201,75,255,0.5); border-style: solid;
}
.corner.tl { top: 4px; left: 4px; border-width: 2px 0 0 2px; }
.corner.tr { top: 4px; right: 4px; border-width: 2px 2px 0 0; }
.corner.bl { bottom: 4px; left: 4px; border-width: 0 0 2px 2px; }
.corner.br { bottom: 4px; right: 4px; border-width: 0 2px 2px 0; }

/* Scanline overlay */
.scanlines {
  position: absolute; inset: 3px; border-radius: 7px;
  background: repeating-linear-gradient(
    0deg, transparent, transparent 2px, rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 4px
  );
  pointer-events: none; z-index: 3;
}

.board-overlay {
  position: absolute; inset: 3px; background: rgba(0,0,0,0.75);
  border-radius: 7px; z-index: 5; backdrop-filter: blur(4px);
}

/* Screen shake */
.board-frame.shake {
  animation: screenShake 0.25s ease-out;
}
@keyframes screenShake {
  0%   { transform: translate(0, 0); }
  15%  { transform: translate(-5px, 1px); }
  30%  { transform: translate(4px, -2px); }
  45%  { transform: translate(-3px, 2px); }
  60%  { transform: translate(2px, -1px); }
  75%  { transform: translate(-1px, 1px); }
  90%  { transform: translate(1px, 0); }
  100% { transform: translate(0, 0); }
}

.start-btn-wrap {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
  z-index: 10;
}
.start-btn {
  position: relative;
  padding: 12px 28px; border-radius: 6px; border: 2px solid rgba(201,75,255,0.5);
  background: rgba(10,10,21,0.85);
  color: white;
  font-family: 'Press Start 2P', monospace;
  font-size: 0.65rem; font-weight: 400; cursor: pointer;
  display: flex; align-items: center; gap: 10px;
  backdrop-filter: blur(8px); transition: all 0.25s;
  letter-spacing: 1px;
  box-shadow: 0 0 20px rgba(201,75,255,0.15), inset 0 0 0 1px rgba(255,255,255,0.06);
}
.start-btn:hover {
  transform: scale(1.06);
  border-color: rgba(201,75,255,0.8);
  box-shadow: 0 0 30px rgba(201,75,255,0.3), inset 0 0 0 1px rgba(255,255,255,0.1);
}
.start-btn:active { transform: scale(0.95); }
.btn-symbol { font-size: 0.8rem; }

/* ── Right Panel ── */
.panel-label {
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 0.55rem; font-weight: 600; color: rgba(255,255,255,0.2);
  letter-spacing: 2px; margin-bottom: 4px; text-align: center;
}

.next-box { text-align: center; }
.next-frame {
  display: inline-block; border-radius: 6px;
  border: 1px solid rgba(255,255,255,0.06); overflow: hidden;
  background: rgba(0,0,0,0.3);
}
.next-frame canvas { display: block; }

.char-box { text-align: center; }
.char-canvas-wrap { display: flex; justify-content: center; }
.char-selector { display: flex; justify-content: center; gap: 3px; margin-top: 3px; }
.char-btn {
  padding: 2px 8px; border-radius: 4px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.02); color: rgba(255,255,255,0.3);
  font-family: 'ZCOOL QingKe HuangYou', 'PingFang SC', sans-serif;
  font-size: 0.65rem; cursor: pointer; transition: all 0.2s;
  letter-spacing: 1px;
}
.char-btn:hover {
  background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.5);
  border-color: rgba(255,255,255,0.15);
}
.char-btn.active {
  background: rgba(201,75,255,0.15);
  border-color: rgba(201,75,255,0.4); color: #fff;
  box-shadow: 0 0 10px rgba(201,75,255,0.15);
}

.ctrl-box {}
.ctrl-grid { display: flex; flex-direction: column; gap: 2px; }
.ctrl-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 2px 6px;
  background: rgba(255,255,255,0.02);
  border-radius: 3px;
}
.key-cap {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 26px; height: 18px; padding: 0 5px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 2px;
  font-family: 'Press Start 2P', monospace;
  font-size: 0.45rem; color: rgba(255,255,255,0.4);
  box-shadow: inset 0 -1.5px 0 rgba(0,0,0,0.3);
}
.ctrl-item span:last-child {
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 0.55rem; font-weight: 500; color: rgba(255,255,255,0.25);
  letter-spacing: 1px;
}

.achieve-box { display: flex; flex-direction: column; gap: 2px; }
.achieve-item {
  padding: 3px 6px;
  background: rgba(255,215,0,0.06);
  border: 1px solid rgba(255,215,0,0.12);
  border-radius: 3px;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 0.5rem; font-weight: 600; color: rgba(255,215,0,0.6); text-align: center;
  animation: pop 0.3s ease-out;
}
@keyframes pop { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }

/* ── Game Over ── */
.game-over-overlay {
  position: fixed; inset: 0; z-index: 200;
  background: rgba(0,0,0,0.85); backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.go-content { text-align: center; }
.go-title {
  font-family: 'Press Start 2P', monospace;
  font-size: 1.8rem; font-weight: 400; color: #c41e3a;
  margin-bottom: 16px;
  letter-spacing: 4px;
}
.go-score {
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  color: rgba(255,255,255,0.3); font-size: 0.7rem;
  letter-spacing: 2px; margin-bottom: 8px;
}
.go-num {
  font-family: 'Press Start 2P', monospace;
  font-size: 2rem; font-weight: 400;
  background: linear-gradient(135deg,#ffd700,#ffed4a);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 20px rgba(255,215,0,0.3));
}

/* ── Combo Pop ── */
.combo-pop {
  position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%); z-index: 100;
  animation: comboAnim 0.8s ease-out forwards; pointer-events: none;
}
.combo-text {
  font-family: 'Press Start 2P', monospace;
  font-size: 1.5rem; font-weight: 400;
  background: linear-gradient(135deg,#ff6b9d,#c94bff,#6b9dff);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  text-shadow: 0 0 40px rgba(201,75,255,0.5);
  letter-spacing: 2px;
}
@keyframes comboAnim {
  0% { opacity: 0; transform: translate(-50%,-50%) scale(0.5); }
  20% { opacity: 1; transform: translate(-50%,-50%) scale(1.1); }
  80% { opacity: 1; transform: translate(-50%,-50%) scale(1); }
  100% { opacity: 0; transform: translate(-50%,-50%) scale(1.3); }
}
@keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }

/* ── Responsive ── */
@media (max-width: 780px) {
  .game-container { max-width: 100%; padding: 6px 10px; overflow-x: hidden; }
  .main-area { flex-direction: column; align-items: center; gap: 6px; }
  .left-panel { width: auto; flex-direction: row; flex-wrap: wrap; justify-content: center; gap: 3px; order: 1; }
  .left-panel .stat { padding: 4px 7px; gap: 5px; }
  .left-panel .stat-icon { font-size: 0.8rem; }
  .left-panel .stat-val { font-size: 0.6rem; }
  .left-panel .stat-label { font-size: 0.5rem; }
  .right-panel { order: 2; width: auto; flex-direction: row; flex-wrap: wrap; justify-content: center; gap: 4px; }
  .right-panel .next-box { display: none; }
  .right-panel .ctrl-box { display: none; }
  .right-panel .achieve-box { display: none; }
  .board-section { order: 3; }
}
@media (max-width: 600px) {
  .title { font-size: 1.2rem; letter-spacing: 3px; }
  .subtitle { display: none; }
  .lang-switch { top: 8px; right: 8px; width: 34px; height: 34px; font-size: 1rem; }
  .game-container { gap: 4px; padding: 4px 6px; }
  .stat { padding: 3px 5px; }
  .stat-val { font-size: 0.55rem; }
  .go-title { font-size: 1.2rem; }
  .go-num { font-size: 1.4rem; }
  .board-section { flex: 1; min-height: 0; display: flex; justify-content: center; }
  .board-frame { height: 100%; width: auto; aspect-ratio: 328 / 648; }
  .board-frame canvas { width: 100%; height: 100%; display: block; }
  .right-panel { align-items: center; gap: 4px; }
  .char-box :deep(.char-canvas) { width: 120px; height: auto; }
  .char-btn { font-size: 0.55rem; padding: 2px 6px; }
}
</style>
