<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { X, ShieldCheck, Thermometer, Sparkles } from 'lucide-vue-next'
import type { Product, ProductColor } from '@/data/catalog'

const props = defineProps<{
  product: Product | null
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'customize', product: Product, color?: ProductColor): void
}>()

const selectedColorIndex = ref(0)

watch(
  () => props.product,
  () => {
    selectedColorIndex.value = 0
  }
)

const activeColor = computed(() => {
  if (!props.product) return undefined
  return props.product.colors[selectedColorIndex.value] || props.product.colors[0]
})

const activeImage = computed(() => {
  return activeColor.value?.image || props.product?.defaultImage
})

const handleCustomize = () => {
  if (!props.product) return
  emit('customize', props.product, activeColor.value)
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen && product"
      class="fixed inset-0 z-50 flex items-end bg-black/60 backdrop-blur-xs select-none animate-fade-in"
      @click.self="emit('close')"
    >
      <div class="w-full max-h-[90vh] bg-white rounded-t-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up">
        <!-- Sheet Header -->
        <div class="px-5 py-3.5 flex items-center justify-between border-b border-neutral-100 flex-none">
          <span class="text-xs font-mono uppercase tracking-wider text-neutral-500">Quick Preview</span>
          <button
            @click="emit('close')"
            class="w-8 h-8 rounded-full flex items-center justify-center text-neutral-500 hover:text-black hover:bg-neutral-100 hover:rotate-90 active:scale-90 transition-all duration-200 transform-gpu cursor-pointer"
          >
            <X :size="18" />
          </button>
        </div>

        <!-- Sheet Body (Scrollable) -->
        <div class="flex-1 overflow-y-auto p-5 space-y-5">
          <!-- Tumbler Render with Gradient Backdrop & Zoom -->
          <div
            class="w-full h-64 rounded-xl flex items-center justify-center p-4 relative overflow-hidden group"
            :style="{
              background: `linear-gradient(to bottom, ${product.gradientFrom || '#cbd6e2'}, ${product.gradientTo || '#f0f0f0'})`
            }"
          >
            <img
              :src="activeImage"
              :alt="product.name"
              class="h-full w-auto object-contain drop-shadow-lg transition-transform duration-500 ease-out transform-gpu group-hover:scale-105 group-active:scale-105"
            />
            <span
              v-if="product.badge"
              class="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-[11px] font-bold px-2.5 py-1 rounded-full text-black shadow-xs animate-pop-in"
            >
              {{ product.badge }}
            </span>
          </div>

          <!-- Title & Price -->
          <div>
            <h3 class="text-xl font-bold text-black leading-tight">
              {{ product.name }}
            </h3>
            <p class="text-xs text-neutral-500 mt-1">
              {{ product.description }}
            </p>
            <div class="text-lg font-bold text-black mt-2">
              {{ product.priceFormatted }}
            </div>
          </div>

          <!-- Color Swatch Selector with smooth scaling -->
          <div class="space-y-2">
            <div class="flex justify-between text-xs font-medium">
              <span class="text-neutral-500">Color:</span>
              <span class="text-black font-semibold">{{ activeColor?.name }}</span>
            </div>
            <div class="flex items-center gap-2.5 overflow-x-auto py-1">
              <button
                v-for="(color, index) in product.colors"
                :key="color.name + index"
                @click="selectedColorIndex = index"
                class="w-7 h-7 rounded-full flex-none transition-all duration-200 relative transform-gpu hover:scale-110 active:scale-125 cursor-pointer"
                :class="selectedColorIndex === index ? 'ring-2 ring-black ring-offset-2 scale-110' : 'opacity-80 hover:opacity-100'"
                :style="{ backgroundColor: color.hex }"
                :aria-label="color.name"
              ></button>
            </div>
          </div>

          <!-- Highlights & Features -->
          <div class="grid grid-cols-3 gap-2.5 pt-2 border-t border-neutral-100 text-center">
            <div class="p-2.5 bg-neutral-50 rounded-lg flex flex-col items-center gap-1 transition-transform hover:scale-[1.02]">
              <Thermometer :size="16" class="text-neutral-700" />
              <span class="text-[10px] text-neutral-500">Thermal Retention</span>
              <span class="text-[11px] font-bold text-neutral-800">Hot 7h • Cold 11h</span>
            </div>
            <div class="p-2.5 bg-neutral-50 rounded-lg flex flex-col items-center gap-1 transition-transform hover:scale-[1.02]">
              <ShieldCheck :size="16" class="text-neutral-700" />
              <span class="text-[10px] text-neutral-500">Steel Standard</span>
              <span class="text-[11px] font-bold text-neutral-800">90% Recycled 18/8</span>
            </div>
            <div class="p-2.5 bg-neutral-50 rounded-lg flex flex-col items-center gap-1 transition-transform hover:scale-[1.02]">
              <Sparkles :size="16" class="text-neutral-700" />
              <span class="text-[10px] text-neutral-500">Laser Precision</span>
              <span class="text-[11px] font-bold text-neutral-800">0.05mm Beam</span>
            </div>
          </div>
        </div>

        <!-- Fixed Bottom CTA with btn-shimmer -->
        <div class="p-4 bg-white border-t border-neutral-200 flex-none">
          <button
            @click="handleCustomize"
            class="w-full py-3.5 bg-black text-white font-bold text-sm rounded-lg hover:bg-neutral-800 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-xl cursor-pointer btn-shimmer transform-gpu"
          >
            <span>Customize This Tumbler</span>
            <span class="transition-transform group-hover:translate-x-1">&rarr;</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-slide-up {
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.animate-fade-in {
  animation: fadeIn 0.25s ease-out;
}
</style>
