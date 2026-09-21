<script setup lang="ts">
import { ref } from 'vue'
import { X, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { PRODUCTS, type Product, type ProductColor } from '@/data/catalog'
import ProductCard from '@/components/landing/ProductCard.vue'

const props = withDefaults(
  defineProps<{
    isOpen: boolean
    mode?: 'explore' | 'swap'
  }>(),
  {
    mode: 'explore'
  }
)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'design-now', product: Product, color: ProductColor): void
  (e: 'see-details', product: Product): void
}>()

const scrollContainer = ref<HTMLDivElement | null>(null)

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
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in select-none"
      @click.self="emit('close')"
    >
      <div
        class="bg-white rounded-2xl w-full max-w-[1360px] max-h-[90vh] overflow-hidden shadow-2xl relative flex flex-col py-[40px] animate-scale-up border border-neutral-100"
      >
        <!-- Modal Header (40px horizontal padding) -->
        <div class="flex items-center justify-between mb-6 px-[40px] flex-none">
          <h2 class="font-['Stanley_Favorit',sans-serif] font-medium text-[24px] text-black tracking-[-0.72px] leading-tight">
            {{ mode === 'swap' ? 'Choose your Stanley.' : 'Explore the lineup.' }}
          </h2>

          <div class="flex items-center gap-3">
            <!-- Modal Slider Arrow Controls -->
            <div class="hidden sm:flex items-center gap-2 mr-2">
              <button
                @click="scroll('left')"
                class="w-9 h-9 rounded-full border border-neutral-200 hover:border-black flex items-center justify-center transition-colors cursor-pointer bg-white text-neutral-700 hover:text-black shadow-2xs active:scale-95"
                aria-label="Scroll left"
              >
                <ChevronLeft :size="16" />
              </button>
              <button
                @click="scroll('right')"
                class="w-9 h-9 rounded-full border border-neutral-200 hover:border-black flex items-center justify-center transition-colors cursor-pointer bg-white text-neutral-700 hover:text-black shadow-2xs active:scale-95"
                aria-label="Scroll right"
              >
                <ChevronRight :size="16" />
              </button>
            </div>

            <!-- Close Button -->
            <button
              @click="emit('close')"
              class="w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-800 hover:text-black transition-all cursor-pointer hover:scale-105 active:scale-95"
              aria-label="Close modal"
            >
              <X :size="18" stroke-width="2" />
            </button>
          </div>
        </div>

        <!-- Products Horizontal Slider (Container with 40px padding and scroll-padding for snap scrolling) -->
        <div
          ref="scrollContainer"
          class="w-full px-[40px] scroll-pl-[40px] scroll-pr-[40px] flex gap-8 overflow-x-auto no-scrollbar pt-1 pb-2 snap-x snap-mandatory scroll-smooth flex-1 items-start"
        >
          <ProductCard
            v-for="product in PRODUCTS"
            :key="`modal-${product.id}`"
            :product="product"
            :cta-text="mode === 'swap' ? 'Swap' : 'Design Now'"
            class="snap-start flex-none"
            @design-now="(prod, col) => emit('design-now', prod, col)"
            @see-details="(prod) => emit('see-details', prod)"
          />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleUp {
  from { transform: scale(0.96); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.animate-fade-in {
  animation: fadeIn 0.25s ease-out;
}

.animate-scale-up {
  animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
</style>
