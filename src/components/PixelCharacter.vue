<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  outfit: { type: Object, default: () => ({ id: 'casual' }) },
  action: { type: String, default: 'idle' },
})

const canvasRef = ref(null)
let ctx = null
let animFrame = null
let startTime = 0
let time = 0
let blinkState = false
let blinkTimer = 0

const P = 4
const CW = 24
const CH = 34
const W = CW * P
const H = CH * P

const CODES = {
  '.': 0, H: 1, h: 2, F: 3, E: 4, e: 5, m: 6, b: 7,
  T: 8, D: 9, S: 10, A: 11, L: 12, K: 13, O: 14,
  B: 15, N: 16, C: 17, U: 18, R: 19,
}

const PALETTES = {
  casual: {
    1: '#8B5E3C', 2: '#A67B5B', 3: '#FDE8D0', 4: '#FFFFFF',
    5: '#2C1810', 6: '#E8505A', 7: '#FFB8C0', 8: '#4A90FF',
    11: '#FDE8D0', 12: '#FDE8D0', 13: '#FFFFFF', 14: '#5C4033',
    16: '#FDE8D0', 10: '#4A4A70',
  },
  school: {
    1: '#2D2D2D', 2: '#4A4A4A', 3: '#FDE8D0', 4: '#FFFFFF',
    5: '#1A1A2E', 6: '#E8505A', 7: '#FFB8C0', 8: '#F5F5F5',
    11: '#FDE8D0', 12: '#FDE8D0', 13: '#FFFFFF', 14: '#5C4033',
    16: '#FDE8D0', 10: '#1E4A8A', R: '#FF4757',
  },
  party: {
    1: '#FF8FC4', 2: '#FFB0D5', 3: '#FDE8D0', 4: '#FFFFFF',
    5: '#2C1810', 6: '#E8505A', 7: '#FFB8C0', 8: '#FF69B4',
    11: '#FDE8D0', 12: '#FDE8D0', 13: '#2D2D2D', 14: '#FF69B4',
    9: '#FF69B4', 16: '#FDE8D0',
  },
  bikini: {
    1: '#8B5E3C', 2: '#D4A574', 3: '#FDE8D0', 4: '#FFFFFF',
    5: '#2C1810', 6: '#E8505A', 7: '#FFB8C0', 8: '#FF4757',
    11: '#FDE8D0', 12: '#FDE8D0', 13: '#FFFFFF', 14: '#FFD700',
    15: '#FF4757', 16: '#FDE8D0',
  },
  princess: {
    1: '#FFD700', 2: '#FFEC8B', 3: '#FDE8D0', 4: '#FFFFFF',
    5: '#6B3A2A', 6: '#E8505A', 7: '#FFB8C0', 8: '#FFD700',
    11: '#FDE8D0', 12: '#FDE8D0', 13: '#FFFFFF', 14: '#FFD700',
    9: '#FFD700', 16: '#FDE8D0',
  },
}

const CHAR_MAP = [
  '.....HHHHHHH.....',
  '....HHHHHHHHH....',
  '...HHHHHHHHHHH...',
  '...HHhhhhhhhhh...',
  '..HHH..FF..HHH...',
  '..HH...FF..HH....',
  '....F......F.....',
  '...FEE....EEF...',
  '...FEe....EeF...',
  '...FEE....EEF...',
  '...FFF....FFF...',
  '...FFb....bFF...',
  '...FFFmmmmFFF...',
  '....FFFFFFF.....',
  '.....NNNNN......',
  '....TATATTT.....',
  '...TTTTTTTTTT...',
  '...TTTTTTTTTT...',
  '...TTTTTTTTTT...',
  '...TT...TTTT....',
  '...TT....TTT....',
  '....TTTTTTT.....',
  '...SSSSSSSSS....',
  '..SSSSSSSSSS....',
  '..SSSSSSSSS.....',
  '...SSSSSSS......',
  '....SSSSS.......',
  '.....L.L........',
  '....KK.KK.......',
  '...KKK.KKK......',
  '...KKK.KKK......',
  '...OOO.OOO......',
  '....OOOOOO......',
  '.....OOOO.......',
]

const BIKINI_MAP = [
  '.....HHHHHHH.....',
  '....HHHHHHHHH....',
  '...HHHHHHHHHHH...',
  '...HHhhhhhhhhh...',
  '..HHH..FF..HHH...',
  '..HH...FF..HH....',
  '....F......F.....',
  '...FEE....EEF...',
  '...FEe....EeF...',
  '...FEE....EEF...',
  '...FFF....FFF...',
  '...FFb....bFF...',
  '...FFFmmmmFFF...',
  '....FFFFFFF.....',
  '.....NNNNN......',
  '....ABBBBBB.....',
  '...BBBBBBBBBB...',
  '...BBBBBBBBBB...',
  '...BBBBBBBBBB...',
  '...BB...BBBB....',
  '...BB....BBB....',
  '....CCCCCC......',
  '...CCCCCCCCC....',
  '..CCCCCCCCCC....',
  '..CCCCCCCCC.....',
  '...CCCCCCC......',
  '....CCCCC.......',
  '.....L.L........',
  '....KK.KK.......',
  '...KKK.KKK......',
  '...KKK.KKK......',
  '...OOO.OOO......',
  '....OOOOOO......',
  '.....OOOO.......',
]

const SCHOOL_MAP = [
  '.....HHHHHHH.....',
  '....HHHHHHHHH....',
  '...HHHHHHHHHHH...',
  '...HHhhhhhhhhh...',
  '..HHH..FF..HHH...',
  '..HH...FF..HH....',
  '....F......F.....',
  '...FEE....EEF...',
  '...FEe....EeF...',
  '...FEE....EEF...',
  '...FFF....FFF...',
  '...FFb....bFF...',
  '...FFFmmmmFFF...',
  '....FFFFFFF.....',
  '.....NNNNN......',
  '....RTRTTTT.....',
  '...TTTTTTTTTT...',
  '...TTTTTTTTTT...',
  '...TTTTTTTTTT...',
  '...TT...TTTT....',
  '...TT....TTT....',
  '....TTTTTTT.....',
  '...SSSSSSSSS....',
  '..SSSSSSSSSS....',
  '..SSSSSSSSS.....',
  '...SSSSSSS......',
  '....SSSSS.......',
  '.....L.L........',
  '....KK.KK.......',
  '...KKK.KKK......',
  '...KKK.KKK......',
  '...OOO.OOO......',
  '....OOOOOO......',
  '.....OOOO.......',
]

const PARTY_MAP = [
  '.....HHHHHHH.....',
  '....HHHHHHHHH....',
  '...HHHHHHHHHHH...',
  '...HHhhhhhhhhh...',
  '..HHH..FF..HHH...',
  '..HH...FF..HH....',
  '....F......F.....',
  '...FEE....EEF...',
  '...FEe....EeF...',
  '...FEE....EEF...',
  '...FFF....FFF...',
  '...FFb....bFF...',
  '...FFFmmmmFFF...',
  '....FFFFFFF.....',
  '.....NNNNN......',
  '....ADDDDDDD....',
  '...DDDDDDDDDD...',
  '...DDDDDDDDDD...',
  '...DDDDDDDDDD...',
  '...DDD..DDDD....',
  '...DDD...DDD....',
  '....DDDDDDD.....',
  '...DDDDDDDDD....',
  '..DDDDDDDDDD....',
  '..DDDDDDDDD.....',
  '...DDDDDDD......',
  '....DDDDD.......',
  '.....L.L........',
  '....KK.KK.......',
  '...KKK.KKK......',
  '...KKK.KKK......',
  '...OOO.OOO......',
  '....OOOOOO......',
  '.....OOOO.......',
]

const PRINCESS_MAP = [
  '...w.HHHHHHH....',
  '..wwHHHHHHHHH...',
  '..wwHHHHHHHHH...',
  '..w.HHhhhhhhh...',
  '....HH..FF..HH..',
  '....HH..FF..HH..',
  '.....F......F...',
  '....FEE....EEF..',
  '....FEe....EeF..',
  '....FEE....EEF..',
  '....FFF....FFF..',
  '....FFb....bFF..',
  '....FFFmmmmFFF..',
  '.....FFFFFFF....',
  '......NNNNN.....',
  '.....ADDDDDD....',
  '....DDDDDDDDD...',
  '....DDDDDDDDD...',
  '....DDDDDDDDD...',
  '....DDDDDDDDD...',
  '...DDDDDDDDDD...',
  '...DDDDDDDDDD...',
  '...DDDDDDDDDD...',
  '....DDDDDDDD....',
  '....DDDDDDD.....',
  '.....DDDDD......',
  '......L.L.......',
  '.....KK.KK......',
  '....KKK.KKK.....',
  '....KKK.KKK.....',
  '....OOO.OOO.....',
  '.....OOOOOO.....',
  '......OOOO......',
]

const CROWN_MAP = [
  '...w..ww...',
  '..www.www..',
  '.wwwwwwwww.',
  '..wwwwwww..',
]

function getCharMap(id) {
  switch (id) {
    case 'bikini': return BIKINI_MAP
    case 'school': return SCHOOL_MAP
    case 'party': return PARTY_MAP
    case 'princess': return PRINCESS_MAP
    default: return CHAR_MAP
  }
}

function drawCharacter(c, t, blink) {
  const palette = PALETTES[props.outfit.id] || PALETTES.casual
  const map = getCharMap(props.outfit.id)

  const idleBob = Math.sin(t * 0.0025) * 0.8
  const bounce = props.action === 'jump' ? Math.abs(Math.sin(t * 0.015)) * -10
    : props.action === 'cheer' ? Math.sin(t * 0.01) * -2 + 1
    : 0
  const sway = props.action === 'dance' ? Math.sin(t * 0.007) * 0.3
    : props.action === 'wave' ? Math.sin(t * 0.004) * 0.6
    : 0

  const bobY = Math.floor(idleBob + bounce)
  const swayX = Math.floor(sway * P)

  c.save()
  c.clearRect(0, 0, W, H)
  c.translate(swayX, bobY)

  if (props.outfit.id === 'princess') {
    const crownOffsetX = 2
    const crownOffsetY = -4 * P
    CROWN_MAP.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) {
        const ch = row[x]
        if (ch === '.') continue
        if (ch === 'w') {
          c.fillStyle = '#FFFFFF'
        } else {
          c.fillStyle = '#FFD700'
        }
        c.fillRect((x + crownOffsetX) * P, y * P + crownOffsetY, P, P)
      }
    })
  }

  map.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const ch = row[x]
      if (ch === '.') continue
      if (ch === 'w') continue
      const px = x * P
      const py = y * P
      const ci = CODES[ch] || 0
      const color = palette[ci]
      if (!color) continue

      if (ch === 'e' && blink) {
        c.fillStyle = palette[4] || '#FFFFFF'
        c.fillRect(px, py, P, P)
        continue
      }

      if (ch === 'E') {
        c.fillStyle = '#FFFFFF'
        c.fillRect(px, py, P, P)
        c.fillStyle = palette[4]
        c.fillRect(px, py, P, 1)
        c.fillRect(px, py, 1, P)
        continue
      }

      if (ch === 'e') {
        c.fillStyle = palette[5]
        c.fillRect(px, py, P, P)
        c.fillStyle = '#FFFFFF'
        c.fillRect(px + P - 1, py, 1, 1)
        continue
      }

      c.fillStyle = color
      c.fillRect(px, py, P, P)

      if (ch === 'b') {
        c.globalAlpha = 0.5
        c.fillRect(px, py, P, P)
        c.globalAlpha = 1
      }
    }
  })

  c.restore()
}

function render(timestamp) {
  if (!startTime) startTime = timestamp
  const t = timestamp - startTime

  blinkTimer++
  if (blinkTimer > 150 + Math.random() * 100) {
    blinkState = true
    blinkTimer = 0
    setTimeout(() => { blinkState = false }, 120)
  }

  drawCharacter(ctx, t, blinkState)
  animFrame = requestAnimationFrame(render)
}

watch(() => props.action, () => { blinkTimer = 0 })

onMounted(() => {
  ctx = canvasRef.value.getContext('2d')
  animFrame = requestAnimationFrame(render)
})

onUnmounted(() => {
  if (animFrame) cancelAnimationFrame(animFrame)
})
</script>

<template>
  <canvas ref="canvasRef" :width="W" :height="H" class="pixel-character-canvas" />
</template>

<style scoped>
.pixel-character-canvas {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}
</style>
