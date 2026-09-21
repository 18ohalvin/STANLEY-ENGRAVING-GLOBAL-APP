<script setup lang="ts">
import { ref } from 'vue'
import { Search, ShoppingBag, User, ChevronDown } from 'lucide-vue-next'
import stanleyLogo from '@/assets/images/stanley-logo.png'

defineProps<{
  standalone?: boolean
}>()

const activeTab = ref('CUSTOMIZE')
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
    <div class="bg-black text-white text-[12px] font-['Stanley_Favorit',sans-serif] tracking-wider h-[44px] px-4 sm:px-10 flex justify-between items-center select-none">
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

    <!-- Main Navigation Bar (80px) -->
    <div class="max-w-[1512px] mx-auto px-4 sm:px-10 h-[80px] flex items-center justify-between">
      <!-- Stanley Brand Logo -->
      <a href="/" class="flex items-center cursor-pointer select-none group">
        <img
          :src="stanleyLogo"
          alt="STANLEY"
          class="h-7 sm:h-8 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]"
        />
      </a>

      <!-- Navigation Links -->
      <nav class="hidden xl:flex items-center gap-7 text-[13px] font-['Stanley_Favorit',sans-serif] font-medium tracking-normal text-neutral-800">
        <button
          v-for="link in navLinks"
          :key="link.name"
          @click="activeTab = link.name"
          :class="[
            'cursor-pointer transition-all duration-150 py-1 relative',
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
  </header>
</template>
