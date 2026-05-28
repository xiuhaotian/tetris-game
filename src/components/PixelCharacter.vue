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
let blink = false
let blinkCount = 0

const W = 112
const H = 160

const OUTFITS = {
  casual: {
    hair: '#8B5A3A', hairLight: '#C49060', hairDark: '#5A3020',
    skin: '#FDE8D0', skinShadow: '#E8C9A8',
    eye: '#5A3A6A',
    top: '#4A88D0', topLight: '#78A8E8', skirt: '#3A3A6A',
    sock: '#FFFFFF', shoe: '#4A3020',
  },
  school: {
    hair: '#1A1A2E', hairLight: '#3A3A5A', hairDark: '#0A0A1A',
    skin: '#FDE8D0', skinShadow: '#E8C9A8',
    eye: '#2A1A4A',
    top: '#F0F0F0', topLight: '#FFFFFF', skirt: '#1E3A6A',
    sock: '#FFFFFF', shoe: '#1A1A1A',
  },
  party: {
    hair: '#FF6AA8', hairLight: '#FF90C0', hairDark: '#CC4080',
    skin: '#FDE8D0', skinShadow: '#E8C9A8',
    eye: '#7A2060',
    top: '#FF5AA0', topLight: '#FF80B8', skirt: '#6A3AAA',
    sock: '#1A0A1A', shoe: '#CC3070',
  },
  bikini: {
    hair: '#C48850', hairLight: '#DTA878', hairDark: '#906030',
    skin: '#FDE8D0', skinShadow: '#E8C9A8',
    eye: '#3A6A8A',
    top: '#FF4058', topLight: '#FF7080', skirt: '#FF4058',
    sock: '#FFFFFF', shoe: '#FFD700',
  },
  princess: {
    hair: '#E8C040', hairLight: '#FFE070', hairDark: '#C09820',
    skin: '#FDE8D0', skinShadow: '#E8C9A8',
    eye: '#4A2A7A',
    top: '#FFD700', topLight: '#FFE840', skirt: '#FF8A00',
    sock: '#FFF8E0', shoe: '#FFD700',
  },
}

function roundRect(c, x, y, w, h, r) {
  c.beginPath()
  c.moveTo(x + r, y)
  c.lineTo(x + w - r, y)
  c.quadraticCurveTo(x + w, y, x + w, y + r)
  c.lineTo(x + w, y + h - r)
  c.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  c.lineTo(x + r, y + h)
  c.quadraticCurveTo(x, y + h, x, y + h - r)
  c.lineTo(x, y + r)
  c.quadraticCurveTo(x, y, x + r, y)
  c.closePath()
}

function draw(c, t) {
  const o = OUTFITS[props.outfit.id] || OUTFITS.casual

  const bobY = props.action === 'jump' ? Math.abs(Math.sin(t * 0.012)) * -14
    : props.action === 'cheer' ? Math.sin(t * 0.008) * -4 + 1
    : Math.sin(t * 0.002) * 0.8
  const tilt = props.action === 'dance' ? Math.sin(t * 0.006) * 2
    : props.action === 'wave' ? Math.sin(t * 0.003) * 4
    : 0
  const bodySway = props.action === 'dance' ? Math.sin(t * 0.007) * 2
    : Math.sin(t * 0.0015 + 1) * 0.8

  c.save()
  c.clearRect(0, 0, W, H)
  c.translate(W / 2, H / 2 + 10 + bobY)
  c.rotate(tilt * Math.PI / 180)

  // ── Hair (back) ──
  c.fillStyle = o.hairDark
  roundRect(c, -18, -48, 36, 48, 10)
  c.fill()
  // hair sides
  c.fillRect(-22, -38, 8, 36)
  c.fillRect(14, -38, 8, 36)
  // hair bottom wisps
  c.beginPath()
  c.ellipse(-18, -8, 6, 10, -0.2, 0, Math.PI * 2)
  c.fill()
  c.beginPath()
  c.ellipse(18, -8, 6, 10, 0.2, 0, Math.PI * 2)
  c.fill()

  // ── Body / Clothes (behind arms) ──
  if (props.outfit.id === 'bikini') {
    // bikini bottom
    c.fillStyle = o.skirt
    roundRect(c, -10, 18, 20, 12, 4)
    c.fill()
    // bare midriff
    c.fillStyle = o.skin
    roundRect(c, -9, 6, 18, 14, 3)
    c.fill()
  } else if (props.outfit.id === 'princess') {
    c.fillStyle = o.skirt
    roundRect(c, -18, 20, 36, 28, 6)
    c.fill()
    c.fillStyle = o.top
    roundRect(c, -14, 4, 28, 22, 5)
    c.fill()
  } else if (props.outfit.id === 'party') {
    c.fillStyle = o.skirt
    roundRect(c, -16, 18, 32, 30, 8)
    c.fill()
    c.fillStyle = o.top
    roundRect(c, -12, 4, 24, 20, 5)
    c.fill()
  } else {
    // top
    c.fillStyle = o.top
    roundRect(c, -12, 4, 24, 20, 5)
    c.fill()
    c.fillStyle = o.topLight
    roundRect(c, -10, 6, 20, 6, 3)
    c.fill()
    // skirt
    c.fillStyle = o.skirt
    roundRect(c, -14, 22, 28, 16, 3)
    c.fill()
  }

  // ── Legs ──
  c.fillStyle = o.skin
  c.fillRect(-9, 36, 7, 18)
  c.fillRect(2, 36, 7, 18)
  // socks
  c.fillStyle = o.sock
  c.fillRect(-9, 48, 7, 8)
  c.fillRect(2, 48, 7, 8)
  // shoes
  c.fillStyle = o.shoe
  roundRect(c, -10, 55, 9, 5, 2)
  c.fill()
  roundRect(c, 1, 55, 9, 5, 2)
  c.fill()

  // ── Arms ──
  const armSwing = bodySway * 0.5
  c.fillStyle = o.skin
  c.save()
  c.translate(-16, 8)
  c.rotate(-0.4 + Math.sin(t * 0.001 + armSwing) * 0.1)
  roundRect(c, -3, 0, 6, 18, 3)
  c.fill()
  c.restore()
  c.save()
  c.translate(16, 8)
  c.rotate(0.4 - Math.sin(t * 0.001 + armSwing) * 0.1)
  roundRect(c, -3, 0, 6, 18, 3)
  c.fill()
  c.restore()

  // ── Neck ──
  c.fillStyle = o.skinShadow
  c.fillRect(-4, -6, 8, 10)

  // ── Head ──
  c.fillStyle = o.skin
  c.beginPath()
  c.ellipse(0, -20, 15, 17, 0, 0, Math.PI * 2)
  c.fill()

  // ── Hair (front / bangs) ──
  c.fillStyle = o.hair
  // main hair top
  c.beginPath()
  c.ellipse(0, -30, 17, 14, 0, 0, Math.PI * 2)
  c.fill()
  // bangs
  c.beginPath()
  c.ellipse(-6, -26, 8, 7, -0.3, -Math.PI * 0.5, Math.PI * 0.5)
  c.fill()
  c.beginPath()
  c.ellipse(6, -26, 8, 7, 0.3, -Math.PI * 0.5, Math.PI * 0.5)
  c.fill()
  // hair sides overlapping face
  c.fillRect(-17, -26, 4, 14)
  c.fillRect(13, -26, 4, 14)
  // hair highlight
  c.fillStyle = o.hairLight
  roundRect(c, -6, -36, 12, 4, 2)
  c.fill()

  // ── Eyes ──
  const eyeY = -22
  // eye whites
  c.fillStyle = '#FFFFFF'
  c.beginPath()
  c.ellipse(-6, eyeY, 5, 6, 0, 0, Math.PI * 2)
  c.fill()
  c.beginPath()
  c.ellipse(6, eyeY, 5, 6, 0, 0, Math.PI * 2)
  c.fill()

  if (!blink) {
    // iris
    c.fillStyle = o.eye
    c.beginPath()
    c.ellipse(-6, eyeY + 1, 3.5, 4, 0, 0, Math.PI * 2)
    c.fill()
    c.beginPath()
    c.ellipse(6, eyeY + 1, 3.5, 4, 0, 0, Math.PI * 2)
    c.fill()
    // pupil
    c.fillStyle = '#0A0A1A'
    c.beginPath()
    c.ellipse(-6, eyeY + 1, 2, 2.5, 0, 0, Math.PI * 2)
    c.fill()
    c.beginPath()
    c.ellipse(6, eyeY + 1, 2, 2.5, 0, 0, Math.PI * 2)
    c.fill()
    // eye highlights
    c.fillStyle = '#FFFFFF'
    c.beginPath()
    c.arc(-4, eyeY - 1, 1.5, 0, Math.PI * 2)
    c.fill()
    c.beginPath()
    c.arc(8, eyeY - 1, 1.5, 0, Math.PI * 2)
    c.fill()
    // small highlight
    c.beginPath()
    c.arc(-8, eyeY + 3, 0.8, 0, Math.PI * 2)
    c.fill()
    c.beginPath()
    c.arc(4, eyeY + 3, 0.8, 0, Math.PI * 2)
    c.fill()
    // upper eyelashes
    c.strokeStyle = '#1A1A1A'
    c.lineWidth = 1.5
    c.beginPath()
    c.arc(-6, eyeY - 5.5, 4.5, Math.PI * 1.1, Math.PI * 1.9)
    c.stroke()
    c.beginPath()
    c.arc(6, eyeY - 5.5, 4.5, Math.PI * 1.1, Math.PI * 1.9)
    c.stroke()
  }

  // ── Blush ──
  c.fillStyle = 'rgba(255,150,160,0.45)'
  c.beginPath()
  c.ellipse(-9, -15, 3.5, 2, 0, 0, Math.PI * 2)
  c.fill()
  c.beginPath()
  c.ellipse(9, -15, 3.5, 2, 0, 0, Math.PI * 2)
  c.fill()

  // ── Mouth ──
  c.fillStyle = '#D44050'
  c.beginPath()
  c.arc(0, -12, 2.5, 0.1, Math.PI - 0.1)
  c.fill()

  // ── Eyebrows ──
  c.strokeStyle = o.hairDark
  c.lineWidth = 1.5
  c.beginPath()
  c.moveTo(-10, -28)
  c.quadraticCurveTo(-8, -30, -5, -29)
  c.stroke()
  c.beginPath()
  c.moveTo(10, -28)
  c.quadraticCurveTo(8, -30, 5, -29)
  c.stroke()

  // ── Princess Crown ──
  if (props.outfit.id === 'princess') {
    c.fillStyle = '#FFD700'
    c.strokeStyle = '#D4A000'
    c.lineWidth = 1
    // crown base
    roundRect(c, -10, -44, 20, 7, 2)
    c.fill()
    // crown points
    c.beginPath()
    c.moveTo(-9, -44)
    c.lineTo(-7, -52)
    c.lineTo(-3, -44)
    c.lineTo(0, -54)
    c.lineTo(3, -44)
    c.lineTo(7, -52)
    c.lineTo(9, -44)
    c.closePath()
    c.fill()
    // gems
    c.fillStyle = '#FF4070'
    c.beginPath()
    c.arc(-5, -42, 1.5, 0, Math.PI * 2)
    c.fill()
    c.beginPath()
    c.arc(0, -42, 1.5, 0, Math.PI * 2)
    c.fill()
    c.beginPath()
    c.arc(5, -42, 1.5, 0, Math.PI * 2)
    c.fill()
  }

  // ── School ribbon ──
  if (props.outfit.id === 'school') {
    c.fillStyle = '#FF4058'
    c.beginPath()
    c.moveTo(-3, -4)
    c.lineTo(0, 2)
    c.lineTo(3, -4)
    c.closePath()
    c.fill()
    c.fillRect(-1, -4, 2, 8)
  }

  // ── Bikini top ──
  if (props.outfit.id === 'bikini') {
    c.fillStyle = o.top
    // left cup
    c.beginPath()
    c.ellipse(-6, 6, 7, 6, -0.2, 0, Math.PI * 2)
    c.fill()
    // right cup
    c.beginPath()
    c.ellipse(6, 6, 7, 6, 0.2, 0, Math.PI * 2)
    c.fill()
    // highlight
    c.fillStyle = o.topLight
    c.beginPath()
    c.ellipse(-5, 4, 3, 2.5, -0.2, 0, Math.PI * 2)
    c.fill()
    c.beginPath()
    c.ellipse(7, 4, 3, 2.5, 0.2, 0, Math.PI * 2)
    c.fill()
  } else {
    // normal top bust line
    c.fillStyle = o.topLight
    roundRect(c, -8, 8, 16, 4, 2)
    c.fill()
  }

  c.restore()
}

function render(timestamp) {
  if (!startTime) startTime = timestamp
  const t = timestamp - startTime

  blinkCount++
  if (blinkCount > 140 + Math.random() * 60) {
    blink = true
    blinkCount = 0
    setTimeout(() => { blink = false }, 100)
  }

  draw(ctx, t)
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
  <canvas ref="canvasRef" :width="W" :height="H" class="char-canvas" />
</template>

<style scoped>
.char-canvas {
  display: block;
}
</style>
