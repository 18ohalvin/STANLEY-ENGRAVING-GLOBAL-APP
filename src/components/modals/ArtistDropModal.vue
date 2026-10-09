<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import iceflowImg from '@/assets/images/artist-drop-iceflow.png'
import barbiePinkTumblerImg from '@/assets/images/barbie-quencher-pink-clean.png'
import { topGraphics, graphicCampaigns, type GraphicItem } from '@/data/graphics'
import LaserPreview from '@/components/customizer/LaserPreview.vue'

const props = defineProps<{
  isOpen: boolean
  campaignId?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'start-engrave', graphicId?: string): void
}>()

const activeCampaign = computed(() => {
  if (props.campaignId) {
    return graphicCampaigns.find(c => c.id === props.campaignId) || null
  }
  return null
})

const graphics = computed<GraphicItem[]>(() => {
  return activeCampaign.value?.graphics || topGraphics
})

const modalTitle = computed(() => {
  return activeCampaign.value ? activeCampaign.value.title : 'Get Inspired by Artist Designs Drop'
})

const modalSubtitle = computed(() => {
  return activeCampaign.value ? activeCampaign.value.description : 'Explore unique creations from talented artists and see how different styles come to life.'
})

const sectionTitle = computed(() => {
  return activeCampaign.value ? activeCampaign.value.subtitle : 'Top 5 Most Used Graphics'
})

const selectedGraphicId = ref<string>(graphics.value[0]?.id || 'stanley-bear-crest')

watch(() => props.campaignId, () => {
  if (graphics.value.length > 0) {
    selectedGraphicId.value = graphics.value[0].id
  }
}, { immediate: true })

watch(() => props.isOpen, (newVal) => {
  if (newVal && graphics.value.length > 0) {
    selectedGraphicId.value = graphics.value[0].id
  }
})

const selectGraphic = (id: string) => {
  selectedGraphicId.value = id
}

const handleEngraveNow = () => {
  emit('start-engrave', selectedGraphicId.value)
  emit('close')
}

const getActiveGraphicImage = () => {
  const g = graphics.value.find(item => item.id === selectedGraphicId.value)
  return g ? g.img : graphics.value[0]?.img
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-fade-in select-none"
      @click.self="emit('close')"
    >
      <!-- Main Modal Card Container (Figma Node 5076:4983 - Locked Global 1200px x 600px, rounded-[16px]) -->
      <div
        class="bg-white rounded-[16px] w-full max-w-[1200px] h-full max-h-[850px] lg:w-[1200px] lg:h-[600px] overflow-hidden relative shadow-2xl flex flex-col lg:flex-row border border-neutral-100 animate-scale-up"
      >
        <!-- Background Hero Visual (Tumbler with Live Laser Engraved Preview - Figma Node 5076:4983) -->
        <div class="absolute inset-0 pointer-events-none hidden lg:block overflow-hidden">
          <img
            :src="barbiePinkTumblerImg"
            alt="Stanley Tumbler"
            class="absolute left-[690px] top-[25px] w-[600px] h-[1100px] object-contain object-top pointer-events-none"
          />
          <!-- Laser Etched Vector Artwork Overlay on Tumbler (Figma Node 5255:5338 - Metallic Laser Finish) -->
          <div class="absolute left-[790px] top-[215px] w-[215px] h-[215px] flex items-center justify-center pointer-events-none">
            <LaserPreview
              type="image"
              :image-src="getActiveGraphicImage()"
              :is-light-tumbler="true"
              depth-level="standard"
              class="w-[185px] h-[185px]"
            />
          </div>
        </div>

        <!-- Global Close Button (Figma Node 5074:8153 - 40x40 #E9E6E6 circle with 1.2px vector X) -->
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

        <!-- Left Content Container (Figma Node 5115:1834 - 704px width, px-64 pt-55, no-scrollbar) -->
        <div
          class="relative z-10 w-full lg:w-[704px] p-6 sm:p-10 lg:px-[64px] lg:pt-[55px] lg:pb-[40px] flex flex-col justify-between gap-[24px] overflow-y-auto max-h-full bg-white/95 lg:bg-transparent backdrop-blur-xs lg:backdrop-blur-none no-scrollbar"
        >
          <div class="flex flex-col gap-[20px]">
            <!-- Header Container (Figma Node 5076:6402 - 560px width) -->
            <div class="flex flex-col gap-[12px] max-w-[576px]">
              <h1 class="font-['Stanley_Favorit',sans-serif] font-medium text-2xl sm:text-3xl lg:text-[32px] text-black tracking-[-0.96px] leading-tight">
                {{ modalTitle }}
              </h1>
              <p class="font-['Stanley_Favorit',sans-serif] font-normal text-[15px] sm:text-[16px] text-black leading-[1.5]">
                {{ modalSubtitle }}
              </p>
            </div>

            <!-- Categories Container (Figma Node 5255:5164 - 560px width) -->
            <div class="flex flex-col gap-[14px] w-full max-w-[576px]">
              <!-- Categories Title (Figma Node 5255:5165) -->
              <h2 class="font-['Stanley_Favorit',sans-serif] font-medium text-[16px] text-black tracking-[-0.48px] leading-normal">
                {{ sectionTitle }}
              </h2>

              <!-- Categories Row (Figma Node 5255:5166 - 138px x 184px cards) -->
              <div class="flex gap-[8px] overflow-x-auto no-scrollbar pb-1 pt-1 -mx-1 px-1 snap-x">
                <div
                  v-for="item in graphics"
                  :key="item.id"
                  @click="selectGraphic(item.id)"
                  class="flex-none w-[138px] h-[184px] bg-[#f5f5f5] hover:bg-[#ececec] rounded-[8px] relative cursor-pointer select-none transition-all duration-200 snap-start flex flex-col items-center justify-between p-[12px] border"
                  :class="selectedGraphicId === item.id ? 'border-black bg-white shadow-xs' : 'border-transparent'"
                >
                  <!-- Graphic Preview Image (100x100 in Figma) -->
                  <div class="w-[100px] h-[100px] flex items-center justify-center mt-2 p-2">
                    <img
                      :src="item.img"
                      :alt="item.name"
                      class="max-w-full max-h-full object-contain pointer-events-none transition-transform duration-200 group-hover:scale-105"
                    />
                  </div>

                  <!-- Graphic Label -->
                  <div class="flex flex-col items-center justify-center text-center w-full gap-[3px]">
                    <span class="font-['Stanley_Favorit',sans-serif] font-normal text-[12px] text-black leading-tight truncate w-full">
                      {{ item.name }}
                    </span>
                    <span class="font-['Stanley_Favorit',sans-serif] font-normal text-[10px] text-neutral-500 leading-tight truncate w-full">
                      {{ item.subtext }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- CTA Button (Figma Node 5255:5218 - 160px x 60px, rounded-[8px], border border-black) -->
          <div class="flex items-center pt-2">
            <button
              @click="handleEngraveNow"
              class="w-[160px] h-[54px] lg:h-[60px] rounded-[8px] border border-black bg-white hover:bg-black text-black hover:text-white transition-all duration-200 flex items-center justify-center cursor-pointer active:scale-95 shadow-xs select-none"
            >
              <span class="font-['Stanley_Favorit',sans-serif] font-bold text-[16px] leading-normal">
                Engrave Now
              </span>
            </button>
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
