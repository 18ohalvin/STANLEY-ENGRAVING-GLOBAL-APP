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
    subtitle: 'Stanley x Liunic on Things. Available Now.',
    ctaText: 'Design Now',
    image: bannerImg,
    productId: 'quencher-h20-40oz',
    overlayGradient: 'from-black/70 via-black/35 to-transparent',
  },
  {
    id: 1,
    badge: 'Signature Quencher Series',
    title: 'Precision Laser Etching.',
    subtitle: 'Personalize your everyday Quencher ProTour.',
    ctaText: 'Customize Now',
    image: cardArtistDropImg,
    productId: 'quencher-protour',
    overlayGradient: 'from-[#1c1825]/85 via-[#1c1825]/45 to-transparent',
  },
  {
    id: 2,
    badge: 'AI Design Studio',
    title: 'Guided Vector Prompts.',
    subtitle: 'Transform your thoughts into intricate stainless art.',
    ctaText: 'Try AI Studio',
    image: cardGuidedImg,
    productId: 'iceflow-flip-straw',
    overlayGradient: 'from-[#11161d]/90 via-[#11161d]/50 to-transparent',
  },
  {
    id: 3,
    badge: 'Outdoor & Heritage',
    title: 'Built For Life. Made For You.',
    subtitle: 'Classic Legendary Camp Mugs etched to last.',
    ctaText: 'Design Camp Mug',
    image: bannerImg,
    productId: 'classic-camp-mug',
    overlayGradient: 'from-black/70 via-black/35 to-transparent',
  },
  {
    id: 4,
    badge: 'Bespoke Monograms',
    title: 'Architectural Monograms.',
    subtitle: 'Custom initials, coordinates, and typography.',
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
  }, 3500)
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
  <!-- Figma Node 5217:1921 Banner Image Container (h-[491px]) with Desktop Carousel Effects -->
  <div
    class="relative w-full h-[491px] overflow-hidden shrink-0 select-none bg-neutral-900"
    data-node-id="5217:1921"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
  >
    <!-- Slides Layer with Crossfade & Subtle Zoom (Desktop matched) -->
    <div
      v-for="(slide, index) in slides"
      :key="slide.id"
      class="absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out will-change-opacity pointer-events-none"
      :class="[
        currentSlide === index
          ? 'opacity-100 z-0'
          : 'opacity-0 z-0'
      ]"
    >
      <!-- Background Image with Slow Subtle Zoom Effect -->
      <img
        :src="slide.image"
        :alt="slide.title"
        class="w-full h-full object-cover object-[center_20%] transform-gpu will-change-transform transition-transform duration-7000 ease-out"
        :class="currentSlide === index ? 'scale-105' : 'scale-100'"
      />

      <!-- Gradient Overlay (Figma Node 5217:1922) -->
      <div
        class="absolute inset-0"
        style="background: linear-gradient(179.59deg, rgba(0, 0, 0, 0.45) 0.28%, rgba(0, 0, 0, 0) 45%, rgba(0, 0, 0, 0.7) 99.72%);"
      ></div>
    </div>

    <!-- Banner Text Container (Figma Node 5217:1935: left-[20px] py-[64px] gap-[16px]) -->
    <div class="absolute bottom-0 left-[20px] right-[20px] py-[64px] flex flex-col gap-[16px] items-start z-10" data-node-id="5217:1935">
      <!-- Animated Title & Subtitle with Desktop slide-up transitions -->
      <div class="flex flex-col gap-[8px] items-start text-white min-h-[72px]" data-node-id="5217:1941">
        <transition name="slide-up" mode="out-in">
          <h1
            :key="`title-${currentSlide}`"
            class="font-['Stanley_Favorit',sans-serif] font-medium text-[24px] tracking-[-0.72px] leading-[normal] drop-shadow-md"
            data-node-id="5217:1936"
          >
            {{ slides[currentSlide].title }}
          </h1>
        </transition>

        <transition name="slide-up-delay" mode="out-in">
          <p
            :key="`subtitle-${currentSlide}`"
            class="font-['Stanley_Favorit',sans-serif] font-normal text-[14px] tracking-[-0.42px] leading-[normal] text-white drop-shadow-sm"
            data-node-id="5217:1937"
          >
            {{ slides[currentSlide].subtitle }}
          </p>
        </transition>
      </div>

      <!-- CTA Button (Figma Node 5217:1938 + Desktop Shadow, Hover, Shimmer & Tactile Effects) -->
      <button
        @click="handleCtaClick"
        class="bg-white hover:bg-neutral-100 active:bg-neutral-200 text-black font-['Stanley_Favorit',sans-serif] font-bold text-[16px] h-[60px] px-[32px] py-[15px] rounded-[8px] shadow-xl hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 flex items-center justify-center cursor-pointer select-none btn-shimmer transform-gpu"
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
        class="relative h-1.5 rounded-full transition-all duration-500 cursor-pointer focus:outline-none transform-gpu overflow-hidden"
        :class="[
          currentSlide === index
            ? 'w-7 bg-white'
            : 'w-1.5 bg-white/40 hover:bg-white/70'
        ]"
      >
        <span
          v-if="currentSlide === index && !isPaused"
          class="absolute inset-0 bg-white rounded-full origin-left transform-gpu animate-progress-fill"
        ></span>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Headline & Subtitle Staggered GPU-Accelerated Animations from Desktop */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform, opacity;
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
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform, opacity;
  transform: translate3d(0, 0, 0);
}
.slide-up-delay-enter-from {
  opacity: 0;
  transform: translate3d(0, 20px, 0);
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
  animation: progressFill 3.5s linear forwards;
}
</style>
