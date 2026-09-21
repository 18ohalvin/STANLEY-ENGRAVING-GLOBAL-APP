<script setup lang="ts">
import { ref } from 'vue'
import { INSPIRATION_CARDS, type InspirationCard } from '@/data/catalog'
import { Plus, ChevronLeft, ChevronRight } from 'lucide-vue-next'

const emit = defineEmits<{
  (e: 'select-card', card: InspirationCard): void
}>()

const scrollContainer = ref<HTMLDivElement | null>(null)

const scroll = (direction: 'left' | 'right') => {
  if (!scrollContainer.value) return
  const scrollAmount = 360
  scrollContainer.value.scrollBy({
    left: direction === 'left' ? -scrollAmount : scrollAmount,
    behavior: 'smooth',
  })
}
</script>

<template>
  <section class="w-full max-w-[1512px] mx-auto py-8">
    <!-- Header with Section Title and Navigation Controls -->
    <div class="flex items-center justify-between mb-6 px-4 sm:px-10">
      <div>
        <h2 class="font-['Stanley_Favorit',sans-serif] font-medium text-2xl sm:text-3xl lg:text-[32px] text-black tracking-[-0.96px]">
          Get to know more.
        </h2>
      </div>

      <!-- Arrow Controls -->
      <div class="hidden sm:flex items-center gap-2">
        <button
          @click="scroll('left')"
          class="w-10 h-10 rounded-full border border-neutral-300 hover:border-black flex items-center justify-center transition-colors cursor-pointer bg-white text-neutral-800 hover:text-black shadow-2xs"
          aria-label="Scroll left"
        >
          <ChevronLeft :size="18" />
        </button>
        <button
          @click="scroll('right')"
          class="w-10 h-10 rounded-full border border-neutral-300 hover:border-black flex items-center justify-center transition-colors cursor-pointer bg-white text-neutral-800 hover:text-black shadow-2xs"
          aria-label="Scroll right"
        >
          <ChevronRight :size="18" />
        </button>
      </div>
    </div>

    <!-- Product Options / Inspiration Cards Container (Padding adjusted to prevent shadow-xl clipping) -->
    <div
      ref="scrollContainer"
      class="flex gap-6 overflow-x-auto no-scrollbar pt-3 pb-8 -mb-4 snap-x snap-mandatory scroll-smooth px-4 sm:px-10"
    >
      <div
        v-for="card in INSPIRATION_CARDS"
        :key="card.id"
        @click="emit('select-card', card)"
        class="flex-none w-[280px] sm:w-[320px] h-[400px] sm:h-[427px] rounded-2xl overflow-hidden relative cursor-pointer group snap-start transition-all duration-300 transform-gpu will-change-transform hover:-translate-y-1.5 hover:shadow-xl select-none"
        :style="{ backgroundColor: card.bgColor || '#fafafa' }"
      >
        <!-- Background Imagery -->
        <img
          :src="card.image"
          :alt="`${card.titleLine1} ${card.titleLine2}`"
          class="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-out transform-gpu will-change-transform group-hover:scale-105"
        />

        <!-- Ambient Tint / Gradient -->
        <div
          class="absolute inset-0 pointer-events-none transition-opacity duration-300"
          :class="[
            card.textColor === 'white'
              ? 'bg-gradient-to-t from-black/80 via-black/30 to-black/20 group-hover:from-black/90'
              : 'bg-gradient-to-t from-black/30 via-transparent to-white/40 group-hover:from-black/40'
          ]"
        ></div>

        <!-- Top Title Container (Figma spec: Bold 24px, tracking -0.72px) -->
        <div class="absolute top-0 inset-x-0 p-6 sm:p-7 z-10">
          <h3
            class="font-['Stanley_Favorit',sans-serif] font-bold text-2xl leading-tight tracking-[-0.72px]"
            :class="card.textColor === 'white' ? 'text-white' : 'text-black'"
          >
            {{ card.titleLine1 }}<br />{{ card.titleLine2 }}
          </h3>
        </div>

        <!-- Bottom Action Plus Button (Figma spec: bottom-right icon) -->
        <div class="absolute bottom-0 inset-x-0 p-6 flex justify-end z-10">
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-90"
            :class="[
              card.textColor === 'white'
                ? 'bg-white text-black'
                : 'bg-black text-white'
            ]"
          >
            <Plus :size="20" stroke-width="2.5" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
