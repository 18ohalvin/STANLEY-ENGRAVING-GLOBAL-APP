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

/**
 * EXACT STANLEY LID COLLAR REFLECTION PROFILE
 * Sampled directly from authentic Stanley 18/8 stainless steel lid collar:
 * - 0% - 5%: Dark brushed steel left edge (#5e6063)
 * - 14% - 18%: Secondary soft ambient fill highlight (#c8c7c5)
 * - 34% - 44%: Core shadow trough from cylinder curve (#46484a -> #525456)
 * - 55% - 70%: PRIMARY CYLINDRICAL SPECULAR REFLECTION BAR (peaks at 63% with #faf8f6)
 * - 78% - 88%: Dark right shadow falloff (#525458 -> #404143)
 * - 95% - 100%: Right ambient rim catch (#707275)
 */
const stanleyStops = [
  '#5e6063 0%',
  '#7a7c80 6%',
  '#c8c7c5 14%',
  '#bdbcb9 20%',
  '#4a4c4e 34%',
  '#444547 40%',
  '#585a5e 46%',
  '#8a8d92 52%',
  '#e2e0df 57%',
  '#f8f6f5 62%',
  '#ffffff 64%',
  '#dedcdb 69%',
  '#6a6c70 76%',
  '#4d4f52 84%',
  '#3d3e40 92%',
  '#6e7073 100%'
].join(', ')

/**
 * ORIENTATION-AWARE LIGHTING ANGLE
 * In horizontal mode (or standard graphic):
 * - Gradient direction is 90deg (Left to Right), so the reflection runs VERTICALLY
 *   down the tumbler cylinder, exactly matching the lid collar reflection above it.
 *
 * In vertical mode (when container has -rotate-90 / transform: rotate(-90deg)):
 * - In rotated coordinate space: local +Y points to screen +X (right).
 * - Therefore, gradient direction MUST BE 180deg (to bottom in local space),
 *   which projects from Screen Left to Screen Right (+X).
 * - This guarantees that vertical text catches the cylinder reflection in the EXACT
 *   same vertical direction as the lid collar and tumbler body!
 */
const metallicGradientCss = computed(() => {
  if (props.orientation === 'vertical') {
    return `linear-gradient(180deg, ${stanleyStops})`
  }
  return `linear-gradient(90deg, ${stanleyStops})`
})

// Depth relief configuration for true physical DEBOSSED effect:
// In debossing, the shape is sunken into the powder coat.
// Light coming from top/ambient casts a dark inner shadow at the TOP wall of the cut,
// and a bright specular rim catch at the BOTTOM lip of the cut.
const depthConfig = computed(() => {
  switch (props.depthLevel) {
    case 'subtle':
      return {
        shadowDy: 1.0,
        shadowBlur: 0.6,
        shadowOpacity: 0.65,
        highlightDy: -0.7,
        highlightBlur: 0.4,
        highlightOpacity: 0.45,
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
        highlightOpacity: 0.6,
        dropFilter: 'drop-shadow(0px -0.7px 0.5px rgba(0,0,0,0.75)) drop-shadow(0px 0.9px 0.5px rgba(255,255,255,0.45))'
      }
  }
})

// Unique filter IDs
const instanceId = Math.random().toString(36).substring(2, 9)
const debossFilterId = computed(() => `laser-deboss-${instanceId}`)

// CSS Mask Styles for PNG Graphic Mode
const imageMaskStyle = computed(() => {
  if (!props.imageSrc) return {}
  return {
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
</script>

<template>
  <div class="relative inline-flex items-center justify-center select-none" :class="containerClass">
    
    <!-- SVG DEBOSS FILTER DEFINITION (Physical Cavity Occlusion & Chisel Bevel) -->
    <svg class="absolute w-0 h-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <defs>
        <filter :id="debossFilterId" x="-20%" y="-20%" width="140%" height="140%">
          <!-- 1. Top-Edge Inner Cavity Shadow (Sunken Powder-Coat Wall) -->
          <feOffset :dy="depthConfig.shadowDy" in="SourceAlpha" result="offset-down" />
          <feGaussianBlur :stdDeviation="depthConfig.shadowBlur" in="offset-down" result="blur-down" />
          <feComposite operator="out" in="SourceAlpha" in2="blur-down" result="top-inner-mask" />
          <feFlood flood-color="#000000" :flood-opacity="depthConfig.shadowOpacity" result="shadow-color" />
          <feComposite operator="in" in="shadow-color" in2="top-inner-mask" result="inner-top-shadow" />

          <!-- 2. Bottom-Lip Micro Chisel Highlight (Reflective Powder-Coat Rim Cut) -->
          <feOffset :dy="depthConfig.highlightDy" in="SourceAlpha" result="offset-up" />
          <feGaussianBlur :stdDeviation="depthConfig.highlightBlur" in="offset-up" result="blur-up" />
          <feComposite operator="out" in="SourceAlpha" in2="blur-up" result="bottom-lip-mask" />
          <feFlood flood-color="#ffffff" :flood-opacity="depthConfig.highlightOpacity" result="highlight-color" />
          <feComposite operator="in" in="highlight-color" in2="bottom-lip-mask" result="bottom-chisel-rim" />

          <!-- 3. Merge: Base Substrate Graphic + Top Inner Shadow + Bottom Chisel Rim -->
          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="inner-top-shadow" />
            <feMergeNode in="bottom-chisel-rim" />
          </feMerge>
        </filter>
      </defs>
    </svg>

    <!-- MODE 1: PNG / SVG GRAPHIC MASK (Authentic Debossed Stainless Steel Substrate) -->
    <div
      v-if="type === 'image' && imageSrc"
      class="relative transition-all duration-200 transform-gpu overflow-hidden"
      :style="imageMaskStyle"
    >
      <!-- Layer 1: Lid-Aligned Cylindrical Light Reflection Bar -->
      <div
        class="absolute inset-0 pointer-events-none mix-blend-soft-light opacity-90"
        :style="{
          background: 'linear-gradient(90deg, transparent 0%, transparent 45%, rgba(255,255,255,0.7) 60%, rgba(255,255,255,0.95) 64%, rgba(255,255,255,0.5) 70%, transparent 85%)'
        }"
      ></div>

      <!-- Layer 2: Debossed Cavity Gradient (Deepens the sunken cavity from top to bottom) -->
      <div
        class="absolute inset-0 pointer-events-none mix-blend-multiply opacity-65"
        :style="{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.15) 15%, transparent 40%, transparent 75%, rgba(0,0,0,0.2) 100%)'
        }"
      ></div>
    </div>

    <!-- MODE 2: LIVE TEXT ENGRAVING (Debossed Chiseled Text Relief) -->
    <div
      v-else-if="type === 'text' && text"
      class="relative font-bold select-none transition-all duration-200 tracking-wider text-center"
      :class="[
        fontClass,
        fontSizeClass,
        orientation === 'vertical'
          ? '-rotate-90 transform-gpu whitespace-nowrap flex flex-col items-center justify-center'
          : 'w-full max-w-full break-words'
      ]"
    >
      <!-- Base Metal Text with Stanley Lid-Matched Reflection and Deboss Shadows -->
      <div
        class="relative inline-block"
        :style="{
          background: metallicGradientCss,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: depthConfig.dropFilter
        }"
      >
        <template v-if="orientation === 'vertical' && verticalLines.length > 0">
          <div
            v-for="(line, idx) in verticalLines"
            :key="idx"
            class="whitespace-nowrap text-center leading-tight"
            :class="idx > 0 ? 'mt-1' : ''"
          >
            {{ line }}
          </div>
        </template>
        <template v-else>
          {{ text }}
        </template>
      </div>

      <!-- Top Inner Shadow Layer (Debossed Cavity Wall) -->
      <div
        class="absolute inset-0 pointer-events-none -z-10 select-none"
        aria-hidden="true"
        :style="{
          color: 'rgba(0,0,0,0.85)',
          transform: orientation === 'vertical' ? 'translate(-0.8px, 0)' : 'translate(0, -0.8px)',
          filter: 'blur(0.4px)'
        }"
      >
        <template v-if="orientation === 'vertical' && verticalLines.length > 0">
          <div
            v-for="(line, idx) in verticalLines"
            :key="idx"
            class="whitespace-nowrap text-center leading-tight"
            :class="idx > 0 ? 'mt-1' : ''"
          >
            {{ line }}
          </div>
        </template>
        <template v-else>
          {{ text }}
        </template>
      </div>

      <!-- Bottom Rim Chisel Highlight Layer (Sunken Lip Reflection) -->
      <div
        class="absolute inset-0 pointer-events-none -z-20 select-none"
        aria-hidden="true"
        :style="{
          color: 'rgba(255,255,255,0.45)',
          transform: orientation === 'vertical' ? 'translate(0.8px, 0)' : 'translate(0, 0.9px)',
          filter: 'blur(0.3px)'
        }"
      >
        <template v-if="orientation === 'vertical' && verticalLines.length > 0">
          <div
            v-for="(line, idx) in verticalLines"
            :key="idx"
            class="whitespace-nowrap text-center leading-tight"
            :class="idx > 0 ? 'mt-1' : ''"
          >
            {{ line }}
          </div>
        </template>
        <template v-else>
          {{ text }}
        </template>
      </div>
    </div>

    <!-- Fallback slot -->
    <slot />
  </div>
</template>

<style scoped>
/* Hardware accelerated metallic surface */
.laser-surface {
  will-change: transform, opacity;
  transform: translateZ(0);
}
</style>



