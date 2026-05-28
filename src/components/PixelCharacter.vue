<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  stage: { type: Number, default: 0 },
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

const SKIN = '#FDE8D0'
const SKIN_S = '#E8C9A8'
const SKIN_D = '#D4B090'

const stages = computed(() => {
  const s = props.stage
  return {
    blazer: s < 1,
    tie: s < 1,
    shirtClosed: s < 2,
    skirtLong: s < 1,
    skirtMid: s >= 1 && s < 3,
    skirtShort: s >= 3,
    thighHigh: s >= 2,
    topOff: s >= 3,
    braOnly: s >= 4,
    towel: s >= 5,
  }
})

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
  const st = stages.value

  const bobY = props.action === 'jump' ? Math.abs(Math.sin(t * 0.012)) * -14
    : props.action === 'cheer' ? Math.sin(t * 0.008) * -3 + 1
    : Math.sin(t * 0.002) * 0.5
  const tilt = props.action === 'dance' ? Math.sin(t * 0.006) * 3
    : props.action === 'wave' ? Math.sin(t * 0.003) * 5
    : 0
  const legShift = props.action === 'dance' ? Math.sin(t * 0.008) * 2
    : 0

  c.save()
  c.clearRect(0, 0, W, H)
  c.translate(W / 2, H / 2 + 8 + bobY)
  c.rotate(tilt * Math.PI / 180)

  // ── Back Hair ──
  c.fillStyle = '#1A1A2E'
  // long flowing hair reaching shoulders
  roundRect(c, -20, -48, 40, 56, 10)
  c.fill()
  // hair side strands
  c.beginPath()
  c.ellipse(-22, -30, 7, 30, -0.1, 0, Math.PI * 2)
  c.fill()
  c.beginPath()
  c.ellipse(22, -30, 7, 30, 0.1, 0, Math.PI * 2)
  c.fill()
  // long back strands (long hair)
  c.fillRect(-22, -20, 8, 44)
  c.fillRect(14, -20, 8, 44)

  // ── Legs (behind skirt) ──
  c.fillStyle = SKIN
  c.fillRect(-8 + legShift, 40, 6.5, 18)
  c.fillRect(1.5 + legShift, 40, 6.5, 18)

  if (st.thighHigh) {
    // thigh-high stockings
    c.fillStyle = '#1A1A2E'
    c.fillRect(-8 + legShift, 49, 6.5, 9)
    c.fillRect(1.5 + legShift, 49, 6.5, 9)
    // stocking top band
    c.fillStyle = '#FF88AA'
    c.fillRect(-8 + legShift, 49, 6.5, 2)
    c.fillRect(1.5 + legShift, 49, 6.5, 2)
    // bare thigh above stockings
    c.fillStyle = SKIN
    c.fillRect(-8 + legShift, 40, 6.5, 9)
    c.fillRect(1.5 + legShift, 40, 6.5, 9)
  } else {
    // knee socks
    c.fillStyle = '#FFFFFF'
    c.fillRect(-8 + legShift, 48, 6.5, 7)
    c.fillRect(1.5 + legShift, 48, 6.5, 7)
  }

  // shoes
  c.fillStyle = '#1A1A1A'
  roundRect(c, -9 + legShift, 56, 8, 5, 2)
  c.fill()
  roundRect(c, 1 + legShift, 56, 8, 5, 2)
  c.fill()

  // ── Body / Torso ──
  // Bare skin for torso (covered by clothes)
  c.fillStyle = SKIN
  // upper torso (midriff area visible when top is off)
  if (st.towel) {
    // towel wrap
    c.fillStyle = '#FFFFFF'
    roundRect(c, -14, 8, 28, 24, 4)
    c.fill()
    // towel folds
    c.strokeStyle = 'rgba(200,200,200,0.4)'
    c.lineWidth = 0.5
    for (let i = 0; i < 3; i++) {
      c.beginPath()
      c.moveTo(-12, 12 + i * 6)
      c.lineTo(12, 12 + i * 6)
      c.stroke()
    }
    // bare shoulders
    c.fillStyle = SKIN
    roundRect(c, -18, 6, 6, 6, 3)
    c.fill()
    roundRect(c, 12, 6, 6, 6, 3)
    c.fill()
  } else if (st.braOnly) {
    // lingerie set
    c.fillStyle = SKIN
    roundRect(c, -11, 4, 22, 22, 3)
    c.fill()
    // bra
    c.fillStyle = '#1A1A2E'
    c.beginPath()
    c.ellipse(-6, 8, 8, 7, -0.2, 0, Math.PI * 2)
    c.fill()
    c.beginPath()
    c.ellipse(6, 8, 8, 7, 0.2, 0, Math.PI * 2)
    c.fill()
    // bra center
    c.fillRect(-2, 6, 4, 6)
    // bra lace detail
    c.fillStyle = '#FF88AA'
    c.beginPath()
    c.ellipse(-6, 8, 4, 3, -0.2, 0, Math.PI * 2)
    c.fill()
    c.beginPath()
    c.ellipse(6, 8, 4, 3, 0.2, 0, Math.PI * 2)
    c.fill()
    // panties
    c.fillStyle = '#1A1A2E'
    roundRect(c, -8, 18, 16, 10, 4)
    c.fill()
    c.fillStyle = '#FF88AA'
    roundRect(c, -6, 19, 12, 4, 2)
    c.fill()
    // bare midriff
    c.fillStyle = SKIN
    c.fillRect(-10, 12, 20, 7)
  } else if (st.topOff) {
    // corset/cami top
    c.fillStyle = SKIN
    roundRect(c, -11, 4, 22, 22, 3)
    c.fill()
    // corset top
    c.fillStyle = '#1A1A2E'
    roundRect(c, -10, 4, 20, 16, 4)
    c.fill()
    // lace trim
    c.fillStyle = '#FF88AA'
    c.fillRect(-10, 17, 20, 3)
    // cleavage
    c.fillStyle = SKIN_S
    c.beginPath()
    c.ellipse(-4, 9, 4, 5, -0.3, 0, Math.PI * 2)
    c.fill()
    c.beginPath()
    c.ellipse(4, 9, 4, 5, 0.3, 0, Math.PI * 2)
    c.fill()
  } else {
    // shirt body
    c.fillStyle = '#FFFFFF'
    roundRect(c, -12, 4, 24, 24, 4)
    c.fill()
    if (st.shirtClosed) {
      // shirt buttons
      c.fillStyle = '#D4D4D4'
      c.beginPath(); c.arc(0, 8, 1, 0, Math.PI * 2); c.fill()
      c.beginPath(); c.arc(0, 12, 1, 0, Math.PI * 2); c.fill()
      c.beginPath(); c.arc(0, 16, 1, 0, Math.PI * 2); c.fill()
      c.beginPath(); c.arc(0, 20, 1, 0, Math.PI * 2); c.fill()
    } else {
      // shirt partially open — cleavage visible
      c.fillStyle = SKIN
      roundRect(c, -4, 6, 8, 14, 3)
      c.fill()
      // shadow line
      c.fillStyle = SKIN_S
      c.beginPath()
      c.ellipse(-2, 10, 3, 4, -0.2, 0, Math.PI * 2)
      c.fill()
      c.beginPath()
      c.ellipse(2, 10, 3, 4, 0.2, 0, Math.PI * 2)
      c.fill()
    }
  }

  // ── Arms ──
  const armSwing = Math.sin(t * 0.0015) * 0.5
  c.fillStyle = SKIN
  // left arm
  c.save()
  c.translate(-16, 8)
  c.rotate(-0.3 + armSwing)
  roundRect(c, -3, 0, 6, 22, 3)
  c.fill()
  if (!st.blazer) {
    // rolled sleeve
    c.fillStyle = '#FFFFFF'
    roundRect(c, -3, 8, 6, 6, 2)
    c.fill()
    c.fillStyle = '#E8E8E8'
    c.fillRect(-3, 8, 6, 2)
  }
  c.restore()
  // right arm
  c.save()
  c.translate(16, 8)
  c.rotate(0.3 - armSwing)
  roundRect(c, -3, 0, 6, 22, 3)
  c.fill()
  if (!st.blazer) {
    c.fillStyle = '#FFFFFF'
    roundRect(c, -3, 8, 6, 6, 2)
    c.fill()
    c.fillStyle = '#E8E8E8'
    c.fillRect(-3, 8, 6, 2)
  }
  c.restore()

  // ── Blazer ──
  if (st.blazer) {
    c.fillStyle = '#1E3A6A'
    // blazer body
    roundRect(c, -14, 3, 28, 28, 5)
    c.fill()
    // collar
    c.fillStyle = '#2A5090'
    c.beginPath()
    c.moveTo(-6, 4); c.lineTo(-2, 12); c.lineTo(-6, 14); c.closePath()
    c.fill()
    c.beginPath()
    c.moveTo(6, 4); c.lineTo(2, 12); c.lineTo(6, 14); c.closePath()
    c.fill()
    // lapel edge
    c.strokeStyle = '#153060'
    c.lineWidth = 0.5
    c.beginPath()
    c.moveTo(-5, 4); c.lineTo(-3, 14); c.lineTo(-10, 18)
    c.stroke()
    c.beginPath()
    c.moveTo(5, 4); c.lineTo(3, 14); c.lineTo(10, 18)
    c.stroke()
  }

  // ── Tie ──
  if (st.tie) {
    c.fillStyle = '#CC2233'
    roundRect(c, -2, 6, 4, 20, 1)
    c.fill()
    // tie knot
    c.fillStyle = '#AA1A28'
    roundRect(c, -2.5, 5, 5, 4, 1.5)
    c.fill()
  } else if (!st.topOff && !st.braOnly && !st.towel) {
    // loose hanging tie
    c.fillStyle = '#CC2233'
    roundRect(c, -2, 6, 4, 22, 1)
    c.fill()
    c.fillStyle = '#AA1A28'
    roundRect(c, -2.5, 5, 5, 4, 1.5)
    c.fill()
  }

  // ── Skirt ──
  if (st.towel) {
    // towel covers lower body
    c.fillStyle = '#FFFFFF'
    roundRect(c, -16, 22, 32, 20, 4)
    c.fill()
    c.strokeStyle = 'rgba(200,200,200,0.4)'
    c.lineWidth = 0.5
    for (let i = 0; i < 3; i++) {
      c.beginPath()
      c.moveTo(-14, 24 + i * 5)
      c.lineTo(14, 24 + i * 5)
      c.stroke()
    }
  } else if (st.braOnly) {
    // just panties (already drawn above)
  } else if (st.skirtShort) {
    // mini skirt
    c.fillStyle = '#1E3A6A'
    roundRect(c, -14, 22, 28, 10, 3)
    c.fill()
    // plaid pattern
    c.strokeStyle = '#2A5090'
    c.lineWidth = 0.5
    c.beginPath(); c.moveTo(-8, 22); c.lineTo(-8, 32); c.stroke()
    c.beginPath(); c.moveTo(0, 22); c.lineTo(0, 32); c.stroke()
    c.beginPath(); c.moveTo(8, 22); c.lineTo(8, 32); c.stroke()
    // visible thigh
    c.fillStyle = SKIN
    c.fillRect(-8, 32, 16, 8 + legShift)
  } else if (st.skirtMid) {
    // mid thigh skirt
    c.fillStyle = '#1E3A6A'
    roundRect(c, -14, 22, 28, 16, 3)
    c.fill()
    c.strokeStyle = '#2A5090'
    c.lineWidth = 0.5
    c.beginPath(); c.moveTo(-8, 22); c.lineTo(-8, 38); c.stroke()
    c.beginPath(); c.moveTo(0, 22); c.lineTo(0, 38); c.stroke()
    c.beginPath(); c.moveTo(8, 22); c.lineTo(8, 38); c.stroke()
  } else {
    // long pleated skirt (full JK)
    c.fillStyle = '#1E3A6A'
    roundRect(c, -14, 22, 28, 20, 3)
    c.fill()
    c.strokeStyle = '#2A5090'
    c.lineWidth = 0.5
    c.beginPath(); c.moveTo(-8, 22); c.lineTo(-8, 42); c.stroke()
    c.beginPath(); c.moveTo(0, 22); c.lineTo(0, 42); c.stroke()
    c.beginPath(); c.moveTo(8, 22); c.lineTo(8, 42); c.stroke()
  }

  // ── Neck ──
  c.fillStyle = SKIN_S
  c.fillRect(-4, -6, 8, 10)

  // ── Collar ──
  if (st.shirtClosed) {
    c.fillStyle = '#FFFFFF'
    c.beginPath()
    c.moveTo(-3, -5); c.lineTo(0, -2); c.lineTo(3, -5); c.closePath()
    c.fill()
  }

  // ── Head ──
  c.fillStyle = SKIN
  c.beginPath()
  c.ellipse(0, -22, 15, 18, 0, 0, Math.PI * 2)
  c.fill()

  // ── Hair (front / bangs) ──
  c.fillStyle = '#1A1A2E'
  // main hair top
  c.beginPath()
  c.ellipse(0, -33, 17, 15, 0, 0, Math.PI * 2)
  c.fill()
  // side-swept bangs
  c.beginPath()
  c.ellipse(-8, -27, 10, 8, -0.4, 0, Math.PI * 2)
  c.fill()
  c.beginPath()
  c.ellipse(6, -26, 9, 7, 0.3, 0, Math.PI * 2)
  c.fill()
  // hair sides
  c.fillRect(-18, -28, 5, 18)
  c.fillRect(13, -28, 5, 18)
  // hair shine
  c.fillStyle = '#2A2A4E'
  roundRect(c, -5, -38, 10, 4, 2)
  c.fill()
  c.fillRect(-4, -34, 1, 12)
  c.fillRect(3, -34, 1, 10)

  // ── Eyes (big anime, sultry) ──
  const eyeY = -24
  // eye whites
  c.fillStyle = '#FFFFFF'
  c.beginPath()
  c.ellipse(-6, eyeY, 6, 7, 0, 0, Math.PI * 2)
  c.fill()
  c.beginPath()
  c.ellipse(6, eyeY, 6, 7, 0, 0, Math.PI * 2)
  c.fill()

  if (!blink) {
    // iris (large, seductive)
    c.fillStyle = '#3A2A6A'
    c.beginPath()
    c.ellipse(-6, eyeY + 1, 4, 5, 0, 0, Math.PI * 2)
    c.fill()
    c.beginPath()
    c.ellipse(6, eyeY + 1, 4, 5, 0, 0, Math.PI * 2)
    c.fill()
    // pupil
    c.fillStyle = '#0A0A1A'
    c.beginPath()
    c.ellipse(-6, eyeY + 1, 2.5, 3.5, 0, 0, Math.PI * 2)
    c.fill()
    c.beginPath()
    c.ellipse(6, eyeY + 1, 2.5, 3.5, 0, 0, Math.PI * 2)
    c.fill()
    // eye highlights
    c.fillStyle = '#FFFFFF'
    c.beginPath()
    c.arc(-4, eyeY - 2, 2, 0, Math.PI * 2)
    c.fill()
    c.beginPath()
    c.arc(8, eyeY - 2, 2, 0, Math.PI * 2)
    c.fill()
    // small highlight
    c.beginPath()
    c.arc(-8, eyeY + 4, 1, 0, Math.PI * 2)
    c.fill()
    c.beginPath()
    c.arc(4, eyeY + 4, 1, 0, Math.PI * 2)
    c.fill()
    // long upper eyelashes (seductive look)
    c.strokeStyle = '#0A0A1A'
    c.lineWidth = 1.8
    c.beginPath()
    c.arc(-6, eyeY - 6.5, 5.5, Math.PI * 1.05, Math.PI * 1.95)
    c.stroke()
    c.beginPath()
    c.arc(6, eyeY - 6.5, 5.5, Math.PI * 1.05, Math.PI * 1.95)
    c.stroke()
    // lower lashes (subtle)
    c.lineWidth = 0.8
    c.beginPath()
    c.arc(-6, eyeY + 6.5, 5, Math.PI * -0.1, Math.PI * 0.1)
    c.stroke()
    c.beginPath()
    c.arc(6, eyeY + 6.5, 5, Math.PI * -0.1, Math.PI * 0.1)
    c.stroke()
  }

  // ── Eyebrows (arched, seductive) ──
  c.strokeStyle = '#0A0A1A'
  c.lineWidth = 1.2
  c.beginPath()
  c.moveTo(-11, -31)
  c.quadraticCurveTo(-8, -34, -4, -33)
  c.stroke()
  c.beginPath()
  c.moveTo(11, -31)
  c.quadraticCurveTo(8, -34, 4, -33)
  c.stroke()

  // ── Blush (subtle sexy flush) ──
  c.fillStyle = 'rgba(255,140,150,0.5)'
  c.beginPath()
  c.ellipse(-10, -16, 4, 2.5, 0, 0, Math.PI * 2)
  c.fill()
  c.beginPath()
  c.ellipse(10, -16, 4, 2.5, 0, 0, Math.PI * 2)
  c.fill()

  // ── Mouth (full, seductive pout) ──
  c.fillStyle = '#D43850'
  c.beginPath()
  c.moveTo(-4, -11)
  c.quadraticCurveTo(0, -8, 4, -11)
  c.quadraticCurveTo(0, -6, -4, -11)
  c.fill()
  // lower lip highlight
  c.fillStyle = '#E06070'
  c.beginPath()
  c.arc(0, -10, 1.2, 0, Math.PI)
  c.fill()

  // ── Ribbon ──
  if (st.shirtClosed || props.stage < 2) {
    c.fillStyle = '#CC2233'
    c.beginPath()
    c.moveTo(-4, -4); c.lineTo(0, 2); c.lineTo(4, -4); c.closePath()
    c.fill()
    c.fillRect(-1, -4, 2, 10)
  }

  // ── Stage label ──
  c.fillStyle = 'rgba(255,255,255,0.25)'
  c.font = '6px monospace'
  c.textAlign = 'center'
  c.textBaseline = 'bottom'
  let stageLabel = 'JK制服'
  if (props.stage >= 5) stageLabel = '♥♥♥'
  else if (props.stage >= 4) stageLabel = '♥♥'
  else if (props.stage >= 3) stageLabel = '♥'
  else if (props.stage >= 2) stageLabel = '♥'
  c.fillText(stageLabel, 0, H / 2 - H / 2 - 2)

  c.restore()
}

function render(timestamp) {
  if (!startTime) startTime = timestamp
  const t = timestamp - startTime

  blinkCount++
  if (blinkCount > 120 + Math.random() * 80) {
    blink = true
    blinkCount = 0
    setTimeout(() => { blink = false }, 120)
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
