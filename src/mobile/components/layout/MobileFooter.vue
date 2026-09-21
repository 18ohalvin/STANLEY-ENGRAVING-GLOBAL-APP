<script setup lang="ts">
import { ref } from 'vue'
import { ChevronDown, ArrowRight, Instagram, Facebook, Twitter, Youtube } from 'lucide-vue-next'
import stanleyLogo from '@/assets/images/stanley-logo.png'

const activeAccordion = ref<string | null>(null)
const email = ref('')
const isSubscribed = ref(false)

const toggleAccordion = (name: string) => {
  activeAccordion.value = activeAccordion.value === name ? null : name
}

const handleSubscribe = () => {
  if (!email.value) return
  isSubscribed.value = true
  email.value = ''
  setTimeout(() => {
    isSubscribed.value = false
  }, 4000)
}
</script>

<template>
  <footer class="w-full bg-[#161616] text-white pt-10 pb-12 px-5 font-['Stanley_Favorit',sans-serif] border-t border-neutral-800 select-none">
    <!-- 1. Brand Logo & Story -->
    <div class="space-y-3 pb-8 border-b border-neutral-800">
      <img
        :src="stanleyLogo"
        alt="STANLEY"
        class="h-6 w-auto object-contain brightness-0 invert"
      />
      <p class="text-xs font-light text-neutral-400 leading-relaxed max-w-sm">
        Built for life since 1913. Create timeless, bespoke laser-engraved drinkware crafted with recycled 18/8 stainless steel and unmatched thermal retention.
      </p>
      <div class="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">
        STANLEY GLOBAL ENGRAVING STUDIO • INDONESIA
      </div>
    </div>

    <!-- 2. Mobile Accordion Navigation -->
    <div class="divide-y divide-neutral-800 text-sm">
      <!-- Section 1: Custom Studio -->
      <div class="py-3.5">
        <button
          @click="toggleAccordion('custom')"
          class="w-full flex items-center justify-between font-bold text-xs uppercase tracking-wider text-left text-neutral-300 hover:text-white transition-colors cursor-pointer"
        >
          <span>Custom Studio</span>
          <ChevronDown
            :size="16"
            class="transition-transform duration-300 text-neutral-400 transform-gpu"
            :class="{ 'rotate-180': activeAccordion === 'custom' }"
          />
        </button>
        <div
          class="grid transition-[grid-template-rows,opacity] duration-350 ease-[cubic-bezier(0.16,1,0.3,1)]"
          :class="activeAccordion === 'custom' ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'"
        >
          <div class="overflow-hidden">
            <div class="pt-3 pb-2 space-y-2 text-xs text-neutral-400">
              <p><a href="#" class="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">How Laser Engraving Works</a></p>
              <p><a href="#" class="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">Artist Collaboration Drops</a></p>
              <p><a href="#" class="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">Corporate & Bulk Orders</a></p>
              <p><a href="#" class="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">Monogram Guidelines</a></p>
              <p><a href="#" class="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">Vector Artwork Requirements</a></p>
            </div>
          </div>
        </div>
      </div>

      <!-- Section 2: Support & Care -->
      <div class="py-3.5">
        <button
          @click="toggleAccordion('support')"
          class="w-full flex items-center justify-between font-bold text-xs uppercase tracking-wider text-left text-neutral-300 hover:text-white transition-colors cursor-pointer"
        >
          <span>Support & Care</span>
          <ChevronDown
            :size="16"
            class="transition-transform duration-300 text-neutral-400 transform-gpu"
            :class="{ 'rotate-180': activeAccordion === 'support' }"
          />
        </button>
        <div
          class="grid transition-[grid-template-rows,opacity] duration-350 ease-[cubic-bezier(0.16,1,0.3,1)]"
          :class="activeAccordion === 'support' ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'"
        >
          <div class="overflow-hidden">
            <div class="pt-3 pb-2 space-y-2 text-xs text-neutral-400">
              <p><a href="#" class="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">FAQ & Cleaning Care</a></p>
              <p><a href="#" class="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">Lifetime Warranty Info</a></p>
              <p><a href="#" class="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">Shipping & Delivery Policies</a></p>
              <p><a href="#" class="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">Track Custom Order</a></p>
              <p><a href="#" class="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">Contact Customer Service</a></p>
            </div>
          </div>
        </div>
      </div>

      <!-- Section 3: Company -->
      <div class="py-3.5">
        <button
          @click="toggleAccordion('company')"
          class="w-full flex items-center justify-between font-bold text-xs uppercase tracking-wider text-left text-neutral-300 hover:text-white transition-colors cursor-pointer"
        >
          <span>Company</span>
          <ChevronDown
            :size="16"
            class="transition-transform duration-300 text-neutral-400 transform-gpu"
            :class="{ 'rotate-180': activeAccordion === 'company' }"
          />
        </button>
        <div
          class="grid transition-[grid-template-rows,opacity] duration-350 ease-[cubic-bezier(0.16,1,0.3,1)]"
          :class="activeAccordion === 'company' ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'"
        >
          <div class="overflow-hidden">
            <div class="pt-3 pb-2 space-y-2 text-xs text-neutral-400">
              <p><a href="#" class="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">Our 1913 Heritage</a></p>
              <p><a href="#" class="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">Sustainability & Recycled Steel</a></p>
              <p><a href="#" class="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">Store Locator Indonesia</a></p>
              <p><a href="#" class="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">Careers at Stanley</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. Newsletter Subscription -->
    <div class="pt-8 pb-6 space-y-3">
      <h4 class="text-xs font-bold uppercase tracking-wider text-white">
        Be the First to Know
      </h4>
      <p class="text-xs text-neutral-400">
        Sign up for limited edition artist drops, engraving events, and exclusive seasonal releases.
      </p>

      <form @submit.prevent="handleSubscribe" class="flex gap-2 pt-1">
        <input
          v-model="email"
          type="email"
          placeholder="Enter your email"
          required
          class="flex-1 bg-neutral-900 border border-neutral-700 rounded-md px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white transition-colors"
        />
        <button
          type="submit"
          class="bg-white text-black px-4 py-2.5 rounded-md font-bold text-xs hover:bg-neutral-200 active:scale-95 transition-all flex items-center justify-center cursor-pointer btn-shimmer transform-gpu"
        >
          <ArrowRight :size="15" />
        </button>
      </form>

      <div v-if="isSubscribed" class="text-xs text-emerald-400 font-medium animate-fade-in">
        Thank you for subscribing! Check your inbox for updates.
      </div>
    </div>

    <!-- 4. Social Links & Copyright -->
    <div class="pt-6 border-t border-neutral-800 flex flex-col gap-4">
      <div class="flex items-center gap-5 text-neutral-400">
        <a href="#" class="hover:text-white hover:scale-125 active:scale-90 transition-all duration-200 transform-gpu" aria-label="Instagram"><Instagram :size="18" /></a>
        <a href="#" class="hover:text-white hover:scale-125 active:scale-90 transition-all duration-200 transform-gpu" aria-label="Facebook"><Facebook :size="18" /></a>
        <a href="#" class="hover:text-white hover:scale-125 active:scale-90 transition-all duration-200 transform-gpu" aria-label="Twitter"><Twitter :size="18" /></a>
        <a href="#" class="hover:text-white hover:scale-125 active:scale-90 transition-all duration-200 transform-gpu" aria-label="YouTube"><Youtube :size="18" /></a>
      </div>

      <div class="text-[11px] text-neutral-500 space-y-1">
        <p>&copy; {{ new Date().getFullYear() }} Stanley 1913. All rights reserved.</p>
        <div class="flex gap-3 text-neutral-400">
          <a href="#" class="hover:underline hover:text-white transition-colors">Privacy Policy</a>
          <span>•</span>
          <a href="#" class="hover:underline hover:text-white transition-colors">Terms of Service</a>
          <span>•</span>
          <a href="#" class="hover:underline hover:text-white transition-colors">Engraving Terms</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}
</style>
