<script setup lang="ts">
import { ref } from 'vue'
import { ArrowRight, Instagram, Facebook, Twitter, Youtube } from 'lucide-vue-next'
import stanleyLogo from '@/assets/images/stanley-logo.png'

const email = ref('')
const subscribed = ref(false)

const handleSubscribe = () => {
  if (!email.value) return
  subscribed.value = true
  email.value = ''
  setTimeout(() => {
    subscribed.value = false
  }, 4000)
}
</script>

<template>
  <footer class="w-full bg-[#161616] text-white pt-16 pb-12 border-t border-neutral-800 select-none">
    <div class="max-w-[1512px] mx-auto px-4 sm:px-10">
      <!-- Top Grid: Brand, Newsletter, Navigation Links -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-neutral-800">
        <!-- Col 1: Brand Wordmark & Story -->
        <div class="lg:col-span-2 space-y-4">
          <div class="flex items-center">
            <img
              :src="stanleyLogo"
              alt="STANLEY"
              class="h-7 w-auto object-contain brightness-0 invert"
            />
          </div>
          <p class="text-sm font-['Stanley_Favorit',sans-serif] font-light text-neutral-400 max-w-sm leading-relaxed">
            Built for life since 1913. Create timeless, bespoke laser-engraved drinkware crafted with recycled 18/8 stainless steel and unmatched thermal retention.
          </p>
          <div class="pt-2 text-xs font-mono text-neutral-500 uppercase tracking-wider">
            STANLEY GLOBAL ENGRAVING STUDIO • INDONESIA
          </div>
        </div>

        <!-- Col 2: Engraving Studio Navigation -->
        <div>
          <h4 class="font-['Stanley_Favorit',sans-serif] font-bold text-sm tracking-wider uppercase mb-4 text-white">
            Custom Studio
          </h4>
          <ul class="space-y-2.5 text-sm font-['Stanley_Favorit',sans-serif] font-normal text-neutral-400">
            <li><a href="#" class="hover:text-white transition-colors">How Laser Engraving Works</a></li>
            <li><a href="#" class="hover:text-white transition-colors">Artist Collaboration Drops</a></li>
            <li><a href="#" class="hover:text-white transition-colors">Corporate & Bulk Orders</a></li>
            <li><a href="#" class="hover:text-white transition-colors">Monogram Guidelines</a></li>
            <li><a href="#" class="hover:text-white transition-colors">Vector Artwork Requirements</a></li>
          </ul>
        </div>

        <!-- Col 3: Customer Care & Warranty -->
        <div>
          <h4 class="font-['Stanley_Favorit',sans-serif] font-bold text-sm tracking-wider uppercase mb-4 text-white">
            Support & Care
          </h4>
          <ul class="space-y-2.5 text-sm font-['Stanley_Favorit',sans-serif] font-normal text-neutral-400">
            <li><a href="#" class="hover:text-white transition-colors">Lifetime Warranty Coverage</a></li>
            <li><a href="#" class="hover:text-white transition-colors">Care & Cleaning Guide</a></li>
            <li><a href="#" class="hover:text-white transition-colors">Shipping & Lead Times</a></li>
            <li><a href="#" class="hover:text-white transition-colors">Track Custom Order</a></li>
            <li><a href="#" class="hover:text-white transition-colors">Contact Support</a></li>
          </ul>
        </div>

        <!-- Col 4: Newsletter Subscription -->
        <div>
          <h4 class="font-['Stanley_Favorit',sans-serif] font-bold text-sm tracking-wider uppercase mb-4 text-white">
            Stay Inspired
          </h4>
          <p class="text-xs font-['Stanley_Favorit',sans-serif] font-light text-neutral-400 mb-3 leading-relaxed">
            Subscribe for early access to limited edition artist drops and seasonal colorways.
          </p>

          <form @submit.prevent="handleSubscribe" class="relative">
            <input
              v-model="email"
              type="email"
              placeholder="Enter your email"
              required
              class="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white transition-colors"
            />
            <button
              type="submit"
              class="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-white hover:bg-neutral-200 text-black rounded-md flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Subscribe"
            >
              <ArrowRight :size="16" />
            </button>
          </form>

          <div v-if="subscribed" class="mt-2 text-xs text-emerald-400 font-medium animate-fade-in">
            ✓ Thank you for subscribing!
          </div>
        </div>
      </div>

      <!-- Bottom Bar: Copyright & Socials -->
      <div class="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-['Stanley_Favorit',sans-serif] text-neutral-500">
        <div class="flex items-center gap-6">
          <span>© 2026 Stanley 1913. All Rights Reserved.</span>
          <a href="#" class="hover:text-neutral-300 transition-colors">Privacy Policy</a>
          <a href="#" class="hover:text-neutral-300 transition-colors">Terms of Service</a>
        </div>

        <!-- Social Icons -->
        <div class="flex items-center gap-4 text-neutral-400">
          <a href="#" class="hover:text-white transition-colors" aria-label="Instagram"><Instagram :size="18" /></a>
          <a href="#" class="hover:text-white transition-colors" aria-label="Facebook"><Facebook :size="18" /></a>
          <a href="#" class="hover:text-white transition-colors" aria-label="Twitter"><Twitter :size="18" /></a>
          <a href="#" class="hover:text-white transition-colors" aria-label="YouTube"><Youtube :size="18" /></a>
        </div>
      </div>
    </div>
  </footer>
</template>
