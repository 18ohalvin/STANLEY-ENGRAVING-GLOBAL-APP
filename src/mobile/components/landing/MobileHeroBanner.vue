<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ArrowDown } from 'lucide-vue-next'
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
  }, 4800)
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
  }, 2000)
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
  const target = document.querySelector('[data-name="Landing Page"] main > div:nth-child(2)') || document.getElementById('mobile-get-to-know-more')
  if (target) {
    target.scrollIntoView({ behavior: 'smooth' })
  } else {
    window.scrollBy({ top: 400, behavior: 'smooth' })
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
  <!-- Figma Node 5217:1921 Banner Image Container (h-[500px]) with Ken Burns Transition -->
  <div
    class="relative w-full h-[500px] overflow-hidden shrink-0 select-none bg-neutral-950"
    data-node-id="5217:1921"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
  >
    <!-- Slides Layer with Ken Burns Zoom & Cinematic Crossfade -->
    <div
      v-for="(slide, index) in slides"
      :key="slide.id"
      class="absolute inset-0 w-full h-full transition-all duration-1000 ease-out pointer-events-none"
      :class="[
        currentSlide === index
          ? 'opacity-100 z-0 visible'
          : 'opacity-0 z-0 invisible'
      ]"
    >
      <!-- Background Image (HD Display with Ken Burns Motion) -->
      <div class="w-full h-full overflow-hidden">
        <img
          :src="slide.image"
          :alt="slide.title"
          class="w-full h-full object-cover object-[center_25%] hero-slide-img"
          :class="{ 'is-active': currentSlide === index }"
          loading="eager"
          decoding="sync"
        />
      </div>

      <!-- Double Gradient Overlay for Maximum Readability -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/20 pointer-events-none"></div>
    </div>

    <!-- Banner Text Container (Figma Node 5217:1935) -->
    <div class="absolute bottom-0 left-[20px] right-[20px] pb-[44px] pt-[32px] flex flex-col gap-[14px] items-start z-10" data-node-id="5217:1935">
      <!-- Animated Badge Pill -->
      <div class="overflow-hidden h-7 flex items-center">
        <transition name="slide-down-badge" mode="out-in">
          <span
            :key="`badge-${currentSlide}`"
            class="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-white/20 text-white backdrop-blur-md border border-white/20 shadow-xs"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            {{ slides[currentSlide].badge }}
          </span>
        </transition>
      </div>

      <!-- Animated Title & Subtitle -->
      <div class="flex flex-col gap-[6px] items-start text-white min-h-[74px]" data-node-id="5217:1941">
        <transition name="slide-up" mode="out-in">
          <h1
            :key="`title-${currentSlide}`"
            class="font-['Stanley_Favorit',sans-serif] font-medium text-[26px] tracking-[-0.8px] leading-[1.18] drop-shadow-md"
            data-node-id="5217:1936"
          >
            {{ slides[currentSlide].title }}
          </h1>
        </transition>

        <transition name="slide-up-delay" mode="out-in">
          <p
            :key="`subtitle-${currentSlide}`"
            class="font-['Stanley_Favorit',sans-serif] font-normal text-[14px] tracking-[-0.35px] leading-[1.3] text-neutral-100 max-w-sm drop-shadow-xs"
            data-node-id="5217:1937"
          >
            {{ slides[currentSlide].subtitle }}
          </p>
        </transition>
      </div>

      <!-- CTA Button & Scroll Cue Row -->
      <div class="w-full flex items-center justify-between gap-3 pt-1">
        <button
          @click="handleCtaClick"
          class="bg-white hover:bg-neutral-100 active:bg-neutral-200 text-black font-['Stanley_Favorit',sans-serif] font-bold text-[15px] h-[52px] px-[28px] rounded-[8px] shadow-2xl active:scale-95 transition-all duration-200 flex items-center justify-center cursor-pointer select-none btn-shimmer"
          data-node-id="5217:1938"
        >
          <span class="whitespace-nowrap" data-node-id="5217:1939">
            {{ slides[currentSlide].ctaText }}
          </span>
        </button>

        <!-- Compact Scroll Down Prompt -->
        <button
          @click="handleScrollDown"
          aria-label="Scroll down"
          class="flex items-center gap-1.5 px-3 py-2 rounded-full bg-black/40 text-white/90 backdrop-blur-md border border-white/20 text-[11px] font-medium tracking-wide uppercase transition-all duration-200 active:scale-95 cursor-pointer"
        >
          <span class="w-3 h-4 rounded-full border border-white/60 flex items-start justify-center p-0.5">
            <span class="w-0.5 h-1 bg-white rounded-full animate-scroll-dot"></span>
          </span>
          <ArrowDown class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <!-- Navigation Pagination Dots with Real-Time Fill Animation -->
    <div class="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20 bg-black/45 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-full shadow-md">
      <button
        v-for="(_, index) in slides"
        :key="index"
        @click="setSlide(index)"
        :aria-label="`Slide ${index + 1}`"
        class="relative h-1.5 rounded-full transition-all duration-500 cursor-pointer focus:outline-none overflow-hidden"
        :class="[
          currentSlide === index
            ? 'w-8 bg-white/25'
            : 'w-1.5 bg-white/40 hover:bg-white/70'
        ]"
      >
        <span
          v-if="currentSlide === index"
          :key="slideProgressKey"
          class="absolute inset-0 bg-white rounded-full origin-left hero-progress-bar"
          :class="{ 'is-paused': isPaused }"
        ></span>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Razor-sharp HD image rendering & Ken Burns Drift */
.hero-slide-img {
  image-rendering: auto;
  backface-visibility: hidden;
  transform: scale(1.08) translate3d(0, 0, 0);
  transition: transform 6.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.9s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform, opacity;
}

.hero-slide-img.is-active {
  transform: scale(1) translate3d(0, 0, 0);
}

.slide-down-badge-enter-active,
.slide-down-badge-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-down-badge-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
.slide-down-badge-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  transform: translate3d(0, 0, 0);
}
.slide-up-enter-from {
  opacity: 0;
  transform: translate3d(0, 16px, 0);
}
.slide-up-leave-to {
  opacity: 0;
  transform: translate3d(0, -10px, 0);
}

.slide-up-delay-enter-active,
.slide-up-delay-leave-active {
  transition: all 0.55s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform, opacity;
  transform: translate3d(0, 0, 0);
}
.slide-up-delay-enter-from {
  opacity: 0;
  transform: translate3d(0, 18px, 0);
}
.slide-up-delay-leave-to {
  opacity: 0;
  transform: translate3d(0, -10px, 0);
}

@keyframes fillProgressMobile {
  0% { transform: scaleX(0); }
  100% { transform: scaleX(1); }
}

.hero-progress-bar {
  animation: fillProgressMobile 4.8s linear forwards;
}

.hero-progress-bar.is-paused {
  animation-play-state: paused;
}
</style>
