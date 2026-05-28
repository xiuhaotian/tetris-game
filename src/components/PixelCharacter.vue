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
const SKIN_D = '#D0B088'

function pos(x, y) { return { x, y } }

function ellipse(cx, cy, rx, ry, r = 0) {
  ctx.beginPath()
  ctx.ellipse(cx, cy, rx, ry, r, 0, Math.PI * 2)
}

function fillEllipse(cx, cy, rx, ry, color, r = 0) {
  ctx.fillStyle = color
  ellipse(cx, cy, rx, ry, r)
  ctx.fill()
}

function fillRoundRect(x, y, w, h, rad, color) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(x + rad, y)
  ctx.lineTo(x + w - rad, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + rad)
  ctx.lineTo(x + w, y + h - rad)
  ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h)
  ctx.lineTo(x + rad, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - rad)
  ctx.lineTo(x, y + rad)
  ctx.quadraticCurveTo(x, y, x + rad, y)
  ctx.closePath()
  ctx.fill()
}

function grad(cx, cy, r, c1, c2) {
  const g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r)
  g.addColorStop(0, c1)
  g.addColorStop(1, c2)
  return g
}

function linGrad(x0, y0, x1, y1, stops) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1)
  stops.forEach(s => g.addColorStop(s[0], s[1]))
  return g
}

function draw(c, t) {
  const s = props.stage

  const bobY = props.action === 'jump' ? Math.abs(Math.sin(t * 0.012)) * -14
    : props.action === 'cheer' ? Math.sin(t * 0.008) * -3 + 1
    : Math.sin(t * 0.002) * 0.5
  const tilt = props.action === 'dance' ? Math.sin(t * 0.006) * 3
    : props.action === 'wave' ? Math.sin(t * 0.003) * 5
    : 0
  const legShift = props.action === 'dance' ? Math.sin(t * 0.008) * 1.5
    : 0

  c.save()
  c.clearRect(0, 0, W, H)
  c.translate(W / 2, H / 2 + 10 + bobY)
  c.rotate(tilt * Math.PI / 180)

  const hairC = '#1A1A2E'
  const hairL = '#3A3A5A'
  const hairD = '#0A0A1A'

  // ════════════════════════════════════════
  // BACK LAYERS
  // ════════════════════════════════════════

  // Back hair — long flowing
  c.fillStyle = hairD
  fillRoundRect(-22, -52, 44, 68, 10, hairD)
  // long back strands
  c.fillStyle = hairC
  ellipse(-20, -10, 7, 28, -0.1)
  c.fill()
  ellipse(20, -10, 7, 28, 0.1)
  c.fill()
  // flowing ends
  ellipse(-18, 12, 6, 12, -0.2)
  c.fill()
  ellipse(18, 12, 6, 12, 0.2)
  c.fill()

  // Back arms (behind body — only lower arms visible)
  c.fillStyle = SKIN
  c.save()
  c.translate(-20, -4)
  c.rotate(-0.2 + Math.sin(t * 0.0015) * 0.1)
  fillRoundRect(-3, 0, 6, 28, 3, SKIN)
  c.restore()
  c.save()
  c.translate(20, -4)
  c.rotate(0.2 - Math.sin(t * 0.0015) * 0.1)
  fillRoundRect(-3, 0, 6, 28, 3, SKIN)
  c.restore()

  // ════════════════════════════════════════
  // LEGS
  // ════════════════════════════════════════

  // Upper legs (thighs)
  c.fillStyle = SKIN
  fillRoundRect(-9 + legShift, 26, 8, 14, 2, SKIN)
  fillRoundRect(1 + legShift, 26, 8, 14, 2, SKIN)
  // inner thigh shadow
  c.fillStyle = SKIN_S
  if (s >= 2) {
    c.fillRect(-1 + legShift, 26, 2, 10)
  }

  // Lower legs
  c.fillStyle = SKIN
  fillRoundRect(-8 + legShift, 40, 7, 16, 2, SKIN)
  fillRoundRect(1 + legShift, 40, 7, 16, 2, SKIN)

  // Socks / Stockings
  if (s >= 4) {
    // no socks (lingerie)
  } else if (s >= 2) {
    // thigh-high stockings
    c.fillStyle = '#1A1A2E'
    fillRoundRect(-8 + legShift, 44, 7, 12, 2, '#1A1A2E')
    fillRoundRect(1 + legShift, 44, 7, 12, 2, '#1A1A2E')
    // lace top
    c.fillStyle = '#E880A0'
    c.fillRect(-8 + legShift, 43, 7, 2)
    c.fillRect(1 + legShift, 43, 7, 2)
  } else if (s >= 1) {
    // knee-high socks with stripe
    c.fillStyle = '#FFFFFF'
    fillRoundRect(-8 + legShift, 46, 7, 8, 1.5, '#FFFFFF')
    fillRoundRect(1 + legShift, 46, 7, 8, 1.5, '#FFFFFF')
    c.fillStyle = '#1E3A6A'
    c.fillRect(-8 + legShift, 49, 7, 1.5)
    c.fillRect(1 + legShift, 49, 7, 1.5)
  } else {
    // knee-high socks
    c.fillStyle = '#FFFFFF'
    fillRoundRect(-8 + legShift, 46, 7, 10, 1.5, '#FFFFFF')
    fillRoundRect(1 + legShift, 46, 7, 10, 1.5, '#FFFFFF')
  }

  // Shoes
  if (s >= 5) {
    // barefoot (towel stage)
  } else {
    c.fillStyle = '#1A1A1A'
    fillRoundRect(-9 + legShift, 56, 8, 5, 2, '#1A1A1A')
    fillRoundRect(1 + legShift, 56, 8, 5, 2, '#1A1A1A')
    // shoe sole
    c.fillStyle = '#2A2A2A'
    c.fillRect(-9 + legShift, 59, 8, 1.5)
    c.fillRect(1 + legShift, 59, 8, 1.5)
  }

  // ════════════════════════════════════════
  // TORSO
  // ════════════════════════════════════════

  // Bare skin base for torso
  c.fillStyle = SKIN
  fillRoundRect(-12, -8, 24, 30, 3, SKIN)

  // Bust shading
  c.fillStyle = SKIN_S
  ellipse(-5, -3, 6, 5, -0.2)
  c.fill()
  ellipse(5, -3, 6, 5, 0.2)
  c.fill()

  // Waist definition
  c.fillStyle = SKIN_D
  c.fillRect(-9, 5, 18, 4)

  // Hip curves
  c.fillStyle = SKIN
  fillRoundRect(-13, 8, 26, 12, 4, SKIN)
  c.fillStyle = SKIN_S
  ellipse(-11, 10, 5, 3, 0)
  c.fill()
  ellipse(11, 10, 5, 3, 0)
  c.fill()

  // ── STAGE-BASED CLOTHING ──

  if (s >= 5) {
    // ═══ TOWEL ═══
    // towel wrap around torso
    c.fillStyle = '#FFF8F0'
    fillRoundRect(-13, -4, 26, 16, 4, '#FFF8F0')
    // towel folds
    c.strokeStyle = 'rgba(200,190,180,0.5)'
    c.lineWidth = 0.8
    for (let i = -1; i <= 2; i++) {
      c.beginPath()
      c.moveTo(-11, i * 4 + 2)
      c.lineTo(11, i * 4 + 2)
      c.stroke()
    }
    // towel wraps around lower body too
    c.fillStyle = '#FFF8F0'
    fillRoundRect(-14, 10, 28, 18, 5, '#FFF8F0')
    c.strokeStyle = 'rgba(200,190,180,0.5)'
    c.lineWidth = 0.8
    for (let i = 0; i < 3; i++) {
      c.beginPath()
      c.moveTo(-12, 12 + i * 5)
      c.lineTo(12, 12 + i * 5)
      c.stroke()
    }
    // bare shoulders
    c.fillStyle = SKIN
    fillRoundRect(-17, -6, 6, 6, 3, SKIN)
    fillRoundRect(11, -6, 6, 6, 3, SKIN)
    // upper chest
    c.fillStyle = SKIN
    ellipse(0, -8, 7, 4, 0)
    c.fill()

  } else if (s >= 4) {
    // ═══ LINGERIE ═══
    // Bra
    c.fillStyle = '#1A1A2E'
    ellipse(-6, -2, 7, 6.5, -0.15)
    c.fill()
    ellipse(6, -2, 7, 6.5, 0.15)
    c.fill()
    // bra lace trim
    c.fillStyle = '#E880A0'
    ctx.strokeStyle = '#E880A0'
    ctx.lineWidth = 0.8
    ellipse(-6, -2, 5.5, 5, -0.15)
    ctx.stroke()
    ellipse(6, -2, 5.5, 5, 0.15)
    ctx.stroke()
    // bra center
    c.fillStyle = '#1A1A2E'
    c.fillRect(-2, -4, 4, 5)
    // bra strap
    c.fillStyle = '#1A1A2E'
    c.fillRect(-17, -8, 5, 3)
    c.fillRect(12, -8, 5, 3)
    // Panties
    c.fillStyle = '#1A1A2E'
    fillRoundRect(-8, 10, 16, 8, 3, '#1A1A2E')
    // panties lace
    c.fillStyle = '#E880A0'
    c.fillRect(-8, 10, 16, 2.5)
    // bare midriff
    c.fillStyle = SKIN
    c.fillRect(-10, 4, 20, 7)
    // belly button
    c.fillStyle = SKIN_D
    c.beginPath()
    c.arc(0, 8, 0.8, 0, Math.PI * 2)
    c.fill()

  } else if (s >= 3) {
    // ═══ CAMISOLE ═══
    // Camisole / tank top
    c.fillStyle = '#FFF8F0'
    fillRoundRect(-11, -7, 22, 20, 4, '#FFF8F0')
    // cami straps
    c.fillStyle = '#FFF8F0'
    c.fillRect(-14, -8, 4, 6)
    c.fillRect(10, -8, 4, 6)
    // cami lace trim
    c.fillStyle = '#E880A0'
    c.fillRect(-11, 10, 22, 3)
    // cleavage showing
    c.fillStyle = SKIN_S
    ellipse(-4, -1, 4, 5, -0.3)
    c.fill()
    ellipse(4, -1, 4, 5, 0.3)
    c.fill()
    // Mini skirt
    c.fillStyle = '#1E3A6A'
    fillRoundRect(-13, 12, 26, 8, 3, '#1E3A6A')
    // skirt plaid
    c.strokeStyle = '#2A5090'
    c.lineWidth = 0.5
    c.beginPath(); c.moveTo(-7, 12); c.lineTo(-7, 20); c.stroke()
    c.beginPath(); c.moveTo(0, 12); c.lineTo(0, 20); c.stroke()
    c.beginPath(); c.moveTo(7, 12); c.lineTo(7, 20); c.stroke()

  } else if (s >= 2) {
    // ═══ SHIRT OPEN ═══
    // Shirt body (white)
    c.fillStyle = '#FFFFFF'
    fillRoundRect(-12, -8, 24, 26, 4, '#FFFFFF')
    // Shirt folded open sides
    c.fillStyle = '#F0F0F0'
    c.beginPath()
    c.moveTo(-11, -7)
    c.lineTo(-5, 0)
    c.lineTo(-11, 5)
    c.closePath()
    c.fill()
    c.beginPath()
    c.moveTo(11, -7)
    c.lineTo(5, 0)
    c.lineTo(11, 5)
    c.closePath()
    c.fill()
    // exposed chest
    c.fillStyle = SKIN
    fillRoundRect(-5, -6, 10, 14, 3, SKIN)
    // cleavage shadow
    c.fillStyle = SKIN_S
    ellipse(-3, -1, 3.5, 4.5, -0.2)
    c.fill()
    ellipse(3, -1, 3.5, 4.5, 0.2)
    c.fill()
    // Loose tie
    c.fillStyle = '#CC2233'
    fillRoundRect(-2, -7, 4, 22, 1.5, '#CC2233')
    c.fillStyle = '#AA1A28'
    fillRoundRect(-2.5, -8, 5, 4, 2, '#AA1A28')
    // Mini skirt
    c.fillStyle = '#1E3A6A'
    fillRoundRect(-13, 12, 26, 12, 3, '#1E3A6A')
    c.strokeStyle = '#2A5090'
    c.lineWidth = 0.5
    c.beginPath(); c.moveTo(-7, 13); c.lineTo(-7, 24); c.stroke()
    c.beginPath(); c.moveTo(0, 13); c.lineTo(0, 24); c.stroke()
    c.beginPath(); c.moveTo(7, 13); c.lineTo(7, 24); c.stroke()

  } else if (s >= 1) {
    // ═══ NO BLAZER ═══
    // White shirt (buttoned)
    c.fillStyle = '#FFFFFF'
    fillRoundRect(-12, -8, 24, 26, 4, '#FFFFFF')
    // shirt collar
    c.fillStyle = '#F0F0F0'
    c.beginPath()
    c.moveTo(-2, -8)
    c.lineTo(-7, -4)
    c.lineTo(-2, -2)
    c.closePath()
    c.fill()
    c.beginPath()
    c.moveTo(2, -8)
    c.lineTo(7, -4)
    c.lineTo(2, -2)
    c.closePath()
    c.fill()
    // buttons
    c.fillStyle = '#D4D4D4'
    for (let y = -2; y <= 12; y += 5) {
      c.beginPath()
      c.arc(0, y, 1, 0, Math.PI * 2)
      c.fill()
    }
    // Tie
    c.fillStyle = '#CC2233'
    fillRoundRect(-2, -7, 4, 20, 1.5, '#CC2233')
    fillRoundRect(-2.5, -8, 5, 4, 2, '#AA1A28')
    // Tie stripe
    c.fillStyle = '#AA1A28'
    c.fillRect(-1, -6, 2, 18)
    // Skirt (mid length)
    c.fillStyle = '#1E3A6A'
    fillRoundRect(-13, 12, 26, 14, 3, '#1E3A6A')
    c.strokeStyle = '#2A5090'
    c.lineWidth = 0.5
    c.beginPath(); c.moveTo(-7, 13); c.lineTo(-7, 26); c.stroke()
    c.beginPath(); c.moveTo(0, 13); c.lineTo(0, 26); c.stroke()
    c.beginPath(); c.moveTo(7, 13); c.lineTo(7, 26); c.stroke()

  } else {
    // ═══ FULL JK UNIFORM ═══
    // Blazer
    c.fillStyle = '#1E3A6A'
    fillRoundRect(-16, -8, 32, 32, 6, '#1E3A6A')
    // Blazer lapels
    c.fillStyle = '#2A5090'
    c.beginPath()
    c.moveTo(-8, -7)
    c.lineTo(-3, 2)
    c.lineTo(-10, 4)
    c.closePath()
    c.fill()
    c.beginPath()
    c.moveTo(8, -7)
    c.lineTo(3, 2)
    c.lineTo(10, 4)
    c.closePath()
    c.fill()
    // Blazer buttons (gold)
    c.fillStyle = '#D4A000'
    c.beginPath()
    c.arc(0, 1, 1.2, 0, Math.PI * 2)
    c.fill()
    c.beginPath()
    c.arc(0, 6, 1.2, 0, Math.PI * 2)
    c.fill()
    // White shirt visible at collar
    c.fillStyle = '#FFFFFF'
    c.fillRect(-6, -8, 12, 4)
    // Tie
    c.fillStyle = '#CC2233'
    fillRoundRect(-2, -7, 4, 20, 1.5, '#CC2233')
    fillRoundRect(-2.5, -8, 5, 4, 2, '#AA1A28')
    c.fillStyle = '#AA1A28'
    c.fillRect(-1, -6, 2, 18)
    // Skirt (long)
    c.fillStyle = '#1E3A6A'
    fillRoundRect(-14, 14, 28, 18, 3, '#1E3A6A')
    c.strokeStyle = '#2A5090'
    c.lineWidth = 0.5
    for (let x = -8; x <= 8; x += 4) {
      c.beginPath()
      c.moveTo(x, 14)
      c.lineTo(x, 32)
      c.stroke()
    }
  }

  // ════════════════════════════════════════
  // FRONT ARMS (over clothes)
  // ════════════════════════════════════════

  c.fillStyle = SKIN
  c.save()
  c.translate(-19, -2)
  c.rotate(-0.15 + Math.sin(t * 0.002) * 0.05)
  fillRoundRect(-2.5, 0, 5, 22, 2.5, SKIN)
  c.restore()
  c.save()
  c.translate(19, -2)
  c.rotate(0.15 - Math.sin(t * 0.002) * 0.05)
  fillRoundRect(-2.5, 0, 5, 22, 2.5, SKIN)
  c.restore()

  // Sleeves (when wearing blazer)
  if (s < 1) {
    c.fillStyle = '#1E3A6A'
    fillRoundRect(-22, -6, 8, 12, 3, '#1E3A6A')
    fillRoundRect(14, -6, 8, 12, 3, '#1E3A6A')
  }

  // ════════════════════════════════════════
  // NECK & COLLARBONE
  // ════════════════════════════════════════

  c.fillStyle = SKIN_S
  c.fillRect(-5, -14, 10, 8)
  // collarbone shadow
  c.strokeStyle = SKIN_D
  c.lineWidth = 0.8
  c.beginPath()
  c.moveTo(-8, -10)
  c.quadraticCurveTo(-4, -8, -5, -7)
  c.stroke()
  c.beginPath()
  c.moveTo(8, -10)
  c.quadraticCurveTo(4, -8, 5, -7)
  c.stroke()

  // Sailor collar (only stage 0)
  if (s < 1) {
    c.fillStyle = '#FFFFFF'
    c.beginPath()
    c.moveTo(-10, -12)
    c.lineTo(0, -6)
    c.lineTo(10, -12)
    c.lineTo(12, -10)
    c.lineTo(0, -3)
    c.lineTo(-12, -10)
    c.closePath()
    c.fill()
    // collar stripes
    c.strokeStyle = '#1E3A6A'
    c.lineWidth = 2
    c.beginPath()
    c.moveTo(-9, -11)
    c.lineTo(0, -6)
    c.lineTo(9, -11)
    c.stroke()
    // ribbon bow
    c.fillStyle = '#CC2233'
    c.beginPath()
    c.moveTo(0, -5)
    c.lineTo(-5, -1)
    c.lineTo(-2, -3)
    c.lineTo(0, -1)
    c.lineTo(2, -3)
    c.lineTo(5, -1)
    c.closePath()
    c.fill()
  }

  // ════════════════════════════════════════
  // HEAD
  // ════════════════════════════════════════

  // Face base
  c.fillStyle = SKIN
  ellipse(0, -30, 16, 19, 0)
  c.fill()

  // Face shape — slightly pointed chin
  c.fillStyle = SKIN
  c.beginPath()
  c.moveTo(-14, -32)
  c.quadraticCurveTo(-16, -22, -12, -14)
  c.quadraticCurveTo(-6, -10, 0, -10)
  c.quadraticCurveTo(6, -10, 12, -14)
  c.quadraticCurveTo(16, -22, 14, -32)
  c.closePath()
  c.fill()

  // Ears
  c.fillStyle = SKIN_S
  ellipse(-15, -26, 3, 4, 0)
  c.fill()
  ellipse(15, -26, 3, 4, 0)
  c.fill()

  // ════════════════════════════════════════
  // EYES - DETALLED
  // ════════════════════════════════════════

  const eyeY = -32

  // Eye whites
  c.fillStyle = '#FFFFFF'
  ellipse(-7, eyeY, 6, 7, 0)
  c.fill()
  ellipse(7, eyeY, 6, 7, 0)
  c.fill()

  if (!blink) {
    // Iris gradient
    const irisGrad1 = c.createRadialGradient(-7, eyeY - 1, 0.5, -7, eyeY, 5)
    irisGrad1.addColorStop(0, '#5A3A8A')
    irisGrad1.addColorStop(0.6, '#3A1A5A')
    irisGrad1.addColorStop(1, '#1A0A2A')
    c.fillStyle = irisGrad1
    ellipse(-7, eyeY, 4.5, 5.5, 0)
    c.fill()

    const irisGrad2 = c.createRadialGradient(7, eyeY - 1, 0.5, 7, eyeY, 5)
    irisGrad2.addColorStop(0, '#5A3A8A')
    irisGrad2.addColorStop(0.6, '#3A1A5A')
    irisGrad2.addColorStop(1, '#1A0A2A')
    c.fillStyle = irisGrad2
    ellipse(7, eyeY, 4.5, 5.5, 0)
    c.fill()

    // Pupil
    c.fillStyle = '#0A0A1A'
    ellipse(-7, eyeY + 0.5, 2.5, 3.5, 0)
    c.fill()
    ellipse(7, eyeY + 0.5, 2.5, 3.5, 0)
    c.fill()

    // Big highlight (top left)
    c.fillStyle = '#FFFFFF'
    ellipse(-5, eyeY - 2, 2.2, 2.5, 0)
    c.fill()
    ellipse(9, eyeY - 2, 2.2, 2.5, 0)
    c.fill()

    // Small highlight (bottom right)
    c.fillStyle = 'rgba(255,255,255,0.7)'
    ellipse(-9, eyeY + 3, 1.2, 1.5, 0)
    c.fill()
    ellipse(5, eyeY + 3, 1.2, 1.5, 0)
    c.fill()

    // Upper eyelid (dark line with lashes)
    c.strokeStyle = '#0A0A1A'
    c.lineWidth = 2
    ellipse(-7, eyeY - 6.5, 5.5, 5, 0)
    c.stroke()

    c.strokeStyle = '#0A0A1A'
    c.lineWidth = 2
    ellipse(7, eyeY - 6.5, 5.5, 5, 0)
    c.stroke()

    // Eyelash extenders
    c.beginPath()
    c.moveTo(-13, eyeY - 9)
    c.lineTo(-14, eyeY - 11)
    c.stroke()
    c.beginPath()
    c.moveTo(-9, eyeY - 10)
    c.lineTo(-9, eyeY - 12.5)
    c.stroke()
    c.beginPath()
    c.moveTo(13, eyeY - 9)
    c.lineTo(14, eyeY - 11)
    c.stroke()
    c.beginPath()
    c.moveTo(9, eyeY - 10)
    c.lineTo(9, eyeY - 12.5)
    c.stroke()

    // Lower lash line
    c.strokeStyle = 'rgba(10,10,26,0.4)'
    c.lineWidth = 0.8
    ellipse(-7, eyeY + 6.5, 5, 3.5, 0)
    c.stroke()
    ellipse(7, eyeY + 6.5, 5, 3.5, 0)
    c.stroke()
  } else {
    // Closed eyes (horizontal line)
    c.strokeStyle = '#0A0A1A'
    c.lineWidth = 1.8
    c.beginPath()
    c.moveTo(-12, eyeY)
    c.quadraticCurveTo(-7, eyeY - 2, -2, eyeY)
    c.stroke()
    c.beginPath()
    c.moveTo(2, eyeY)
    c.quadraticCurveTo(7, eyeY - 2, 12, eyeY)
    c.stroke()
  }

  // ════════════════════════════════════════
  // EYEBROWS
  // ════════════════════════════════════════

  c.strokeStyle = hairD
  c.lineWidth = 1.2
  c.beginPath()
  c.moveTo(-12, -38)
  c.quadraticCurveTo(-7, -41, -3, -40)
  c.stroke()
  c.beginPath()
  c.moveTo(12, -38)
  c.quadraticCurveTo(7, -41, 3, -40)
  c.stroke()

  // ════════════════════════════════════════
  // NOSE
  // ════════════════════════════════════════

  c.strokeStyle = SKIN_D
  c.lineWidth = 0.8
  c.beginPath()
  c.moveTo(0, -27)
  c.quadraticCurveTo(3, -25, 0, -23)
  c.stroke()

  // ════════════════════════════════════════
  // MOUTH
  // ════════════════════════════════════════

  // Upper lip
  c.fillStyle = '#D44058'
  c.beginPath()
  c.moveTo(-4, -19)
  c.quadraticCurveTo(0, -22, 4, -19)
  c.quadraticCurveTo(0, -18, -4, -19)
  c.fill()
  // Lower lip
  c.fillStyle = '#E85870'
  c.beginPath()
  c.moveTo(-3.5, -19)
  c.quadraticCurveTo(0, -17, 3.5, -19)
  c.quadraticCurveTo(0, -16, -3.5, -19)
  c.fill()
  // Lower lip highlight
  c.fillStyle = 'rgba(255,255,255,0.25)'
  c.beginPath()
  c.arc(0, -18, 1, 0, Math.PI)
  c.fill()

  // ════════════════════════════════════════
  // BLUSH
  // ════════════════════════════════════════

  const blush = c.createRadialGradient(-11, -24, 0.5, -11, -24, 5)
  blush.addColorStop(0, 'rgba(255,140,150,0.5)')
  blush.addColorStop(1, 'rgba(255,140,150,0)')
  c.fillStyle = blush
  ellipse(-11, -24, 5, 3, 0)
  c.fill()

  const blush2 = c.createRadialGradient(11, -24, 0.5, 11, -24, 5)
  blush2.addColorStop(0, 'rgba(255,140,150,0.5)')
  blush2.addColorStop(1, 'rgba(255,140,150,0)')
  c.fillStyle = blush2
  ellipse(11, -24, 5, 3, 0)
  c.fill()

  // ════════════════════════════════════════
  // FRONT HAIR
  // ════════════════════════════════════════

  // Main hair volume
  c.fillStyle = hairC
  ellipse(0, -40, 19, 16, 0)
  c.fill()

  // Side-swept bangs — individual strands
  c.fillStyle = hairC
  // Left bang
  c.beginPath()
  c.moveTo(-10, -48)
  c.quadraticCurveTo(-16, -36, -12, -24)
  c.quadraticCurveTo(-10, -30, -6, -38)
  c.closePath()
  c.fill()
  // Center left bang
  c.beginPath()
  c.moveTo(-4, -50)
  c.quadraticCurveTo(-10, -38, -6, -26)
  c.quadraticCurveTo(-4, -32, -2, -40)
  c.closePath()
  c.fill()
  // Center bang
  c.beginPath()
  c.moveTo(0, -52)
  c.quadraticCurveTo(-4, -40, 0, -30)
  c.quadraticCurveTo(2, -36, 2, -44)
  c.closePath()
  c.fill()
  // Right bang
  c.beginPath()
  c.moveTo(6, -50)
  c.quadraticCurveTo(10, -38, 8, -28)
  c.quadraticCurveTo(6, -34, 4, -42)
  c.closePath()
  c.fill()
  // Far right bang
  c.beginPath()
  c.moveTo(12, -46)
  c.quadraticCurveTo(16, -36, 14, -26)
  c.quadraticCurveTo(12, -32, 9, -38)
  c.closePath()
  c.fill()

  // Hair sides (overlapping face)
  c.fillStyle = hairC
  c.fillRect(-19, -36, 6, 20)
  c.fillRect(13, -36, 6, 20)
  // side strands rounding
  ellipse(-16, -18, 5, 8, -0.1)
  c.fill()
  ellipse(16, -18, 5, 8, 0.1)
  c.fill()

  // Hair highlights
  c.fillStyle = hairL
  // Left highlight
  c.beginPath()
  c.moveTo(-5, -46)
  c.quadraticCurveTo(-8, -40, -4, -34)
  c.lineTo(-3, -38)
  c.quadraticCurveTo(-6, -42, -3, -46)
  c.closePath()
  c.fill()
  // Right highlight
  c.beginPath()
  c.moveTo(8, -44)
  c.quadraticCurveTo(10, -38, 7, -32)
  c.lineTo(6, -36)
  c.quadraticCurveTo(7, -40, 6, -44)
  c.closePath()
  c.fill()

  // Hair shine streak
  c.fillStyle = 'rgba(255,255,255,0.08)'
  c.fillRect(-2, -48, 4, 12)

  // ════════════════════════════════════════
  // ACCESSORIES (per stage)
  // ════════════════════════════════════════

  // Hair ribbon (only stage 0 and 1)
  if (s < 2) {
    c.fillStyle = '#CC2233'
    // left bow
    c.beginPath()
    c.moveTo(14, -40)
    c.lineTo(8, -44)
    c.lineTo(10, -36)
    c.closePath()
    c.fill()
    // right bow
    c.beginPath()
    c.moveTo(20, -40)
    c.lineTo(26, -44)
    c.lineTo(24, -36)
    c.closePath()
    c.fill()
    // center knot
    c.beginPath()
    c.arc(17, -40, 2.5, 0, Math.PI * 2)
    c.fill()
  }

  // ════════════════════════════════════════
  // STAGE INDICATOR
  // ════════════════════════════════════════

  // Small hearts based on stage
  c.fillStyle = s >= 5 ? '#FF4060'
    : s >= 4 ? '#FF6080'
    : s >= 3 ? '#FFA0B0'
    : 'rgba(255,255,255,0.15)'
  c.font = '7px sans-serif'
  c.textAlign = 'center'
  c.textBaseline = 'top'
  const hearts = s >= 5 ? '♥♥♥' : s >= 3 ? '♥♥' : s >= 1 ? '♥' : ''
  if (hearts) c.fillText(hearts, 0, H / 2 + 70)

  c.restore()
}

function render(timestamp) {
  if (!startTime) startTime = timestamp
  const t = timestamp - startTime

  blinkCount++
  if (blinkCount > 110 + Math.random() * 80) {
    blink = true
    blinkCount = 0
    setTimeout(() => { blink = false }, 130)
  }

  draw(ctx, t)
  animFrame = requestAnimationFrame(render)
}

onMounted(() => {
  if (canvasRef.value) {
    ctx = canvasRef.value.getContext('2d')
    animFrame = requestAnimationFrame(render)
  }
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
