<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { PRODUCTS, type Product, type ProductColor } from '@/data/catalog'
import ProductCard from './ProductCard.vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

const emit = defineEmits<{
  (e: 'design-now', product: Product, color: ProductColor): void
  (e: 'see-details', product: Product): void
}>()

const activeCategory = ref('ALL')
const scrollContainer = ref<HTMLDivElement | null>(null)
const headerContainer = ref<HTMLDivElement | null>(null)
const titleRef = ref<HTMLHeadingElement | null>(null)

const getInitialPadding = () => {
  if (typeof window === 'undefined') return '24px'
  const w = window.innerWidth
  if (w > 1440) return `${(w - 1440) / 2 + 24}px`
  if (w >= 640) return '24px'
  return '16px'
}

const leftPadding = ref(getInitialPadding())
const canScrollLeft = ref(false)
const canScrollRight = ref(true)

const updatePadding = () => {
  if (titleRef.value) {
    const rect = titleRef.value.getBoundingClientRect()
    if (rect.left > 0) {
      leftPadding.value = `${Math.round(rect.left)}px`
      return
    }
  }
  if (headerContainer.value) {
    const rect = headerContainer.value.getBoundingClientRect()
    const style = window.getComputedStyle(headerContainer.value)
    const pl = parseFloat(style.paddingLeft) || (window.innerWidth >= 640 ? 24 : 16)
    const totalLeft = rect.left + pl
    if (totalLeft > 0) {
      leftPadding.value = `${Math.round(totalLeft)}px`
      return
    }
  }
  const w = window.innerWidth
  leftPadding.value = w > 1440 ? `${(w - 1440) / 2 + 24}px` : (w >= 640 ? '24px' : '16px')
}

const categories = [
  { id: 'ALL', label: 'All Silhouettes' },
  { id: 'QUENCHER', label: 'Quenchers' },
  { id: 'ICEFLOW', label: 'IceFlow™' },
  { id: 'MUGS', label: 'Camp Mugs & Travel' },
]

const filteredProducts = computed(() => {
  if (activeCategory.value === 'ALL') return PRODUCTS
  if (activeCategory.value === 'QUENCHER') {
    return PRODUCTS.filter(p => p.id.includes('quencher'))
  }
  if (activeCategory.value === 'ICEFLOW') {
    return PRODUCTS.filter(p => p.id.includes('iceflow'))
  }
  if (activeCategory.value === 'MUGS') {
    return PRODUCTS.filter(p => p.id.includes('mug'))
  }
  return PRODUCTS
})

const checkScroll = () => {
  if (!scrollContainer.value) return
  const { scrollLeft, scrollWidth, clientWidth } = scrollContainer.value
  canScrollLeft.value = scrollLeft > 8
  canScrollRight.value = scrollLeft < scrollWidth - clientWidth - 8
}

const scroll = (direction: 'left' | 'right') => {
  if (!scrollContainer.value) return
  // Scroll by 2 card steps (2 * 232px = 464px)
  const scrollAmount = 464
  scrollContainer.value.scrollBy({
    left: direction === 'left' ? -scrollAmount : scrollAmount,
    behavior: 'smooth',
  })
  setTimeout(checkScroll, 350)
}

const selectCategory = (catId: string) => {
  activeCategory.value = catId
  nextTick(() => {
    if (scrollContainer.value) {
      scrollContainer.value.scrollLeft = 0
      setTimeout(checkScroll, 100)
    }
  })
}

watch(activeCategory, () => {
  nextTick(() => {
    setTimeout(checkScroll, 100)
  })
})

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  updatePadding()
  window.addEventListener('resize', updatePadding)
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      updatePadding()
    })
    resizeObserver.observe(document.body)
  }
  nextTick(() => {
    updatePadding()
    if (scrollContainer.value) {
      scrollContainer.value.scrollLeft = 0
    }
    setTimeout(checkScroll, 150)
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', updatePadding)
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})
</script>

<template>
  <section id="lineup-section" class="w-full py-10 overflow-hidden">
    <!-- Header with Title & Filters (Anchored to Global 1440px Container) -->
    <div
      ref="headerContainer"
      class="w-full max-w-[1440px] mx-auto px-4 sm:px-6 xl:px-[24px] flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 scroll-reveal"
    >
      <div>
        <h2
          ref="titleRef"
          class="font-['Stanley_Favorit',sans-serif] font-medium text-2xl sm:text-3xl lg:text-[32px] text-black tracking-[-0.96px]"
        >
          Explore the lineup.
        </h2>
      </div>

      <!-- Category Filter Pills & Arrows -->
      <div class="flex items-center gap-3">
        <!-- Category Filter Pills -->
        <div class="flex items-center gap-1.5 bg-neutral-100 p-1 rounded-xl">
          <button
            v-for="cat in categories"
            :key="cat.id"
            @click="selectCategory(cat.id)"
            class="px-3.5 py-1.5 rounded-lg text-[13px] font-['Stanley_Favorit',sans-serif] transition-all cursor-pointer"
            :class="[
              activeCategory === cat.id
                ? 'bg-white text-black font-bold shadow-2xs'
                : 'text-neutral-600 hover:text-black font-medium'
            ]"
          >
            {{ cat.label }}
          </button>
        </div>

        <!-- Button Navigation Arrows -->
        <div class="flex items-center gap-1.5 ml-2">
          <button
            @click="scroll('left')"
            :disabled="!canScrollLeft"
            class="w-10 h-10 rounded-full border border-neutral-300 hover:border-black flex items-center justify-center transition-colors cursor-pointer bg-white text-neutral-800 hover:text-black disabled:opacity-30 disabled:hover:border-neutral-300 disabled:cursor-not-allowed shadow-2xs"
            aria-label="Scroll lineup left"
          >
            <ChevronLeft :size="18" />
          </button>
          <button
            @click="scroll('right')"
            :disabled="!canScrollRight"
            class="w-10 h-10 rounded-full border border-neutral-300 hover:border-black flex items-center justify-center transition-colors cursor-pointer bg-white text-neutral-800 hover:text-black disabled:opacity-30 disabled:hover:border-neutral-300 disabled:cursor-not-allowed shadow-2xs"
            aria-label="Scroll lineup right"
          >
            <ChevronRight :size="18" />
          </button>
        </div>
      </div>
    </div>

    <!-- Product Lineup Horizontal Carousel: Left edge matches header, right edge bleeds full width -->
    <div
      ref="scrollContainer"
      @scroll.passive="checkScroll"
      class="w-full flex gap-8 overflow-x-auto no-scrollbar pb-8 pt-2 snap-x snap-proximity scroll-smooth scroll-reveal-scale delay-150"
      :style="{
        paddingLeft: leftPadding,
        scrollPaddingLeft: leftPadding
      }"
    >
      <ProductCard
        v-for="(product, pIdx) in filteredProducts"
        :key="product.id"
        :product="product"
        class="snap-start transition-transform duration-300 hover:-translate-y-1"
        @design-now="(prod, col) => emit('design-now', prod, col)"
        @see-details="(prod) => emit('see-details', prod)"
      />
      <!-- Trailing spacer so rightmost card aligns with the header on full scroll -->
      <div
        class="flex-none h-full pointer-events-none aria-hidden"
        :style="{ width: leftPadding }"
      ></div>
    </div>
  </section>
</template>
