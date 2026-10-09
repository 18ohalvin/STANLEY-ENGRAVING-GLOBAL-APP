<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Product, ProductColor } from '@/data/catalog'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    product: Product
    ctaText?: string
  }>(),
  {
    ctaText: 'Design Now'
  }
)

const emit = defineEmits<{
  (e: 'design-now', product: Product, color: ProductColor): void
  (e: 'see-details', product: Product): void
}>()

const selectedColorIndex = ref(0)
const swatchContainer = ref<HTMLDivElement | null>(null)

// 7 colors fit comfortably across 200px (7 * 16px + 6 * 8px = 160px)
const MAX_NATURAL_COLORS = 7
const needsScroll = computed(() => props.product.colors.length > MAX_NATURAL_COLORS)

const selectColor = (index: number) => {
  selectedColorIndex.value = index
  if (needsScroll.value) {
    const dot = swatchContainer.value?.children[index] as HTMLElement
    if (dot) {
      dot.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }
}

const scrollSwatches = (direction: 'left' | 'right') => {
  if (!swatchContainer.value) return
  const scrollAmount = 50
  swatchContainer.value.scrollBy({
    left: direction === 'left' ? -scrollAmount : scrollAmount,
    behavior: 'smooth',
  })

  // Also step to next/prev color for responsive tactile feedback
  if (direction === 'right' && selectedColorIndex.value < props.product.colors.length - 1) {
    selectedColorIndex.value++
  } else if (direction === 'left' && selectedColorIndex.value > 0) {
    selectedColorIndex.value--
  }
}

const activeImage = computed(() => {
  const col = props.product.colors[selectedColorIndex.value]
  return col?.image || props.product.defaultImage
})

const handleDesignNow = () => {
  emit('design-now', props.product, props.product.colors[selectedColorIndex.value])
}
</script>

<template>
  <div class="flex-none w-[200px] flex flex-col gap-3.5 select-none group">
    <!-- Product Image Container with Gradient Background (Figma: 200px x 267px) -->
    <div
      @click="emit('see-details', product)"
      class="relative w-[200px] h-[267px] rounded-lg overflow-hidden cursor-pointer transition-all duration-300 group-hover:shadow-md flex-none"
      :style="{
        background: `linear-gradient(to bottom, ${product.gradientFrom}, ${product.gradientTo})`
      }"
    >
      <!-- Tumbler Image -->
      <img
        :src="activeImage"
        :alt="product.name"
        @error="($event.target as HTMLImageElement).src = product.defaultImage"
        class="w-full h-full object-contain p-3 transition-transform duration-500 ease-out transform-gpu will-change-transform group-hover:scale-105"
      />
    </div>

    <!-- Color Swatches Bar (Static visual row - unclickable, no O-ring) -->
    <div class="w-[200px] h-7 flex items-center justify-start gap-2 overflow-hidden py-1 px-1 select-none pointer-events-none flex-none">
      <div
        v-for="col in product.colors.slice(0, 7)"
        :key="col.name"
        :title="col.name"
        class="w-4 h-4 rounded-full flex-none"
        :style="{ backgroundColor: col.hex }"
      ></div>
    </div>

    <!-- Product Details (Typography matching Figma: Bold 16px, Light 14px) -->
    <div class="flex flex-col gap-2 text-black flex-none">
      <h3
        @click="emit('see-details', product)"
        class="font-['Stanley_Favorit',sans-serif] font-bold text-[15px] sm:text-[16px] leading-snug cursor-pointer hover:underline line-clamp-2 min-h-[42px]"
      >
        {{ product.name }}
      </h3>

      <p class="font-['Stanley_Favorit',sans-serif] font-light text-[13px] text-neutral-600 leading-snug line-clamp-2 min-h-[34px]">
        {{ product.description }}
      </p>

      <div class="font-['Stanley_Favorit',sans-serif] font-light text-[14px] text-black">
        {{ product.priceFormatted }}
      </div>
    </div>

    <!-- Product Actions (Figma specs: CTA Button 107px x 48px, Stanley Favorit Medium Standard Case) -->
    <div class="flex items-center justify-between w-[200px] mt-auto pt-1 flex-none">
      <button
        @click="handleDesignNow"
        class="w-[107px] h-12 border border-black bg-transparent hover:bg-black text-black hover:text-white rounded-[4px] font-['Stanley_Favorit',sans-serif] font-medium text-[12px] tracking-normal transition-all duration-200 cursor-pointer flex items-center justify-center shadow-2xs hover:shadow-md select-none"
      >
        {{ ctaText }}
      </button>

      <button
        @click="emit('see-details', product)"
        class="flex-1 text-center font-['Stanley_Favorit',sans-serif] font-normal text-[12px] text-neutral-800 hover:text-black underline underline-offset-2 decoration-neutral-300 hover:decoration-black transition-colors cursor-pointer select-none"
      >
        See Details
      </button>
    </div>
  </div>
</template>
