<script setup lang="ts">
import { type InspirationCard } from '@/data/catalog'
import cardQuestionsImg from '@/assets/images/card-questions.png'
import cardGuidedImg from '@/assets/images/card-guided.png'
import cardArtistDropImg from '@/assets/images/card-artist-drop.png'
import addFilledIcon from '@/assets/icons/add-filled.svg'

const emit = defineEmits<{
  (e: 'select-card', card: InspirationCard): void
}>()

// 5 cards matching Figma Node 5238:6635
const mobileCards: InspirationCard[] = [
  {
    id: 'faq',
    titleLine1: 'What People',
    titleLine2: 'Are Asking',
    tag: 'FAQ & Care',
    image: cardQuestionsImg,
    bgColor: '#e7e7d5',
    textColor: 'black',
    description: 'Learn how our precision laser engraving works, warranty coverage, and tumbler care instructions.',
  },
  {
    id: 'guided-ai',
    titleLine1: 'Guided to Generate',
    titleLine2: 'Your Design',
    tag: 'AI Studio',
    image: cardGuidedImg,
    bgColor: '#161616',
    textColor: 'white',
    description: 'Step-by-step guidance to create custom monograms, typography, and vector line art.',
  },
  {
    id: 'artist-drops',
    titleLine1: 'Get Inspired by Artist',
    titleLine2: 'Designs Drop',
    tag: 'Collaborations',
    image: cardArtistDropImg,
    bgColor: '#d9d9d9',
    textColor: 'black',
    description: 'Exclusive limited edition artwork created in collaboration with global and local artists.',
  },
  {
    id: 'artist-drops-2',
    titleLine1: 'Get Inspired by Artist',
    titleLine2: 'Designs Drop',
    tag: 'Collaborations',
    image: cardArtistDropImg,
    bgColor: '#f6eafa',
    textColor: 'black',
    description: 'Curated creative drops ready for laser engraving on any Stanley silhouette.',
  },
  {
    id: 'faq-2',
    titleLine1: 'What People',
    titleLine2: 'Are Asking',
    tag: 'FAQ & Care',
    image: cardQuestionsImg,
    bgColor: '#e7e7d5',
    textColor: 'black',
    description: 'Learn how our precision laser engraving works, warranty coverage, and tumbler care instructions.',
  },
]
</script>

<template>
  <!-- Figma Node 5217:1942 Product Selection Section (Get to know more.) -->
  <div class="flex flex-col gap-[20px] items-start relative shrink-0 w-full" data-node-id="5217:1942">
    <!-- Section Title (Figma Node 5217:1943) - aligned with 16px padding -->
    <div class="px-[16px] w-full flex flex-col font-['Stanley_Favorit',sans-serif] font-medium h-[24px] justify-center text-[20px] text-black tracking-[-0.6px]" data-node-id="5217:1943">
      <h2 class="leading-none">Get to know more.</h2>
    </div>

    <!-- Horizontal Swipeable Cards Container with Symmetric Left & Right 16px Padding -->
    <div class="w-full relative shrink-0" data-node-id="5238:6634">
      <div class="flex gap-[16px] items-center w-full overflow-x-auto no-scrollbar scroll-smooth px-[16px] pt-1 pb-4" data-node-id="5238:6635">
        <div
          v-for="(card, index) in mobileCards"
          :key="card.id + index"
          @click="emit('select-card', card)"
          class="w-[201.75px] h-[269px] rounded-[10.084px] overflow-hidden relative shrink-0 cursor-pointer group shadow-md hover:shadow-xl hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 transform-gpu will-change-transform select-none"
          :style="{ backgroundColor: card.bgColor || '#e7e7d5' }"
          :data-node-id="`5238:6636-${index}`"
        >
          <!-- Background Visual Image with Desktop Hover & Tap Zoom -->
          <img
            :src="card.image"
            :alt="card.titleLine1 + ' ' + card.titleLine2"
            class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out transform-gpu will-change-transform group-hover:scale-105 group-active:scale-105 pointer-events-none"
          />

          <!-- Ambient Tint / Gradient matching desktop -->
          <div
            class="absolute inset-0 pointer-events-none transition-opacity duration-300"
            :class="[
              card.textColor === 'white'
                ? 'bg-gradient-to-t from-black/80 via-black/20 to-black/30 group-hover:from-black/90'
                : 'bg-gradient-to-t from-black/25 via-transparent to-white/30 group-hover:from-black/35'
            ]"
          ></div>

          <!-- Title Text Block (Figma Node 5238:6644: pl-[15.125px] pt-[20.167px]) -->
          <div class="absolute top-0 left-0 pl-[15.13px] pt-[20.17px] pr-[15px] z-10 transition-transform duration-300 group-hover:translate-x-0.5">
            <div
              class="font-['Stanley_Favorit',sans-serif] font-bold text-[16px] tracking-[-0.48px] leading-tight"
              :class="card.textColor === 'white' ? 'text-white' : 'text-black'"
            >
              <p class="mb-0">{{ card.titleLine1 }}</p>
              <p>{{ card.titleLine2 }}</p>
            </div>
          </div>

          <!-- Action Icon Bottom Right (Desktop effect: shadow-lg + rotate on interaction) -->
          <div class="absolute right-[14px] bottom-[14px] w-[25.2px] h-[25.2px] z-10">
            <div class="w-full h-full rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-90 group-active:scale-90 transform-gpu">
              <img
                :src="addFilledIcon"
                alt="View"
                class="w-full h-full block brightness-0"
                :class="card.textColor === 'white' ? 'invert' : ''"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
