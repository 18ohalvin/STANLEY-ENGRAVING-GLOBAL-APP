<script setup lang="ts">
import { ref } from 'vue'
import { X, ChevronDown, Plus, Minus, Check } from 'lucide-vue-next'
import cardQuestionsImg from '@/assets/images/card-questions.png'

defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'switch-card', cardId: string): void
}>()

const isDropdownOpen = ref(false)

const shortcutOptions = [
  { id: 'guided-ai', title: 'Guided to generation' },
  { id: 'artist-drops', title: 'Artist drop inspirations' },
]

const handleSelectCardShortcut = (cardId: string) => {
  isDropdownOpen.value = false
  emit('switch-card', cardId)
}

const openFaqIndex = ref<number | null>(0) // Default first FAQ open matching Figma

const toggleFaq = (index: number) => {
  openFaqIndex.value = openFaqIndex.value === index ? null : index
}

interface FaqItem {
  question: string
  intro?: string
  bullets?: string[]
  outro?: string
  content?: string
}

const faqs: FaqItem[] = [
  {
    question: 'What can I get on my bottle?',
    intro: 'With the Stanley Design Studio, we enable you to:',
    bullets: [
      'Engrave Custom Text: In your choice of fonts.',
      'Upload Vector Logos: Bring your brand to life.',
      'Generate AI Line Art: Create unique patterns and icons.',
    ],
    outro: 'A laser etches the top coat, revealing the premium stainless steel beneath for a permanent, dishwasher-safe finish.',
  },
  {
    question: 'What products can I customize?',
    intro: 'We currently support precision laser engraving across all iconic silhouettes:',
    bullets: [
      'The Quencher H2.0 FlowState™ Tumbler (30 oz & 40 oz)',
      'The Quencher ProTour Flip Straw Tumbler (40 oz)',
      'The IceFlow™ Flip Straw Tumbler (30 oz)',
      'Classic Legendary Camp Mug (12 oz) & Transit Travel Mug',
    ],
  },
  {
    question: 'What if I’m not an artist or designer?',
    content: 'No design skills needed! Our intuitive studio includes curated typography styles, guided AI prompt generators, and pre-licensed artist collections to create stunning engravings in minutes.',
  },
  {
    question: 'What size is the printable or engraveable area?',
    content: 'Engraving areas are tailored to each bottle silhouette. Quenchers allow up to a 4" x 7" vertical etching area, while Camp Mugs and IceFlows feature centered 3" x 3" zones to maintain ergonomic balance and insulation integrity.',
  },
  {
    question: 'Is there anything I can’t get on my bottle?',
    content: 'We cannot engrave copyrighted brand trademarks without permission, offensive content, or explicit graphics. All designs pass through an automated guideline check prior to production.',
  },
  {
    question: 'Can I engrave and print on a bottle?',
    content: 'Our studio specializes in precision laser etching, which permanently strips the durable powder coat to reveal raw surgical stainless steel. This creates a tactile, scratch-proof, dishwasher-safe finish that never peels.',
  },
  {
    question: 'What else can Stanley Customization do?',
    content: 'We offer corporate volume orders, personalized team drinkware, monogram party sets, and limited artist collaboration drops. Reach out to our customer care team for custom bulk requests.',
  },
]
</script>

<template>
  <Teleport to="body">
    <Transition name="fullscreen-modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 bg-white flex flex-col font-['Stanley_Favorit',sans-serif] select-none overflow-hidden"
        data-node-id="5217:2202"
        data-name="FAQ Pop Up"
      >
        <!-- 1. Sticky Header with Card Switcher (Figma Node 5682:6623) -->
        <header class="sticky top-0 z-40 bg-white px-[16px] py-[24px] sm:py-[32px] flex items-center justify-between border-b border-neutral-100 flex-none relative">
          <!-- Title & Shortcut Switcher Trigger -->
          <div
            @click="isDropdownOpen = !isDropdownOpen"
            class="flex items-center gap-[16px] cursor-pointer group py-1 -my-1 rounded-lg transition-all duration-200"
          >
            <h1 class="font-['Stanley_Favorit',sans-serif] font-medium text-[20px] text-black tracking-[-0.6px] leading-none whitespace-nowrap">
              What people are asking
            </h1>
            <ChevronDown
              :size="16"
              class="text-black transition-transform duration-300 transform-gpu"
              :class="{ 'rotate-180': isDropdownOpen }"
            />
          </div>

          <!-- Circular Close Button -->
          <button
            @click="emit('close')"
            class="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 hover:rotate-90 active:scale-90 text-neutral-800 hover:text-black flex items-center justify-center transition-all duration-200 transform-gpu cursor-pointer"
            aria-label="Close FAQ modal"
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
            <!-- 2.1 Hero Banner Image (Figma Node 5217:2203 / 5219:2588) -->
            <div class="w-full h-[400px] sm:h-[448px] overflow-hidden relative flex-none bg-[#e7e7d5]" data-node-id="5217:2203">
              <img
                :src="cardQuestionsImg"
                alt="What People Are Asking"
                class="w-full h-full object-cover object-[center_top] pointer-events-none"
              />
            </div>

            <!-- 2.2 FAQ Accordion List (Figma Node 5217:2548) -->
            <div class="px-[16px] py-[20px] flex flex-col gap-[10px]" data-node-id="5217:2548">
              <div
                v-for="(faq, index) in faqs"
                :key="index"
                class="bg-[#f5f5f5] hover:bg-[#ececec] active:scale-[0.99] rounded-[8px] px-[20px] py-[16px] flex flex-col transition-all duration-300 cursor-pointer select-none group"
                :class="openFaqIndex === index ? 'bg-[#f0f0f0] shadow-xs' : ''"
                :data-node-id="`5217:faq-${index}`"
                @click="toggleFaq(index)"
              >
                <!-- Question Row (Figma Node 5217:2550) -->
                <div class="flex items-center justify-between gap-3 w-full">
                  <h3 class="font-bold text-[14px] text-black tracking-normal leading-snug flex-1 group-hover:text-neutral-900 transition-colors">
                    {{ faq.question }}
                  </h3>
                  <!-- Desktop-style rotating morphing icon (+ to -) -->
                  <div class="w-6 h-6 shrink-0 flex items-center justify-center">
                    <div
                      class="w-5 h-5 flex items-center justify-center transition-transform duration-350 ease-[cubic-bezier(0.16,1,0.3,1)]"
                      :class="openFaqIndex === index ? 'rotate-90' : 'rotate-0'"
                    >
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" class="overflow-visible">
                        <!-- Horizontal bar (always visible) -->
                        <line
                          x1="3.5"
                          y1="10"
                          x2="16.5"
                          y2="10"
                          stroke="black"
                          stroke-width="1.4"
                          stroke-linecap="round"
                        />
                        <!-- Vertical bar (smoothly collapses into horizontal bar) -->
                        <line
                          x1="10"
                          y1="3.5"
                          x2="10"
                          y2="16.5"
                          stroke="black"
                          stroke-width="1.4"
                          stroke-linecap="round"
                          class="transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] origin-center"
                          :class="openFaqIndex === index ? 'scale-y-0 opacity-0' : 'scale-y-100 opacity-100'"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <!-- Silky Smooth Grid Height Expansion -->
                <div
                  class="grid transition-[grid-template-rows,opacity] duration-350 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  :class="openFaqIndex === index ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'"
                >
                  <div class="overflow-hidden">
                    <div
                      class="pt-3 font-light text-[12px] text-black leading-[22px] border-t border-neutral-200/50 mt-3 cursor-default"
                      @click.stop
                    >
                      <p v-if="faq.intro" class="mb-2">{{ faq.intro }}</p>

                      <ul v-if="faq.bullets" class="list-disc pl-4 space-y-1 mb-2 text-neutral-800">
                        <li v-for="(bullet, bIdx) in faq.bullets" :key="bIdx">
                          {{ bullet }}
                        </li>
                      </ul>

                      <p v-if="faq.outro" class="text-neutral-700 mt-2">{{ faq.outro }}</p>
                      <p v-if="faq.content" class="text-neutral-800">{{ faq.content }}</p>
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

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
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
