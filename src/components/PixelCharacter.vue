<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  outfit: { type: Object, default: () => ({ id: 'casual' }) },
  action: { type: String, default: 'idle' },
})

const canvasRef = ref(null)
let ctx = null
let animFrame = null
let startTime = 0
let blinkState = false
let blinkCounter = 0

const P = 4
const CW = 28
const CH = 40
const W = CW * P
const H = CH * P

const C = {
  mouth: '#D44050',
  blush: '#FFB0B0',
  sockBand: '#FFB0D0',
  shoeDark: '#1A1010',
}

const OUTFITS = {
  casual: {
    hair: '#7A4A2E', hairLight: '#B8865C', hairDark: '#4A2815',
    skin: '#FDE8D0', skinShadow: '#E8C9A8',
    eye: '#6B3A5E',
    top: '#4A90D9', topLight: '#80B8F0', topDark: '#2A5A80',
    skirt: '#3A3A6A', skirtLight: '#5A5A9A',
    sock: '#FFFFFF', shoe: '#3A2A2A',
  },
  school: {
    hair: '#1A1A2E', hairLight: '#4A4A6A', hairDark: '#0A0A1A',
    skin: '#FDE8D0', skinShadow: '#E8C9A8',
    eye: '#2A1A4A',
    top: '#F5F5F5', topLight: '#FFFFFF', topDark: '#D0D0D0',
    skirt: '#1E3A6A', skirtLight: '#2A5A9A',
    sock: '#FFFFFF', shoe: '#1A1A1A',
  },
  party: {
    hair: '#FF7AB8', hairLight: '#FFA8D0', hairDark: '#CC4080',
    skin: '#FDE8D0', skinShadow: '#E8C9A8',
    eye: '#8A2060',
    top: '#FF5EA0', topLight: '#FF80B8', topDark: '#CC3070',
    skirt: '#6A3AAA', skirtLight: '#8A5ADA',
    sock: '#1A0A1A', shoe: '#CC3070',
  },
  bikini: {
    hair: '#D4905A', hairLight: '#E8B880', hairDark: '#A06030',
    skin: '#FDE8D0', skinShadow: '#E8C9A8',
    eye: '#3A6A9A',
    top: '#FF4060', topLight: '#FF7090', topDark: '#CC1030',
    skirt: '#FF4060', skirtLight: '#FF7090',
    sock: '#FFFFFF', shoe: '#FFD700',
  },
  princess: {
    hair: '#F0C840', hairLight: '#FFE880', hairDark: '#C09820',
    skin: '#FDE8D0', skinShadow: '#E8C9A8',
    eye: '#4A3A8A',
    top: '#FFD700', topLight: '#FFE840', topDark: '#D4A000',
    skirt: '#FF8A00', skirtLight: '#FFB040',
    sock: '#FFF8E0', shoe: '#FFD700',
  },
}

function getMap(id) {
  const M = (m) => m
  switch (id) {
    case 'bikini': return M(BIKINI)
    case 'school': return M(SCHOOL)
    case 'party': return M(PARTY)
    case 'princess': return M(PRINCESS)
    default: return M(CASUAL)
  }
}

const BASE = [
  '..........HHHHHH..........',
  '........HHHHHHHHHH........',
  '........HHHHHHHHHH........',
  '.......HHHHHHHHHHHH.......',
  '......HHHHHHHHHHHHHH......',
  '......HHHHHHHHHHHHHH......',
  '.....HHHHhhhhHHHHHHHH.....',
  '.....HHH..FF..HHHHHH.....',
  '.....HHH..FF..HHHHH......',
  '.....HH.........HHH......',
  '......FF.......FFF.......',
  '.....FEE......EEFF.......',
  '.....FEE......EEFF.......',
  '.....FEE......EEFF.......',
  '.....FFF......FFF........',
  '.....FFb......bFF........',
  '.....FFFmmmmmmFFF........',
  '......FFFFFFFFF..........',
  '.......NNNNNNN...........',
  '......AAAAAAAAAA..........',
  '....AAA....TT....AAA......',
  '....AAA..TTTT..AAA.......',
  '....AAA..TTTT..AAA.......',
  '....AAA..TTTT..AAA.......',
  '....AAA..TT....AAA.......',
  '....AAAAA......AAAAA.....',
  '.....SSSSSSSSSSSSS.......',
  '....SSSSSSSSSSSSSSS......',
  '....SS..SSSSSS..SS......',
  '.....L..L....L..L.......',
  '....LLLL....LLLLL.......',
  '....L..L....L..L........',
  '....L..L....L..L........',
  '...LLL..L..LLL..L.......',
  '..KKKK..L.KKKK..L.......',
  '..KKKK..L.KKKK..L.......',
  '..K..K..L.K..K..L.......',
  '..OOOO..L.OOOO..L.......',
  '...OOOO..L.OOOO..L......',
  '....OO....L..OO..........',
]

const CASUAL = BASE.map(r => r)

const SCHOOL = [
  '..........HHHHHH..........',
  '........HHHHHHHHHH........',
  '........HHHHHHHHHH........',
  '.......HHHHHHHHHHHH.......',
  '......HHHHHHHHHHHHHH......',
  '......HHHHHHHHHHHHHH......',
  '.....HHHHhhhhHHHHHHHH.....',
  '.....HHH..FF..HHHHHH.....',
  '.....HHH..FF..HHHHH......',
  '.....HH.........HHH......',
  '......FF.......FFF.......',
  '.....FEE......EEFF.......',
  '.....FEE......EEFF.......',
  '.....FEE......EEFF.......',
  '.....FFF......FFF........',
  '.....FFb......bFF........',
  '.....FFFmmmmmmFFF........',
  '......FFFFFFFFF..........',
  '.......NNNNNNN...........',
  '......AAAAAAAAAA..........',
  '....AAA....OO....AAA......',
  '....AAA..OOOO..AAA.......',
  '....AAA..OOOO..AAA.......',
  '....AAA..OOOO..AAA.......',
  '....AAA..OO....AAA.......',
  '....AAAAA......AAAAA.....',
  '.....SSSSSSSSSSSSS.......',
  '....SSSSSSSSSSSSSSS......',
  '....SS..SSSSSS..SS......',
  '.....L..L....L..L.......',
  '....LLLL....LLLLL.......',
  '....L..L....L..L........',
  '....L..L....L..L........',
  '...LLL..L..LLL..L.......',
  '..KKKK..L.KKKK..L.......',
  '..KKKK..L.KKKK..L.......',
  '..K..K..L.K..K..L.......',
  '..OOOO..L.OOOO..L.......',
  '...OOOO..L.OOOO..L......',
  '....OO....L..OO..........',
]

const PARTY = [
  '..........HHHHHH..........',
  '........HHHHHHHHHH........',
  '........HHHHHHHHHH........',
  '.......HHHHHHHHHHHH.......',
  '......HHHHHHHHHHHHHH......',
  '......HHHHHHHHHHHHHH......',
  '.....HHHHhhhhHHHHHHHH.....',
  '.....HHH..FF..HHHHHH.....',
  '.....HHH..FF..HHHHH......',
  '.....HH.........HHH......',
  '......FF.......FFF.......',
  '.....FEE......EEFF.......',
  '.....FEE......EEFF.......',
  '.....FEE......EEFF.......',
  '.....FFF......FFF........',
  '.....FFb......bFF........',
  '.....FFFmmmmmmFFF........',
  '......FFFFFFFFF..........',
  '.......NNNNNNN...........',
  '......AAAAAAAAAA..........',
  '....AAA....DD....AAA......',
  '....AAA..DDDD..AAA.......',
  '....AAA..DDDD..AAA.......',
  '....AAA..DDDD..AAA.......',
  '....AAA..DD....AAA.......',
  '....AAAAA......AAAAA.....',
  '.....DDDDDDDDDDDDD.......',
  '....DDDDDDDDDDDDDDD......',
  '....DD..DDDDDD..DD......',
  '.....L..L....L..L.......',
  '....LLLL....LLLLL.......',
  '....L..L....L..L........',
  '....L..L....L..L........',
  '...LLL..L..LLL..L.......',
  '..KKKK..L.KKKK..L.......',
  '..KKKK..L.KKKK..L.......',
  '..K..K..L.K..K..L.......',
  '..OOOO..L.OOOO..L.......',
  '...OOOO..L.OOOO..L......',
  '....OO....L..OO..........',
]

const BIKINI = [
  '..........HHHHHH..........',
  '........HHHHHHHHHH........',
  '........HHHHHHHHHH........',
  '.......HHHHHHHHHHHH.......',
  '......HHHHHHHHHHHHHH......',
  '......HHHHHHHHHHHHHH......',
  '.....HHHHhhhhHHHHHHHH.....',
  '.....HHH..FF..HHHHHH.....',
  '.....HHH..FF..HHHHH......',
  '.....HH.........HHH......',
  '......FF.......FFF.......',
  '.....FEE......EEFF.......',
  '.....FEE......EEFF.......',
  '.....FEE......EEFF.......',
  '.....FFF......FFF........',
  '.....FFb......bFF........',
  '.....FFFmmmmmmFFF........',
  '......FFFFFFFFF..........',
  '.......NNNNNNN...........',
  '......AAAAA.AAA..........',
  '....AAA.BB..BB.AAA.......',
  '....AAA.BB..BB.AAA.......',
  '....AAA.BB..BB.AAA.......',
  '....AAA.BB..BB.AAA.......',
  '....AAA..BB....AAA.......',
  '....AAAAA......AAAAA.....',
  '.....VVVVVVVVVVVVV.......',
  '....VVVVVVVVVVVVVVV......',
  '....VV..VVVVVV..VV......',
  '.....L..L....L..L.......',
  '....LLLL....LLLLL.......',
  '....L..L....L..L........',
  '....L..L....L..L........',
  '...LLL..L..LLL..L.......',
  '..KKKK..L.KKKK..L.......',
  '..KKKK..L.KKKK..L.......',
  '..K..K..L.K..K..L.......',
  '..OOOO..L.OOOO..L.......',
  '...OOOO..L.OOOO..L......',
  '....OO....L..OO..........',
]

const PRINCESS = [
  '...w..HHHHHH..w.......',
  '..wwwHHHHHHHHwww.......',
  '..w..HHHHHHHH..w.......',
  '.....HHHHHHHHHH........',
  '....HHHHHHHHHHHH.......',
  '....HHHHHHHHHHHH.......',
  '...HHHHhhhhHHHHHH......',
  '...HHH..FF..HHHHH......',
  '...HHH..FF..HHHH.......',
  '...HH.........HHH......',
  '....FF.......FFF.......',
  '...FEE......EEFF.......',
  '...FEE......EEFF.......',
  '...FEE......EEFF.......',
  '...FFF......FFF........',
  '...FFb......bFF........',
  '...FFFmmmmmmFFF........',
  '....FFFFFFFFF..........',
  '.....NNNNNNN...........',
  '....AAAAAAAAAA..........',
  '..AAA....DD....AAA......',
  '..AAA..DDDD..AAA.......',
  '..AAA..DDDD..AAA.......',
  '..AAA..DDDD..AAA.......',
  '..AAA..DD....AAA.......',
  '..AAAAA......AAAAA.....',
  '...DDDDDDDDDDDDD.......',
  '..DDDDDDDDDDDDDDD......',
  '..DD..DDDDDD..DD......',
  '...L..L....L..L........',
  '..LLLL....LLLLL........',
  '..L..L....L..L.........',
  '..L..L....L..L.........',
  '.LLL..L..LLL..L........',
  'KKKK..L.KKKK..L........',
  'KKKK..L.KKKK..L........',
  'K..K..L.K..K..L........',
  'OOOO..L.OOOO..L........',
  '.OOOO..L.OOOO..L.......',
  '..OO....L..OO..........',
]

function drawBody(c, t) {
  const outfit = OUTFITS[props.outfit.id] || OUTFITS.casual
  const map = getMap(props.outfit.id)

  const bobY = props.action === 'jump' ? Math.abs(Math.sin(t * 0.012)) * -12
    : props.action === 'cheer' ? Math.sin(t * 0.008) * -3 + 1
    : 0
  const sway = props.action === 'dance' ? Math.sin(t * 0.006) * 0.3
    : props.action === 'wave' ? Math.sin(t * 0.003) * 0.5
    : 0
  const idle = Math.sin(t * 0.002) * 0.6
  const hipSway = props.action === 'dance' ? Math.sin(t * 0.006 + 1) * 0.15
    : Math.sin(t * 0.002 + 1) * 0.1

  const ox = sway * P + P * 0.5
  const oy = (bobY + idle)

  c.save()
  c.clearRect(0, 0, W, H)
  c.translate(0, oy)

  const palette = {
    '.': null,
    'H': outfit.hair, 'h': outfit.hairLight,
    'F': outfit.skin, 'f': outfit.skinShadow,
    'E': '#FFFFFF', 'e': outfit.eye,
    'm': C.mouth, 'b': C.blush,
    'N': outfit.skin,
    'A': outfit.skin, 'a': outfit.skinShadow,
    'T': outfit.top, 't': outfit.topLight,
    'O': outfit.top, 'o': outfit.topLight,
    'S': outfit.skirt, 's': outfit.skirtLight,
    'D': outfit.skirt,
    'B': outfit.top, 'V': outfit.skirt,
    'L': outfit.skin, 'l': outfit.skinShadow,
    'K': outfit.sock, 'k': C.sockBand,
    'Q': outfit.shoe, 'q': C.shoeDark,
    'R': C.blush,
    'w': '#FFFFFF',
  }

  const nudge = (row) => Math.round((row - CH / 2) * hipSway)

  for (let y = 0; y < map.length; y++) {
    const row = map[y]
    const nx = nudge(y)
    for (let x = 0; x < row.length; x++) {
      const ch = row[x]
      const color = palette[ch]
      if (!color) continue
      if (ch === 'w' && props.outfit.id !== 'princess') continue

      const px = (x + nx) * P
      const py = y * P

      if (ch === 'E') {
        c.fillStyle = '#FFFFFF'
        c.fillRect(px, py, P * 3, P * 2)
        if (!blinkState) {
          c.fillStyle = outfit.eye
          c.fillRect(px + 1, py + 1, P, P)
          c.fillRect(px + P * 2 - 1, py + 1, P - 1, P - 1)
          c.fillStyle = '#FFFFFF'
          c.fillRect(px + 1, py, 1, 1)
          c.fillRect(px + P * 2, py, 1, 1)
        }
        continue
      }
      if (ch === 'e' && blinkState) continue

      c.fillStyle = color
      c.fillRect(px, py, P, P)

      if (ch === 'b') {
        c.globalAlpha = 0.4
        c.fillRect(px, py, P, P)
        c.globalAlpha = 1
      }
    }
  }

  c.restore()
}

function render(timestamp) {
  if (!startTime) startTime = timestamp
  const t = timestamp - startTime

  blinkCounter++
  if (blinkCounter > 120 + Math.random() * 80) {
    blinkState = true
    blinkCounter = 0
    setTimeout(() => { blinkState = false }, 100)
  }

  drawBody(ctx, t)
  animFrame = requestAnimationFrame(render)
}

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
