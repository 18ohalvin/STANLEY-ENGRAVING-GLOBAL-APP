<script setup lang="ts">
import { ref } from 'vue'
import { X, ChevronDown, Plus, Minus } from 'lucide-vue-next'
import iceflowImg from '@/assets/images/artist-drop-iceflow.png'
import type { InspirationCard } from '@/data/catalog'

defineProps<{
  card: InspirationCard | null
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'start-design', prompt?: string): void
  (e: 'switch-card', cardId: string): void
}>()

const isDropdownOpen = ref(false)

const shortcutOptions = [
  { id: 'faq', title: 'What people are asking' },
  { id: 'artist-drops', title: 'Artist drop inspirations' },
]

const handleSelectCardShortcut = (cardId: string) => {
  isDropdownOpen.value = false
  emit('switch-card', cardId)
}

interface PromptStyle {
  id: number
  title: string
  description: string
}

const promptStyles: PromptStyle[] = [
  {
    id: 1,
    title: 'Prompt Style 1',
    description: 'Abstract geometric cat pattern with fine organic linework, stylized whiskers, and minimal celestial elements',
  },
  {
    id: 2,
    title: 'Prompt Style 2',
    description: 'Minimalist botanical line art with delicate fern fronds, subtle stippling texture, and clean geometric border',
  },
  {
    id: 3,
    title: 'Prompt Style 3',
    description: 'Vintage topographical mountain contours with sunburst accents and bold adventure typography',
  },
  {
    id: 4,
    title: 'Prompt Style 4',
    description: 'Geometric origami wildlife silhouette with crisp vector facets and modern Nordic aesthetics',
  },
  {
    id: 5,
    title: 'Prompt Style 5',
    description: 'Classic heritage emblem with intertwined monogram, laurel wreath, and precision laser crosshatch shading',
  },
]

const openPromptIndex = ref<number | null>(0) // Default Prompt Style 1 open matching Figma 5219:5161

const togglePrompt = (index: number) => {
  openPromptIndex.value = openPromptIndex.value === index ? null : index
}

const handleUsePrompt = (prompt: PromptStyle) => {
  emit('start-design', prompt.description)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fullscreen-modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 bg-white flex flex-col font-['Stanley_Favorit',sans-serif] select-none overflow-hidden"
        data-node-id="5219:5161"
        data-name="Guided to Generate Your Design"
      >
        <!-- 1. Sticky Header with Card Switcher (Figma Node 5654:1970) -->
        <header class="sticky top-0 z-40 bg-white px-[16px] py-[24px] sm:py-[32px] flex items-center justify-between border-b border-neutral-100 flex-none relative">
          <!-- Title & Shortcut Switcher Trigger -->
          <div
            @click="isDropdownOpen = !isDropdownOpen"
            class="flex items-center gap-[16px] cursor-pointer group py-1 -my-1 rounded-lg transition-all duration-200"
            data-node-id="5654:1971"
          >
            <h1 class="font-['Stanley_Favorit',sans-serif] font-medium text-[20px] text-black tracking-[-0.6px] leading-none whitespace-nowrap" data-node-id="5654:1972">
              Guided to generation
            </h1>
            <ChevronDown
              :size="16"
              class="text-black transition-transform duration-300 transform-gpu"
              :class="{ 'rotate-180': isDropdownOpen }"
              data-node-id="5654:1973"
            />
          </div>

          <!-- Circular Close Button (Figma Node 5654:1975) -->
          <button
            @click="emit('close')"
            class="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 hover:rotate-90 active:scale-90 text-neutral-800 hover:text-black flex items-center justify-center transition-all duration-200 transform-gpu cursor-pointer"
            aria-label="Close modal"
            data-node-id="5654:1975"
          >
            <X :size="18" :stroke-width="2" />
          </button>

          <!-- Pop-up Menu matching Figma Node 5682:6640 (Full width under header, auto height) -->
          <Transition name="dropdown-slide">
            <div
              v-if="isDropdownOpen"
              class="absolute top-full left-0 right-0 w-full bg-white px-[16px] pt-[20px] pb-[24px] border-b border-neutral-200 shadow-2xl z-50 flex flex-col gap-[16px]"
              data-node-id="5682:6637"
              data-name="FAQ Content"
            >
              <button
                v-for="item in shortcutOptions"
                :key="item.id"
                @click.stop="handleSelectCardShortcut(item.id)"
                class="text-left font-['Stanley_Favorit',sans-serif] font-normal text-[16px] text-black tracking-normal leading-[normal] cursor-pointer select-none py-1 hover:opacity-75"
              >
                {{ item.title }}
              </button>
            </div>
          </Transition>
        </header>

        <!-- Darker background overlay of the page when pop-up is open -->
        <Transition name="fade">
          <div
            v-if="isDropdownOpen"
            @click="isDropdownOpen = false"
            class="fixed inset-0 top-[73px] sm:top-[81px] z-30 bg-black/50 backdrop-blur-2xs transition-opacity"
          ></div>
        </Transition>

        <!-- 2. Scrollable Body -->
        <main class="flex-1 overflow-y-auto overscroll-contain pb-16">
          <div class="w-full max-w-[430px] mx-auto flex flex-col">
            <!-- 2.1 Banner Image Container with IceFlow Tumbler (Figma Node 5219:5163 - h-[448px]) -->
            <div
              class="w-full h-[448px] overflow-hidden relative flex-none bg-[#e8e9e4] flex items-center justify-center py-[24px]"
              data-node-id="5219:5163"
            >
              <img
                :src="iceflowImg"
                alt="Stanley IceFlow Tumbler"
                class="h-full w-auto max-w-full object-contain pointer-events-none transform-gpu drop-shadow-md"
                data-node-id="5256:8729"
              />
            </div>

            <!-- 2.2 Content Container (Figma Node 5219:5165 - p-[16px]) -->
            <div class="p-[16px] flex flex-col w-full" data-node-id="5219:5165">
              <div class="flex flex-col gap-[8px] w-full" data-node-id="5219:6269">
                <div
                  v-for="(prompt, index) in promptStyles"
                  :key="prompt.id"
                  class="bg-[#f5f5f5] rounded-[8px] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden"
                  :class="openPromptIndex === index ? 'px-[24px] py-[16px]' : 'px-[24px] py-[16px] hover:bg-[#ececec]'"
                >
                  <!-- Question / Title Header -->
                  <div
                    @click="togglePrompt(index)"
                    class="flex items-center justify-between cursor-pointer select-none w-full"
                  >
                    <span class="font-['Stanley_Favorit',sans-serif] font-bold text-[14px] text-black leading-normal">
                      {{ prompt.title }}
                    </span>
                    <button
                      type="button"
                      class="w-6 h-6 flex items-center justify-center text-black flex-none transition-transform duration-300 transform-gpu"
                      :class="{ 'rotate-90': openPromptIndex === index }"
                      aria-label="Toggle prompt style details"
                    >
                      <Minus v-if="openPromptIndex === index" :size="22" class="stroke-[1.5]" />
                      <Plus v-else :size="22" class="stroke-[1.5]" />
                    </button>
                  </div>

                  <!-- Expandable Answer Body with smooth CSS Grid transition -->
                  <div
                    class="grid transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    :class="openPromptIndex === index ? 'grid-rows-[1fr] opacity-100 mt-6' : 'grid-rows-[0fr] opacity-0 mt-0'"
                  >
                    <div class="overflow-hidden flex flex-col gap-[24px]">
                      <!-- Prompt Description (Figma Node 5219:6276) -->
                      <p class="font-['Stanley_Favorit',sans-serif] font-light text-[12px] text-black leading-[1.4]">
                        {{ prompt.description }}
                      </p>

                      <!-- "Use Prompt" Action Button (Figma Node 5219:6277 - h-[40px] w-[111px]) -->
                      <button
                        type="button"
                        @click="handleUsePrompt(prompt)"
                        class="h-[40px] w-[111px] border border-black border-solid rounded-[4px] px-[16px] flex items-center justify-center font-['Stanley_Favorit',sans-serif] font-medium text-[12px] text-black hover:bg-black hover:text-white active:scale-95 transition-all duration-200 cursor-pointer"
                        data-node-id="5219:6277"
                      >
                        Use Prompt
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Full-screen smooth slide transition matching Explore the Lineup */
.fullscreen-modal-enter-active,
.fullscreen-modal-leave-active {
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.fullscreen-modal-enter-from,
.fullscreen-modal-leave-to {
  transform: translateY(100%);
  opacity: 0.5;
}

.fullscreen-modal-enter-to,
.fullscreen-modal-leave-from {
  transform: translateY(0);
  opacity: 1;
}

/* Dropdown Slide Animation matching Figma 5682:6640 */
.dropdown-slide-enter-active,
.dropdown-slide-leave-active {
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.dropdown-slide-enter-from,
.dropdown-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
.dropdown-slide-enter-to,
.dropdown-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
