<script setup lang="ts">
import { ref } from 'vue'
import { Search, ShoppingBag, Menu, X, ChevronRight, User, Globe } from 'lucide-vue-next'
import stanleyLogo from '@/assets/images/stanley-logo.png'

defineProps<{
  cartCount?: number
}>()

const emit = defineEmits<{
  (e: 'open-cart'): void
  (e: 'select-customize-option', id: string): void
}>()

const isMenuOpen = ref(false)
const isSearchOpen = ref(false)
const isCustomizeExpanded = ref(true)
const searchQuery = ref('')

const navItems = [
  { name: 'NEW ARRIVAL', href: '#' },
  { name: 'QUENCHER', href: '#' },
  { name: 'DRINKWARE', href: '#' },
  { name: 'ICEFLOW', href: '#' },
  { name: 'AEROLIGHT', href: '#' },
  { name: 'ACCESSORIES', href: '#' },
  { name: 'LIMITED EDITIONS', href: '#' },
  { name: 'CUSTOMIZE', href: '#', active: true, hasChildren: true },
]

const customizeSubItems = [
  { id: 'collaborations', name: 'Collaborations' },
  { id: 'licensed', name: 'Licensed Graphics' },
  { id: 'categories', name: 'Browse Categories' },
]
</script>

<template>
  <!-- Figma Node 5217:1879 Header Image (Total height ~106px) -->
  <header class="w-full sticky top-0 z-40 bg-white font-['Stanley_Favorit',sans-serif] select-none shadow-xs">
    <!-- 1. Top Announcement Bar (42px) -->
    <div class="h-[42px] bg-black text-white text-[12px] font-bold tracking-[0.04em] flex items-center justify-center px-4 text-center">
      <a href="#" class="underline hover:text-neutral-300 transition-colors uppercase">
        SHOP NOW-WE DELIVER EVERYDAY!
      </a>
    </div>

    <!-- 2. Main Navigation Bar (64px) -->
    <div class="h-[64px] px-[16px] flex items-center justify-between border-b border-neutral-200">
      <!-- Stanley Brand Logo with Desktop subtle scale on hover & tap -->
      <a href="/" class="flex items-center group">
        <img
          :src="stanleyLogo"
          alt="STANLEY"
          class="h-[26px] w-auto object-contain transition-transform duration-200 transform-gpu group-hover:scale-[1.03] group-active:scale-95"
        />
      </a>

      <!-- Right Actions: Search, Bag, Menu with Tactile Scale & Hover -->
      <div class="flex items-center gap-[6px] text-black">
        <!-- Search Button -->
        <button
          @click="isSearchOpen = !isSearchOpen"
          class="w-9 h-9 flex items-center justify-center rounded-full text-black hover:bg-neutral-100 hover:scale-105 active:scale-90 transition-all duration-150 transform-gpu cursor-pointer"
          aria-label="Search"
        >
          <Search :size="20" stroke-width="2.2" />
        </button>

        <!-- Shopping Bag -->
        <button
          @click="emit('open-cart')"
          class="w-9 h-9 flex items-center justify-center rounded-full relative text-black hover:bg-neutral-100 hover:scale-105 active:scale-90 transition-all duration-150 transform-gpu cursor-pointer"
          aria-label="Shopping Bag"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 6H16V5C16 2.79 14.21 1 12 1C9.79 1 8 2.79 8 5V6H5C3.9 6 3 6.9 3 8V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V8C21 6.9 20.1 6 19 6ZM10 5C10 3.9 10.9 3 12 3C13.1 3 14 3.9 14 5V6H10V5ZM19 20H5V8H8V10C8 10.55 8.45 11 9 11C9.55 11 10 10.55 10 10V8H14V10C14 10.55 14.45 11 15 11C15.55 11 16 10.55 16 10V8H19V20Z"/>
          </svg>
          <span
            v-if="cartCount && cartCount > 0"
            class="absolute top-1 right-1 bg-black text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white animate-pop-in"
          >
            {{ cartCount }}
          </span>
        </button>

        <!-- Hamburger Menu Toggle (3 bars) -->
        <button
          @click="isMenuOpen = !isMenuOpen"
          class="w-9 h-9 flex items-center justify-center rounded-full text-black hover:bg-neutral-100 hover:scale-105 active:scale-90 transition-all duration-150 transform-gpu cursor-pointer"
          aria-label="Menu"
        >
          <X v-if="isMenuOpen" :size="22" :stroke-width="2.2" class="transition-transform duration-200 rotate-90" />
          <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="transition-transform duration-200">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>

    <!-- 3. Expandable Mobile Search Bar -->
    <div
      v-if="isSearchOpen"
      class="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center gap-2 animate-fade-in"
    >
      <div class="relative flex-1">
        <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search tumblers, collections, designs..."
          class="w-full pl-9 pr-4 py-2 text-sm bg-white rounded-md border border-neutral-300 focus:outline-none focus:border-black transition-colors"
        />
      </div>
      <button
        @click="isSearchOpen = false"
        class="text-xs font-semibold px-2 py-1 text-neutral-600 hover:text-black active:scale-95 transition-all cursor-pointer"
      >
        Cancel
      </button>
    </div>

    <!-- 4. Slide-Out Navigation Drawer -->
    <Teleport to="body">
      <div
        v-if="isMenuOpen"
        class="fixed inset-0 z-50 flex"
      >
        <!-- Backdrop -->
        <div
          @click="isMenuOpen = false"
          class="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
        ></div>

        <!-- Drawer Content -->
        <div class="relative ml-auto w-[85%] max-w-sm h-full bg-white flex flex-col shadow-2xl z-10 animate-slide-left">
          <div class="h-16 px-5 flex items-center justify-between border-b border-neutral-100">
            <img :src="stanleyLogo" alt="STANLEY" class="h-5 w-auto object-contain" />
            <button
              @click="isMenuOpen = false"
              class="w-8 h-8 rounded-full flex items-center justify-center text-neutral-600 hover:text-black hover:bg-neutral-100 hover:rotate-90 active:scale-90 transition-all duration-200 cursor-pointer"
            >
              <X :size="20" />
            </button>
          </div>

          <div class="flex-1 overflow-y-auto py-4 px-5 divide-y divide-neutral-100">
            <nav class="space-y-1 pb-4">
              <template v-for="item in navItems" :key="item.name">
                <!-- Regular Menu Item -->
                <a
                  v-if="!item.hasChildren"
                  :href="item.href"
                  @click="isMenuOpen = false"
                  class="flex items-center justify-between py-3 text-sm font-bold tracking-wide transition-all duration-200 hover:translate-x-1.5 active:translate-x-1 transform-gpu group text-neutral-700 hover:text-black"
                >
                  <span>{{ item.name }}</span>
                  <ChevronRight :size="16" class="text-neutral-400 group-hover:text-black transition-colors" />
                </a>

                <!-- CUSTOMIZE Accordion Item -->
                <div v-else class="flex flex-col py-1">
                  <button
                    @click="isCustomizeExpanded = !isCustomizeExpanded"
                    class="flex items-center justify-between py-2 text-sm font-extrabold tracking-wide transition-all duration-200 text-black border-l-2 border-black pl-2 cursor-pointer group"
                  >
                    <div class="flex items-center gap-1.5">
                      <span>{{ item.name }}</span>
                      <span class="px-1.5 py-0.5 text-[8.5px] bg-black text-white rounded-full font-bold uppercase tracking-wider">
                        Studio
                      </span>
                    </div>
                    <ChevronRight
                      :size="16"
                      class="text-black transition-transform duration-200"
                      :class="isCustomizeExpanded ? 'rotate-90' : ''"
                    />
                  </button>

                  <!-- Submenu list matching Desktop Mega Menu -->
                  <div
                    v-if="isCustomizeExpanded"
                    class="ml-3 pl-3 border-l border-neutral-200 flex flex-col gap-1 mt-1 mb-2 animate-fade-in"
                  >
                    <button
                      v-for="sub in customizeSubItems"
                      :key="sub.id"
                      @click="() => { isMenuOpen = false; emit('select-customize-option', sub.id); }"
                      class="flex items-center justify-between py-2 px-2 text-[13px] font-medium text-neutral-700 hover:text-black hover:bg-neutral-50 rounded-md transition-colors text-left cursor-pointer active:scale-98"
                    >
                      <span>{{ sub.name }}</span>
                      <ChevronRight :size="14" class="text-neutral-300 group-hover:text-black" />
                    </button>
                  </div>
                </div>
              </template>
            </nav>

            <div class="pt-5 space-y-4 text-sm text-neutral-600">
              <div class="flex items-center gap-3 py-1">
                <User :size="18" class="text-black" />
                <span class="font-medium text-black">Account:</span>
                <a href="#" class="hover:underline hover:text-black transition-colors">Login</a>
                <span>/</span>
                <a href="#" class="hover:underline hover:text-black transition-colors">Sign Up</a>
              </div>
              <div class="flex items-center gap-3 py-1">
                <Globe :size="18" class="text-black" />
                <span>Region: <strong class="text-black">Indonesia</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </header>
</template>

<style scoped>
@keyframes slideLeft {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-slide-left {
  animation: slideLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.animate-fade-in {
  animation: fadeIn 0.25s ease-out;
}
</style>
