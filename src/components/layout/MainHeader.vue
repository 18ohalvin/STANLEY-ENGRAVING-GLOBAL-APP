<script setup lang="ts">
import { ref } from 'vue'
import { Search, ShoppingBag, User, ChevronDown } from 'lucide-vue-next'
import stanleyLogo from '@/assets/images/stanley-logo.png'
import CustomizeMegaMenu from '@/components/layout/CustomizeMegaMenu.vue'
import type { Product, ProductColor } from '@/data/catalog'

defineProps<{
  standalone?: boolean
}>()

const emit = defineEmits<{
  (e: 'explore'): void
  (e: 'select-graphic-collection', category: string): void
  (e: 'design-now', product: Product, color?: ProductColor, artworkId?: string): void
  (e: 'see-details', product: Product): void
  (e: 'open-corporate-modal'): void
  (e: 'open-trending-modal'): void
  (e: 'open-faq'): void
}>()

const activeTab = ref('CUSTOMIZE')
const isMegaMenuOpen = ref(false)
let closeTimeout: ReturnType<typeof setTimeout> | null = null

const handleMouseEnterCustomize = () => {
  if (closeTimeout) {
    clearTimeout(closeTimeout)
    closeTimeout = null
  }
  isMegaMenuOpen.value = true
}

const handleMouseLeaveCustomize = () => {
  closeTimeout = setTimeout(() => {
    isMegaMenuOpen.value = false
  }, 180)
}

const handleNavClick = (linkName: string) => {
  activeTab.value = linkName
  if (linkName === 'CUSTOMIZE') {
    isMegaMenuOpen.value = !isMegaMenuOpen.value
    emit('explore')
  } else {
    isMegaMenuOpen.value = false
  }
}

const navLinks = [
  { name: 'NEW ARRIVAL', href: '#' },
  { name: 'QUENCHER', href: '#' },
  { name: 'DRINKWARE', href: '#' },
  { name: 'ICEFLOW', href: '#' },
  { name: 'AEROLIGHT', href: '#' },
  { name: 'ACCESSORIES', href: '#' },
  { name: 'LIMITED EDITIONS', href: '#' },
  { name: 'CUSTOMIZE', href: '#', active: true },
]
</script>

<template>
  <header class="w-full bg-white border-b border-neutral-200 z-50 sticky top-0">
    <!-- Top Bar Announcement (44px) -->
    <div class="bg-black text-white text-[12px] font-['Stanley_Favorit',sans-serif] tracking-wider h-[44px] select-none">
      <div class="max-w-[1440px] mx-auto px-4 sm:px-6 xl:px-[24px] h-full flex justify-between items-center">
        <div class="font-bold tracking-widest uppercase text-[11px] sm:text-[12px]">
          SHOP NOW - WE DELIVER EVERYDAY!
        </div>
        <div class="hidden md:flex items-center gap-6 text-neutral-300 text-[12px]">
          <div class="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors">
            <User :size="13" />
            <span>Login</span>
            <span class="text-neutral-500">|</span>
            <span>Sign Up</span>
          </div>
          <a href="#support" class="hover:text-white transition-colors">Support</a>
          <a href="#about" class="hover:text-white transition-colors">About</a>
          <div class="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors">
            <span>Indonesia</span>
            <span class="inline-block w-4 h-2.5 bg-red-600 border border-white/20 relative overflow-hidden">
              <span class="absolute inset-x-0 bottom-0 h-1/2 bg-white"></span>
            </span>
            <ChevronDown :size="12" />
          </div>
        </div>
      </div>
    </div>

    <!-- Main Navigation Bar (80px) with 24px padding on desktop -->
    <div class="max-w-[1440px] mx-auto px-4 sm:px-6 xl:px-[24px] h-[80px] flex items-center justify-between relative">
      <!-- Stanley Brand Logo -->
      <a href="/" class="flex items-center cursor-pointer select-none group">
        <img
          :src="stanleyLogo"
          alt="STANLEY"
          class="h-7 sm:h-8 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]"
        />
      </a>

      <!-- Navigation Links -->
      <nav class="hidden xl:flex items-center gap-7 text-[13px] font-['Stanley_Favorit',sans-serif] font-medium tracking-normal text-neutral-800 h-full">
        <div
          v-for="link in navLinks"
          :key="link.name"
          class="h-full flex items-center relative"
          @mouseenter="link.name === 'CUSTOMIZE' ? handleMouseEnterCustomize() : (isMegaMenuOpen = false)"
          @mouseleave="link.name === 'CUSTOMIZE' ? handleMouseLeaveCustomize() : null"
        >
          <button
            @click="handleNavClick(link.name)"
            :class="[
              'cursor-pointer transition-all duration-150 py-1 relative flex items-center',
              link.name === 'CUSTOMIZE' 
                ? 'font-bold text-black border-b-2 border-black -mb-[2px]' 
                : activeTab === link.name 
                  ? 'font-bold text-black' 
                  : 'hover:text-black text-neutral-600'
            ]"
          >
            {{ link.name }}
            <span v-if="link.name === 'CUSTOMIZE'" class="ml-1 px-1.5 py-0.5 text-[9px] bg-black text-white rounded-full font-bold uppercase tracking-wider">
              Studio
            </span>
          </button>
        </div>
      </nav>

      <!-- Utility Icons -->
      <div class="flex items-center gap-5">
        <button 
          aria-label="Search catalog" 
          class="p-2 hover:bg-neutral-100 rounded-full transition-colors cursor-pointer text-neutral-800"
        >
          <Search :size="20" stroke-width="2" />
        </button>
        <button 
          aria-label="Shopping Cart" 
          class="p-2 hover:bg-neutral-100 rounded-full transition-colors relative cursor-pointer text-neutral-800"
        >
          <ShoppingBag :size="20" stroke-width="2" />
          <span class="absolute top-1 right-1 w-4 h-4 bg-black text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            1
          </span>
        </button>
      </div>
    </div>

    <!-- Dark Background Overlay when Mega Menu appears -->
    <transition
      enter-active-class="transition-opacity duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isMegaMenuOpen"
        class="fixed inset-0 top-[124px] bg-black/60 backdrop-blur-[2px] z-40 transition-colors"
        @mouseenter="handleMouseLeaveCustomize"
        @click="isMegaMenuOpen = false"
      />
    </transition>

    <!-- Mega Menu Dropdown on Customize Hover (Figma Node 5742:3662) -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="isMegaMenuOpen"
        class="absolute top-full left-0 w-full z-50 shadow-2xl"
        @mouseenter="handleMouseEnterCustomize"
        @mouseleave="handleMouseLeaveCustomize"
      >
        <CustomizeMegaMenu
          @select-graphic-collection="(cat) => { isMegaMenuOpen = false; $emit('select-graphic-collection', cat); }"
          @design-now="(prod, col, artId) => { isMegaMenuOpen = false; $emit('design-now', prod, col, artId); }"
          @see-details="(prod) => { isMegaMenuOpen = false; $emit('see-details', prod); }"
          @open-corporate-modal="() => { isMegaMenuOpen = false; $emit('open-corporate-modal'); }"
          @open-trending-modal="() => { isMegaMenuOpen = false; $emit('open-trending-modal'); }"
          @open-faq="() => { isMegaMenuOpen = false; $emit('open-faq'); }"
          @close="isMegaMenuOpen = false"
        />
      </div>
    </transition>
  </header>
</template>
