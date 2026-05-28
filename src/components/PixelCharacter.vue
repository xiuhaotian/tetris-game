<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  stage: { type: Number, default: 0 },
  action: { type: String, default: 'idle' },
})

const cvs = ref(null)
const bobY = ref(0)
const tilt = ref(0)

const IMG = '/sprites/sayaka/Idle'
const CW = 216
const CH = 384

const PP = 'Saya_I'
const stageCfg = [
  { body: `${PP}Nude1`, face: `${PP}Happy`,  clothes: [`${PP}SchoolUni1`, `${PP}Stocking1`, `${PP}SchoolShoes`] },
  { body: `${PP}Nude1`, face: `${PP}Happy`,  clothes: [`${PP}SchoolUni2`, `${PP}Stocking2`, `${PP}SchoolShoes`] },
  { body: `${PP}Nude1`, face: `${PP}Happy`,  clothes: [`${PP}CasualDress`, `${PP}CasualShoes`] },
  { body: `${PP}Nude1`, face: `${PP}Angry`,  clothes: [`${PP}Bra`, `${PP}Panties`] },
  { body: `${PP}Nude1`, face: `${PP}Sad`,    clothes: [] },
  { body: `${PP}Nude2`, face: `${PP}Sad`,    clothes: [] },
]

const neededFiles = new Set()
for (const cfg of stageCfg) {
  neededFiles.add(`Body/${cfg.body}.png`)
  neededFiles.add(`Faces/${cfg.face}.png`)
  for (const c of cfg.clothes) neededFiles.add(`Clothes/${c}.png`)
}

let imageCache = {}
let allLoaded = false
let frameId = null
let startTime = 0

function draw() {
  const canvas = cvs.value
  if (!canvas || !allLoaded) return
  const ctx = canvas.getContext('2d')
  const cfg = stageCfg[props.stage] || stageCfg[0]

  ctx.clearRect(0, 0, CW, CH)

  const body = imageCache[`Body/${cfg.body}.png`]
  if (body) ctx.drawImage(body, 0, 0, CW, CH)

  for (const item of cfg.clothes) {
    const img = imageCache[`Clothes/${item}.png`]
    if (img) ctx.drawImage(img, 0, 0, CW, CH)
  }

  const face = imageCache[`Faces/${cfg.face}.png`]
  if (face) ctx.drawImage(face, 0, 0, CW, CH)
}

function loop(t) {
  if (!startTime) startTime = t
  const e = t - startTime
  const s1 = Math.sin(e * 0.002) * 0.5
  const s2 = Math.sin(e * 0.006) * 3
  if (props.action === 'jump') bobY.value = Math.abs(Math.sin(e * 0.012)) * -14
  else if (props.action === 'cheer') bobY.value = Math.sin(e * 0.008) * -3 + 1
  else bobY.value = s1
  if (props.action === 'dance') tilt.value = s2
  else if (props.action === 'wave') tilt.value = Math.sin(e * 0.003) * 5
  else tilt.value = 0
  draw()
  frameId = requestAnimationFrame(loop)
}

watch(() => props.stage, () => { draw() })

onMounted(() => {
  let pending = neededFiles.size
  for (const f of neededFiles) {
    const img = new Image()
    img.onload = () => {
      pending--
      if (!pending) { allLoaded = true; draw() }
    }
    img.src = `${IMG}/${f}`
    imageCache[f] = img
  }
  frameId = requestAnimationFrame(loop)
})

onUnmounted(() => {
  if (frameId) cancelAnimationFrame(frameId)
})
</script>

<template>
  <div class="char-wrap" :style="{ transform: `translateY(${bobY}px) rotate(${tilt}deg)` }">
    <canvas ref="cvs" width="216" height="384" class="char-canvas"></canvas>
  </div>
</template>

<style scoped>
.char-wrap {
  display: flex;
  justify-content: center;
  will-change: transform;
  line-height: 0;
}
.char-canvas {
  display: block;
  width: 108px;
  max-width: 100%;
  height: auto;
  aspect-ratio: 216 / 384;
}
</style>
