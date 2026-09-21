<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  type?: 'text' | 'image' | 'custom'
  text?: string
  fontClass?: string
  fontSizeClass?: string
  orientation?: 'horizontal' | 'vertical'
  verticalLines?: string[]
  imageSrc?: string
  imageStyle?: Record<string, string | number>
  isLightTumbler?: boolean
  depthLevel?: 'subtle' | 'standard' | 'deep'
  containerClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  text: '',
  fontClass: '',
  fontSizeClass: 'text-[28px]',
  orientation: 'horizontal',
  verticalLines: () => [],
  imageSrc: '',
  isLightTumbler: false,
  depthLevel: 'standard',
  containerClass: ''
})

// Unique instance ID for SVG definitions
const instanceId = Math.random().toString(36).substring(2, 9)
const globalRefId = computed(() => `global-ref-${instanceId}`)
const debossFilterId = computed(() => `laser-deboss-${instanceId}`)

/**
 * EXACT STANLEY LID COLLAR REFLECTION PROFILE (Sampled at Y=248)
 * Light profile across the cylinder (left to right):
 * - 0% - 5%: Dark brushed steel left edge (#5e6063)
 * - 14% - 18%: Secondary soft ambient fill highlight (#c8c7c5)
 * - 34% - 44%: Core shadow trough (#4a4c4e -> #585a5e)
 * - 57% - 70%: PRIMARY SPECULAR REFLECTION BAR (Peak at 64% with #ffffff)
 * - 76% - 88%: Dark right shadow falloff (#6a6c70 -> #4d4f52)
 * - 95% - 100%: Right ambient rim catch (#6e7073)
 */
const reflectionStops = [
  { offset: '0%', color: '#5e6063' },
  { offset: '6%', color: '#7a7c80' },
  { offset: '14%', color: '#c8c7c5' },
  { offset: '20%', color: '#bdbcb9' },
  { offset: '34%', color: '#4a4c4e' },
  { offset: '40%', color: '#444547' },
  { offset: '46%', color: '#585a5e' },
  { offset: '52%', color: '#8a8d92' },
  { offset: '57%', color: '#e2e0df' },
  { offset: '62%', color: '#f8f6f5' },
  { offset: '64%', color: '#ffffff' },
  { offset: '69%', color: '#dedcdb' },
  { offset: '76%', color: '#6a6c70' },
  { offset: '84%', color: '#4d4f52' },
  { offset: '92%', color: '#3d3e40' },
  { offset: '100%', color: '#6e7073' }
]

const metallicGradientCss = computed(() => {
  const stopsStr = reflectionStops.map(s => `${s.color} ${s.offset}`).join(', ')
  return `linear-gradient(90deg, ${stopsStr})`
})

// Extract numeric font size in pixels from fontSizeClass (e.g. 'text-[34px]' -> 34)
const numericFontSize = computed(() => {
  const match = props.fontSizeClass.match(/text-\[(\d+)px\]/)
  if (match) return parseInt(match[1], 10)
  if (props.fontSizeClass.includes('text-sm')) return 18
  if (props.fontSizeClass.includes('text-base')) return 22
  if (props.fontSizeClass.includes('text-lg')) return 26
  if (props.fontSizeClass.includes('text-xl')) return 32
  if (props.fontSizeClass.includes('text-2xl')) return 38
  return 32
})

// Determine font-family and uppercase styling from fontClass
const parsedFontFamily = computed(() => {
  if (props.fontClass.includes('Stanley_Favorit')) return "'Stanley_Favorit', sans-serif"
  if (props.fontClass.includes('serif')) return 'Georgia, Cambria, serif'
  if (props.fontClass.includes('mono')) return 'Menlo, Monaco, Consolas, monospace'
  return "'Stanley_Favorit', sans-serif"
})

const isUppercase = computed(() => {
  return props.fontClass.includes('uppercase')
})

const displayText = computed(() => {
  if (isUppercase.value) return props.text.toUpperCase()
  return props.text
})

const processedVerticalLines = computed(() => {
  if (props.verticalLines && props.verticalLines.length > 0) {
    return props.verticalLines.map(l => isUppercase.value ? l.toUpperCase() : l)
  }
  return [displayText.value]
})

// Depth relief configuration for true physical DEBOSSED effect:
const depthConfig = computed(() => {
  switch (props.depthLevel) {
    case 'subtle':
      return {
        shadowDy: 1.0,
        shadowBlur: 0.6,
        shadowOpacity: 0.7,
        highlightDy: -0.7,
        highlightBlur: 0.4,
        highlightOpacity: 0.5,
        dropFilter: 'drop-shadow(0px -0.5px 0.4px rgba(0,0,0,0.6)) drop-shadow(0px 0.6px 0.4px rgba(255,255,255,0.35))'
      }
    case 'deep':
      return {
        shadowDy: 2.2,
        shadowBlur: 1.0,
        shadowOpacity: 0.95,
        highlightDy: -1.2,
        highlightBlur: 0.6,
        highlightOpacity: 0.8,
        dropFilter: 'drop-shadow(0px -1.0px 0.7px rgba(0,0,0,0.85)) drop-shadow(0px 1.2px 0.6px rgba(255,255,255,0.55))'
      }
    case 'standard':
    default:
      return {
        shadowDy: 1.5,
        shadowBlur: 0.8,
        shadowOpacity: 0.85,
        highlightDy: -0.9,
        highlightBlur: 0.5,
        highlightOpacity: 0.65,
        dropFilter: 'drop-shadow(0px -0.7px 0.5px rgba(0,0,0,0.75)) drop-shadow(0px 0.9px 0.5px rgba(255,255,255,0.45))'
      }
  }
})

// CSS Mask Styles for PNG Graphic Mode (100% reliable across all browsers & formats)
const imageMaskStyle = computed(() => {
  if (!props.imageSrc) return {}
  return {
    width: '110px',
    height: '110px',
    background: metallicGradientCss.value,
    maskImage: `url('${props.imageSrc}')`,
    WebkitMaskImage: `url('${props.imageSrc}')`,
    maskSize: 'contain',
    WebkitMaskSize: 'contain',
    maskRepeat: 'no-repeat',
    WebkitMaskRepeat: 'no-repeat',
    maskPosition: 'center',
    WebkitMaskPosition: 'center',
    filter: `url(#${debossFilterId.value}) ${depthConfig.value.dropFilter}`,
    ...(props.imageStyle || {})
  }
})

// ViewBox coordinate system: 191 width x 280 height (matches standard Stanley engraving zone)
const VB_WIDTH = 191
const VB_HEIGHT = 280
const CX = VB_WIDTH / 2
const CY = VB_HEIGHT / 2
</script>

<template>
  <div class="relative w-full h-full flex items-center justify-center select-none" :class="containerClass">
    
    <!-- SVG DEBOSS FILTER DEFINITIONS -->
    <svg class="absolute w-0 h-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <defs>
        <!-- GLOBAL CYLINDRICAL REFLECTION GRADIENT
             Because gradientUnits="userSpaceOnUse" and x1="0" x2="191" y1="0" y2="0",
             the light bar at 64% stays strictly vertical down the cylinder! -->
        <linearGradient :id="globalRefId" gradientUnits="userSpaceOnUse" x1="0" y1="0" :x2="VB_WIDTH" y2="0">
          <stop
            v-for="(stop, idx) in reflectionStops"
            :key="idx"
            :offset="stop.offset"
            :stop-color="stop.color"
          />
        </linearGradient>

        <!-- DEBOSSED TRENCH DEPTH FILTER (Top Wall Occlusion + Bottom Chisel Rim) -->
        <filter :id="debossFilterId" x="-20%" y="-20%" width="140%" height="140%">
          <feOffset :dy="depthConfig.shadowDy" in="SourceAlpha" result="offset-down" />
          <feGaussianBlur :stdDeviation="depthConfig.shadowBlur" in="offset-down" result="blur-down" />
          <feComposite operator="out" in="SourceAlpha" in2="blur-down" result="top-inner-mask" />
          <feFlood flood-color="#000000" :flood-opacity="depthConfig.shadowOpacity" result="shadow-color" />
          <feComposite operator="in" in="shadow-color" in2="top-inner-mask" result="inner-top-shadow" />

          <feOffset :dy="depthConfig.highlightDy" in="SourceAlpha" result="offset-up" />
          <feGaussianBlur :stdDeviation="depthConfig.highlightBlur" in="offset-up" result="blur-up" />
          <feComposite operator="out" in="SourceAlpha" in2="blur-up" result="bottom-lip-mask" />
          <feFlood flood-color="#ffffff" :flood-opacity="depthConfig.highlightOpacity" result="highlight-color" />
          <feComposite operator="in" in="highlight-color" in2="bottom-lip-mask" result="bottom-chisel-rim" />

          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="inner-top-shadow" />
            <feMergeNode in="bottom-chisel-rim" />
          </feMerge>
        </filter>
      </defs>
    </svg>

    <!-- MODE 1: PNG / SVG GRAPHIC MASK (100% Reliable Mask Rendering + Debossed Shading) -->
    <div
      v-if="type === 'image' && imageSrc"
      class="relative transition-all duration-200 transform-gpu overflow-hidden flex items-center justify-center"
      :style="imageMaskStyle"
    >
      <!-- Layer 1: Cylindrical Specular Glare Bar (at 64% width) -->
      <div
        class="absolute inset-0 pointer-events-none mix-blend-soft-light opacity-90"
        :style="{
          background: 'linear-gradient(90deg, transparent 0%, transparent 45%, rgba(255,255,255,0.7) 60%, rgba(255,255,255,0.95) 64%, rgba(255,255,255,0.5) 70%, transparent 85%)'
        }"
      ></div>

      <!-- Layer 2: Debossed Cavity Gradient (Top-to-bottom depth shadow) -->
      <div
        class="absolute inset-0 pointer-events-none mix-blend-multiply opacity-65"
        :style="{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.15) 15%, transparent 40%, transparent 75%, rgba(0,0,0,0.2) 100%)'
        }"
      ></div>
    </div>

    <!-- MODE 2: LIVE TEXT ENGRAVING (SVG Global Substrate Stencil: Never Rotates Reflections) -->
    <svg
      v-else-if="type === 'text' && text"
      :viewBox="`0 0 ${VB_WIDTH} ${VB_HEIGHT}`"
      class="w-full h-full max-w-full max-h-full overflow-visible pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- Vertical Text: Text rotates, but fill="url(#globalRef)" stays pinned to cylinder! -->
      <g v-if="orientation === 'vertical'" :filter="`url(#${debossFilterId})`" class="laser-surface">
        <text
          v-for="(line, idx) in processedVerticalLines"
          :key="idx"
          :x="CX + (idx - (processedVerticalLines.length - 1) / 2) * (numericFontSize * 1.15)"
          :y="CY"
          :fill="`url(#${globalRefId})`"
          text-anchor="middle"
          dominant-baseline="central"
          :font-family="parsedFontFamily"
          :font-size="numericFontSize"
          font-weight="bold"
          letter-spacing="0.08em"
          :transform="`rotate(-90 ${CX + (idx - (processedVerticalLines.length - 1) / 2) * (numericFontSize * 1.15)} ${CY})`"
        >
          {{ line }}
        </text>
      </g>

      <!-- Horizontal Text -->
      <g v-else :filter="`url(#${debossFilterId})`" class="laser-surface">
        <text
          :x="CX"
          :y="CY"
          :fill="`url(#${globalRefId})`"
          text-anchor="middle"
          dominant-baseline="central"
          :font-family="parsedFontFamily"
          :font-size="numericFontSize"
          font-weight="bold"
          letter-spacing="0.05em"
        >
          {{ displayText }}
        </text>
      </g>
    </svg>

    <!-- Fallback slot -->
    <slot />
  </div>
</template>

<style scoped>
.laser-surface {
  will-change: transform, filter;
  transform: translateZ(0);
}
</style>





