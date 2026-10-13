<script setup lang="ts">
import { INSPIRATION_CARDS, type InspirationCard } from '@/data/catalog'
import { Plus } from 'lucide-vue-next'

const emit = defineEmits<{
  (e: 'select-card', card: InspirationCard): void
}>()
</script>

<template>
  <!-- Figma Node 5217:1942 Product Selection Section (Get to know more.) -->
  <div id="mobile-get-to-know-more" class="flex flex-col gap-[20px] items-start relative shrink-0 w-full scroll-mt-4" data-node-id="5217:1942">
    <!-- Section Title (Figma Node 5217:1943) with Scroll Reveal -->
    <div class="px-[16px] w-full flex flex-col font-['Stanley_Favorit',sans-serif] font-medium justify-center text-black tracking-[-0.6px] scroll-reveal" data-node-id="5217:1943">
      <h2 class="text-[20px] leading-tight font-medium">Curated Artwork Collections.</h2>
      <p class="text-[13px] text-neutral-600 leading-snug mt-1 font-normal">Explore our exclusive artworks—precision laser-etched onto your favorite silhouette.</p>
    </div>

    <!-- Horizontal Swipeable Cards Container with Symmetric Left & Right 16px Padding -->
    <div class="w-full relative shrink-0 scroll-reveal-scale delay-100" data-node-id="5238:6634">
      <div class="flex gap-[16px] items-center w-full overflow-x-auto no-scrollbar scroll-smooth px-[16px] pt-1 pb-4" data-node-id="5238:6635">
        <div
          v-for="card in INSPIRATION_CARDS"
          :key="card.id"
          @click="emit('select-card', card)"
          class="w-[201.75px] h-[269px] rounded-[10.084px] overflow-hidden relative shrink-0 cursor-pointer group shadow-md hover:shadow-xl hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 transform-gpu will-change-transform select-none"
          :style="{ backgroundColor: card.bgColor || '#e7e7d5' }"
        >
          <!-- Background Visual Image -->
          <img
            :src="card.image"
            :alt="card.titleLine1"
            class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out transform-gpu will-change-transform group-hover:scale-105 group-active:scale-105 pointer-events-none"
          />

          <!-- Theme-Matched Gradient Overlay for crisp text contrast -->
          <div
            class="absolute inset-0 pointer-events-none transition-opacity duration-300"
            :style="{
              background: card.gradientOverlay || 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 60%)'
            }"
          ></div>

          <!-- Title Text Block with adaptive text color based on background theme -->
          <div class="absolute top-0 left-0 pl-[15px] pt-[20px] pr-[15px] z-10 transition-transform duration-300 group-hover:translate-x-0.5">
            <h3
              class="font-['Stanley_Favorit',sans-serif] font-bold text-[16px] tracking-[-0.48px] leading-tight"
              :class="card.textColor === 'white' ? 'text-white' : 'text-[#111827]'"
            >
              {{ card.titleLine1 }}
            </h3>
            <p
              v-if="card.subtitle"
              class="font-['Stanley_Favorit',sans-serif] text-[11px] leading-tight mt-1 max-w-[170px]"
              :class="card.textColor === 'white' ? 'text-white/85' : 'text-[#374151]'"
            >
              {{ card.subtitle }}
            </p>
          </div>

          <!-- Action Icon Bottom Right -->
          <div class="absolute right-[14px] bottom-[14px] z-10">
            <div class="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-90 group-active:scale-90 transform-gpu">
              <Plus :size="15" stroke-width="2.5" />
            </div>
          </div>
        </div>
      </div>
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
