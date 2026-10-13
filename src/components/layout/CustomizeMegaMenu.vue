<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-vue-next'
import type { Product, ProductColor } from '@/data/catalog'
import { PRODUCTS } from '@/data/catalog'
import collabLiunicCardImg from '@/assets/images/collab-liunic-card.jpg'
import collabMaliqCardImg from '@/assets/images/collab-maliq-card.jpg'

import categoryUniversityImg from '@/assets/images/licensed/category-university.svg'
import categorySchoolImg from '@/assets/images/licensed/category-school.svg'
import categoryFootballClubImg from '@/assets/images/licensed/category-football-club.svg'
import categoryBasketballClubImg from '@/assets/images/licensed/category-basketball-club.svg'
import categoryCommunitiesImg from '@/assets/images/licensed/category-communities.svg'
import bannerPssiStadiumImg from '@/assets/images/licensed/banner-pssi-stadium.png'

import {
  celebrationsGraphics,
  familyGraphics,
  holidayGraphics,
  petNatureGraphics,
  sportsGraphics,
  zodiacGraphics,
  type GraphicItem
} from '@/data/graphics'

const emit = defineEmits<{
  (e: 'select-graphic-collection', category: string): void
  (e: 'design-now', product: Product, color?: ProductColor, artworkId?: string): void
  (e: 'see-details', product: Product): void
  (e: 'open-corporate-modal'): void
  (e: 'open-trending-modal'): void
  (e: 'open-faq'): void
  (e: 'close'): void
}>()

// Active primary category tab (defaults to 'collaborations' on hover/open)
const activeCategory = ref<'collaborations' | 'licensed' | 'categories'>('collaborations')

// Active sub-filter pill for Browse Artworks
const activeArtworkCategory = ref<'celebration' | 'family' | 'holiday' | 'pet-nature' | 'sports' | 'zodiac'>('celebration')

const artworkCategoryTabs = [
  { id: 'celebration', name: 'Celebration' },
  { id: 'family', name: 'Family' },
  { id: 'holiday', name: 'Holiday' },
  { id: 'pet-nature', name: 'Pet & Nature' },
  { id: 'sports', name: 'Sports' },
  { id: 'zodiac', name: 'Zodiac' },
]

const currentCategoryGraphics = computed<GraphicItem[]>(() => {
  switch (activeArtworkCategory.value) {
    case 'celebration':
      return celebrationsGraphics
    case 'family':
      return familyGraphics
    case 'holiday':
      return holidayGraphics
    case 'pet-nature':
      return petNatureGraphics
    case 'sports':
      return sportsGraphics
    case 'zodiac':
      return zodiacGraphics
    default:
      return celebrationsGraphics
  }
})

// Horizontal/Vertical Scrolling for Unified Artwork Cards Grid
const artworkScrollRef = ref<HTMLElement | null>(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

const checkScroll = () => {
  const el = artworkScrollRef.value
  if (!el) {
    canScrollLeft.value = false
    canScrollRight.value = false
    return
  }
  if (el.scrollHeight > el.clientHeight + 8) {
    canScrollLeft.value = el.scrollTop > 8
    canScrollRight.value = el.scrollTop < el.scrollHeight - el.clientHeight - 8
  } else {
    canScrollLeft.value = el.scrollLeft > 8
    canScrollRight.value = el.scrollLeft < el.scrollWidth - el.clientWidth - 8
  }
}

const scrollLeftAction = () => {
  const el = artworkScrollRef.value
  if (!el) return
  if (el.scrollHeight > el.clientHeight + 8) {
    el.scrollBy({ top: -390, behavior: 'smooth' })
  } else {
    el.scrollBy({ left: -1062, behavior: 'smooth' })
  }
}

const scrollRightAction = () => {
  const el = artworkScrollRef.value
  if (!el) return
  if (el.scrollHeight > el.clientHeight + 8) {
    el.scrollBy({ top: 390, behavior: 'smooth' })
  } else {
    el.scrollBy({ left: 1062, behavior: 'smooth' })
  }
}

const selectCategoryTab = (tabId: typeof activeArtworkCategory.value) => {
  activeArtworkCategory.value = tabId
  nextTick(() => {
    const el = artworkScrollRef.value
    if (el) {
      el.scrollTop = 0
      el.scrollLeft = 0
      setTimeout(checkScroll, 100)
    }
  })
}

watch(activeArtworkCategory, () => {
  nextTick(() => {
    setTimeout(checkScroll, 100)
  })
})

watch(activeCategory, (newVal) => {
  if (newVal === 'categories') {
    nextTick(() => {
      setTimeout(checkScroll, 100)
    })
  }
})

onMounted(() => {
  activeCategory.value = 'collaborations'
  nextTick(() => {
    setTimeout(checkScroll, 150)
  })
})

// Collaboration cards: 2 Selected Collaborations
const collaborationCards = [
  {
    id: 'liunic',
    title: 'Stanley x Liunic',
    subtitle: 'Fuel your imagination.',
    image: collabLiunicCardImg,
  },
  {
    id: 'maliq',
    title: "Stanley x MALIQ & D'ESSENTIAL",
    subtitle: 'Keep the rhythm flowing',
    image: collabMaliqCardImg,
  }
]

// Licensed category cards (5 Categories)
const licensedCards = [
  { id: 'university', title: 'University', count: '6 Graphics', image: categoryUniversityImg },
  { id: 'school', title: 'School', count: '4 Graphics', image: categorySchoolImg },
  { id: 'football-club', title: 'Football Club', count: '8 Graphics', image: categoryFootballClubImg },
  { id: 'basketball-club', title: 'Basketball Club', count: '6 Graphics', image: categoryBasketballClubImg },
  { id: 'communities', title: 'Communities', count: '5 Graphics', image: categoryCommunitiesImg },
]
</script>

<template>
  <div
    class="bg-white w-full border-b border-neutral-200/80 shadow-2xl relative overflow-hidden font-['Stanley_Favorit',sans-serif] select-none"
    @mouseleave="$emit('close')"
  >
    <!-- Fixed Container matching global landing page padding (px-4 sm:px-6 xl:px-[24px] max-w-[1440px]) with 32px bottom padding -->
    <div class="max-w-[1440px] mx-auto px-4 sm:px-6 xl:px-[24px] pt-[40px] pb-[32px] relative flex items-start gap-[64px]">
      
      <!-- Left Column: Heading & Navigation (w-[214px], gap-[48px]) -->
      <div class="w-[214px] shrink-0 flex flex-col gap-[48px] items-start text-black">
        <!-- Heading (Figma Node 5772:1538) -->
        <div class="text-[32px] font-medium tracking-[-0.96px] leading-[1.15]">
          <p class="mb-0">Your Stanley,</p>
          <p>Personalized.</p>
        </div>

        <!-- Navigation Links Stack (Figma Node 5772:1539) -->
        <div class="flex flex-col gap-[24px] items-start text-[16px] leading-[1.5]">
          <!-- 1. Collaborations -->
          <button
            @mouseenter="activeCategory = 'collaborations'"
            @click="activeCategory = 'collaborations'"
            class="text-left transition-colors cursor-pointer"
            :class="activeCategory === 'collaborations' ? 'font-bold text-black' : 'font-normal text-black/80 hover:text-black'"
          >
            Collaborations
          </button>

          <!-- 2. Licensed Graphics -->
          <button
            @mouseenter="activeCategory = 'licensed'"
            @click="activeCategory = 'licensed'"
            class="text-left transition-colors cursor-pointer"
            :class="activeCategory === 'licensed' ? 'font-bold text-black' : 'font-normal text-black/80 hover:text-black'"
          >
            Licensed Graphics
          </button>

          <!-- 3. Browse Artworks (Figma Node 5772:1542) -->
          <button
            @mouseenter="activeCategory = 'categories'"
            @click="activeCategory = 'categories'"
            class="text-left transition-colors cursor-pointer"
            :class="activeCategory === 'categories' ? 'font-bold text-black' : 'font-normal text-black/80 hover:text-black'"
          >
            Browse Artworks
          </button>
        </div>
      </div>

      <!-- Right Content Panels -->

      <!-- MENU 1: Collaborations -->
      <div v-if="activeCategory === 'collaborations'" class="flex items-start gap-[24px] shrink-0 animate-fadeIn">
        <div
          v-for="(card, idx) in collaborationCards"
          :key="idx"
          @click="$emit('select-graphic-collection', card.id)"
          class="w-[238px] flex flex-col gap-[10px] items-start shrink-0 cursor-pointer group"
        >
          <!-- Preserved 300:400 (3:4) Aspect Ratio Image Container -->
          <div class="w-[238px] h-[293px] aspect-[300/400] bg-[#d9d9d9] rounded-[8px] overflow-hidden relative shrink-0">
            <img
              :src="card.image"
              :alt="card.title"
              class="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          <!-- Card Details -->
          <div class="w-full flex flex-col gap-[4px] items-start shrink-0">
            <p class="text-[15px] font-medium text-black leading-snug line-clamp-1">{{ card.title }}</p>
            <p class="text-[11px] font-normal text-neutral-600 leading-snug line-clamp-1">{{ card.subtitle }}</p>
            <div class="flex items-center gap-[6px] shrink-0 mt-0.5 group-hover:translate-x-1 transition-transform">
              <span class="text-[14px] font-medium text-black leading-snug">Explore Graphic</span>
              <svg class="size-[15px] shrink-0 text-black fill-current" viewBox="0 0 32 32">
                <path d="M17 15V8h-2v7H8v2h7v7h2v-7h7v-2z"/>
                <path d="M16 2a14 14 0 1 0 14 14A14.016 14.016 0 0 0 16 2zm0 26a12 12 0 1 1 12-12 12.014 12.014 0 0 1-12 12z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- MENU 2: Licensed Graphics (Figma Node 5742:3656) -->
      <div v-else-if="activeCategory === 'licensed'" class="flex items-start gap-[64px] shrink-0 animate-fadeIn">
        
        <!-- Center Column: Licensed Graphics Grid (w-[446px]) -->
        <div class="w-[446px] flex flex-col gap-[16px] items-start shrink-0">
          <div class="w-full text-[16px] font-medium text-black leading-[1.5]">
            <p>Licensed Graphics</p>
          </div>

          <!-- Row 1: 3 Cards (Brands, Colleges, Indonesia's Team) -->
          <div class="flex items-start gap-[16px] shrink-0">
            <div
              v-for="card in licensedCards.slice(0, 3)"
              :key="card.id"
              @click="$emit('select-graphic-collection', card.id)"
              class="w-[138px] h-[184px] bg-[#f5f5f5] hover:bg-[#eaeaea] rounded-[8px] relative shrink-0 cursor-pointer group transition-colors flex flex-col justify-between items-center p-[16px]"
            >
              <!-- Center Icon (82px x 82px) -->
              <div class="w-full flex-1 flex items-center justify-center pointer-events-none">
                <img
                  :src="card.image"
                  :alt="card.title"
                  class="size-[82px] object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <!-- Card Labels -->
              <div class="w-full flex flex-col gap-[4px] items-center text-center text-black">
                <p class="text-[12px] font-normal leading-normal truncate w-full">{{ card.title }}</p>
                <p class="text-[10px] font-normal text-neutral-500 leading-normal">{{ card.count }}</p>
              </div>
            </div>
          </div>

          <!-- Row 2: 2 Cards (Automotive Logo, Family Mart) -->
          <div class="flex items-start gap-[16px] shrink-0">
            <div
              v-for="card in licensedCards.slice(3, 5)"
              :key="card.id"
              @click="$emit('select-graphic-collection', card.id)"
              class="w-[138px] h-[184px] bg-[#f5f5f5] hover:bg-[#eaeaea] rounded-[8px] relative shrink-0 cursor-pointer group transition-colors flex flex-col justify-between items-center p-[16px]"
            >
              <!-- Center Icon (82px x 82px) -->
              <div class="w-full flex-1 flex items-center justify-center pointer-events-none">
                <img
                  :src="card.image"
                  :alt="card.title"
                  class="size-[82px] object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <!-- Card Labels -->
              <div class="w-full flex flex-col gap-[4px] items-center text-center text-black">
                <p class="text-[12px] font-normal leading-normal truncate w-full">{{ card.title }}</p>
                <p class="text-[10px] font-normal text-neutral-500 leading-normal">{{ card.count }}</p>
              </div>
            </div>
          </div>

        </div>

        <!-- Right Column: Happening Now PSSI Banner (w-[552px] - Figma Node 5768:3450) -->
        <div class="w-[552px] flex flex-col gap-[16px] items-start shrink-0">
          <div class="w-full text-[16px] font-medium text-black leading-[1.5]">
            <p>Happening Now</p>
          </div>

          <div
            @click="$emit('select-graphic-collection', 'pssi-cup')"
            class="w-[552px] flex flex-col gap-[12px] items-start shrink-0 cursor-pointer group"
          >
            <!-- Banner Image (w-full h-[287px] rounded-[8px]) -->
            <div class="h-[287px] w-full rounded-[8px] overflow-hidden relative shrink-0 bg-neutral-100 shadow-xs">
              <img
                :src="bannerPssiStadiumImg"
                alt="PSSI: Indonesia President Cup 2026"
                class="w-full h-full object-cover object-center rounded-[8px] transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </div>

            <!-- Details -->
            <div class="w-full flex flex-col gap-[4px] items-start shrink-0">
              <p class="text-[16px] font-medium text-black leading-snug">PSSI: Indonesia President Cup 2026</p>
              <p class="text-[12px] font-normal text-neutral-600 leading-snug">Show your colors. Put your team front and center on your everyday Stanley.</p>
              <div class="flex items-center gap-[6px] shrink-0 mt-0.5 group-hover:translate-x-1 transition-transform">
                <span class="text-[14px] font-medium text-black leading-snug">Explore Graphic</span>
                <svg class="size-[15px] shrink-0 text-black fill-current" viewBox="0 0 32 32">
                  <path d="M17 15V8h-2v7H8v2h7v7h2v-7h7v-2z"/>
                  <path d="M16 2a14 14 0 1 0 14 14A14.016 14.016 0 0 0 16 2zm0 26a12 12 0 1 1 12-12 12.014 12.014 0 0 1-12 12z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- MENU 3: Browse Artworks (Figma Node 5772:1533) -->
      <div v-else-if="activeCategory === 'categories'" class="flex-1 flex flex-col gap-[20px] items-start shrink-0 animate-fadeIn overflow-hidden">
        
        <!-- Header Bar: Category Filter Pills (Left) + Arrow Buttons (Right) Aligned -->
        <div class="flex items-center justify-between w-full max-w-[1062px]">
          <!-- Category Filter Pills Bar (Figma Node 5772:1607) -->
          <div class="flex items-center gap-[8px] flex-wrap">
            <button
              v-for="tab in artworkCategoryTabs"
              :key="tab.id"
              @click="selectCategoryTab(tab.id as any)"
              class="px-[16px] py-[8px] rounded-[8px] text-[14px] leading-normal transition-all duration-200 cursor-pointer"
              :class="activeArtworkCategory === tab.id
                ? 'bg-[#f5f5f5] border border-black text-black font-medium shadow-2xs'
                : 'bg-[#f5f5f5] border border-transparent text-black font-normal hover:bg-[#eaeaea]'"
            >
              {{ tab.name }}
            </button>
          </div>

          <!-- Arrow Navigation Buttons Aligned with Tabs for Scrolling Artworks -->
          <div class="flex items-center gap-[8px] shrink-0">
            <button
              @click="scrollLeftAction"
              :disabled="!canScrollLeft"
              class="w-[34px] h-[34px] rounded-full border border-neutral-300 hover:border-black flex items-center justify-center transition-colors disabled:opacity-30 disabled:hover:border-neutral-300 disabled:cursor-not-allowed cursor-pointer bg-white"
              aria-label="Scroll artworks left"
            >
              <ChevronLeft :size="17" class="text-neutral-900" />
            </button>
            <button
              @click="scrollRightAction"
              :disabled="!canScrollRight"
              class="w-[34px] h-[34px] rounded-full border border-neutral-300 hover:border-black flex items-center justify-center transition-colors disabled:opacity-30 disabled:hover:border-neutral-300 disabled:cursor-not-allowed cursor-pointer bg-white"
              aria-label="Scroll artworks right"
            >
              <ChevronRight :size="17" class="text-neutral-900" />
            </button>
          </div>
        </div>

        <!-- Single Unified Responsive Grid Wrapper for All Artwork Cards + Browse More Card -->
        <div
          ref="artworkScrollRef"
          @scroll="checkScroll"
          class="grid grid-cols-7 gap-[16px] w-full max-w-[1062px] max-h-[390px] overflow-y-auto scrollbar-none scroll-smooth py-0.5"
        >
          <!-- Direct Child Artwork Cards (Flows left-to-right filling Row 1 first) -->
          <div
            v-for="graphic in currentCategoryGraphics"
            :key="graphic.id"
            @click="emit('design-now', PRODUCTS[0], undefined, graphic.id)"
            class="w-[138px] h-[184px] bg-[#f5f5f5] hover:bg-[#ebebeb] rounded-[8px] shrink-0 cursor-pointer group transition-all duration-200 flex flex-col justify-between items-center p-[16px]"
          >
            <!-- Center Graphic (82px x 82px) -->
            <div class="w-full flex-1 flex items-center justify-center pointer-events-none p-1">
              <div
                v-if="graphic.svgRaw"
                class="size-[82px] max-h-[82px] max-w-[82px] flex items-center justify-center [&_svg]:max-h-[82px] [&_svg]:max-w-[82px] [&_svg]:w-full [&_svg]:h-full transition-transform duration-300 group-hover:scale-105"
                v-html="graphic.svgRaw"
              ></div>
              <img
                v-else
                :src="graphic.img"
                :alt="graphic.name"
                class="size-[82px] max-h-[82px] max-w-[82px] object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <!-- Graphic Name Label -->
            <div class="w-full flex flex-col items-center justify-center text-center">
              <p class="text-[12px] font-normal leading-normal text-black truncate w-full group-hover:font-medium">
                {{ graphic.name }}
              </p>
            </div>
          </div>

          <!-- Browse More in Studio Card (Direct Child at the end of the list matching graphic card background) -->
          <div
            @click="emit('design-now', PRODUCTS[0])"
            class="w-[138px] h-[184px] bg-[#f5f5f5] hover:bg-[#ebebeb] rounded-[8px] shrink-0 cursor-pointer group transition-all duration-200 flex flex-col justify-between items-center p-[16px]"
          >
            <!-- Center Icon with circle container -->
            <div class="w-full flex-1 flex items-center justify-center pointer-events-none">
              <div class="w-[44px] h-[44px] rounded-full bg-black/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-black/10 transition-all duration-300">
                <ArrowRight :size="20" class="text-black" />
              </div>
            </div>
            <!-- Text Label -->
            <div class="w-full flex flex-col items-center justify-center text-center">
              <p class="text-[12px] font-medium leading-tight text-black">
                Browse More
              </p>
              <p class="text-[10px] text-neutral-500 mt-0.5">
                In Design Studio &rarr;
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.18s ease-out forwards;
}

/* Hide scrollbar while preserving smooth scrolling behavior */
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
