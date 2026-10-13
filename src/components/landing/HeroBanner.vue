<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ChevronLeft, ChevronRight, ArrowDown } from 'lucide-vue-next'
import bannerLiunicImg from '@/assets/images/banner-liunic-hero.jpg'
import bannerMaliqImg from '@/assets/images/banner-maliq-hero.jpg'

const emit = defineEmits<{
  'navigate-customizer': [productId?: string, campaignId?: string]
  'scroll-lineup': []
  'scroll-down': []
}>()

interface Slide {
  id: number
  badge: string
  title: string
  subtitle: string
  ctaText: string
  image: string
  productId: string
  campaignId: string
}

const slides: Slide[] = [
  {
    id: 0,
    badge: 'Stanley x Liunic Collection',
    title: 'Fuel your imagination',
    subtitle: 'Keep the creativity flowing.<br class="hidden sm:inline" /> The Stanley x Liunic Collection.',
    ctaText: 'Explore Collection',
    image: bannerLiunicImg,
    productId: 'quencher-h20-40oz',
    campaignId: 'liunic',
  },
  {
    id: 1,
    badge: "Stanley x MALIQ & D'ESSENTIALS",
    title: 'Keep the rhythm flowing',
    subtitle: "The MALIQ & D'ESSENTIALS Official Tour Artworks",
    ctaText: 'Explore Collection',
    image: bannerMaliqImg,
    productId: 'quencher-h20-40oz',
    campaignId: 'maliq',
  },
]

const currentSlide = ref(0)
const isPaused = ref(false)
const slideProgressKey = ref(0)
let autoplayTimer: ReturnType<typeof setInterval> | null = null

// Touch swipe tracking
let touchStartX = 0
let touchEndX = 0

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % slides.length
  slideProgressKey.value++
}

const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + slides.length) % slides.length
  slideProgressKey.value++
}

const setSlide = (index: number) => {
  currentSlide.value = index
  slideProgressKey.value++
  resetAutoplay()
}

const startAutoplay = () => {
  stopAutoplay()
  autoplayTimer = setInterval(() => {
    if (!isPaused.value) {
      nextSlide()
    }
  }, 5000)
}

const stopAutoplay = () => {
  if (autoplayTimer) {
    clearInterval(autoplayTimer)
    autoplayTimer = null
  }
}

const resetAutoplay = () => {
  stopAutoplay()
  startAutoplay()
}

const handleTouchStart = (e: TouchEvent) => {
  touchStartX = e.changedTouches[0].screenX
  isPaused.value = true
}

const handleTouchEnd = (e: TouchEvent) => {
  touchEndX = e.changedTouches[0].screenX
  handleSwipe()
  setTimeout(() => {
    isPaused.value = false
  }, 1000)
}

const handleSwipe = () => {
  const diff = touchStartX - touchEndX
  if (Math.abs(diff) > 40) {
    if (diff > 0) {
      nextSlide()
    } else {
      prevSlide()
    }
    resetAutoplay()
  }
}

const handleCtaClick = () => {
  const slide = slides[currentSlide.value]
  emit('navigate-customizer', slide.productId, slide.campaignId)
}

const handleScrollDown = () => {
  emit('scroll-down')
  const target = document.getElementById('get-to-know-more') || document.querySelector('section:nth-of-type(2)')
  if (target) {
    target.scrollIntoView({ behavior: 'smooth' })
  } else {
    window.scrollBy({ top: window.innerHeight * 0.75, behavior: 'smooth' })
  }
}

onMounted(() => {
  startAutoplay()
})

onUnmounted(() => {
  stopAutoplay()
})
</script>

<template>
  <section
    class="w-full relative select-none overflow-hidden group"
    @mouseenter="isPaused = true"
    @mouseleave="isPaused = false"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
  >
    <!-- Full-width 1512x563 Ratio Container (Figma spec: 1512x563) -->
    <div class="relative w-full aspect-[1512/563] min-h-[480px] sm:min-h-[520px] lg:min-h-[563px] overflow-hidden bg-neutral-950">
      <!-- Slides Layer with Ken Burns Zoom & Cinematic Crossfade -->
      <div
        v-for="(slide, index) in slides"
        :key="slide.id"
        class="absolute inset-0 w-full h-full transition-all duration-1000 ease-out"
        :class="[
          currentSlide === index
            ? 'opacity-100 z-10 pointer-events-auto visible'
            : 'opacity-0 z-0 pointer-events-none invisible'
        ]"
      >
        <!-- Native High-Definition Imagery with Ken Burns Parallax Drift -->
        <div class="w-full h-full overflow-hidden">
          <img
            :src="slide.image"
            :alt="slide.title"
            class="w-full h-full object-cover object-center hero-slide-img"
            :class="{ 'is-active': currentSlide === index }"
            loading="eager"
            decoding="sync"
          />
        </div>

        <!-- Layered Cinematic Gradient Overlays: Left shadow for high legibility, bottom vignette for smooth transition -->
        <div class="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent pointer-events-none"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none"></div>
      </div>

      <!-- Foreground Content Container (Aligned with 1440px grid with 24px padding) -->
      <div class="absolute inset-0 z-20 flex flex-col justify-center px-4 sm:px-6 xl:px-[24px] max-w-[1440px] mx-auto pointer-events-none">
        <div class="max-w-2xl pointer-events-auto">
          <!-- Animated Collection Badge Tag with Subtle Glass Glow -->
          <div class="h-8 mb-3 overflow-hidden flex items-center">
            <transition name="slide-down-badge" mode="out-in">
              <span
                :key="`badge-${currentSlide}`"
                class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-medium tracking-wide uppercase bg-white/15 text-white backdrop-blur-md border border-white/20 shadow-xs"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                {{ slides[currentSlide].badge }}
              </span>
            </transition>
          </div>

          <!-- Animated Main Headline (Figma spec: 48px, leading 64px, tracking -1.44px) -->
          <div class="overflow-hidden mb-3">
            <transition name="slide-up-heading" mode="out-in">
              <h1
                :key="`title-${currentSlide}`"
                class="font-['Stanley_Favorit',sans-serif] font-medium text-3xl sm:text-4xl lg:text-[50px] text-white tracking-[-1.5px] leading-[1.12] sm:leading-[1.18] drop-shadow-md"
              >
                {{ slides[currentSlide].title }}
              </h1>
            </transition>
          </div>

          <!-- Animated Subtitle Container (Fixed height to eliminate layout shift) -->
          <div class="h-[56px] sm:h-[68px] lg:h-[76px] flex items-start mb-7 overflow-hidden">
            <transition name="slide-up-sub" mode="out-in">
              <p
                :key="`subtitle-${currentSlide}`"
                class="font-['Stanley_Favorit',sans-serif] font-normal text-base sm:text-xl lg:text-[23px] text-neutral-100 tracking-[-0.6px] leading-[1.3] max-w-xl drop-shadow-sm"
                v-html="slides[currentSlide].subtitle"
              ></p>
            </transition>
          </div>

          <!-- Action CTA Button with Metallic Shimmer & Tactile Hover -->
          <div class="flex items-center gap-4">
            <button
              @click="handleCtaClick"
              class="cursor-pointer bg-white hover:bg-neutral-100 active:bg-neutral-200 text-black font-['Stanley_Favorit',sans-serif] font-bold text-[16px] px-8 sm:px-10 h-[52px] sm:h-[60px] rounded-lg shadow-2xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 inline-flex items-center justify-center select-none btn-shimmer group/btn"
            >
              <span>{{ slides[currentSlide].ctaText }}</span>
              <svg class="w-4 h-4 ml-2 transition-transform duration-300 group-hover/btn:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Desktop Slide Navigation Controls (Left & Right Chevrons with Glassmorphism) -->
      <button
        @click="prevSlide"
        aria-label="Previous Slide"
        class="hidden lg:flex absolute left-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full items-center justify-center bg-black/25 hover:bg-white hover:text-black text-white backdrop-blur-md border border-white/20 transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95 shadow-xl cursor-pointer"
      >
        <ChevronLeft class="w-6 h-6" />
      </button>

      <button
        @click="nextSlide"
        aria-label="Next Slide"
        class="hidden lg:flex absolute right-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full items-center justify-center bg-black/25 hover:bg-white hover:text-black text-white backdrop-blur-md border border-white/20 transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95 shadow-xl cursor-pointer"
      >
        <ChevronRight class="w-6 h-6" />
      </button>

      <!-- Navigation Pagination Dots with Real-Time Progress Bar -->
      <div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-30 bg-black/45 backdrop-blur-md border border-white/15 px-4 py-2 rounded-full shadow-lg">
        <button
          v-for="(_, index) in slides"
          :key="index"
          @click="setSlide(index)"
          :aria-label="`Go to slide ${index + 1}`"
          class="relative h-2 rounded-full transition-all duration-500 cursor-pointer focus:outline-none overflow-hidden"
          :class="[
            currentSlide === index
              ? 'w-10 bg-white/20'
              : 'w-2 bg-white/40 hover:bg-white/70'
          ]"
        >
          <!-- Active Progress Bar Filling over 5 seconds -->
          <span
            v-if="currentSlide === index"
            :key="slideProgressKey"
            class="absolute inset-0 bg-white rounded-full origin-left hero-progress-bar"
            :class="{ 'is-paused': isPaused }"
          ></span>
        </button>
      </div>

      <!-- Animated "Scroll Down" Indicator Prompt -->
      <div class="hidden sm:flex absolute bottom-6 right-6 lg:right-10 z-30 items-center">
        <button
          @click="handleScrollDown"
          aria-label="Scroll down to explore curated collections"
          class="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white/80 hover:text-white backdrop-blur-md border border-white/15 text-xs font-['Stanley_Favorit',sans-serif] tracking-widest uppercase transition-all duration-300 cursor-pointer group/scroll hover:border-white/30 hover:shadow-lg"
        >
          <!-- Elegant Mouse / Capsule Scroll Animation -->
          <span class="w-3.5 h-5 rounded-full border border-white/60 flex items-start justify-center p-0.5 shrink-0">
            <span class="w-1 h-1.5 bg-white rounded-full animate-scroll-dot"></span>
          </span>
          <span class="text-[11px] font-medium tracking-wider">Scroll</span>
          <ArrowDown class="w-3.5 h-3.5 transition-transform duration-300 group-hover/scroll:translate-y-0.5" />
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* High-End Ken Burns Cinematic Drift */
.hero-slide-img {
  image-rendering: auto;
  backface-visibility: hidden;
  transform: scale(1.08) translate3d(0, 0, 0);
  transition: transform 7.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.9s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform, opacity;
}

.hero-slide-img.is-active {
  transform: scale(1) translate3d(0, 0, 0);
}

/* Badge slide-down transition */
.slide-down-badge-enter-active,
.slide-down-badge-leave-active {
  transition: all 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-down-badge-enter-from {
  opacity: 0;
  transform: translateY(-12px);
}
.slide-down-badge-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

/* Headline Staggered Slide-Up */
.slide-up-heading-enter-active,
.slide-up-heading-leave-active {
  transition: all 0.55s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-up-heading-enter-from {
  opacity: 0;
  transform: translateY(28px);
}
.slide-up-heading-leave-to {
  opacity: 0;
  transform: translateY(-16px);
}

/* Subtitle Staggered Slide-Up */
.slide-up-sub-enter-active,
.slide-up-sub-leave-active {
  transition: all 0.65s cubic-bezier(0.16, 1, 0.3, 1);
  transition-delay: 60ms;
}
.slide-up-sub-enter-from {
  opacity: 0;
  transform: translateY(22px);
}
.slide-up-sub-leave-to {
  opacity: 0;
  transform: translateY(-14px);
}

/* Real-Time Autoplay Progress Fill */
@keyframes fillProgress {
  0% {
    transform: scaleX(0);
  }
  100% {
    transform: scaleX(1);
  }
}

.hero-progress-bar {
  animation: fillProgress 5s linear forwards;
}

.hero-progress-bar.is-paused {
  animation-play-state: paused;
}
</style>
