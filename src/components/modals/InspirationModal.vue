<script setup lang="ts">
import { Sparkles, HelpCircle, Palette, CheckCircle2 } from 'lucide-vue-next'
import type { InspirationCard } from '@/data/catalog'

defineProps<{
  card: InspirationCard | null
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'start-design'): void
}>()
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen && card"
      class="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-fade-in select-none"
      @click.self="emit('close')"
    >
      <!-- Global Get To Know More Modal Container (Locked: 1200px x 600px, rounded-[16px]) -->
      <div
        class="bg-white rounded-[16px] w-full max-w-[1200px] h-full max-h-[850px] lg:w-[1200px] lg:h-[600px] overflow-hidden relative shadow-2xl flex flex-col lg:flex-row border border-neutral-100 animate-scale-up"
      >
        <!-- Background Hero Visual (Right-aligned, hidden on small screens) -->
        <div class="absolute inset-0 pointer-events-none hidden lg:block overflow-hidden">
          <img
            :src="card.image"
            :alt="card.titleLine1"
            class="absolute right-0 top-0 w-full h-[603px] object-cover object-right pointer-events-none"
          />
        </div>

        <!-- Global Close Button (40x40 #E9E6E6 circle with 1.2px vector X) -->
        <button
          @click="emit('close')"
          class="absolute top-5 sm:top-[32px] right-5 sm:right-[32px] z-30 w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer hover:opacity-85 active:scale-95 shadow-xs"
          aria-label="Close modal"
        >
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="20" fill="#E9E6E6" />
            <path
              d="M28.8888 11.1111L11.111 28.8889M11.111 11.1111L28.8888 28.8889"
              stroke="black"
              stroke-width="1.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>

        <!-- Left Content Container (756px width, px-64 pt-64, no-scrollbar) -->
        <div
          class="relative z-10 w-full lg:w-[756px] p-6 sm:p-10 lg:px-[64px] lg:pt-[64px] lg:pb-8 flex flex-col justify-between gap-[24px] overflow-y-auto max-h-full bg-white/95 lg:bg-transparent backdrop-blur-xs lg:backdrop-blur-none no-scrollbar"
        >
          <div class="flex flex-col gap-[20px]">
            <!-- Header Group -->
            <div class="flex-none">
              <div class="inline-flex items-center gap-1.5 px-3 py-1 bg-[#f0ede6] text-neutral-800 rounded-full text-[11px] font-['Stanley_Favorit',sans-serif] font-medium tracking-wide mb-2.5">
                <Sparkles v-if="card.id === 'guided-ai'" :size="12" />
                <HelpCircle v-else-if="card.id === 'faq'" :size="12" />
                <Palette v-else :size="12" />
                <span>{{ card.tag }}</span>
              </div>
              <h1 class="font-['Stanley_Favorit',sans-serif] font-medium text-2xl sm:text-3xl lg:text-[32px] text-black tracking-[-0.96px] leading-tight">
                {{ card.titleLine1 }} {{ card.titleLine2 }}
              </h1>
            </div>

            <!-- Content Area (Max 560px width matching global container) -->
            <div class="w-full max-w-[560px] flex flex-col gap-4">
              <p class="font-['Stanley_Favorit',sans-serif] font-light text-[13px] text-neutral-700 leading-[18px]">
                {{ card.description }}
              </p>

              <!-- Dynamic card details in global gray rounded cards -->
              <div v-if="card.id === 'guided-ai'" class="flex flex-col gap-2.5">
                <h2 class="font-['Stanley_Favorit',sans-serif] font-medium text-[15px] text-black">
                  Recommended AI Prompts
                </h2>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div class="p-3.5 rounded-[8px] bg-[#f5f5f5] border border-neutral-200/60">
                    <span class="text-[10px] font-mono text-neutral-500 block mb-1">PROMPT STYLE 01</span>
                    <p class="font-['Stanley_Favorit',sans-serif] font-light text-[12px] text-black leading-[16px]">
                      "Botanical single-line art with delicate leaves and geometric sunburst"
                    </p>
                  </div>
                  <div class="p-3.5 rounded-[8px] bg-[#f5f5f5] border border-neutral-200/60">
                    <span class="text-[10px] font-mono text-neutral-500 block mb-1">PROMPT STYLE 02</span>
                    <p class="font-['Stanley_Favorit',sans-serif] font-light text-[12px] text-black leading-[16px]">
                      "Minimalist mountain ridge contour with geographic coordinates"
                    </p>
                  </div>
                </div>
              </div>

              <div v-else class="flex flex-col gap-2.5">
                <h2 class="font-['Stanley_Favorit',sans-serif] font-medium text-[15px] text-black">
                  Stanley x Liunic on Things Drop
                </h2>
                <div class="p-4 rounded-[8px] bg-[#f5f5f5] border border-neutral-200/60 space-y-2.5">
                  <p class="font-['Stanley_Favorit',sans-serif] font-light text-[12px] text-neutral-800 leading-[16px]">
                    Featuring whimsical playful characters, positive affirmation icons, and bold graffiti flourishes designed exclusively for Stanley tumblers and mugs.
                  </p>
                  <div class="flex items-center gap-3 pt-1">
                    <div class="flex items-center gap-1.5 text-[11px] font-['Stanley_Favorit',sans-serif] font-medium text-neutral-800">
                      <CheckCircle2 :size="14" class="text-black" />
                      <span>Vector Certified</span>
                    </div>
                    <div class="flex items-center gap-1.5 text-[11px] font-['Stanley_Favorit',sans-serif] font-medium text-neutral-800">
                      <CheckCircle2 :size="14" class="text-black" />
                      <span>Limited Edition</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Action Buttons (Max 560px width) -->
          <div class="w-full max-w-[560px] pt-4 flex items-center justify-end gap-3 border-t border-neutral-200/80">
            <button
              @click="emit('close')"
              class="px-5 py-2.5 rounded-[8px] border border-neutral-300 hover:border-black text-[13px] font-['Stanley_Favorit',sans-serif] font-medium text-black transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              @click="() => { emit('close'); emit('start-design'); }"
              class="px-6 py-2.5 rounded-[8px] bg-black hover:bg-neutral-800 text-white text-[13px] font-['Stanley_Favorit',sans-serif] font-medium transition-all shadow-xs cursor-pointer active:scale-95"
            >
              Start Engraving
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
