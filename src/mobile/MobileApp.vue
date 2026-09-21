<script setup lang="ts">
import { ref, nextTick } from 'vue'
import MobileHeader from './components/layout/MobileHeader.vue'
import MobileHeroBanner from './components/landing/MobileHeroBanner.vue'
import MobileGetToKnowMore from './components/landing/MobileGetToKnowMore.vue'
import MobileLineupSection from './components/landing/MobileLineupSection.vue'
import MobileFooter from './components/layout/MobileFooter.vue'

import MobileSelectStanleyModal from './modals/MobileSelectStanleyModal.vue'
import MobileProductQuickViewModal from './modals/MobileProductQuickViewModal.vue'
import MobileInspirationModal from './modals/MobileInspirationModal.vue'
import MobileFaqModal from './modals/MobileFaqModal.vue'
import MobileArtistDropModal from './modals/MobileArtistDropModal.vue'
import MobileEditorLoadingModal from './modals/MobileEditorLoadingModal.vue'
import MobileCustomizerStudio from './components/customizer/MobileCustomizerStudio.vue'

// Import catalog
import { PRODUCTS, type Product, type ProductColor, type InspirationCard, INSPIRATION_CARDS } from '@/data/catalog'

// State
const selectedInspirationCard = ref<InspirationCard | null>(null)
const isInspirationModalOpen = ref(false)
const isFaqModalOpen = ref(false)
const isArtistDropModalOpen = ref(false)

const selectedQuickViewProduct = ref<Product | null>(null)
const isQuickViewModalOpen = ref(false)

const isSelectStanleyModalOpen = ref(false)
const selectStanleyModalMode = ref<'explore' | 'swap'>('explore')
const isEditorLoading = ref(false)
const isCustomizerStudioOpen = ref(false)

const selectedCustomizerProduct = ref<Product>(PRODUCTS[0])
const selectedCustomizerColor = ref<ProductColor | undefined>(PRODUCTS[0].colors[0])
const selectedCustomizerArtwork = ref<string | undefined>(undefined)

const cartCount = ref(0)
const cartToast = ref<string | null>(null)

// Navigation & Actions
const handleSelectInspirationCard = (card: InspirationCard) => {
  if (card.id === 'faq' || card.id === 'faq-2') {
    isFaqModalOpen.value = true
  } else if (card.id === 'artist-drops' || card.id === 'artist-drops-2') {
    isArtistDropModalOpen.value = true
  } else {
    selectedInspirationCard.value = card
    isInspirationModalOpen.value = true
  }
}

const handleSwitchInspirationCard = (cardId: string) => {
  isFaqModalOpen.value = false
  isArtistDropModalOpen.value = false
  isInspirationModalOpen.value = false

  nextTick(() => {
    if (cardId === 'faq' || cardId === 'faq-2') {
      isFaqModalOpen.value = true
    } else if (cardId === 'artist-drops' || cardId === 'artist-drops-2') {
      isArtistDropModalOpen.value = true
    } else {
      selectedInspirationCard.value = INSPIRATION_CARDS.find(c => c.id === cardId) || INSPIRATION_CARDS[1]
      isInspirationModalOpen.value = true
    }
  })
}

const cameFromLineupModal = ref(false)

const handleSeeDetails = (product: Product, fromLineup = false) => {
  selectedQuickViewProduct.value = product
  cameFromLineupModal.value = fromLineup
  if (fromLineup) {
    isSelectStanleyModalOpen.value = false
  }
  isQuickViewModalOpen.value = true
}

const handleCloseQuickView = () => {
  isQuickViewModalOpen.value = false
  if (cameFromLineupModal.value) {
    cameFromLineupModal.value = false
    isSelectStanleyModalOpen.value = true
  }
}

const handleDesignNow = (product: Product, color?: ProductColor, artworkId?: string) => {
  selectedCustomizerProduct.value = product
  selectedCustomizerColor.value = color || product.colors[0]
  selectedCustomizerArtwork.value = artworkId
  isQuickViewModalOpen.value = false
  isInspirationModalOpen.value = false
  isSelectStanleyModalOpen.value = false
  isArtistDropModalOpen.value = false

  // Trigger mobile loading screen
  isEditorLoading.value = true
}

const handleEditorLoadingComplete = () => {
  isEditorLoading.value = false
  isCustomizerStudioOpen.value = true
}

const handleStudioAddToCart = (payload: any) => {
  cartCount.value++
  isCustomizerStudioOpen.value = false
  cartToast.value = `Added 1x ${payload.product.name} to your cart!`
  setTimeout(() => {
    cartToast.value = null
  }, 4000)
}

const handleStudioSwapProducts = () => {
  selectStanleyModalMode.value = 'swap'
  isSelectStanleyModalOpen.value = true
}

const handleSelectStanleyProduct = (product: Product, color?: ProductColor) => {
  selectedCustomizerProduct.value = product
  selectedCustomizerColor.value = color || product.colors[0]
  isSelectStanleyModalOpen.value = false
  if (!isCustomizerStudioOpen.value) {
    isEditorLoading.value = true
  }
}

const handleHeroNavigate = (_productId?: string) => {
  // Hero CTA button opens the Explore the Line-up modal matching desktop UX in explore mode
  selectStanleyModalMode.value = 'explore'
  isSelectStanleyModalOpen.value = true
}

const scrollToLineup = () => {
  const el = document.getElementById('mobile-lineup-section')
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}

const handleOpenCart = () => {
  cartToast.value = cartCount.value > 0 ? `You have ${cartCount.value} item(s) in your cart.` : 'Your cart is currently empty.'
  setTimeout(() => {
    cartToast.value = null
  }, 3000)
}
</script>

<template>
  <!-- Mobile Landing Page Container -->
  <div class="min-h-screen w-full bg-[#f4f4f4] flex justify-center text-black font-['Stanley_Favorit',sans-serif] antialiased">
    <div class="w-full max-w-[430px] bg-white min-h-screen flex flex-col shadow-2xl relative" data-node-id="5217:1832" data-name="Landing Page">
      <!-- 1. Mobile Header (Height ~106px: Announcement Bar + Nav Bar) -->
      <MobileHeader
        :cart-count="cartCount"
        @open-cart="handleOpenCart"
      />

      <!-- 2. Main Mobile Landing Content -->
      <main class="flex-1 w-full flex flex-col gap-[24px] pb-[32px] overflow-x-hidden" data-node-id="5238:6688">
        <!-- 2.1 Hero Banner (Autoplaying Slides, Zoom, Crossfade, Swipe) -->
        <MobileHeroBanner
          @navigate-customizer="handleHeroNavigate"
          @scroll-lineup="scrollToLineup"
        />

        <!-- 2.2 Content Container (w-full gap-[28px]) -->
        <div class="flex flex-col gap-[28px] w-full" data-node-id="5217:1843">
          <!-- Section 1: Get to know more (Cards with hover zoom, shadow-md/xl, plus-rotate) -->
          <MobileGetToKnowMore
            @select-card="handleSelectInspirationCard"
          />

          <!-- Section 2: Explore The Line-up (Clean thumbnails without shadow, card shadows, silhouette filters) -->
          <MobileLineupSection
            @design-now="handleDesignNow"
            @see-details="(p) => handleSeeDetails(p, false)"
          />
        </div>
      </main>

      <!-- 3. Mobile Footer (Accordions, Newsletter, Socials, Brand Story) -->
      <MobileFooter />

      <!-- Modals & Bottom Sheets -->
      <MobileSelectStanleyModal
        :is-open="isSelectStanleyModalOpen"
        :mode="selectStanleyModalMode"
        @close="isSelectStanleyModalOpen = false"
        @design-now="handleSelectStanleyProduct"
        @see-details="(p) => handleSeeDetails(p, true)"
      />

      <MobileProductQuickViewModal
        :product="selectedQuickViewProduct"
        :is-open="isQuickViewModalOpen"
        @close="handleCloseQuickView"
        @customize="handleDesignNow"
      />

      <MobileInspirationModal
        :card="selectedInspirationCard"
        :is-open="isInspirationModalOpen"
        @close="isInspirationModalOpen = false"
        @switch-card="handleSwitchInspirationCard"
        @start-design="handleDesignNow(PRODUCTS[0])"
      />

      <MobileFaqModal
        :is-open="isFaqModalOpen"
        @close="isFaqModalOpen = false"
        @switch-card="handleSwitchInspirationCard"
      />

      <MobileArtistDropModal
        :is-open="isArtistDropModalOpen"
        @close="isArtistDropModalOpen = false"
        @switch-card="handleSwitchInspirationCard"
        @start-engrave="(graphicId) => {
          isArtistDropModalOpen = false
          const mappedId = graphicId === 'viking-de-juve' ? 'viking-juve' : graphicId
          handleDesignNow(PRODUCTS[0], undefined, mappedId)
        }"
      />

      <MobileEditorLoadingModal
        :is-loading="isEditorLoading"
        :product-name="selectedCustomizerProduct?.name"
        @complete="handleEditorLoadingComplete"
      />

      <MobileCustomizerStudio
        :is-open="isCustomizerStudioOpen"
        :product="selectedCustomizerProduct"
        :initial-color="selectedCustomizerColor"
        :initial-artwork="selectedCustomizerArtwork"
        @close="isCustomizerStudioOpen = false"
        @swap-products="handleStudioSwapProducts"
        @add-to-cart="handleStudioAddToCart"
      />

      <!-- Mobile Toast Notification -->
      <Teleport to="body">
        <div
          v-if="cartToast"
          class="fixed bottom-5 inset-x-4 max-w-sm mx-auto z-50 bg-black text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs border border-neutral-700 animate-slide-up font-['Stanley_Favorit',sans-serif]"
        >
          <span class="w-2 h-2 rounded-full bg-emerald-400 flex-none"></span>
          <span class="flex-1">{{ cartToast }}</span>
        </div>
      </Teleport>
    </div>
  </div>
</template>

<style scoped>
@keyframes slideUpFade {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
.animate-slide-up {
  animation: slideUpFade 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
</style>
