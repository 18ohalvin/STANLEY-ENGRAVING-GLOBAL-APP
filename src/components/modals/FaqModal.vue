<script setup lang="ts">
import { ref } from 'vue'
import faqHeroImg from '@/assets/images/card-questions.png'

defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

// Default: first question is expanded (matching Figma Node 5074:8117)
const openFaqId = ref<number | null>(1)

const toggleFaq = (id: number) => {
  openFaqId.value = openFaqId.value === id ? null : id
}

interface FaqItem {
  id: number
  question: string
  intro?: string
  bullets?: string[]
  outro?: string
}

const faqs: FaqItem[] = [
  {
    id: 1,
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
    id: 2,
    question: 'What products can I customize?',
    intro: 'Currently, you can customize our most sought-after hydration silhouettes:',
    bullets: [
      'The Quencher H2.0 FlowState™ Tumbler (30 oz, 40 oz, 50 oz, 64 oz)',
      'The IceFlow™ Flip Straw Tumbler (20 oz, 30 oz)',
      'The Legendary Classic Camp Mug & Café Tumblers',
    ],
    outro: 'We continuously add new colors and limited-edition product drops to our custom studio.',
  },
  {
    id: 3,
    question: 'What if I’m not an artist or designer?',
    intro: 'No design experience required! Our studio is crafted for simplicity:',
    bullets: [
      'Select from curated typography fonts and styles.',
      'Browse exclusive Stanley artwork and partner collaboration marks.',
      'Our layout engine automatically balances text sizing and orientation.',
    ],
    outro: 'Preview your creation in real-time before finalizing your engraving order.',
  },
  {
    id: 4,
    question: 'What size is the printable or engraveable area?',
    intro: 'Engraving boundaries are calibrated to match each tumbler\'s ergonomic curvature:',
    bullets: [
      'Quencher: Up to 3.5” wide × 5.5” tall on the body.',
      'IceFlow & Mugs: Up to 3.0” wide × 4.0” tall calibrated area.',
    ],
    outro: 'Live boundary guides inside the customizer ensure your artwork stays within certified laser tolerance.',
  },
  {
    id: 5,
    question: 'Is there anything I can’t get on my bottle?',
    intro: 'We uphold strict brand and community integrity standards:',
    bullets: [
      'Profane, hateful, or discriminatory language.',
      'Unlicensed copyrighted emblems or trademarks.',
      'Explicit or offensive imagery.',
    ],
    outro: 'All submissions pass through automated filters and quality review before laser engraving.',
  },
]
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-fade-in select-none"
      @click.self="emit('close')"
    >
      <!-- Main Modal Card Container (Figma Node 5074:8112 - 1200px wide x 600px high, rounded-[16px]) -->
      <div
        class="bg-white rounded-[16px] w-full max-w-[1200px] h-full max-h-[850px] lg:w-[1200px] lg:h-[600px] overflow-hidden relative shadow-2xl flex flex-col lg:flex-row border border-neutral-100 animate-scale-up"
      >
        <!-- Background Hero Visual (Figma Node 5074:8113 - 1200px x 603px) -->
        <div class="absolute inset-0 pointer-events-none hidden lg:block overflow-hidden">
          <img
            :src="faqHeroImg"
            alt="What People Are Asking"
            class="absolute right-0 top-0 w-full h-[603px] object-cover object-right pointer-events-none"
          />
        </div>

        <!-- Close Button (Figma Node 5074:8153 - lets-icons:close-round-duotone 40x40 #E9E6E6 circle) -->
        <button
          @click="emit('close')"
          class="absolute top-5 sm:top-[32px] right-5 sm:right-[32px] z-30 w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer hover:opacity-85 active:scale-95 shadow-xs"
          aria-label="Close FAQ modal"
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

        <!-- Left FAQ Content Container (Figma Node 5074:8114 - 756px width, px-64 pt-64, gap-32) -->
        <div
          class="relative z-10 w-full lg:w-[756px] p-6 sm:p-10 lg:px-[64px] lg:pt-[64px] lg:pb-0 flex flex-col gap-[32px] overflow-y-auto max-h-full bg-white/95 lg:bg-transparent backdrop-blur-xs lg:backdrop-blur-none no-scrollbar"
        >
          <!-- Header (Figma Node 5074:8115 - Matching landing page h2 section title font size: 2xl sm:3xl lg:32px, tracking -0.96px) -->
          <div class="flex-none">
            <h1 class="font-['Stanley_Favorit',sans-serif] font-medium text-2xl sm:text-3xl lg:text-[32px] text-black tracking-[-0.96px] leading-tight">
              What People Are Asking
            </h1>
          </div>

          <!-- FAQ Accordion List (Figma Node 5074:8116 - 560px width, gap 8px) -->
          <div class="flex flex-col gap-[8px] w-full max-w-[560px]">
            <div
              v-for="item in faqs"
              :key="item.id"
              class="bg-[#f5f5f5] hover:bg-[#eaeaea] rounded-[8px] px-[24px] py-[16px] flex flex-col transition-colors duration-200 cursor-pointer select-none"
              @click="toggleFaq(item.id)"
            >
              <!-- Question Header Row (Figma Node 5074:8118 - h-[24px]) -->
              <div class="flex items-center justify-between w-full h-[24px]">
                <span class="font-['Stanley_Favorit',sans-serif] font-medium text-[16px] text-black leading-normal">
                  {{ item.question }}
                </span>

                <!-- Premium Rotating Morphing Icon (+ to -) -->
                <div class="w-6 h-6 shrink-0 flex items-center justify-center">
                  <div
                    class="w-5 h-5 flex items-center justify-center transition-transform duration-350 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    :class="openFaqId === item.id ? 'rotate-90' : 'rotate-0'"
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" class="overflow-visible">
                      <!-- Horizontal bar (always present) -->
                      <line
                        x1="3.5"
                        y1="10"
                        x2="16.5"
                        y2="10"
                        stroke="black"
                        stroke-width="1.25"
                        stroke-linecap="round"
                      />
                      <!-- Vertical bar (smoothly collapses from center when open) -->
                      <line
                        x1="10"
                        y1="3.5"
                        x2="10"
                        y2="16.5"
                        stroke="black"
                        stroke-width="1.25"
                        stroke-linecap="round"
                        class="transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] origin-center"
                        :class="openFaqId === item.id ? 'scale-y-0 opacity-0' : 'scale-y-100 opacity-100'"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <!-- Accordion Expanded Answer Body (Silky Smooth CSS Grid Height Animation) -->
              <div
                class="grid transition-[grid-template-rows,opacity] duration-350 ease-[cubic-bezier(0.16,1,0.3,1)]"
                :class="openFaqId === item.id ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'"
              >
                <div class="overflow-hidden">
                  <div
                    class="pt-[20px] font-['Stanley_Favorit',sans-serif] font-light text-[12px] text-black leading-[16px] cursor-default"
                    @click.stop
                  >
                    <p v-if="item.intro" class="mb-0 leading-[16px]">
                      {{ item.intro }}
                    </p>

                    <ul v-if="item.bullets && item.bullets.length" class="list-disc pl-[18px] mb-0 mt-0">
                      <li v-for="(bullet, bIdx) in item.bullets" :key="bIdx" class="leading-[16px]">
                        {{ bullet }}
                      </li>
                    </ul>

                    <p v-if="item.outro" class="leading-[16px] mb-0 mt-[16px]">
                      {{ item.outro }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-scale-up {
  animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleUp {
  from { opacity: 0; transform: scale(0.97); }
  to { opacity: 1; transform: scale(1); }
}
</style>
