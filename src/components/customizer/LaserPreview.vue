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

// Depth relief for laser vaporized powder-coat trench
const depthConfig = computed(() => {
  switch (props.depthLevel) {
    case 'subtle':
      return {
        filter: 'drop-shadow(0px 0.7px 0.5px rgba(0,0,0,0.65)) drop-shadow(0px -0.4px 0.3px rgba(255,255,255,0.45))',
        rimColor: 'rgba(0,0,0,0.5)',
        rimOffset: 'translate(0.4px, 0.6px)'
      }
    case 'deep':
      return {
        filter: 'drop-shadow(0px 1.5px 1px rgba(0,0,0,0.85)) drop-shadow(0px -0.8px 0.6px rgba(255,255,255,0.7))',
        rimColor: 'rgba(0,0,0,0.8)',
        rimOffset: 'translate(0.8px, 1.2px)'
      }
    case 'standard':
    default:
      return {
        filter: 'drop-shadow(0px 1px 0.8px rgba(0,0,0,0.75)) drop-shadow(0px -0.5px 0.4px rgba(255,255,255,0.55))',
        rimColor: 'rgba(0,0,0,0.65)',
        rimOffset: 'translate(0.6px, 0.8px)'
      }
  }
})

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
    filter: depthConfig.value.filter,
    ...(props.imageStyle || {})
  }
})
</script>

<template>
  <div class="relative inline-flex items-center justify-center select-none" :class="containerClass">
    
    <!-- MODE 1: PNG / SVG GRAPHIC MASK (Clean Stainless Steel Substrate with Lid-Matched Sheen) -->
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

      <!-- Layer 2: Micro Bevel Inset Shadow for Laser Vaporization Ridge -->
      <div
        class="absolute inset-0 pointer-events-none mix-blend-multiply opacity-50"
        :style="{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 25%, transparent 80%, rgba(0,0,0,0.35) 100%)'
        }"
      ></div>
    </div>

    <!-- MODE 2: LIVE TEXT ENGRAVING (Brushed Stainless Steel with Lid-Aligned Lighting) -->
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
      <!-- Base Metal Text with Stanley Lid-Matched Reflection -->
      <div
        class="relative inline-block"
        :style="{
          background: metallicGradientCss,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: depthConfig.filter
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

      <!-- Laser Trench Cast Shadow (Physical Depth Ridge) -->
      <div
        class="absolute inset-0 pointer-events-none -z-10 select-none"
        aria-hidden="true"
        :style="{
          color: depthConfig.rimColor,
          transform: depthConfig.rimOffset,
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


