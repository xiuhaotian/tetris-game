<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  stage: { type: Number, default: 0 },
  action: { type: String, default: 'idle' },
})

const blink = ref(false)
const bobPhase = ref(0)
let startTime = 0
let frameId = null

onMounted(() => {
  const loop = (t) => {
    if (!startTime) startTime = t
    const elapsed = t - startTime
    bobPhase.value = elapsed
    frameId = requestAnimationFrame(loop)
  }
  frameId = requestAnimationFrame(loop)
})

onUnmounted(() => {
  if (frameId) cancelAnimationFrame(frameId)
})

// Blink timer
let blinkTimer = setInterval(() => {
  blink.value = true
  setTimeout(() => { blink.value = false }, 120)
}, 2000 + Math.random() * 2000)

onUnmounted(() => clearInterval(blinkTimer))

const bobY = computed(() => {
  const t = bobPhase.value
  if (props.action === 'jump') return Math.abs(Math.sin(t * 0.012)) * -14
  if (props.action === 'cheer') return Math.sin(t * 0.008) * -3 + 1
  return Math.sin(t * 0.002) * 0.8
})

const tilt = computed(() => {
  const t = bobPhase.value
  if (props.action === 'dance') return Math.sin(t * 0.006) * 3
  if (props.action === 'wave') return Math.sin(t * 0.003) * 5
  return 0
})

const armL = computed(() => {
  const t = bobPhase.value
  const base = props.action === 'wave' ? -0.5 : -0.15
  const swing = props.action === 'dance' ? Math.sin(t * 0.007) * 0.15
    : Math.sin(t * 0.002) * 0.05
  return base + swing
})

const armR = computed(() => {
  const t = bobPhase.value
  const base = props.action === 'cheer' ? -0.7 : 0.15
  const swing = -(props.action === 'dance' ? Math.sin(t * 0.007) * 0.15
    : Math.sin(t * 0.002) * 0.05)
  return base + swing
})
</script>

<template>
  <svg
    viewBox="0 0 112 160"
    class="char-svg"
    :style="{ transform: `translateY(${bobY}px) rotate(${tilt}deg)` }"
  >
    <defs>
      <!-- Hair gradient -->
      <radialGradient id="hairGrad" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stop-color="#3A3A5A" />
        <stop offset="60%" stop-color="#1A1A2E" />
        <stop offset="100%" stop-color="#0A0A1A" />
      </radialGradient>
      <linearGradient id="hairShine" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="rgba(255,255,255,0.12)" />
        <stop offset="100%" stop-color="rgba(255,255,255,0)" />
      </linearGradient>

      <!-- Skin gradient -->
      <radialGradient id="skinGrad" cx="50%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#FFF0E0" />
        <stop offset="70%" stop-color="#FDE8D0" />
        <stop offset="100%" stop-color="#E8C9A8" />
      </radialGradient>
      <linearGradient id="skinShadow" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#E8C9A8" />
        <stop offset="100%" stop-color="#D4B090" />
      </linearGradient>

      <!-- Eye iris gradient -->
      <radialGradient id="irisGrad" cx="40%" cy="35%" r="65%">
        <stop offset="0%" stop-color="#6B4A9A" />
        <stop offset="50%" stop-color="#4A2A7A" />
        <stop offset="100%" stop-color="#1A0A3A" />
      </radialGradient>

      <!-- Blush gradient -->
      <radialGradient id="blush" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="rgba(255,140,150,0.45)" />
        <stop offset="100%" stop-color="rgba(255,140,150,0)" />
      </radialGradient>

      <!-- Lip gradient -->
      <linearGradient id="lipGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#E85870" />
        <stop offset="100%" stop-color="#D43850" />
      </linearGradient>

      <!-- Cloth gradients -->
      <linearGradient id="blazerGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#2A5090" />
        <stop offset="100%" stop-color="#1E3A6A" />
      </linearGradient>
      <linearGradient id="skirtGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#2A5090" />
        <stop offset="100%" stop-color="#1A3060" />
      </linearGradient>
      <linearGradient id="tieGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#DD3344" />
        <stop offset="100%" stop-color="#BB2030" />
      </linearGradient>
      <linearGradient id="camiGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FFFFFF" />
        <stop offset="100%" stop-color="#F0F0F0" />
      </linearGradient>
    </defs>

    <!-- ════════════════════════════════════════ -->
    <!-- BODY GROUP — translates to character center -->
    <!-- ════════════════════════════════════════ -->
    <g transform="translate(56, 98)">

      <!-- ═══ BACK HAIR ═══ -->
      <g>
        <!-- Main back hair mass -->
        <path d="M-18,-48 Q-26,-30 -24,-10 Q-22,10 -18,22
                 L-14,22 Q-16,10 -18,-8 Q-20,-26 -14,-48 Z"
              fill="url(#hairGrad)" />
        <path d="M18,-48 Q26,-30 24,-10 Q22,10 18,22
                 L14,22 Q16,10 18,-8 Q20,-26 14,-48 Z"
              fill="url(#hairGrad)" />
        <!-- Long back strands -->
        <path d="M-20,-20 Q-24,8 -22,24 Q-20,28 -18,24 Q-16,8 -16,-20 Z"
              fill="#1A1A2E" />
        <path d="M20,-20 Q24,8 22,24 Q20,28 18,24 Q16,8 16,-20 Z"
              fill="#1A1A2E" />
        <!-- Hair ends -->
        <path d="M-22,20 Q-26,30 -18,30 Q-14,30 -14,24 Z" fill="#0A0A1A" />
        <path d="M22,20 Q26,30 18,30 Q14,30 14,24 Z" fill="#0A0A1A" />
      </g>

      <!-- ═══ LEGS ═══ -->
      <g>
        <!-- Upper thighs -->
        <path d="M-10,26 L-3,26 L-3,40 L-10,40 Z" fill="url(#skinGrad)" />
        <path d="M3,26 L10,26 L10,40 L3,40 Z" fill="url(#skinGrad)" />

        <!-- Lower legs -->
        <path d="M-9,40 L-2,40 L-2,56 L-9,56 Z" fill="url(#skinGrad)" />
        <path d="M2,40 L9,40 L9,56 L2,56 Z" fill="url(#skinGrad)" />

        <!-- Knee joint hints -->
        <ellipse cx="-5.5" cy="42" rx="3.5" ry="1.5" fill="#E8C9A8" />
        <ellipse cx="5.5" cy="42" rx="3.5" ry="1.5" fill="#E8C9A8" />

        <!-- Socks/Stockings -->
        <template v-if="stage < 4">
          <!-- Stage 0-1: Knee socks -->
          <template v-if="stage < 2">
            <rect x="-9" y="46" width="7" height="10" rx="2" fill="white" />
            <rect x="2" y="46" width="7" height="10" rx="2" fill="white" />
            <rect x="-9" y="48" width="7" height="1.5" fill="#1E3A6A" />
            <rect x="2" y="48" width="7" height="1.5" fill="#1E3A6A" />
          </template>
          <!-- Stage 2-3: Thigh highs -->
          <template v-else>
            <rect x="-9" y="44" width="7" height="12" rx="2" fill="#1A1A2E" />
            <rect x="2" y="44" width="7" height="12" rx="2" fill="#1A1A2E" />
            <rect x="-9" y="43.5" width="7" height="1.5" rx="0.5" fill="#E880A0" />
            <rect x="2" y="43.5" width="7" height="1.5" rx="0.5" fill="#E880A0" />
          </template>
        </template>

        <!-- Shoes (not on towel stage) -->
        <template v-if="stage < 5">
          <path d="M-10,56 L-1,56 Q0,56 0,58 L-1,61 L-10,61 Q-11,61 -11,58 Q-11,56 -10,56 Z" fill="#1A1A1A" />
          <path d="M1,56 L10,56 Q11,56 11,58 L10,61 L1,61 Q0,61 0,58 Q0,56 1,56 Z" fill="#1A1A1A" />
          <!-- Sole -->
          <rect x="-10" y="60" width="9" height="1" rx="0.3" fill="#2A2A2A" />
          <rect x="1" y="60" width="9" height="1" rx="0.3" fill="#2A2A2A" />
        </template>
      </g>

      <!-- ═══ TORSO (skin base) ═══ -->
      <g>
        <!-- Main torso -->
        <path d="M-13,-6 Q-14,2 -13,8 L-9,8 Q-8,2 -8,-6 Z" fill="url(#skinGrad)" />
        <path d="M8,-6 Q8,2 9,8 L13,8 Q14,2 13,-6 Z" fill="url(#skinGrad)" />
        <rect x="-8" y="-6" width="16" height="15" fill="url(#skinGrad)" />

        <!-- Bust definition -->
        <path d="M-8,-4 Q-5,-8 -2,-4" fill="none" stroke="#E8C9A8" stroke-width="0.8" />
        <path d="M2,-4 Q5,-8 8,-4" fill="none" stroke="#E8C9A8" stroke-width="0.8" />

        <!-- Waist -->
        <rect x="-9" y="4" width="18" height="4" fill="#E8C9A8" />

        <!-- Hips -->
        <path d="M-14,9 Q-14,14 -12,16 L12,16 Q14,14 14,9 Z" fill="url(#skinGrad)" />
        <ellipse cx="-11" cy="11" rx="4" ry="3" fill="#E8C9A8" opacity="0.5" />
        <ellipse cx="11" cy="11" rx="4" ry="3" fill="#E8C9A8" opacity="0.5" />
      </g>

      <!-- ═══ STAGE-BASED CLOTHING ═══ -->

      <!-- STAGE 5: Towel -->
      <g v-if="stage >= 5">
        <path d="M-14,-2 Q-16,4 -14,10 L14,10 Q16,4 14,-2 Z" fill="#FFF8F0" stroke="#E8E0D8" stroke-width="0.5" />
        <path d="M-15,12 Q-17,18 -15,24 L15,24 Q17,18 15,12 Z" fill="#FFF8F0" stroke="#E8E0D8" stroke-width="0.5" />
        <!-- Towel folds -->
        <line x1="-11" y1="1" x2="11" y2="1" stroke="rgba(200,190,180,0.4)" stroke-width="0.5" />
        <line x1="-12" y1="5" x2="12" y2="5" stroke="rgba(200,190,180,0.4)" stroke-width="0.5" />
        <line x1="-13" y1="14" x2="13" y2="14" stroke="rgba(200,190,180,0.4)" stroke-width="0.5" />
        <line x1="-12" y1="19" x2="12" y2="19" stroke="rgba(200,190,180,0.4)" stroke-width="0.5" />
        <!-- Bare shoulders -->
        <ellipse cx="-15" cy="-4" rx="4" ry="3" fill="url(#skinGrad)" />
        <ellipse cx="15" cy="-4" rx="4" ry="3" fill="url(#skinGrad)" />
        <!-- Upper chest -->
        <ellipse cx="0" cy="-5" rx="6" ry="3" fill="url(#skinGrad)" />
      </g>

      <!-- STAGE 4: Lingerie -->
      <g v-else-if="stage >= 4">
        <!-- Bra cups -->
        <path d="M-11,-2 Q-6,-8 -2,-2 Z" fill="#1A1A2E" stroke="#E880A0" stroke-width="0.4" />
        <path d="M2,-2 Q6,-8 11,-2 Z" fill="#1A1A2E" stroke="#E880A0" stroke-width="0.4" />
        <!-- Lace trim -->
        <path d="M-10,-2 Q-6,-5 -3,-2" fill="none" stroke="#E880A0" stroke-width="0.6" />
        <path d="M3,-2 Q6,-5 10,-2" fill="none" stroke="#E880A0" stroke-width="0.6" />
        <!-- Bra center -->
        <rect x="-2" y="-4" width="4" height="4" rx="1" fill="#1A1A2E" />
        <!-- Straps -->
        <line x1="-14" y1="-8" x2="-10" y2="-4" stroke="#1A1A2E" stroke-width="2" />
        <line x1="14" y1="-8" x2="10" y2="-4" stroke="#1A1A2E" stroke-width="2" />
        <!-- Panties -->
        <path d="M-9,11 Q-9,8 -7,8 L7,8 Q9,8 9,11 L8,17 L-8,17 Z" fill="#1A1A2E" />
        <!-- Panties lace -->
        <rect x="-7" y="8" width="14" height="2" rx="1" fill="#E880A0" />
        <!-- Bare midriff -->
        <rect x="-10" y="4" width="20" height="5" fill="url(#skinGrad)" />
        <!-- Belly button -->
        <circle cx="0" cy="7" r="0.7" fill="#D4B090" />
      </g>

      <!-- STAGE 3: Camisole + mini skirt -->
      <g v-else-if="stage >= 3">
        <!-- Camisole body -->
        <path d="M-11,-6 Q-12,0 -11,8 L11,8 Q12,0 11,-6 Z" fill="url(#camiGrad)" />
        <!-- Camisole straps -->
        <rect x="-14" y="-8" width="4" height="6" rx="1.5" fill="white" />
        <rect x="10" y="-8" width="4" height="6" rx="1.5" fill="white" />
        <!-- Lace trim at bottom -->
        <rect x="-11" y="6" width="22" height="2" rx="0.5" fill="#E880A0" />
        <!-- Cleavage -->
        <path d="M-4,-2 Q-4,2 -2,3" fill="none" stroke="#E8C9A8" stroke-width="0.8" />
        <path d="M4,-2 Q4,2 2,3" fill="none" stroke="#E8C9A8" stroke-width="0.8" />
        <!-- Mini skirt -->
        <path d="M-14,10 Q-15,14 -14,18 L14,18 Q15,14 14,10 Z" fill="url(#skirtGrad)" />
        <line x1="-7" y1="10" x2="-7" y2="18" stroke="#3A6AAA" stroke-width="0.5" />
        <line x1="0" y1="10" x2="0" y2="18" stroke="#3A6AAA" stroke-width="0.5" />
        <line x1="7" y1="10" x2="7" y2="18" stroke="#3A6AAA" stroke-width="0.5" />
      </g>

      <!-- STAGE 2: Shirt open + mini skirt -->
      <g v-else-if="stage >= 2">
        <!-- Shirt body -->
        <rect x="-12" y="-8" width="24" height="22" rx="3" fill="white" />
        <!-- Shirt open sides -->
        <path d="M-11,-7 L-5,0 L-11,5 Z" fill="#F0F0F0" />
        <path d="M11,-7 L5,0 L11,5 Z" fill="#F0F0F0" />
        <!-- Exposed chest -->
        <rect x="-5" y="-6" width="10" height="12" rx="2" fill="url(#skinGrad)" />
        <!-- Cleavage shadow -->
        <path d="M-3,-2 Q-3,1 -1,2" fill="none" stroke="#E8C9A8" stroke-width="0.8" />
        <path d="M3,-2 Q3,1 1,2" fill="none" stroke="#E8C9A8" stroke-width="0.8" />
        <!-- Loose tie -->
        <rect x="-2" y="-7" width="4" height="20" rx="1.5" fill="url(#tieGrad)" />
        <rect x="-2.5" y="-8" width="5" height="4" rx="2" fill="#BB2030" />
        <!-- Mini skirt -->
        <path d="M-14,10 Q-15,14 -14,20 L14,20 Q15,14 14,10 Z" fill="url(#skirtGrad)" />
        <line x1="-7" y1="10" x2="-7" y2="20" stroke="#3A6AAA" stroke-width="0.5" />
        <line x1="0" y1="10" x2="0" y2="20" stroke="#3A6AAA" stroke-width="0.5" />
        <line x1="7" y1="10" x2="7" y2="20" stroke="#3A6AAA" stroke-width="0.5" />
      </g>

      <!-- STAGE 1: No blazer, rolled sleeves -->
      <g v-else-if="stage >= 1">
        <!-- Shirt (buttoned) -->
        <rect x="-12" y="-8" width="24" height="22" rx="3" fill="white" />
        <!-- Shirt collar -->
        <path d="M-6,-7 L-2,-2 L-6,0" fill="none" stroke="#E8E8E8" stroke-width="1" />
        <path d="M6,-7 L2,-2 L6,0" fill="none" stroke="#E8E8E8" stroke-width="1" />
        <!-- Buttons -->
        <circle cx="0" cy="-2" r="0.8" fill="#D4D4D4" />
        <circle cx="0" cy="3" r="0.8" fill="#D4D4D4" />
        <circle cx="0" cy="8" r="0.8" fill="#D4D4D4" />
        <!-- Tie -->
        <rect x="-2" y="-7" width="4" height="18" rx="1.5" fill="url(#tieGrad)" />
        <rect x="-2.5" y="-8" width="5" height="4" rx="2" fill="#BB2030" />
        <!-- Tie stripe -->
        <rect x="-0.5" y="-6" width="1" height="16" fill="#BB2030" />
        <!-- Mid skirt -->
        <path d="M-14,10 Q-15,16 -14,24 L14,24 Q15,16 14,10 Z" fill="url(#skirtGrad)" />
        <line x1="-7" y1="10" x2="-7" y2="24" stroke="#3A6AAA" stroke-width="0.5" />
        <line x1="0" y1="10" x2="0" y2="24" stroke="#3A6AAA" stroke-width="0.5" />
        <line x1="7" y1="10" x2="7" y2="24" stroke="#3A6AAA" stroke-width="0.5" />
      </g>

      <!-- STAGE 0: Full JK Uniform -->
      <g v-else>
        <!-- Blazer -->
        <path d="M-17,-6 Q-18,4 -16,14 L16,14 Q18,4 17,-6 Z" fill="url(#blazerGrad)" />
        <!-- Lapels -->
        <path d="M-8,-5 L-3,2 L-10,4 Z" fill="#3A6AAA" />
        <path d="M8,-5 L3,2 L10,4 Z" fill="#3A6AAA" />
        <!-- Gold buttons -->
        <circle cx="0" cy="1" r="1.2" fill="#D4A000" />
        <circle cx="0" cy="5.5" r="1.2" fill="#D4A000" />
        <!-- Shirt collar peek -->
        <rect x="-6" y="-8" width="12" height="3" rx="1" fill="white" />
        <!-- Tie -->
        <rect x="-2" y="-7" width="4" height="18" rx="1.5" fill="url(#tieGrad)" />
        <rect x="-2.5" y="-8" width="5" height="4" rx="2" fill="#BB2030" />
        <rect x="-0.5" y="-6" width="1" height="16" fill="#BB2030" />
        <!-- Long skirt -->
        <path d="M-15,12 Q-16,20 -15,30 L15,30 Q16,20 15,12 Z" fill="url(#skirtGrad)" />
        <line x1="-9" y1="12" x2="-9" y2="30" stroke="#3A6AAA" stroke-width="0.5" />
        <line x1="-3" y1="12" x2="-3" y2="30" stroke="#3A6AAA" stroke-width="0.5" />
        <line x1="3" y1="12" x2="3" y2="30" stroke="#3A6AAA" stroke-width="0.5" />
        <line x1="9" y1="12" x2="9" y2="30" stroke="#3A6AAA" stroke-width="0.5" />
      </g>

      <!-- ═══ ARMS ═══ -->
      <g>
        <!-- Left arm -->
        <g :transform="`rotate(${armL * 180 / Math.PI}, -17, -2)`">
          <path d="M-21,-2 Q-23,-2 -23,4 L-23,22 Q-23,24 -21,24 L-15,24 Q-13,24 -13,22 L-13,4 Q-13,-2 -15,-2 Z" fill="url(#skinGrad)" />
          <!-- Stage 1+ rolled sleeve -->
          <template v-if="stage >= 1 && stage < 3">
            <rect x="-22" y="4" width="10" height="6" rx="1.5" fill="white" />
            <rect x="-22" y="8" width="10" height="2" fill="#E8E8E8" />
          </template>
          <!-- Stage 0 blazer sleeve -->
          <template v-if="stage < 1">
            <rect x="-22" y="-6" width="10" height="12" rx="3" fill="url(#blazerGrad)" />
          </template>
        </g>

        <!-- Right arm -->
        <g :transform="`rotate(${armR * 180 / Math.PI}, 17, -2)`">
          <path d="M15,-2 Q13,-2 13,4 L13,22 Q13,24 15,24 L21,24 Q23,24 23,22 L23,4 Q23,-2 21,-2 Z" fill="url(#skinGrad)" />
          <template v-if="stage >= 1 && stage < 3">
            <rect x="12" y="4" width="10" height="6" rx="1.5" fill="white" />
            <rect x="12" y="8" width="10" height="2" fill="#E8E8E8" />
          </template>
          <template v-if="stage < 1">
            <rect x="12" y="-6" width="10" height="12" rx="3" fill="url(#blazerGrad)" />
          </template>
        </g>
      </g>

      <!-- ═══ NECK ═══ -->
      <g>
        <rect x="-5" y="-12" width="10" height="7" rx="2" fill="url(#skinShadow)" />
        <!-- Collarbone -->
        <path d="M-9,-8 Q-4,-7 -5,-6 Q-4,-7 -5,-6" fill="none" stroke="#D4B090" stroke-width="0.6" />
        <path d="M9,-8 Q4,-7 5,-6" fill="none" stroke="#D4B090" stroke-width="0.6" />
      </g>

      <!-- Sailor collar (stage 0 only) -->
      <g v-if="stage < 1">
        <path d="M-10,-10 L0,-5 L10,-10 L12,-8 L0,-2 L-12,-8 Z" fill="white" />
        <path d="M-9,-9 L0,-5 L9,-9" fill="none" stroke="#1E3A6A" stroke-width="1.5" />
        <!-- Bow -->
        <path d="M-5,-1 L-2,-3 L0,-1 L2,-3 L5,-1 L0,1 Z" fill="#CC2233" />
        <circle cx="0" cy="-1" r="1.2" fill="#AA1A28" />
      </g>

      <!-- ═══ HEAD ═══ -->
      <g>
        <!-- Face base oval -->
        <ellipse cx="0" cy="-30" rx="16" ry="18" fill="url(#skinGrad)" />
        <!-- Chin definition -->
        <path d="M-14,-30 Q-14,-12 0,-11 Q14,-12 14,-30" fill="url(#skinGrad)" />
        <!-- Ears -->
        <ellipse cx="-16" cy="-26" rx="3" ry="4" fill="#E8C9A8" />
        <ellipse cx="16" cy="-26" rx="3" ry="4" fill="#E8C9A8" />
      </g>

      <!-- ═══ EYES ═══ -->
      <g v-if="!blink">
        <!-- Left eye -->
        <g>
          <!-- Eye white -->
          <ellipse cx="-7" cy="-31" rx="6" ry="7" fill="white" />
          <!-- Iris -->
          <ellipse cx="-7" cy="-30" rx="4.5" ry="5.5" fill="url(#irisGrad)" />
          <!-- Pupil -->
          <circle cx="-7" cy="-30" r="2.8" fill="#0A0A1A" />
          <!-- Main highlight -->
          <ellipse cx="-5" cy="-33" rx="2" ry="2.5" fill="white" />
          <!-- Secondary highlight -->
          <ellipse cx="-9" cy="-28" rx="1.2" ry="1.5" fill="rgba(255,255,255,0.7)" />
          <!-- Upper lid -->
          <path d="M-13,-36 Q-7,-39 -1,-36" fill="none" stroke="#0A0A1A" stroke-width="2" />
          <!-- Eyelash extenders -->
          <path d="M-13,-36 L-14,-38" stroke="#0A0A1A" stroke-width="1.5" stroke-linecap="round" />
          <path d="M-10,-38 L-10,-40" stroke="#0A0A1A" stroke-width="1.5" stroke-linecap="round" />
          <path d="M-4,-38 L-4,-40" stroke="#0A0A1A" stroke-width="1.2" stroke-linecap="round" />
          <!-- Lower lash line -->
          <path d="M-12,-25 Q-7,-22 -2,-25" fill="none" stroke="rgba(10,10,26,0.25)" stroke-width="1" />
        </g>

        <!-- Right eye -->
        <g>
          <ellipse cx="7" cy="-31" rx="6" ry="7" fill="white" />
          <ellipse cx="7" cy="-30" rx="4.5" ry="5.5" fill="url(#irisGrad)" />
          <circle cx="7" cy="-30" r="2.8" fill="#0A0A1A" />
          <ellipse cx="9" cy="-33" rx="2" ry="2.5" fill="white" />
          <ellipse cx="5" cy="-28" rx="1.2" ry="1.5" fill="rgba(255,255,255,0.7)" />
          <path d="M1,-36 Q7,-39 13,-36" fill="none" stroke="#0A0A1A" stroke-width="2" />
          <path d="M13,-36 L14,-38" stroke="#0A0A1A" stroke-width="1.5" stroke-linecap="round" />
          <path d="M10,-38 L10,-40" stroke="#0A0A1A" stroke-width="1.5" stroke-linecap="round" />
          <path d="M4,-38 L4,-40" stroke="#0A0A1A" stroke-width="1.2" stroke-linecap="round" />
          <path d="M2,-25 Q7,-22 12,-25" fill="none" stroke="rgba(10,10,26,0.25)" stroke-width="1" />
        </g>
      </g>

      <!-- Blink state -->
      <g v-else>
        <!-- Closed eyes -->
        <path d="M-13,-31 Q-7,-34 -1,-31" fill="none" stroke="#0A0A1A" stroke-width="1.8" stroke-linecap="round" />
        <path d="M1,-31 Q7,-34 13,-31" fill="none" stroke="#0A0A1A" stroke-width="1.8" stroke-linecap="round" />
        <!-- Lower lashes -->
        <path d="M-12,-28 Q-7,-26 -2,-28" fill="none" stroke="rgba(10,10,26,0.2)" stroke-width="0.8" />
        <path d="M2,-28 Q7,-26 12,-28" fill="none" stroke="rgba(10,10,26,0.2)" stroke-width="0.8" />
      </g>

      <!-- ═══ EYEBROWS ═══ -->
      <g>
        <path d="M-13,-37 Q-7,-40 -3,-39" fill="none" stroke="#0A0A1A" stroke-width="1.2" stroke-linecap="round" />
        <path d="M13,-37 Q7,-40 3,-39" fill="none" stroke="#0A0A1A" stroke-width="1.2" stroke-linecap="round" />
      </g>

      <!-- ═══ NOSE ═══ -->
      <g>
        <path d="M0,-26 Q3,-24 0,-22" fill="none" stroke="#D4B090" stroke-width="0.8" stroke-linecap="round" />
      </g>

      <!-- ═══ MOUTH ═══ -->
      <g>
        <!-- Upper lip -->
        <path d="M-4,-18 Q0,-21 4,-18 Q0,-17 -4,-18" fill="url(#lipGrad)" />
        <!-- Lower lip -->
        <path d="M-3.5,-18 Q0,-16 3.5,-18 Q0,-15 -3.5,-18" fill="#E85870" />
        <!-- Lip highlight -->
        <ellipse cx="0" cy="-17" rx="1.2" ry="0.6" fill="rgba(255,255,255,0.2)" />
      </g>

      <!-- ═══ BLUSH ═══ -->
      <g>
        <ellipse cx="-11" cy="-23" rx="5" ry="3" fill="url(#blush)" />
        <ellipse cx="11" cy="-23" rx="5" ry="3" fill="url(#blush)" />
      </g>

      <!-- ═══ FRONT HAIR ═══ -->
      <g>
        <!-- Main hair volume (top) -->
        <ellipse cx="0" cy="-41" rx="19" ry="16" fill="url(#hairGrad)" />

        <!-- Bangs — side-swept strands -->
        <path d="M-10,-48 Q-18,-36 -13,-22 Q-11,-28 -7,-38 Z" fill="#1A1A2E" />
        <path d="M-3,-50 Q-10,-38 -6,-24 Q-4,-30 -2,-40 Z" fill="#1A1A2E" />
        <path d="M0,-52 Q-4,-40 0,-28 Q2,-34 2,-44 Z" fill="#1A1A2E" />
        <path d="M6,-50 Q10,-38 8,-26 Q6,-32 4,-42 Z" fill="#1A1A2E" />
        <path d="M12,-46 Q17,-34 14,-24 Q12,-30 10,-38 Z" fill="#1A1A2E" />

        <!-- Side hair overlapping face -->
        <rect x="-20" y="-35" width="7" height="22" rx="3" fill="#1A1A2E" />
        <rect x="13" y="-35" width="7" height="22" rx="3" fill="#1A1A2E" />
        <ellipse cx="-17" cy="-16" rx="5" ry="8" fill="#1A1A2E" />
        <ellipse cx="17" cy="-16" rx="5" ry="8" fill="#1A1A2E" />

        <!-- Hair highlights -->
        <path d="M-4,-46 Q-8,-40 -4,-33 L-3,-37 Q-5,-42 -3,-46 Z" fill="#3A3A5A" />
        <path d="M8,-44 Q10,-38 7,-31 L6,-35 Q8,-40 6,-44 Z" fill="#3A3A5A" />

        <!-- Hair shine streak -->
        <rect x="-2" y="-49" width="4" height="14" rx="1" fill="url(#hairShine)" />
      </g>

      <!-- ═══ HAIR RIBBON (stage 0-1) ═══ -->
      <g v-if="stage < 2">
        <!-- Left bow -->
        <path d="M15,-40 L8,-44 L10,-36 Z" fill="#CC2233" />
        <!-- Right bow -->
        <path d="M19,-40 L26,-44 L24,-36 Z" fill="#CC2233" />
        <!-- Center knot -->
        <circle cx="17" cy="-40" r="2.5" fill="#AA1A28" />
      </g>

      <!-- ═══ STAGE INDICATOR ═══ -->
      <text
        :fill="stage >= 5 ? '#FF4060' : stage >= 3 ? '#FF6080' : stage >= 1 ? '#FFA0B0' : 'rgba(255,255,255,0.15)'"
        font-size="7"
        font-family="sans-serif"
        text-anchor="middle"
        y="75"
      >
        {{ stage >= 5 ? '♥♥♥' : stage >= 3 ? '♥♥' : stage >= 1 ? '♥' : '' }}
      </text>

    </g>
  </svg>
</template>

<style scoped>
.char-svg {
  display: block;
  width: 112px;
  height: 160px;
  will-change: transform;
}
</style>
