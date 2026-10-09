<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, nextTick, watch } from 'vue'

interface Props {
  type?: 'text' | 'image' | 'custom'
  text?: string
  fontClass?: string
  fontSizeClass?: string
  fontSize?: number
  orientation?: 'horizontal' | 'vertical'
  verticalLines?: string[]
  imageSrc?: string
  imageStyle?: Record<string, string | number>
  isLightTumbler?: boolean
  depthLevel?: 'subtle' | 'standard' | 'deep'
  placement?: 'center' | 'top' | 'bottom'
  containerClass?: string
  viewBoxWidth?: number
  viewBoxHeight?: number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  text: '',
  fontClass: '',
  fontSizeClass: 'text-[28px]',
  fontSize: 0,
  orientation: 'horizontal',
  verticalLines: () => [],
  imageSrc: '',
  isLightTumbler: false,
  depthLevel: 'standard',
  placement: 'center',
  containerClass: '',
  viewBoxWidth: 0,
  viewBoxHeight: 0
})

// Unique instance ID for SVG definitions
const instanceId = Math.random().toString(36).substring(2, 9)
const globalRefId = computed(() => `global-ref-${instanceId}`)
const debossFilterId = computed(() => `laser-deboss-${instanceId}`)

/**
 * EXACT STANLEY LID COLLAR REFLECTION PROFILE (Sampled across cylinder)
 * Ultra-smooth cosine/smoothstep continuous metallic reflection curve:
 * - 0% - 15%: Soft brushed steel left ambient rim
 * - 15% - 35%: Ambient silver mid-tone
 * - 35% - 50%: Smooth core cylinder shadow trough
 * - 50% - 63%: Creamy rise to specular shoulder
 * - 63% - 67%: Specular metallic reflection peak (aligned with Stanley lid collar at ~65%)
 * - 67% - 82%: Smooth specular falloff into right shadow
 * - 82% - 93%: Deep right shadow valley
 * - 93% - 100%: Right ambient rim catch
 */
const reflectionStops = [
  { offset: '0%', color: '#626468' },
  { offset: '4%', color: '#6c6f73' },
  { offset: '8%', color: '#7b7e83' },
  { offset: '13%', color: '#919499' },
  { offset: '18%', color: '#a6a8ad' },
  { offset: '24%', color: '#9c9ea3' },
  { offset: '30%', color: '#83868b' },
  { offset: '36%', color: '#65686d' },
  { offset: '42%', color: '#505256' },
  { offset: '48%', color: '#4f5155' },
  { offset: '53%', color: '#616469' },
  { offset: '57%', color: '#8c8f95' },
  { offset: '60%', color: '#bebfc3' },
  { offset: '62.5%', color: '#e9e9ea' },
  { offset: '64%', color: '#faf9f8' },
  { offset: '65%', color: '#ffffff' },
  { offset: '66%', color: '#faf9f8' },
  { offset: '67.5%', color: '#eae9ea' },
  { offset: '70%', color: '#c1c2c6' },
  { offset: '74%', color: '#8c8e94' },
  { offset: '79%', color: '#5f6166' },
  { offset: '85%', color: '#4a4c50' },
  { offset: '91%', color: '#484a4e' },
  { offset: '96%', color: '#5e6064' },
  { offset: '100%', color: '#6e7075' }
]

const metallicGradientCss = computed(() => {
  const stopsStr = reflectionStops.map(s => `${s.color} ${s.offset}`).join(', ')
  return `linear-gradient(90deg, ${stopsStr})`
})

// Container dimensions detection for exact 1:1 SVG coordinate rendering
const containerRef = ref<HTMLElement | null>(null)
const detectedWidth = ref(191)
const detectedHeight = ref(280)
let resizeObserver: ResizeObserver | null = null

const updateDimensions = () => {
  if (containerRef.value) {
    const w = containerRef.value.clientWidth
    const h = containerRef.value.clientHeight
    if (w > 0) detectedWidth.value = Math.round(w)
    if (h > 0) detectedHeight.value = Math.round(h)
  }
}

onMounted(() => {
  updateDimensions()
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', updateDimensions)
    if (containerRef.value && 'ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(() => {
        updateDimensions()
      })
      resizeObserver.observe(containerRef.value)
    }
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', updateDimensions)
  }
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
})

watch(() => [props.viewBoxWidth, props.viewBoxHeight, props.text, props.fontClass, props.fontSizeClass, props.fontSize, props.imageSrc, props.orientation, props.placement, props.containerClass], () => {
  nextTick(updateDimensions)
})

// ViewBox coordinate system: matches container width x height
const VB_WIDTH = computed(() => props.viewBoxWidth || detectedWidth.value || 191)
const VB_HEIGHT = computed(() => props.viewBoxHeight || detectedHeight.value || 280)
const CX = computed(() => VB_WIDTH.value / 2)
const CY = computed(() => VB_HEIGHT.value / 2)

// Extract numeric font size in pixels from fontSize prop or fontSizeClass
const numericFontSize = computed(() => {
  if (props.fontSize && props.fontSize > 0) return props.fontSize
  const str = props.fontSizeClass || ''
  const isSmOrLarger = typeof window !== 'undefined' && window.innerWidth >= 640
  if (isSmOrLarger) {
    const smMatch = str.match(/sm:text-\[(\d+)px\]/)
    if (smMatch) return parseInt(smMatch[1], 10)
  }
  const match = str.match(/text-\[(\d+)px\]/)
  if (match) return parseInt(match[1], 10)
  if (str.includes('text-xs')) return 12
  if (str.includes('text-sm')) return 14
  if (str.includes('text-base')) return 16
  if (str.includes('text-lg')) return 20
  if (str.includes('text-xl')) return 24
  if (str.includes('text-2xl')) return 28
  if (str.includes('text-3xl')) return 32
  if (str.includes('text-4xl')) return 38
  if (str.includes('text-5xl')) return 48
  return 32
})

// Determine font-family and uppercase styling from fontClass
const parsedFontFamily = computed(() => {
  const fc = props.fontClass || ''
  if (fc.includes('Dancing_Script') || fc.includes('Dancing Script')) return "'Dancing Script', 'Dancing_Script', cursive"
  if (fc.includes('Space_Mono') || fc.includes('Space Mono')) return "'Space Mono', 'Space_Mono', monospace"
  if (fc.includes('Gasoek_One') || fc.includes('Gasoek One')) return "'Gasoek One', 'Gasoek_One', sans-serif"
  if (fc.includes('Caveat')) return "'Caveat', cursive"
  if (fc.includes('Cinzel')) return "'Cinzel', serif"
  if (fc.includes('Playfair_Display') || fc.includes('Playfair Display')) return "'Playfair Display', 'Playfair_Display', serif"
  if (fc.includes('Bebas_Neue') || fc.includes('Bebas Neue')) return "'Bebas Neue', 'Bebas_Neue', sans-serif"
  if (fc.includes('Great_Vibes') || fc.includes('Great Vibes')) return "'Great Vibes', 'Great_Vibes', cursive"
  if (fc.includes('Pacifico')) return "'Pacifico', cursive"
  if (fc.includes('Permanent_Marker') || fc.includes('Permanent Marker')) return "'Permanent Marker', 'Permanent_Marker', cursive"
  if (fc.includes('Righteous')) return "'Righteous', sans-serif"
  if (fc.includes('Montserrat')) return "'Montserrat', sans-serif"
  if (fc.includes('Oswald')) return "'Oswald', sans-serif"
  if (fc.includes('Abril_Fatface') || fc.includes('Abril Fatface')) return "'Abril Fatface', 'Abril_Fatface', serif"
  if (fc.includes('Alfa_Slab_One') || fc.includes('Alfa Slab One')) return "'Alfa Slab One', 'Alfa_Slab_One', serif"
  if (fc.includes('serif')) return 'Georgia, Cambria, serif'
  if (fc.includes('mono')) return 'Menlo, Monaco, Consolas, monospace'
  return "'Stanley_Favorit', sans-serif"
})

const isUppercase = computed(() => {
  const fc = props.fontClass || ''
  return fc.includes('uppercase') || fc.includes('Cinzel') || fc.includes('Bebas') || fc.includes('Oswald')
})

const parsedLetterSpacing = computed(() => {
  const fc = props.fontClass || ''
  if (fc.includes('Bebas_Neue') || fc.includes('Bebas Neue') || fc.includes('tracking-wider')) return '0.08em'
  return props.orientation === 'vertical' ? '0.08em' : '0.05em'
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

const horizontalLines = computed(() => {
  if (!displayText.value) return []
  return displayText.value.split('\n')
})

// Dynamic vertical center point adapting to top/center/bottom placement
const textCenterY = computed(() => {
  if (props.placement === 'top') {
    if (props.orientation === 'vertical') {
      const maxColLen = Math.max(...(processedVerticalLines.value.map(l => l.length) || [1]), 1)
      const estColHeight = maxColLen * (numericFontSize.value * 0.52)
      return Math.min(CY.value, Math.max(estColHeight / 2 + 4, 10))
    } else {
      const totalH = (horizontalLines.value.length || 1) * (numericFontSize.value * 1.00)
      return Math.min(CY.value, totalH / 2 + 6)
    }
  }
  if (props.placement === 'bottom') {
    if (props.orientation === 'vertical') {
      const maxColLen = Math.max(...(processedVerticalLines.value.map(l => l.length) || [1]), 1)
      const estColHeight = maxColLen * (numericFontSize.value * 0.52)
      return Math.max(CY.value, VB_HEIGHT.value - estColHeight / 2 - 4)
    } else {
      const totalH = (horizontalLines.value.length || 1) * (numericFontSize.value * 1.00)
      return Math.max(CY.value, VB_HEIGHT.value - totalH / 2 - 6)
    }
  }
  return CY.value
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
        shadowOpacity: 0.88,
        highlightDy: -0.8,
        highlightBlur: 0.5,
        highlightOpacity: 0.70,
        dropFilter: 'drop-shadow(0px -0.8px 0.5px rgba(0,0,0,0.88)) drop-shadow(0px 1.0px 0.5px rgba(255,255,255,0.55)) drop-shadow(0px 0px 0.8px rgba(0,0,0,0.4))'
      }
  }
})

// Container wrapper style for image
const imageWrapperStyle = computed(() => {
  return {
    width: '100%',
    height: '100%',
    ...(props.imageStyle || {})
  }
})

const maskPositionVal = computed(() => {
  if (props.placement === 'top') return 'center top'
  if (props.placement === 'bottom') return 'center bottom'
  return 'center center'
})

// CSS Mask Styles for PNG Graphic Base Metal Layer with Exterior Deboss Drop Shadows
const imageMaskStyle = computed(() => {
  if (!props.imageSrc) return {}
  const engravableZoneWidth = props.viewBoxWidth || detectedWidth.value || 190
  return {
    width: '100%',
    height: '100%',
    background: metallicGradientCss.value,
    backgroundSize: `${engravableZoneWidth}px 100%`,
    backgroundPosition: 'center center',
    maskImage: `url('${props.imageSrc}')`,
    WebkitMaskImage: `url('${props.imageSrc}')`,
    maskSize: 'contain',
    WebkitMaskSize: 'contain',
    maskRepeat: 'no-repeat',
    WebkitMaskRepeat: 'no-repeat',
    maskPosition: maskPositionVal.value,
    WebkitMaskPosition: maskPositionVal.value,
    imageRendering: '-webkit-optimize-contrast',
    filter: `${depthConfig.value.dropFilter} contrast(1.12) brightness(0.98)`
  }
})

// Top & Inner Shadow Mask Layer for laser deboss trench depth
const innerShadowMaskStyle = computed(() => {
  if (!props.imageSrc) return {}
  return {
    maskImage: `url('${props.imageSrc}')`,
    WebkitMaskImage: `url('${props.imageSrc}')`,
    maskSize: 'contain',
    WebkitMaskSize: 'contain',
    maskRepeat: 'no-repeat',
    WebkitMaskRepeat: 'no-repeat',
    maskPosition: maskPositionVal.value,
    WebkitMaskPosition: maskPositionVal.value,
    background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.78) 0%, rgba(0, 0, 0, 0.25) 30%, transparent 65%)'
  }
})

// Bottom Chisel Rim Highlight Layer for laser-etched edge gleam
const bottomRimMaskStyle = computed(() => {
  if (!props.imageSrc) return {}
  return {
    maskImage: `url('${props.imageSrc}')`,
    WebkitMaskImage: `url('${props.imageSrc}')`,
    maskSize: 'contain',
    WebkitMaskSize: 'contain',
    maskRepeat: 'no-repeat',
    WebkitMaskRepeat: 'no-repeat',
    maskPosition: maskPositionVal.value,
    WebkitMaskPosition: maskPositionVal.value,
    background: 'linear-gradient(0deg, rgba(255, 255, 255, 0.72) 0%, rgba(255, 255, 255, 0.18) 22%, transparent 55%)'
  }
})
</script>

<template>
  <div
    ref="containerRef"
    class="relative flex items-center justify-center select-none antialiased w-full h-full pointer-events-none"
    :class="containerClass"
  >
    <!-- SVG DEBOSS FILTER DEFINITIONS (8K Geometric Precision) -->
    <svg class="absolute w-0 h-0 pointer-events-none overflow-hidden" aria-hidden="true" shape-rendering="geometricPrecision">
      <defs>
        <!-- GLOBAL CYLINDRICAL REFLECTION GRADIENT (Pinned to Tumbler Cylinder Width) -->
        <linearGradient :id="globalRefId" gradientUnits="userSpaceOnUse" x1="0" y1="0" :x2="VB_WIDTH" y2="0">
          <stop
            v-for="(stop, idx) in reflectionStops"
            :key="idx"
            :offset="stop.offset"
            :stop-color="stop.color"
          />
        </linearGradient>

        <!-- DEBOSSED TRENCH DEPTH FILTER (High-Precision UserSpace Calculations) -->
        <filter :id="debossFilterId" x="-30%" y="-30%" width="160%" height="160%">
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

    <!-- MODE 1: PNG / SVG GRAPHIC MASK (8K Sub-Pixel Masked Graphic with Consistent Cylinder Reflection & Deboss) -->
    <div
      v-if="type === 'image' && imageSrc"
      class="relative transition-all duration-200 transform-gpu overflow-visible flex items-center justify-center will-change-transform laser-graphic-deboss"
      :style="imageWrapperStyle"
    >
      <!-- Base Metallic Brushed Steel Layer with Edge Deboss Bevel & Drop Shadow -->
      <div
        class="w-full h-full relative"
        :style="imageMaskStyle"
      >
        <!-- Inner Cavity Top Shadow (Recessed Depth) -->
        <div
          class="absolute inset-0 pointer-events-none opacity-80 mix-blend-multiply"
          :style="innerShadowMaskStyle"
        ></div>
        <!-- Bottom Rim Specular Highlight (Chisel Edge) -->
        <div
          class="absolute inset-0 pointer-events-none opacity-65 mix-blend-screen"
          :style="bottomRimMaskStyle"
        ></div>
      </div>
    </div>

    <!-- MODE 2: LIVE TEXT ENGRAVING (8K Vector Geometric Precision Typography) -->
    <svg
      v-else-if="type === 'text' && text"
      :viewBox="`0 0 ${VB_WIDTH} ${VB_HEIGHT}`"
      class="w-full h-full max-w-full max-h-full overflow-visible pointer-events-none"
      shape-rendering="geometricPrecision"
      text-rendering="geometricPrecision"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- Vertical Text: 8K Sub-pixel crisp vector text -->
      <g v-if="orientation === 'vertical'" :filter="`url(#${debossFilterId})`" class="laser-surface">
        <text
          v-for="(line, idx) in processedVerticalLines"
          :key="idx"
          :x="CX + (idx - (processedVerticalLines.length - 1) / 2) * (numericFontSize * 1.06)"
          :y="textCenterY"
          :fill="`url(#${globalRefId})`"
          text-anchor="middle"
          dominant-baseline="central"
          :font-family="parsedFontFamily"
          :font-size="numericFontSize"
          font-weight="bold"
          :letter-spacing="parsedLetterSpacing"
          shape-rendering="geometricPrecision"
          text-rendering="geometricPrecision"
          :transform="`rotate(-90 ${CX + (idx - (processedVerticalLines.length - 1) / 2) * (numericFontSize * 1.06)} ${textCenterY})`"
        >
          {{ line }}
        </text>
      </g>

      <!-- Horizontal Text: 8K Sub-pixel crisp vector text -->
      <g v-else :filter="`url(#${debossFilterId})`" class="laser-surface">
        <text
          :x="CX"
          :y="textCenterY"
          :fill="`url(#${globalRefId})`"
          text-anchor="middle"
          dominant-baseline="central"
          :font-family="parsedFontFamily"
          :font-size="numericFontSize"
          font-weight="bold"
          :letter-spacing="parsedLetterSpacing"
          shape-rendering="geometricPrecision"
          text-rendering="geometricPrecision"
        >
          <template v-if="horizontalLines.length > 1">
            <tspan
              v-for="(line, idx) in horizontalLines"
              :key="idx"
              :x="CX"
              :dy="idx === 0 ? `-${(horizontalLines.length - 1) * 0.50}em` : '1.00em'"
            >
              {{ line }}
            </tspan>
          </template>
          <template v-else>
            {{ displayText }}
          </template>
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
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>





