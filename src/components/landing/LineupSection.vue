<script setup lang="ts">
import { ref, computed } from 'vue'
import { PRODUCTS, type Product, type ProductColor } from '@/data/catalog'
import ProductCard from './ProductCard.vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

const emit = defineEmits<{
  (e: 'design-now', product: Product, color: ProductColor): void
  (e: 'see-details', product: Product): void
}>()

const activeCategory = ref('ALL')
const scrollContainer = ref<HTMLDivElement | null>(null)

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

const scroll = (direction: 'left' | 'right') => {
  if (!scrollContainer.value) return
  const scrollAmount = 460
  scrollContainer.value.scrollBy({
    left: direction === 'left' ? -scrollAmount : scrollAmount,
    behavior: 'smooth',
  })
}
</script>

<template>
  <section id="lineup-section" class="w-full max-w-[1512px] mx-auto py-10">
    <!-- Header with Title & Filters -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 px-4 sm:px-10">
      <div>
        <h2 class="font-['Stanley_Favorit',sans-serif] font-medium text-2xl sm:text-3xl lg:text-[32px] text-black tracking-[-0.96px]">
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
            @click="activeCategory = cat.id"
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

        <!-- Slider Arrows -->
        <div class="hidden lg:flex items-center gap-1.5 ml-2">
          <button
            @click="scroll('left')"
            class="w-10 h-10 rounded-full border border-neutral-300 hover:border-black flex items-center justify-center transition-colors cursor-pointer bg-white text-neutral-800 hover:text-black shadow-2xs"
            aria-label="Scroll lineup left"
          >
            <ChevronLeft :size="18" />
          </button>
          <button
            @click="scroll('right')"
            class="w-10 h-10 rounded-full border border-neutral-300 hover:border-black flex items-center justify-center transition-colors cursor-pointer bg-white text-neutral-800 hover:text-black shadow-2xs"
            aria-label="Scroll lineup right"
          >
            <ChevronRight :size="18" />
          </button>
        </div>
      </div>
    </div>

    <!-- Product Lineup Horizontal Carousel / Grid (Figma: gap-8 / 32px) -->
    <div
      ref="scrollContainer"
      class="flex gap-8 overflow-x-auto no-scrollbar pb-8 pt-2 snap-x snap-mandatory scroll-smooth px-4 sm:px-10"
    >
      <ProductCard
        v-for="product in filteredProducts"
        :key="product.id"
        :product="product"
        class="snap-start"
        @design-now="(prod, col) => emit('design-now', prod, col)"
        @see-details="(prod) => emit('see-details', prod)"
      />
    </div>
  </section>
</template>
