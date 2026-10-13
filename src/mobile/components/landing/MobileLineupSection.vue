<script setup lang="ts">
import { ref, computed } from 'vue'
import { PRODUCTS, type Product, type ProductColor } from '@/data/catalog'
import MobileProductCard from './MobileProductCard.vue'

const emit = defineEmits<{
  (e: 'design-now', product: Product, color: ProductColor): void
  (e: 'see-details', product: Product): void
}>()

const activeCategory = ref('ALL')

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
</script>

<template>
  <!-- Mobile Explore The Line-up Section (Matching Desktop Mechanism & Figma) -->
  <div id="mobile-lineup-section" class="flex flex-col gap-[20px] items-start relative shrink-0 w-full scroll-mt-4" data-node-id="5217:1996">
    <!-- Section Title (Figma Node 5217:1997) with Scroll Reveal -->
    <div class="px-[16px] w-full flex flex-col font-['Stanley_Favorit',sans-serif] font-medium h-[24px] justify-center text-[20px] text-black tracking-[-0.6px] scroll-reveal" data-node-id="5217:1997">
      <h2 class="leading-none">Explore The Line-up</h2>
    </div>

    <!-- Category Filter Pills (Desktop-matched silhouette filter with smooth transition & tactile feedback) -->
    <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full py-0.5 px-[16px] scroll-reveal delay-100">
      <button
        v-for="cat in categories"
        :key="cat.id"
        @click="activeCategory = cat.id"
        class="px-3 py-1.5 rounded-lg text-[12px] font-['Stanley_Favorit',sans-serif] transition-all duration-200 cursor-pointer shrink-0 active:scale-95 transform-gpu"
        :class="[
          activeCategory === cat.id
            ? 'bg-black text-white font-bold shadow-xs'
            : 'bg-neutral-100 text-neutral-600 hover:text-black hover:bg-neutral-200 font-medium'
        ]"
      >
        {{ cat.label }}
      </button>
    </div>

    <!-- Product List Section (gap-[16px] overflow-x-auto) -->
    <div class="flex gap-[16px] items-start relative shrink-0 w-full overflow-x-auto no-scrollbar scroll-smooth px-[16px] pb-6 scroll-reveal-scale delay-200" data-node-id="5217:1998">
      <MobileProductCard
        v-for="product in filteredProducts"
        :key="product.id"
        :product="product"
        @design-now="(p, c) => emit('design-now', p, c)"
        @see-details="(p) => emit('see-details', p)"
      />
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
