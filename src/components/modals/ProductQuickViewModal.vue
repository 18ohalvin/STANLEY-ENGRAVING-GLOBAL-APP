<script setup lang="ts">
import { ref, watch } from 'vue'
import { X, ShieldCheck, Thermometer, Sparkles, Check } from 'lucide-vue-next'
import type { Product, ProductColor } from '@/data/catalog'

const props = defineProps<{
  product: Product | null
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'customize', product: Product, color: ProductColor): void
}>()

const selectedColorIndex = ref(0)

watch(
  () => props.product,
  () => {
    selectedColorIndex.value = 0
  }
)

const handleCustomize = () => {
  if (!props.product) return
  emit('customize', props.product, props.product.colors[selectedColorIndex.value])
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen && product"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in"
      @click.self="emit('close')"
    >
      <div class="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col md:flex-row overflow-hidden">
        <!-- Close Button -->
        <button
          @click="emit('close')"
          class="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-black transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X :size="20" />
        </button>

        <!-- Left Column: Visual Tumbler Render -->
        <div
          class="w-full md:w-1/2 p-8 flex items-center justify-center relative min-h-[320px] md:min-h-[460px]"
          :style="{
            background: `linear-gradient(to bottom, ${product.gradientFrom}, ${product.gradientTo})`
          }"
        >
          <img
            :src="product.defaultImage"
            :alt="product.name"
            class="max-h-[360px] w-auto object-contain drop-shadow-xl transition-transform duration-300 hover:scale-105"
          />

          <div class="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-xs font-['Stanley_Favorit',sans-serif] text-white">
            Color: {{ product.colors[selectedColorIndex]?.name }}
          </div>
        </div>

        <!-- Right Column: Specs & Customization Details -->
        <div class="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div>
            <div class="inline-block px-2.5 py-0.5 bg-neutral-100 text-neutral-800 text-[11px] font-['Stanley_Favorit',sans-serif] font-bold uppercase tracking-wider rounded mb-2">
              Laser Engraving Ready
            </div>

            <h3 class="font-['Stanley_Favorit',sans-serif] font-bold text-2xl text-black leading-tight mb-2">
              {{ product.name }}
            </h3>

            <p class="font-['Stanley_Favorit',sans-serif] font-light text-sm text-neutral-600 mb-4 leading-relaxed">
              {{ product.description }}
            </p>

            <div class="font-['Stanley_Favorit',sans-serif] font-bold text-xl text-black mb-6">
              {{ product.priceFormatted }}
            </div>

            <!-- Color Palette Selector -->
            <div class="mb-6">
              <label class="block text-xs font-['Stanley_Favorit',sans-serif] font-bold uppercase tracking-wider text-neutral-600 mb-2">
                Select Finish ({{ product.colors.length }} Colors)
              </label>
              <div class="flex flex-wrap gap-2.5">
                <button
                  v-for="(col, idx) in product.colors"
                  :key="col.name"
                  @click="selectedColorIndex = idx"
                  :title="col.name"
                  class="w-6 h-6 rounded-full cursor-pointer transition-transform relative flex items-center justify-center"
                  :style="{ backgroundColor: col.hex }"
                >
                  <Check
                    v-if="selectedColorIndex === idx"
                    :size="12"
                    class="text-white drop-shadow-sm"
                  />
                  <span
                    v-if="selectedColorIndex === idx"
                    class="absolute -inset-1 rounded-full border-2 border-black pointer-events-none"
                  ></span>
                </button>
              </div>
            </div>

            <!-- Key Features -->
            <div class="space-y-2.5 border-t border-neutral-100 pt-4 text-xs font-['Stanley_Favorit',sans-serif] text-neutral-700">
              <div class="flex items-center gap-2">
                <Thermometer :size="16" class="text-neutral-900" />
                <span>11 Hours Cold • 48 Hours Iced • 7 Hours Hot</span>
              </div>
              <div class="flex items-center gap-2">
                <ShieldCheck :size="16" class="text-neutral-900" />
                <span>18/8 Recycled Stainless Steel • BPA Free</span>
              </div>
              <div class="flex items-center gap-2">
                <Sparkles :size="16" class="text-neutral-900" />
                <span>High-Precision Fiber Laser Etch Finish</span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="pt-4 border-t border-neutral-100 flex items-center gap-3">
            <button
              @click="handleCustomize"
              class="w-full bg-black hover:bg-neutral-800 text-white font-['Stanley_Favorit',sans-serif] font-bold text-sm py-3.5 px-6 rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Design Now with Laser Engraving</span>
              <svg class="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 3L11 8L6 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
