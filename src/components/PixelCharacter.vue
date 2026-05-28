<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'

const props = defineProps({
  stage: { type: Number, default: 0 },
  action: { type: String, default: 'idle' },
  character: { type: String, default: 'sayaka' },
})

const cvs = ref(null)
const bobY = ref(0)
const tilt = ref(0)

const characters = {
  sayaka: {
    name: 'Sayaka',
    path: '/sprites/sayaka/Idle',
    prefix: 'Saya_I',
    stages: [
      { body: 'Nude1', face: 'Happy',  clothes: ['SchoolUni1', 'Stocking1', 'SchoolShoes'] },
      { body: 'Nude1', face: 'Happy',  clothes: ['SchoolUni2', 'Stocking2', 'SchoolShoes'] },
      { body: 'Nude1', face: 'Happy',  clothes: ['CasualDress', 'CasualShoes'] },
      { body: 'Nude1', face: 'Angry',  clothes: ['Bra', 'Panties'] },
      { body: 'Nude1', face: 'Sad',    clothes: [] },
      { body: 'Nude2', face: 'Sad',    clothes: [] },
    ],
  },
  tomoko: {
    name: 'Tomoko',
    path: '/sprites/tomoko/Idle',
    prefix: 'Tomo_I',
    stages: [
      { body: 'Nude1', face: 'Happy', clothes: ['SchoolUniform', 'SchoolShoes', 'Stocking'] },
      { body: 'Nude1', face: 'Happy', clothes: ['CasualOutfit1', 'Boots'] },
      { body: 'Nude1', face: 'Happy', clothes: ['CasualOutfit2', 'Boots'] },
      { body: 'Nude1', face: 'Angry', clothes: ['Bra', 'Pantie'] },
      { body: 'Nude1', face: 'Sad',   clothes: [] },
      { body: 'Nude2', face: 'Sad',   clothes: [] },
    ],
  },
}

const CW = 216
const CH = 384

const charData = computed(() => characters[props.character] || characters.sayaka)

function getNeededFiles(cfg) {
  const files = new Set()
  const p = cfg.prefix
  for (const s of cfg.stages) {
    files.add(`Body/${p}${s.body}.png`)
    files.add(`Faces/${p}${s.face}.png`)
    for (const c of s.clothes) files.add(`Clothes/${p}${c}.png`)
  }
  return files
}

let imageCache = {}
let allLoaded = false
let frameId = null
let startTime = 0

function loadImages() {
  allLoaded = false
  imageCache = {}
  const data = charData.value
  const files = getNeededFiles(data)
  let pending = files.size
  for (const f of files) {
    const img = new Image()
    img.onload = img.onerror = () => {
      pending--
      if (!pending) { allLoaded = true; draw() }
    }
    img.src = `${data.path}/${f}`
    imageCache[f] = img
  }
  if (files.size === 0) allLoaded = true
}

function draw() {
  const canvas = cvs.value
  if (!canvas || !allLoaded) return
  const ctx = canvas.getContext('2d')
  const data = charData.value
  const cfg = data.stages[props.stage] || data.stages[0]
  const p = data.prefix
  ctx.clearRect(0, 0, CW, CH)
  const body = imageCache[`Body/${p}${cfg.body}.png`]
  if (body) ctx.drawImage(body, 0, 0, CW, CH)
  for (const item of cfg.clothes) {
    const img = imageCache[`Clothes/${p}${item}.png`]
    if (img) ctx.drawImage(img, 0, 0, CW, CH)
  }
  const face = imageCache[`Faces/${p}${cfg.face}.png`]
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
watch(() => props.character, () => { loadImages() })

onMounted(() => {
  loadImages()
  frameId = requestAnimationFrame(loop)
})

onUnmounted(() => {
  if (frameId) cancelAnimationFrame(frameId)
})
</script>

<template>
  <div class="char-wrap" :style="{ transform: `translateY(${bobY}px) rotate(${tilt}deg)` }">
    <canvas ref="cvs" :width="CW" :height="CH" class="char-canvas"></canvas>
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
