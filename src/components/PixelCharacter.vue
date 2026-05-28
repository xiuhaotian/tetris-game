<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  stage: { type: Number, default: 0 },
  action: { type: String, default: 'idle' },
})

const blink = ref(false)
const bobY = ref(0)
const tilt = ref(0)
let startTime = 0
let frameId = null

onMounted(() => {
  const loop = (t) => {
    if (!startTime) startTime = t
    const e = t - startTime
    const s1 = Math.sin(e * 0.002) * 0.5
    const s2 = Math.sin(e * 0.006) * 3
    const s3 = Math.sin(e * 0.007) * 0.15
    if (props.action === 'jump') bobY.value = Math.abs(Math.sin(e * 0.012)) * -14
    else if (props.action === 'cheer') bobY.value = Math.sin(e * 0.008) * -3 + 1
    else bobY.value = s1
    if (props.action === 'dance') tilt.value = s2
    else if (props.action === 'wave') tilt.value = Math.sin(e * 0.003) * 5
    else tilt.value = 0
    frameId = requestAnimationFrame(loop)
  }
  frameId = requestAnimationFrame(loop)
  const blinkTimer = setInterval(() => {
    blink.value = true
    setTimeout(() => { blink.value = false }, 110)
  }, 1800 + Math.random() * 1800)
  onUnmounted(() => clearInterval(blinkTimer))
})

onUnmounted(() => {
  if (frameId) cancelAnimationFrame(frameId)
})
</script>

<template>
  <div class="char-wrap" :style="{ transform: `translateY(${bobY}px) rotate(${tilt}deg)` }">
    <svg viewBox="0 0 140 180" class="char-svg">
      <defs>
        <radialGradient id="skinG" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#FFF2E8" />
          <stop offset="60%" stop-color="#FDE8D0" />
          <stop offset="100%" stop-color="#E8C9A8" />
        </radialGradient>
        <radialGradient id="hairG" cx="50%" cy="30%" r="65%">
          <stop offset="0%" stop-color="#4A3A6A" />
          <stop offset="50%" stop-color="#2A1A4A" />
          <stop offset="100%" stop-color="#1A0A2A" />
        </radialGradient>
        <radialGradient id="irisG" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#7A5AAA" />
          <stop offset="50%" stop-color="#4A2A7A" />
          <stop offset="100%" stop-color="#1A0A3A" />
        </radialGradient>
        <linearGradient id="blushG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="rgba(255,140,150,0.5)" />
          <stop offset="100%" stop-color="rgba(255,140,150,0)" />
        </linearGradient>
        <linearGradient id="lipG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#E86078" />
          <stop offset="100%" stop-color="#D44058" />
        </linearGradient>
        <linearGradient id="blazerG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#3A6AAA" />
          <stop offset="100%" stop-color="#1E3A6A" />
        </linearGradient>
        <linearGradient id="tieG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#DD3344" />
          <stop offset="100%" stop-color="#BB2030" />
        </linearGradient>
      </defs>

      <!-- ── Center reference ── -->
      <g transform="translate(70, 105)">

        <!-- ═══ BACK HAIR ═══ -->
        <path d="M-24,-52 Q-30,-30 -28,-4 Q-26,12 -22,24 Q-18,28 -14,20 Q-16,8 -18,-10 Q-20,-28 -18,-48 Z" fill="url(#hairG)" />
        <path d="M24,-52 Q30,-30 28,-4 Q26,12 22,24 Q18,28 14,20 Q16,8 18,-10 Q20,-28 18,-48 Z" fill="url(#hairG)" />
        <!-- Long back strands -->
        <path d="M-22,-14 Q-28,6 -26,24 Q-24,30 -20,26 Q-18,10 -18,-14 Z" fill="#2A1A4A" />
        <path d="M22,-14 Q28,6 26,24 Q24,30 20,26 Q18,10 18,-14 Z" fill="#2A1A4A" />

        <!-- ═══ NECK & COLLAR ═══ -->
        <rect x="-6" y="-14" width="12" height="10" rx="3" fill="#E8C9A8" />
        <path d="M-10,-10 Q-5,-8 -6,-6" fill="none" stroke="#D4B090" stroke-width="0.7" stroke-linecap="round" />
        <path d="M10,-10 Q5,-8 6,-6" fill="none" stroke="#D4B090" stroke-width="0.7" stroke-linecap="round" />

        <!-- ═══ BODY (waist-up: shoulders + chest) ═══ -->
        <path d="M-18,-3 Q-20,4 -18,14 L18,14 Q20,4 18,-3 Z" fill="url(#skinG)" />
        <!-- Collarbone -->
        <path d="M-16,-4 Q-10,-1 -8,0" fill="none" stroke="#D4B090" stroke-width="0.6" />
        <path d="M16,-4 Q10,-1 8,0" fill="none" stroke="#D4B090" stroke-width="0.6" />
        <!-- Bust shadow -->
        <path d="M-9,2 Q-6,-2 -3,2" fill="none" stroke="#E8C9A8" stroke-width="1" />
        <path d="M3,2 Q6,-2 9,2" fill="none" stroke="#E8C9A8" stroke-width="1" />

        <!-- ═══ CLOTHING (stage-based, waist-up) ═══ -->

        <!-- Stage 5: Towel (bare shoulders + towel wrap at chest) -->
        <g v-if="stage >= 5">
          <path d="M-16,-1 Q-18,6 -16,14 L16,14 Q18,6 16,-1 Z" fill="#FFF8F0" stroke="#E8E0D8" stroke-width="0.5" />
          <line x1="-14" y1="3" x2="14" y2="3" stroke="rgba(200,190,180,0.4)" stroke-width="0.6" />
          <line x1="-15" y1="8" x2="15" y2="8" stroke="rgba(200,190,180,0.4)" stroke-width="0.6" />
          <line x1="-14" y1="12" x2="14" y2="12" stroke="rgba(200,190,180,0.4)" stroke-width="0.6" />
          <ellipse cx="0" cy="-3" rx="7" ry="3" fill="url(#skinG)" />
        </g>

        <!-- Stage 4: Lingerie -->
        <g v-else-if="stage >= 4">
          <path d="M-12,0 Q-7,-6 -3,0 Z" fill="#1A1A2E" stroke="#E880A0" stroke-width="0.5" />
          <path d="M3,0 Q7,-6 12,0 Z" fill="#1A1A2E" stroke="#E880A0" stroke-width="0.5" />
          <rect x="-2" y="-2" width="4" height="3" rx="1" fill="#1A1A2E" />
          <line x1="-16" y1="-7" x2="-11" y2="-2" stroke="#1A1A2E" stroke-width="2" />
          <line x1="16" y1="-7" x2="11" y2="-2" stroke="#1A1A2E" stroke-width="2" />
          <rect x="-10" y="8" width="20" height="5" fill="url(#skinG)" />
          <circle cx="0" cy="10" r="0.8" fill="#D4B090" />
        </g>

        <!-- Stage 3: Camisole -->
        <g v-else-if="stage >= 3">
          <path d="M-14,-2 Q-15,4 -14,12 L14,12 Q15,4 14,-2 Z" fill="#FFFFFF" />
          <rect x="-17" y="-8" width="5" height="8" rx="2" fill="white" />
          <rect x="12" y="-8" width="5" height="8" rx="2" fill="white" />
          <rect x="-14" y="9" width="28" height="3" rx="0.5" fill="#E880A0" />
          <path d="M-4,0 Q-4,4 -2,5" fill="none" stroke="#E8C9A8" stroke-width="0.8" />
          <path d="M4,0 Q4,4 2,5" fill="none" stroke="#E8C9A8" stroke-width="0.8" />
        </g>

        <!-- Stage 2: Shirt open -->
        <g v-else-if="stage >= 2">
          <rect x="-15" y="-8" width="30" height="24" rx="3" fill="white" />
          <path d="M-14,-6 L-6,2 L-14,8 Z" fill="#F0F0F0" />
          <path d="M14,-6 L6,2 L14,8 Z" fill="#F0F0F0" />
          <rect x="-6" y="-5" width="12" height="14" rx="2" fill="url(#skinG)" />
          <path d="M-3,0 Q-3,3 -1,4" fill="none" stroke="#E8C9A8" stroke-width="0.8" />
          <path d="M3,0 Q3,3 1,4" fill="none" stroke="#E8C9A8" stroke-width="0.8" />
          <rect x="-2.5" y="-8" width="5" height="18" rx="1.5" fill="url(#tieG)" />
          <rect x="-3" y="-9" width="6" height="4" rx="2" fill="#BB2030" />
        </g>

        <!-- Stage 1: Shirt buttoned, no blazer -->
        <g v-else-if="stage >= 1">
          <rect x="-15" y="-8" width="30" height="24" rx="3" fill="white" />
          <path d="M-7,-7 L-3,-2 L-7,1" fill="none" stroke="#E0E0E0" stroke-width="1" />
          <path d="M7,-7 L3,-2 L7,1" fill="none" stroke="#E0E0E0" stroke-width="1" />
          <circle cx="0" cy="0" r="1" fill="#D4D4D4" />
          <circle cx="0" cy="6" r="1" fill="#D4D4D4" />
          <rect x="-2.5" y="-8" width="5" height="18" rx="1.5" fill="url(#tieG)" />
          <rect x="-3" y="-9" width="6" height="4" rx="2" fill="#BB2030" />
          <rect x="-1" y="-7" width="2" height="16" fill="#BB2030" />
        </g>

        <!-- Stage 0: Blazer -->
        <g v-else>
          <path d="M-20,-6 Q-22,4 -20,16 L20,16 Q22,4 20,-6 Z" fill="url(#blazerG)" />
          <path d="M-10,-5 L-4,3 L-12,5 Z" fill="#4A7ABA" />
          <path d="M10,-5 L4,3 L12,5 Z" fill="#4A7ABA" />
          <circle cx="0" cy="2" r="1.5" fill="#D4A000" />
          <circle cx="0" cy="8" r="1.5" fill="#D4A000" />
          <rect x="-7" y="-9" width="14" height="4" rx="1.5" fill="white" />
          <rect x="-2.5" y="-8" width="5" height="18" rx="1.5" fill="url(#tieG)" />
          <rect x="-3" y="-9" width="6" height="4" rx="2" fill="#BB2030" />
          <rect x="-1" y="-7" width="2" height="16" fill="#BB2030" />
        </g>

        <!-- ═══ ARMS ═══ -->
        <g>
          <path d="M-23,-4 Q-25,2 -24,12 L-20,12 Q-22,2 -20,-2 Z" fill="url(#skinG)" />
          <path d="M23,-4 Q25,2 24,12 L20,12 Q22,2 20,-2 Z" fill="url(#skinG)" />
          <g v-if="stage < 1">
            <rect x="-26" y="-7" width="10" height="14" rx="3" fill="url(#blazerG)" />
            <rect x="16" y="-7" width="10" height="14" rx="3" fill="url(#blazerG)" />
          </g>
          <g v-else-if="stage < 3">
            <rect x="-26" y="2" width="10" height="6" rx="1.5" fill="white" />
            <rect x="16" y="2" width="10" height="6" rx="1.5" fill="white" />
            <rect x="-26" y="6" width="10" height="2" fill="#E8E8E8" />
            <rect x="16" y="6" width="10" height="2" fill="#E8E8E8" />
          </g>
        </g>

        <!-- ═══ FACE ═══ -->
        <ellipse cx="0" cy="-32" rx="20" ry="24" fill="url(#skinG)" />
        <!-- Chin -->
        <path d="M-18,-32 Q-18,-10 0,-9 Q18,-10 18,-32 Z" fill="url(#skinG)" />
        <!-- Ears -->
        <ellipse cx="-20" cy="-27" rx="3.5" ry="5" fill="#E8C9A8" />
        <ellipse cx="20" cy="-27" rx="3.5" ry="5" fill="#E8C9A8" />

        <!-- ═══ EYES (big, detailed anime eyes) ═══ -->
        <g v-if="!blink">
          <!-- Left eye -->
          <g>
            <ellipse cx="-9" cy="-33" rx="8" ry="9.5" fill="white" />
            <ellipse cx="-9" cy="-32" rx="6" ry="7.5" fill="url(#irisG)" />
            <circle cx="-9" cy="-32" r="3.5" fill="#0A0A1A" />
            <ellipse cx="-6" cy="-36" rx="3" ry="3.5" fill="white" />
            <ellipse cx="-12" cy="-29" rx="1.5" ry="2" fill="rgba(255,255,255,0.65)" />
            <path d="M-17,-40 Q-9,-44 -1,-40" fill="none" stroke="#0A0A1A" stroke-width="2.2" stroke-linecap="round" />
            <path d="M-17,-40 L-18,-43" stroke="#0A0A1A" stroke-width="1.8" stroke-linecap="round" />
            <path d="M-12,-43 L-12,-46" stroke="#0A0A1A" stroke-width="1.8" stroke-linecap="round" />
            <path d="M-5,-43 L-5,-45" stroke="#0A0A1A" stroke-width="1.5" stroke-linecap="round" />
            <path d="M-16,-26 Q-9,-22 -2,-26" fill="none" stroke="rgba(10,10,26,0.2)" stroke-width="1.2" />
          </g>

          <!-- Right eye -->
          <g>
            <ellipse cx="9" cy="-33" rx="8" ry="9.5" fill="white" />
            <ellipse cx="9" cy="-32" rx="6" ry="7.5" fill="url(#irisG)" />
            <circle cx="9" cy="-32" r="3.5" fill="#0A0A1A" />
            <ellipse cx="12" cy="-36" rx="3" ry="3.5" fill="white" />
            <ellipse cx="6" cy="-29" rx="1.5" ry="2" fill="rgba(255,255,255,0.65)" />
            <path d="M1,-40 Q9,-44 17,-40" fill="none" stroke="#0A0A1A" stroke-width="2.2" stroke-linecap="round" />
            <path d="M17,-40 L18,-43" stroke="#0A0A1A" stroke-width="1.8" stroke-linecap="round" />
            <path d="M12,-43 L12,-46" stroke="#0A0A1A" stroke-width="1.8" stroke-linecap="round" />
            <path d="M5,-43 L5,-45" stroke="#0A0A1A" stroke-width="1.5" stroke-linecap="round" />
            <path d="M-2,-26 Q9,-22 16,-26" fill="none" stroke="rgba(10,10,26,0.2)" stroke-width="1.2" />
          </g>
        </g>

        <!-- Blink (closed eyes) -->
        <g v-else>
          <path d="M-17,-33 Q-9,-36 -1,-33" fill="none" stroke="#0A0A1A" stroke-width="2" stroke-linecap="round" />
          <path d="M1,-33 Q9,-36 17,-33" fill="none" stroke="#0A0A1A" stroke-width="2" stroke-linecap="round" />
          <path d="M-16,-30 Q-9,-28 -2,-30" fill="none" stroke="rgba(10,10,26,0.15)" stroke-width="0.8" />
          <path d="M2,-30 Q9,-28 16,-30" fill="none" stroke="rgba(10,10,26,0.15)" stroke-width="0.8" />
        </g>

        <!-- ═══ EYEBROWS (thin, elegant) ═══ -->
        <path d="M-16,-42 Q-9,-45 -4,-44" fill="none" stroke="#0A0A1A" stroke-width="1.3" stroke-linecap="round" />
        <path d="M16,-42 Q9,-45 4,-44" fill="none" stroke="#0A0A1A" stroke-width="1.3" stroke-linecap="round" />

        <!-- ═══ NOSE (small) ═══ -->
        <path d="M0,-28 Q3,-26 0,-24" fill="none" stroke="#D4B090" stroke-width="0.9" stroke-linecap="round" />

        <!-- ═══ MOUTH (small, pretty) ═══ -->
        <g>
          <path d="M-5,-18 Q0,-22 5,-18 Q0,-17 -5,-18" fill="url(#lipG)" />
          <path d="M-4,-18 Q0,-15 4,-18" fill="#E86078" />
          <ellipse cx="0" cy="-17" rx="1.5" ry="0.6" fill="rgba(255,255,255,0.25)" />
        </g>

        <!-- ═══ BLUSH ═══ -->
        <ellipse cx="-14" cy="-24" rx="6.5" ry="3.5" fill="url(#blushG)" />
        <ellipse cx="14" cy="-24" rx="6.5" ry="3.5" fill="url(#blushG)" />

        <!-- ═══ FRONT HAIR ═══ -->
        <g>
          <!-- Main hair volume (top) -->
          <ellipse cx="0" cy="-48" rx="23" ry="20" fill="url(#hairG)" />

          <!-- Side-swept bangs (above eyebrows, no eye coverage) -->
          <path d="M-12,-58 Q-22,-46 -14,-44 Q-10,-46 -8,-48 Z" fill="url(#hairG)" />
          <path d="M-4,-60 Q-12,-48 -6,-44 Q-4,-46 -2,-50 Z" fill="url(#hairG)" />
          <path d="M0,-62 Q-4,-50 0,-44 Q2,-46 2,-50 Z" fill="url(#hairG)" />
          <path d="M8,-60 Q12,-48 6,-44 Q4,-46 3,-50 Z" fill="url(#hairG)" />

          <!-- Side hair (framing face, not overlapping eyes) -->
          <rect x="-24" y="-40" width="6" height="26" rx="3" fill="url(#hairG)" />
          <rect x="18" y="-40" width="6" height="26" rx="3" fill="url(#hairG)" />
          <ellipse cx="-21" cy="-14" rx="5" ry="10" fill="url(#hairG)" />
          <ellipse cx="21" cy="-14" rx="5" ry="10" fill="url(#hairG)" />

          <!-- Hair highlights -->
          <path d="M-5,-54 Q-10,-46 -5,-40 L-4,-44 Q-7,-48 -4,-54 Z" fill="#4A3A6A" />
          <path d="M10,-52 Q14,-44 9,-38 L8,-42 Q11,-46 8,-52 Z" fill="#4A3A6A" />

          <!-- Hair shine -->
          <rect x="-2" y="-56" width="5" height="16" rx="2" fill="rgba(255,255,255,0.1)" />
        </g>

        <!-- ═══ HAIR RIBBON (stage 0-1) ═══ -->
        <g v-if="stage < 2">
          <path d="M18,-46 L10,-52 L12,-42 Z" fill="#CC2233" />
          <path d="M24,-46 L32,-52 L30,-42 Z" fill="#CC2233" />
          <circle cx="21" cy="-46" r="3.5" fill="#AA1A28" />
        </g>

        <!-- ═══ STAGE INDICATOR (top right) ═══ -->
        <text :fill="stage >= 5 ? '#FF4060' : stage >= 3 ? '#FF6080' : stage >= 1 ? '#FFA0B0' : 'rgba(255,255,255,0.15)'"
              font-size="7" font-family="sans-serif" text-anchor="end" x="68" y="-68">
          {{ stage >= 5 ? '♥♥♥' : stage >= 3 ? '♥♥' : stage >= 1 ? '♥' : '' }}
        </text>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.char-wrap {
  display: flex;
  justify-content: center;
  will-change: transform;
}
.char-svg {
  display: block;
  width: 140px;
  max-width: 100%;
  height: auto;
}
</style>
