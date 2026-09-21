<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import bannerImg from '@/assets/images/banner-hero.png'
import cardGuidedImg from '@/assets/images/card-guided.png'
import cardArtistDropImg from '@/assets/images/card-artist-drop.png'

const emit = defineEmits<{
  (e: 'navigate-customizer', productId?: string): void
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
  overlayGradient: string
}

const slides: Slide[] = [
  {
    id: 0,
    badge: 'Limited Edition Collab',
    title: 'Limited Edition Artwork.',
    subtitle: 'Stanley x Liunic on Things.<br class="hidden sm:inline" /> Limited Edition Available Now.',
    ctaText: 'Engrave Now',
    image: bannerImg,
    productId: 'quencher-h20-40oz',
    overlayGradient: 'from-black/70 via-black/35 to-transparent',
  },
  {
    id: 1,
    badge: 'Signature Quencher Series',
    title: 'Precision Laser Etching.',
    subtitle: 'Personalize your everyday Quencher ProTour<br class="hidden sm:inline" /> & H2.0 FlowState Tumbler.',
    ctaText: 'Customize Now',
    image: cardArtistDropImg,
    productId: 'quencher-protour',
    overlayGradient: 'from-[#1c1825]/85 via-[#1c1825]/45 to-transparent',
  },
  {
    id: 2,
    badge: 'AI Design Studio',
    title: 'Guided Vector Prompts.',
    subtitle: 'Transform your thoughts into intricate<br class="hidden sm:inline" /> stainless laser engraved art.',
    ctaText: 'Try AI Studio',
    image: cardGuidedImg,
    productId: 'iceflow-flip-straw',
    overlayGradient: 'from-[#11161d]/90 via-[#11161d]/50 to-transparent',
  },
  {
    id: 3,
    badge: 'Outdoor & Heritage',
    title: 'Built For Life. Made For You.',
    subtitle: 'Classic Legendary Camp Mugs<br class="hidden sm:inline" /> etched to last generations.',
    ctaText: 'Design Camp Mug',
    image: bannerImg,
    productId: 'classic-camp-mug',
    overlayGradient: 'from-black/70 via-black/35 to-transparent',
  },
  {
    id: 4,
    badge: 'Bespoke Monograms',
    title: 'Architectural Monograms.',
    subtitle: 'Custom architectural initials, coordinates,<br class="hidden sm:inline" /> and clean typography.',
    ctaText: 'Create Monogram',
    image: cardArtistDropImg,
    productId: 'cafe-travel-mug',
    overlayGradient: 'from-[#1a1c23]/85 via-[#1a1c23]/45 to-transparent',
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
  }, 3000)
}

const stopAutoplay = () => {
  if (autoplayTimer) {
    clearInterval(autoplayTimer)
    autoplayTimer = null
  }
}

const handleTouchStart = (e: TouchEvent) => {
  touchStartX = e.changedTouches[0].screenX
}

const handleTouchEnd = (e: TouchEvent) => {
  touchEndX = e.changedTouches[0].screenX
  handleSwipe()
}

const handleSwipe = () => {
  const diff = touchStartX - touchEndX
  if (Math.abs(diff) > 50) {
    if (diff > 0) {
      nextSlide()
    } else {
      prevSlide()
    }
  }
}

const handleCtaClick = () => {
  emit('navigate-customizer', slides[currentSlide.value].productId)
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
    class="w-full relative select-none overflow-hidden"
    @mouseenter="isPaused = true"
    @mouseleave="isPaused = false"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
  >
    <!-- Full-width 1512x563 Ratio Container (Figma spec: 1512x563) -->
    <div class="relative w-full aspect-[1512/563] min-h-[460px] sm:min-h-[520px] lg:min-h-[563px] overflow-hidden bg-neutral-900">
      <!-- Slides Layer with Premium Crossfade & Smooth Zoom -->
      <div
        v-for="(slide, index) in slides"
        :key="slide.id"
        class="absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out will-change-opacity"
        :class="[
          currentSlide === index
            ? 'opacity-100 z-10 pointer-events-auto'
            : 'opacity-0 z-0 pointer-events-none'
        ]"
      >
        <!-- Background Imagery with Slow Subtle Zoom Effect -->
        <img
          :src="slide.image"
          :alt="slide.title"
          class="w-full h-full object-cover object-center transform-gpu will-change-transform transition-transform duration-7000 ease-out"
          :class="currentSlide === index ? 'scale-105' : 'scale-100'"
        />

        <!-- Ambient Contrast Gradient -->
        <div
          class="absolute inset-0 bg-gradient-to-r pointer-events-none transition-all duration-700"
          :class="slide.overlayGradient"
        ></div>
      </div>

      <!-- Foreground Content Container (Aligned with 1512px max grid) -->
      <div class="absolute inset-0 z-20 flex flex-col justify-center px-6 sm:px-12 lg:px-20 max-w-[1512px] mx-auto pointer-events-none">
        <div class="max-w-2xl pointer-events-auto">
          <!-- Animated Main Headline (Figma spec: 48px, leading 64px, tracking -1.44px) -->
          <transition name="slide-up" mode="out-in">
            <h1
              :key="`title-${currentSlide}`"
              class="font-['Stanley_Favorit',sans-serif] font-medium text-3xl sm:text-4xl lg:text-[48px] text-white tracking-[-1.44px] leading-[1.15] sm:leading-[1.2] mb-3.5 drop-shadow-md"
            >
              {{ slides[currentSlide].title }}
            </h1>
          </transition>

          <!-- Animated Subtitle Container (Fixed 2-line height to eliminate CTA layout shifts & stutter) -->
          <div class="h-[56px] sm:h-[68px] lg:h-[80px] flex items-start mb-8">
            <transition name="slide-up-delay" mode="out-in">
              <p
                :key="`subtitle-${currentSlide}`"
                class="font-['Stanley_Favorit',sans-serif] font-normal text-base sm:text-xl lg:text-[24px] text-neutral-100 tracking-[-0.72px] leading-[1.3] drop-shadow-md max-w-xl"
                v-html="slides[currentSlide].subtitle"
              ></p>
            </transition>
          </div>

          <!-- Action CTA Button (Figma spec: 160px x 60px, rounded 8px) -->
          <div>
            <button
              @click="handleCtaClick"
              class="cursor-pointer bg-white hover:bg-neutral-100 active:bg-neutral-200 text-black font-['Stanley_Favorit',sans-serif] font-bold text-[16px] px-8 sm:px-10 h-[52px] sm:h-[60px] rounded-lg shadow-xl hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 inline-flex items-center justify-center select-none transform-gpu"
            >
              {{ slides[currentSlide].ctaText }}
            </button>
          </div>
        </div>
      </div>

      <!-- Navigation Pagination Dots (Figma spec: node 5056:5237 / 4993:2276) -->
      <div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-30 bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full">
        <button
          v-for="(_, index) in slides"
          :key="index"
          @click="setSlide(index)"
          :aria-label="`Go to slide ${index + 1}`"
          class="relative h-2 rounded-full transition-all duration-500 cursor-pointer focus:outline-none transform-gpu"
          :class="[
            currentSlide === index
              ? 'w-8 bg-white'
              : 'w-2 bg-white/40 hover:bg-white/70'
          ]"
        >
          <!-- Active Progress Animation Bar inside current dot -->
          <span
            v-if="currentSlide === index && !isPaused"
            class="absolute inset-0 bg-white rounded-full origin-left transform-gpu"
          ></span>
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Headline & Subtitle Staggered GPU-Accelerated Animations */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform, opacity;
  transform: translate3d(0, 0, 0);
}
.slide-up-enter-from {
  opacity: 0;
  transform: translate3d(0, 18px, 0);
}
.slide-up-leave-to {
  opacity: 0;
  transform: translate3d(0, -12px, 0);
}

.slide-up-delay-enter-active,
.slide-up-delay-leave-active {
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform, opacity;
  transform: translate3d(0, 0, 0);
}
.slide-up-delay-enter-from {
  opacity: 0;
  transform: translate3d(0, 22px, 0);
}
.slide-up-delay-leave-to {
  opacity: 0;
  transform: translate3d(0, -12px, 0);
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.4s ease;
  will-change: transform, opacity;
  transform: translate3d(0, 0, 0);
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: scale(0.95) translate3d(0, 0, 0);
}
</style>
