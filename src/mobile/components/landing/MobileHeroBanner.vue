<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import bannerLiunicImg from '@/assets/images/banner-liunic-hero.jpg'
import bannerMaliqImg from '@/assets/images/banner-maliq-hero.jpg'

const emit = defineEmits<{
  (e: 'navigate-customizer', productId?: string, campaignId?: string): void
  (e: 'scroll-lineup'): void
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
    subtitle: 'Keep the creativity flowing. The Stanley x Liunic Collection.',
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
let autoplayTimer: ReturnType<typeof setInterval> | null = null

// Touch swipe tracking
let touchStartX = 0
let touchEndX = 0

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % slides.length
}

const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + slides.length) % slides.length
}

const setSlide = (index: number) => {
  currentSlide.value = index
}

const startAutoplay = () => {
  stopAutoplay()
  autoplayTimer = setInterval(() => {
    if (!isPaused.value) {
      nextSlide()
    }
  }, 4000)
}

const stopAutoplay = () => {
  if (autoplayTimer) {
    clearInterval(autoplayTimer)
    autoplayTimer = null
  }
}

const handleTouchStart = (e: TouchEvent) => {
  touchStartX = e.changedTouches[0].screenX
  isPaused.value = true
}

const handleTouchEnd = (e: TouchEvent) => {
  touchEndX = e.changedTouches[0].screenX
  handleSwipe()
  // Resume autoplay after 4 seconds
  setTimeout(() => {
    isPaused.value = false
  }, 4000)
}

const handleSwipe = () => {
  const diff = touchStartX - touchEndX
  if (Math.abs(diff) > 40) {
    if (diff > 0) {
      nextSlide()
    } else {
      prevSlide()
    }
  }
}

const handleCtaClick = () => {
  const slide = slides[currentSlide.value]
  emit('navigate-customizer', slide.productId, slide.campaignId)
}

onMounted(() => {
  startAutoplay()
})

onUnmounted(() => {
  stopAutoplay()
})
</script>

<template>
  <!-- Figma Node 5217:1921 Banner Image Container (h-[491px]) with Desktop Carousel Effects -->
  <div
    class="relative w-full h-[491px] overflow-hidden shrink-0 select-none bg-neutral-900"
    data-node-id="5217:1921"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
  >
    <!-- Slides Layer with Crossfade & Native HD Zoom Transition -->
    <div
      v-for="(slide, index) in slides"
      :key="slide.id"
      class="absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out pointer-events-none"
      :class="[
        currentSlide === index
          ? 'opacity-100 z-0'
          : 'opacity-0 z-0'
      ]"
    >
      <!-- Background Image (HD 1:1 Display) -->
      <img
        :src="slide.image"
        :alt="slide.title"
        class="w-full h-full object-cover object-[center_20%] hero-slide-img"
        :class="{ 'is-active': currentSlide === index }"
        loading="eager"
        decoding="sync"
      />

      <!-- 30% Gradient Overlay for Mobile Text Readability -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent pointer-events-none"></div>
    </div>

    <!-- Banner Text Container (Figma Node 5217:1935: left-[20px] py-[64px] gap-[16px]) -->
    <div class="absolute bottom-0 left-[20px] right-[20px] py-[64px] flex flex-col gap-[16px] items-start z-10" data-node-id="5217:1935">
      <!-- Animated Title & Subtitle with Desktop slide-up transitions -->
      <div class="flex flex-col gap-[8px] items-start text-white min-h-[72px]" data-node-id="5217:1941">
        <transition name="slide-up" mode="out-in">
          <h1
            :key="`title-${currentSlide}`"
            class="font-['Stanley_Favorit',sans-serif] font-medium text-[24px] tracking-[-0.72px] leading-[normal]"
            data-node-id="5217:1936"
          >
            {{ slides[currentSlide].title }}
          </h1>
        </transition>

        <transition name="slide-up-delay" mode="out-in">
          <p
            :key="`subtitle-${currentSlide}`"
            class="font-['Stanley_Favorit',sans-serif] font-normal text-[14px] tracking-[-0.42px] leading-[normal] text-white"
            data-node-id="5217:1937"
          >
            {{ slides[currentSlide].subtitle }}
          </p>
        </transition>
      </div>

      <!-- CTA Button (Figma Node 5217:1938 + Desktop Shadow, Hover, Shimmer & Tactile Effects) -->
      <button
        @click="handleCtaClick"
        class="bg-white hover:bg-neutral-100 active:bg-neutral-200 text-black font-['Stanley_Favorit',sans-serif] font-bold text-[16px] h-[60px] px-[32px] py-[15px] rounded-[8px] shadow-2xl hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 flex items-center justify-center cursor-pointer select-none btn-shimmer"
        data-node-id="5217:1938"
      >
        <span class="whitespace-nowrap" data-node-id="5217:1939">
          {{ slides[currentSlide].ctaText }}
        </span>
      </button>
    </div>

    <!-- Navigation Pagination Dots (Desktop matched for mobile with active progress bar) -->
    <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20 bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full">
      <button
        v-for="(_, index) in slides"
        :key="index"
        @click="setSlide(index)"
        :aria-label="`Slide ${index + 1}`"
        class="relative h-1.5 rounded-full transition-all duration-500 cursor-pointer focus:outline-none overflow-hidden"
        :class="[
          currentSlide === index
            ? 'w-7 bg-white/30'
            : 'w-1.5 bg-white/40 hover:bg-white/70'
        ]"
      >
        <span
          v-if="currentSlide === index"
          class="absolute inset-0 bg-white rounded-full origin-left"
          :class="{ 'animate-progress-fill': true, 'paused': isPaused }"
        ></span>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Razor-sharp HD image rendering & cinematic Ken Burns glide transition */
.hero-slide-img {
  image-rendering: auto;
  backface-visibility: hidden;
  transform: scale(1.08);
  transition: transform 6s cubic-bezier(0.25, 1, 0.5, 1);
  will-change: transform;
}

.hero-slide-img.is-active {
  transform: scale(1);
}

/* Headline & Subtitle Staggered GPU-Accelerated Animations */
.slide-up-enter-active {
  transition: opacity 0.55s cubic-bezier(0.16, 1, 0.3, 1), transform 0.55s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform, opacity;
}
.slide-up-leave-active {
  transition: opacity 0.22s ease-in, transform 0.22s ease-in;
  will-change: transform, opacity;
}
.slide-up-enter-from {
  opacity: 0;
  transform: translate3d(0, 20px, 0);
}
.slide-up-leave-to {
  opacity: 0;
  transform: translate3d(0, -10px, 0);
}

.slide-up-delay-enter-active {
  transition: opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1) 0.08s, transform 0.65s cubic-bezier(0.16, 1, 0.3, 1) 0.08s;
  will-change: transform, opacity;
}
.slide-up-delay-leave-active {
  transition: opacity 0.2s ease-in, transform 0.2s ease-in;
  will-change: transform, opacity;
}
.slide-up-delay-enter-from {
  opacity: 0;
  transform: translate3d(0, 16px, 0);
}
.slide-up-delay-leave-to {
  opacity: 0;
  transform: translate3d(0, -10px, 0);
}

@keyframes progressFill {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

.animate-progress-fill {
  animation: progressFill 4s linear forwards;
}

.animate-progress-fill.paused {
  animation-play-state: paused;
}
</style>
