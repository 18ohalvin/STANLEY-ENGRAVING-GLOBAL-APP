<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { INSPIRATION_CARDS, type InspirationCard } from '@/data/catalog'
import { Plus, ChevronLeft, ChevronRight } from 'lucide-vue-next'

const emit = defineEmits<{
  (e: 'select-card', card: InspirationCard): void
  (e: 'open-faq'): void
}>()

const scrollContainer = ref<HTMLDivElement | null>(null)
const sectionWrapper = ref<HTMLDivElement | null>(null)

const isScrollable = ref(false)
const isDragging = ref(false)
let startX = 0
let scrollLeftStart = 0
let hasMoved = false

const checkLayoutMode = () => {
  if (typeof window === 'undefined') return
  // On desktop screens >= 1200px, all 3 cards easily fit side-by-side in full view without scrolling
  if (window.innerWidth >= 1200) {
    isScrollable.value = false
    return
  }
  // On smaller viewports (< 1200px), check whether container has enough space (at least 860px)
  if (scrollContainer.value) {
    isScrollable.value = scrollContainer.value.clientWidth < 860
  } else {
    isScrollable.value = window.innerWidth < 1200
  }
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  checkLayoutMode()
  window.addEventListener('resize', checkLayoutMode)
  if (typeof ResizeObserver !== 'undefined' && sectionWrapper.value) {
    resizeObserver = new ResizeObserver(() => {
      checkLayoutMode()
    })
    resizeObserver.observe(sectionWrapper.value)
  }
  nextTick(() => {
    checkLayoutMode()
    setTimeout(checkLayoutMode, 100)
    setTimeout(checkLayoutMode, 300)
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', checkLayoutMode)
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})

const scroll = (direction: 'left' | 'right') => {
  if (!scrollContainer.value || !isScrollable.value) return
  const scrollAmount = 320
  scrollContainer.value.scrollBy({
    left: direction === 'left' ? -scrollAmount : scrollAmount,
    behavior: 'smooth',
  })
}

const handleWheel = (e: WheelEvent) => {
  if (!scrollContainer.value || !isScrollable.value) return
  if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
    const maxScroll = scrollContainer.value.scrollWidth - scrollContainer.value.clientWidth
    if (maxScroll > 0) {
      const atStart = scrollContainer.value.scrollLeft <= 0 && e.deltaY < 0
      const atEnd = scrollContainer.value.scrollLeft >= maxScroll - 2 && e.deltaY > 0
      if (!atStart && !atEnd) {
        e.preventDefault()
        scrollContainer.value.scrollLeft += e.deltaY * 1.5
      }
    }
  }
}

const handleMouseDown = (e: MouseEvent) => {
  if (!scrollContainer.value || !isScrollable.value) return
  isDragging.value = true
  hasMoved = false
  startX = e.pageX - scrollContainer.value.offsetLeft
  scrollLeftStart = scrollContainer.value.scrollLeft
}

const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.value || !scrollContainer.value || !isScrollable.value) return
  e.preventDefault()
  const x = e.pageX - scrollContainer.value.offsetLeft
  const walk = (x - startX) * 1.5
  if (Math.abs(walk) > 6) {
    hasMoved = true
  }
  scrollContainer.value.scrollLeft = scrollLeftStart - walk
}

const handleMouseUp = () => {
  isDragging.value = false
}

const handleCardClick = (card: InspirationCard) => {
  if (!isScrollable.value || !hasMoved) {
    emit('select-card', card)
  }
}
</script>

<template>
  <section id="get-to-know-more" class="w-full py-8 sm:py-12 overflow-hidden scroll-mt-6">
    <div
      ref="sectionWrapper"
      class="max-w-[1440px] mx-auto px-4 sm:px-6 xl:px-[24px] w-full flex flex-col lg:flex-row items-start gap-8 lg:gap-10"
    >
      <!-- Left Sidebar (Figma Node 5772:508 Layout) with Scroll Reveal -->
      <div class="w-full lg:w-[320px] lg:h-[427px] flex-none flex flex-col justify-between py-1 pr-2 scroll-reveal scroll-reveal-left">
        <!-- Top: Curated Artwork Collections -->
        <div>
          <h2 class="font-['Stanley_Favorit',sans-serif] font-medium text-3xl sm:text-[32px] text-black tracking-[-0.96px] leading-[1.15]">
            Curated Artwork Collections.
          </h2>
          <p class="text-neutral-600 text-[15px] sm:text-[16px] leading-[24px] mt-3 sm:mt-4 font-normal max-w-[310px]">
            Explore our exclusive artworks—precision laser-etched onto your favorite silhouette.
          </p>

          <!-- Slider Arrows (only visible when space is not enough and scrolling is required) -->
          <div v-if="isScrollable" class="hidden sm:flex items-center gap-2 mt-6">
            <button
              @click="scroll('left')"
              class="w-10 h-10 rounded-full border border-neutral-300 hover:border-black flex items-center justify-center transition-colors cursor-pointer bg-white text-neutral-800 hover:text-black shadow-2xs"
              aria-label="Scroll trending left"
            >
              <ChevronLeft :size="18" />
            </button>
            <button
              @click="scroll('right')"
              class="w-10 h-10 rounded-full border border-neutral-300 hover:border-black flex items-center justify-center transition-colors cursor-pointer bg-white text-neutral-800 hover:text-black shadow-2xs"
              aria-label="Scroll trending right"
            >
              <ChevronRight :size="18" />
            </button>
          </div>
        </div>

        <!-- Bottom: FAQ & How it Works CTA -->
        <div class="mt-8 lg:mt-0 pt-2">
          <p class="text-black text-[15px] sm:text-[16px] font-medium leading-[24px] max-w-[260px]">
            First time customizing? See what people are asking.
          </p>
          <button
            @click="emit('open-faq')"
            type="button"
            class="mt-4 h-[56px] sm:h-[60px] px-8 py-3.5 border border-black rounded-[8px] font-bold text-[15px] sm:text-[16px] text-black hover:bg-black hover:text-white transition-all duration-200 cursor-pointer flex items-center justify-center shadow-2xs hover:shadow-md active:scale-[0.98]"
          >
            How it Works
          </button>
        </div>
      </div>

      <!-- Right Cards Container: Switches from non-scrollable 3-column grid when space fits, to scrollable carousel on small screens -->
      <div
        ref="scrollContainer"
        @wheel="handleWheel"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseUp"
        class="flex-1 min-w-0 w-full"
        :class="[
          isScrollable
            ? 'flex gap-5 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth pt-1 pb-4 snap-x snap-proximity cursor-grab active:cursor-grabbing'
            : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 xl:gap-6 pt-1 pb-4 overflow-visible cursor-default'
        ]"
      >
        <div
          v-for="(card, cardIdx) in INSPIRATION_CARDS"
          :key="card.id"
          @click="handleCardClick(card)"
          class="h-[390px] sm:h-[427px] rounded-[16px] relative overflow-hidden cursor-pointer group transition-all duration-300 transform-gpu will-change-transform hover:-translate-y-1.5 hover:shadow-xl select-none scroll-reveal-scale"
          :class="[
            isScrollable ? 'flex-none w-[280px] sm:w-[320px] snap-start' : 'w-full',
            cardIdx === 0 ? 'delay-100' : cardIdx === 1 ? 'delay-200' : 'delay-300'
          ]"
          :style="{ backgroundColor: card.bgColor || '#e7e7d5' }"
        >
          <!-- Background Image -->
          <img
            :src="card.image"
            :alt="card.titleLine1"
            class="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-out transform-gpu will-change-transform group-hover:scale-105 pointer-events-none"
          />

          <!-- Theme-Matched Gradient Overlay for high-contrast readable text -->
          <div
            class="absolute inset-0 pointer-events-none transition-opacity duration-300"
            :style="{
              background: card.gradientOverlay || 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 60%)'
            }"
          ></div>

          <!-- Top Text Content with adaptive text color based on background theme -->
          <div class="absolute top-0 inset-x-0 p-6 sm:p-7 z-10 pointer-events-none">
            <h3
              class="font-['Stanley_Favorit',sans-serif] font-bold text-xl sm:text-[24px] leading-tight tracking-[-0.72px]"
              :class="card.textColor === 'white' ? 'text-white' : 'text-[#111827]'"
            >
              {{ card.titleLine1 }}
            </h3>
            <p
              v-if="card.subtitle"
              class="font-['Stanley_Favorit',sans-serif] text-[13px] sm:text-[14px] leading-snug mt-1.5 max-w-[240px]"
              :class="card.textColor === 'white' ? 'text-white/85' : 'text-[#374151]'"
            >
              {{ card.subtitle }}
            </p>
          </div>

          <!-- Bottom Action Plus Button (White circle, bottom right) -->
          <div class="absolute bottom-6 right-6 z-10 pointer-events-none">
            <div class="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-90">
              <Plus :size="20" stroke-width="2.5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
