<script setup lang="ts">
import { ref } from 'vue'
import MainHeader from '@/components/layout/MainHeader.vue'
import HeroBanner from '@/components/landing/HeroBanner.vue'
import GetToKnowMore from '@/components/landing/GetToKnowMore.vue'
import LineupSection from '@/components/landing/LineupSection.vue'
import Footer from '@/components/layout/Footer.vue'
import InspirationModal from '@/components/modals/InspirationModal.vue'
import FaqModal from '@/components/modals/FaqModal.vue'
import ArtistDropModal from '@/components/modals/ArtistDropModal.vue'
import ProductQuickViewModal from '@/components/modals/ProductQuickViewModal.vue'
import SelectStanleyModal from '@/components/modals/SelectStanleyModal.vue'
import EditorLoadingModal from '@/components/modals/EditorLoadingModal.vue'
import CustomizerStudio from '@/components/customizer/CustomizerStudio.vue'

import { PRODUCTS, type Product, type ProductColor, type InspirationCard } from '@/data/catalog'

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

const selectedCustomizerProduct = ref<Product>(PRODUCTS[0])
const selectedCustomizerColor = ref<ProductColor | undefined>(PRODUCTS[0].colors[0])
const isCustomizerOpen = ref(false)

const cartToast = ref<string | null>(null)

// Navigation & Actions
const selectedCampaignId = ref<string | undefined>(undefined)

const handleSelectInspirationCard = (card: InspirationCard) => {
  if (card.id === 'faq') {
    isFaqModalOpen.value = true
  } else {
    selectedCampaignId.value = card.campaignId || 'autumn-26'
    isArtistDropModalOpen.value = true
  }
}

const handleOpenTrendingModal = () => {
  selectedCampaignId.value = 'autumn-26'
  isArtistDropModalOpen.value = true
}

const handleSeeDetails = (product: Product) => {
  selectedQuickViewProduct.value = product
  isQuickViewModalOpen.value = true
}

const selectedCustomizerArtwork = ref<string | undefined>(undefined)

const handleDesignNow = (product: Product, color?: ProductColor, artworkId?: string) => {
  selectedCustomizerProduct.value = product
  selectedCustomizerColor.value = color || product.colors[0]
  selectedCustomizerArtwork.value = artworkId
  isQuickViewModalOpen.value = false
  isInspirationModalOpen.value = false
  isSelectStanleyModalOpen.value = false
  isArtistDropModalOpen.value = false
  
  // Launch loading transition screen
  if (!isCustomizerOpen.value) {
    isEditorLoading.value = true
  }
}

const handleEditorLoadingComplete = () => {
  isEditorLoading.value = false
  isCustomizerOpen.value = true
}

const handleHeroNavigate = (productId?: string, campaignId?: string) => {
  if (campaignId) {
    selectedCampaignId.value = campaignId
    isArtistDropModalOpen.value = true
  } else if (productId) {
    const product = PRODUCTS.find(p => p.id === productId) || PRODUCTS[0]
    handleDesignNow(product)
  } else {
    selectStanleyModalMode.value = 'explore'
    isSelectStanleyModalOpen.value = true
  }
}

const scrollToLineup = () => {
  const el = document.getElementById('lineup-section')
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}

const handleAddToCart = (payload: any) => {
  isCustomizerOpen.value = false
  cartToast.value = `Added 1x ${payload.product.name} to your cart!`
  setTimeout(() => {
    cartToast.value = null
  }, 4000)
}

const handleSelectGraphicCollectionFromMenu = (category: string) => {
  selectedCampaignId.value = category
  isArtistDropModalOpen.value = true
}

const handleSelectProductFromMenu = (productId: string) => {
  const product = PRODUCTS.find(p => p.id === productId) || PRODUCTS[0]
  handleDesignNow(product)
}

const handleOpenCorporateFromMenu = () => {
  // Direct into customizer with first product
  handleDesignNow(PRODUCTS[0])
}
</script>

<template>
  <div class="min-h-screen bg-white text-black flex flex-col font-['Stanley_Favorit',sans-serif] overflow-x-hidden">
    <!-- Top Navigation Header with Figma Mega Menu -->
    <MainHeader
      @explore="scrollToLineup"
      @select-graphic-collection="handleSelectGraphicCollectionFromMenu"
      @design-now="handleDesignNow"
      @see-details="handleSeeDetails"
      @open-corporate-modal="handleOpenCorporateFromMenu"
      @open-trending-modal="handleOpenTrendingModal"
      @open-faq="isFaqModalOpen = true"
    />

    <!-- Main Content Area -->
    <main class="flex-1">
      <!-- 1. Hero Banner (Figma Node 5058:6131) -->
      <HeroBanner
        @navigate-customizer="handleHeroNavigate"
        @scroll-lineup="scrollToLineup"
      />

      <!-- 2. Get Inspired Carousel (Figma Node 5058:6133 / 5772:508) -->
      <GetToKnowMore
        @select-card="handleSelectInspirationCard"
        @open-faq="isFaqModalOpen = true"
      />

      <!-- 3. Explore The Lineup (Figma Node 5058:6147 / 4993:2338) -->
      <LineupSection
        @design-now="handleDesignNow"
        @see-details="handleSeeDetails"
      />
    </main>

    <!-- Footer -->
    <Footer />

    <!-- Modals & Studio -->
    <SelectStanleyModal
      :is-open="isSelectStanleyModalOpen"
      :mode="selectStanleyModalMode"
      @close="isSelectStanleyModalOpen = false"
      @design-now="handleDesignNow"
      @see-details="handleSeeDetails"
    />

    <EditorLoadingModal
      :is-loading="isEditorLoading"
      :product-name="selectedCustomizerProduct?.name"
      @complete="handleEditorLoadingComplete"
    />

    <InspirationModal
      :card="selectedInspirationCard"
      :is-open="isInspirationModalOpen"
      @close="isInspirationModalOpen = false"
      @start-design="handleDesignNow(PRODUCTS[0])"
    />

    <FaqModal
      :is-open="isFaqModalOpen"
      @close="isFaqModalOpen = false"
    />

    <ArtistDropModal
      :is-open="isArtistDropModalOpen"
      :campaign-id="selectedCampaignId"
      @close="isArtistDropModalOpen = false"
      @start-engrave="(graphicId) => {
        isArtistDropModalOpen = false
        handleDesignNow(PRODUCTS[0], undefined, graphicId)
      }"
    />

    <ProductQuickViewModal
      :product="selectedQuickViewProduct"
      :is-open="isQuickViewModalOpen"
      @close="isQuickViewModalOpen = false"
      @customize="handleDesignNow"
    />

    <CustomizerStudio
      v-if="selectedCustomizerProduct"
      :product="selectedCustomizerProduct"
      :initial-color="selectedCustomizerColor"
      :initial-artwork="selectedCustomizerArtwork"
      :is-open="isCustomizerOpen"
      @close="isCustomizerOpen = false"
      @swap-products="selectStanleyModalMode = 'swap'; isSelectStanleyModalOpen = true"
      @add-to-cart="handleAddToCart"
    />

    <!-- Toast Notification for Shopify Cart -->
    <Teleport to="body">
      <div
        v-if="cartToast"
        class="fixed bottom-6 right-6 z-50 bg-black text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 border border-neutral-700 animate-slide-up text-sm font-['Stanley_Favorit',sans-serif]"
      >
        <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
        <span>{{ cartToast }}</span>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleUp {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.animate-fade-in {
  animation: fadeIn 0.25s ease-out;
}

.animate-scale-up {
  animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.animate-slide-up {
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
</style>
