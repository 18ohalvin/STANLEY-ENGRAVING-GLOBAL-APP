<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { PRODUCTS, type Product, type ProductColor } from '@/data/catalog'

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
  (e: 'design-now', product: Product, color?: ProductColor): void
  (e: 'see-details', product: Product): void
}>()

const handleDesignNow = (product: Product) => {
  emit('design-now', product, product.colors[0])
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fullscreen-modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-60 bg-white flex flex-col font-['Stanley_Favorit',sans-serif] select-none overflow-hidden"
        data-node-id="5238:6689"
        data-name="Select Stanley"
      >
        <!-- 1. Sticky Header with Title and Close Button (Figma Node 5654:1954 - 60% Opacity Overlay) -->
        <header class="sticky top-0 z-20 bg-white/60 backdrop-blur-md px-[16px] py-[18px] flex items-center justify-between border-b border-neutral-100/60 flex-none">
          <div class="flex flex-col font-['Stanley_Favorit',sans-serif] font-medium text-[20px] text-black tracking-[-0.6px]">
            <h1 class="leading-none">{{ mode === 'swap' ? 'Choose your Stanley.' : 'Explore the lineup.' }}</h1>
          </div>

          <!-- Circular Close Button matching Figma Node 5654:1959 with Desktop hover rotate & scale -->
          <button
            @click="emit('close')"
            class="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 hover:rotate-90 active:scale-90 text-neutral-800 hover:text-black flex items-center justify-center transition-all duration-200 transform-gpu cursor-pointer"
            aria-label="Close lineup modal"
          >
            <X :size="18" :stroke-width="2" />
          </button>
        </header>

        <!-- 2. Scrollable 2-Column Product Grid (Figma Node 5238:7515) -->
        <main class="flex-1 overflow-y-auto overscroll-contain px-[16px] pt-5 pb-16">
          <div class="grid grid-cols-2 gap-x-[14px] gap-y-[28px] max-w-[430px] mx-auto">
            <div
              v-for="product in PRODUCTS"
              :key="product.id"
              class="flex flex-col gap-3 group select-none transition-all duration-300 transform-gpu will-change-transform hover:-translate-y-1"
            >
              <!-- 2.1 Product Image Card (Unclickable thumbnail, access via Design Now) -->
              <div
                class="relative aspect-[300/400] w-full rounded-[7px] overflow-hidden shadow-xs group-hover:shadow-md transition-all duration-300 flex items-center justify-center p-2.5"
                :style="{
                  background: `linear-gradient(to bottom, ${product.gradientFrom}, ${product.gradientTo})`
                }"
              >
                <!-- Clean Tumbler PNG without floor shadow + smooth zoom -->
                <img
                  :src="product.defaultImage"
                  :alt="product.name"
                  class="w-full h-full object-contain p-1 transition-transform duration-500 ease-out transform-gpu will-change-transform group-hover:scale-105 pointer-events-none select-none"
                />
              </div>

              <!-- 2.2 Color Swatches Row (Figma: static dots bar) -->
              <div class="h-5 flex items-center justify-start gap-1.5 overflow-hidden px-0.5 select-none pointer-events-none">
                <div
                  v-for="col in product.colors.slice(0, 7)"
                  :key="col.name"
                  class="w-3.5 h-3.5 rounded-full flex-none border border-black/10 transition-transform duration-200"
                  :style="{ backgroundColor: col.hex }"
                  :title="col.name"
                ></div>
              </div>

              <!-- 2.3 Product Info (Figma: Name, Description, Price) -->
              <div class="flex flex-col gap-1 text-black select-none">
                <h3
                  class="font-bold text-[13px] sm:text-[14px] leading-tight line-clamp-2 min-h-[34px] transition-colors duration-150"
                >
                  {{ product.name }}
                </h3>

                <p class="font-light text-[11px] sm:text-[12px] text-neutral-600 leading-snug line-clamp-2 min-h-[30px]">
                  {{ product.description }}
                </p>

                <div class="font-light text-[12px] text-black mt-0.5">
                  {{ product.priceFormatted }}
                </div>
              </div>

              <!-- 2.4 Actions: Design Now CTA Button + See Details Link (Figma Node 5238:7533) -->
              <div class="flex items-center justify-between gap-2 mt-auto pt-1">
                <button
                  @click="handleDesignNow(product)"
                  class="flex-1 h-[36px] border border-black bg-transparent hover:bg-black text-black hover:text-white rounded-[4px] font-bold text-[11px] tracking-normal transition-all duration-200 cursor-pointer flex items-center justify-center shadow-2xs hover:shadow-xs active:scale-95 btn-shimmer transform-gpu select-none"
                >
                  {{ mode === 'swap' ? 'Swap' : 'Design Now' }}
                </button>

                <button
                  @click="emit('see-details', product)"
                  class="text-neutral-800 hover:text-black font-normal text-[11px] underline underline-offset-2 decoration-neutral-300 hover:decoration-black active:scale-95 transition-all duration-150 cursor-pointer select-none px-1 text-center"
                >
                  See Details
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Smooth full-screen slide transition */
.fullscreen-modal-enter-active,
.fullscreen-modal-leave-active {
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.fullscreen-modal-enter-from,
.fullscreen-modal-leave-to {
  transform: translateY(100%);
  opacity: 0.5;
}

.fullscreen-modal-enter-to,
.fullscreen-modal-leave-from {
  transform: translateY(0);
  opacity: 1;
}
</style>
