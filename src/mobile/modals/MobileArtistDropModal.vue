<script setup lang="ts">
import { ref } from 'vue'
import { X, ChevronDown, Check } from 'lucide-vue-next'
import iceflowImg from '@/assets/images/artist-drop-iceflow.png'
import { topGraphics } from '@/data/graphics'

defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'start-engrave', graphicId?: string): void
  (e: 'switch-card', cardId: string): void
}>()

const graphics = topGraphics
const selectedGraphicId = ref<string>(topGraphics[0]?.id || 'stanley-bear-crest')
const isDropdownOpen = ref(false)

const shortcutOptions = [
  { id: 'guided-ai', title: 'Guided to generation' },
  { id: 'faq', title: 'What people are asking' },
]

const selectGraphic = (id: string) => {
  selectedGraphicId.value = id
}

const handleStartEngrave = () => {
  emit('start-engrave', selectedGraphicId.value)
}

const handleSelectCardShortcut = (cardId: string) => {
  isDropdownOpen.value = false
  emit('switch-card', cardId)
}

const getActiveGraphicImage = () => {
  const g = graphics.find(item => item.id === selectedGraphicId.value)
  return g ? g.image : juveVikingImg
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fullscreen-modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 bg-white flex flex-col font-['Stanley_Favorit',sans-serif] select-none overflow-hidden"
        data-node-id="5219:6300"
        data-name="Artist Design Modal"
      >
        <!-- 1. Sticky Header with Card Switcher (Figma Node 5682:6623) -->
        <header class="sticky top-0 z-40 bg-white px-[16px] py-[24px] sm:py-[32px] flex items-center justify-between border-b border-neutral-100 flex-none relative">
          <!-- Title & Shortcut Switcher Trigger -->
          <div
            @click="isDropdownOpen = !isDropdownOpen"
            class="flex items-center gap-[16px] cursor-pointer group py-1 -my-1 rounded-lg transition-all duration-200"
            data-node-id="5682:6624"
          >
            <h1 class="font-['Stanley_Favorit',sans-serif] font-medium text-[20px] text-black tracking-[-0.6px] leading-none whitespace-nowrap" data-node-id="5682:6625">
              Artist drop inspirations
            </h1>
            <ChevronDown
              :size="16"
              class="text-black transition-transform duration-300 transform-gpu"
              :class="{ 'rotate-180': isDropdownOpen }"
              data-node-id="5682:6626"
            />
          </div>

          <!-- Circular Close Button (Figma Node 5682:6628) -->
          <button
            @click="emit('close')"
            class="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 hover:rotate-90 active:scale-90 text-neutral-800 hover:text-black flex items-center justify-center transition-all duration-200 transform-gpu cursor-pointer"
            aria-label="Close modal"
            data-node-id="5682:6628"
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
            <!-- 2.1 Banner Image Container with Engraved Tumbler (Figma Node 5635:11842 - h-[448px]) -->
            <div
              class="w-full h-[448px] overflow-hidden relative flex-none bg-[#e8e9e4] flex items-center justify-center"
              data-node-id="5635:11842"
            >
              <!-- IceFlow Tumbler Base -->
              <img
                :src="iceflowImg"
                alt="Stanley IceFlow Tumbler"
                class="w-full h-full object-cover object-top pointer-events-none transform-gpu scale-105"
                data-node-id="5635:11843"
              />

              <!-- Laser Etched Vector Artwork Overlay on Tumbler -->
              <div
                class="absolute inset-0 flex items-center justify-center pointer-events-none pt-12"
                data-node-id="5635:11845"
              >
                <div class="w-[188px] h-[188px] flex items-center justify-center transition-all duration-300">
                  <img
                    :src="getActiveGraphicImage()"
                    alt="Engraved Artwork"
                    class="max-w-full max-h-full object-contain filter drop-shadow-sm brightness-110 opacity-90 transition-all duration-300 transform-gpu"
                  />
                </div>
              </div>
            </div>

            <!-- 2.2 Main Content Section (Figma Node 5635:11848 - bg-[#f9f9f9]) -->
            <div
              class="bg-[#f9f9f9] px-[16px] py-[32px] flex flex-col gap-[24px] w-full"
              data-node-id="5635:11848"
            >
              <!-- Description Text (Figma Node 5219:6519) -->
              <p
                class="font-['Stanley_Favorit',sans-serif] font-normal text-[16px] text-[#666666] leading-[1.5]"
                data-node-id="5219:6519"
              >
                Explore unique creations from talented artists and see how different styles come to life.
              </p>

              <!-- Top 5 Artworks Container (Figma Node 5219:6343) -->
              <div class="flex flex-col gap-[16px] w-full" data-node-id="5219:6343">
                <div class="flex items-center w-full" data-node-id="5219:6344">
                  <h2 class="font-['Stanley_Favorit',sans-serif] font-medium text-[20px] text-black leading-[1.5]" data-node-id="5219:6345">
                    Top 5 Artworks.
                  </h2>
                </div>

                <!-- 3-Column Artworks Grid matching Figma Node 5682:6567 -->
                <div class="grid grid-cols-3 gap-[8px] w-full" data-node-id="5682:6567">
                  <div
                    v-for="item in graphics"
                    :key="item.id"
                    @click="selectGraphic(item.id)"
                    class="aspect-[138/184] bg-[#f5f5f5] hover:bg-[#ececec] rounded-[8px] p-[10px] flex flex-col items-center justify-between cursor-pointer select-none transition-all duration-200 active:scale-95 group border"
                    :class="selectedGraphicId === item.id ? 'border-black bg-white shadow-xs ring-1 ring-black' : 'border-transparent'"
                  >
                    <!-- Graphic Vector Image -->
                    <div class="w-full flex-1 flex items-center justify-center p-1">
                      <img
                        :src="item.img"
                        :alt="item.name"
                        class="max-w-full max-h-[84px] object-contain pointer-events-none transition-transform duration-300 group-hover:scale-105 transform-gpu"
                      />
                    </div>

                    <!-- Label Container (Figma Node 5682:6455) -->
                    <div class="flex flex-col items-center justify-center text-center w-full pt-1.5 gap-[2px]">
                      <span class="font-['Stanley_Favorit',sans-serif] font-normal text-[10px] text-black truncate w-full leading-tight">
                        {{ item.name }}
                      </span>
                      <span class="font-['Stanley_Favorit',sans-serif] font-normal text-[8px] text-neutral-500 truncate w-full leading-tight">
                        {{ item.subtext }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 2.3 Bottom CTA Button: Browse Gallery (Figma Node 5682:6572 / 5682:6573) -->
              <div class="pt-2 w-full" data-node-id="5682:6572">
                <button
                  @click="handleStartEngrave"
                  class="w-full h-[48px] bg-[#f9f9f9] border border-black rounded-[4px] font-['Stanley_Favorit',sans-serif] font-bold text-[12px] text-black hover:bg-black hover:text-white transition-all duration-200 cursor-pointer flex items-center justify-center btn-shimmer active:scale-95 shadow-2xs hover:shadow-md"
                  data-node-id="5682:6573"
                >
                  Browse Gallery
                </button>
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
