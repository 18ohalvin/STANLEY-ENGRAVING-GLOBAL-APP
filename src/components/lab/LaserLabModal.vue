<script setup lang="ts">
import { ref, computed } from 'vue'
import { X, Eye, Sparkles, ZoomIn, Image, Type, Compass, CheckCircle2 } from 'lucide-vue-next'
import LaserPreview from '@/components/customizer/LaserPreview.vue'
import quencherH20BlueImg from '@/assets/products/quencher-h20-blue.png'
import quencherGreenBlankImg from '@/assets/products/quencher-green-blank.png'
import iceFlowImg from '@/assets/products/iceflow-white.png'
import quencherProTourImg from '@/assets/products/quencher-protour-peach.png'
import cafeTumblerImg from '@/assets/products/cafe-tumbler-brown.png'
import campMugImg from '@/assets/products/camp-mug-green.png'
import { topGraphics, juventusGraphics, liunicGraphics, natureGraphics } from '@/data/graphics'

const emit = defineEmits<{
  (e: 'close'): void
}>()

// State
const activeMode = ref<'text' | 'graphic'>('text')
const selectedTumblerId = ref<'blue' | 'green' | 'white' | 'peach' | 'brown' | 'camp'>('blue')
const sampleText = ref('STANLEY 1913')
const selectedFont = ref("font-['Stanley_Favorit',sans-serif]")
const selectedFontSize = ref<'S' | 'M' | 'L' | 'XL'>('L')
const textOrientation = ref<'horizontal' | 'vertical'>('horizontal')
const selectedGraphicId = ref(juventusGraphics[0].id)
const depthLevel = ref<'subtle' | 'standard' | 'deep'>('standard')
const zoomLevel = ref<1 | 1.8 | 2.6>(1)
const compareMode = ref(false)
const showLightAxisGuide = ref(true)

// Authentic Stanley Tumbler Silhouettes
const tumblers = [
  { id: 'blue', name: 'Quencher 40oz (Navy Blue)', img: quencherH20BlueImg, isLight: false },
  { id: 'green', name: 'Quencher 40oz (Hammertone Green)', img: quencherGreenBlankImg, isLight: false },
  { id: 'white', name: 'IceFlow 30oz (Polar White)', img: iceFlowImg, isLight: true },
  { id: 'peach', name: 'ProTour (Peach)', img: quencherProTourImg, isLight: true },
  { id: 'brown', name: 'Cafe Tumbler (Brown)', img: cafeTumblerImg, isLight: false },
  { id: 'camp', name: 'Camp Mug (Classic Green)', img: campMugImg, isLight: false }
]

const currentTumbler = computed(() => tumblers.find(t => t.id === selectedTumblerId.value) || tumblers[0])

// Graphics pool
const sampleGraphics = [
  ...juventusGraphics.slice(0, 3),
  ...liunicGraphics.slice(0, 3),
  ...natureGraphics.slice(0, 3)
]
const currentGraphic = computed(() => sampleGraphics.find(g => g.id === selectedGraphicId.value) || sampleGraphics[0])

// Font options
const fontOptions = [
  { name: 'Stanley Favorit', class: "font-['Stanley_Favorit',sans-serif]" },
  { name: 'Impact Sans', class: "font-['Stanley_Favorit',sans-serif] uppercase tracking-widest font-extrabold" },
  { name: 'Serif Classic', class: 'font-serif' },
  { name: 'Mono Tech', class: 'font-mono' }
]

const fontSizeClass = computed(() => {
  switch (selectedFontSize.value) {
    case 'S': return 'text-[20px]'
    case 'M': return 'text-[26px]'
    case 'L': return 'text-[34px]'
    case 'XL': return 'text-[44px]'
  }
})

const verticalLines = computed(() => {
  return sampleText.value.split('\n')
})
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 select-none font-['Stanley_Favorit',sans-serif]">
      <div class="bg-neutral-900 border border-white/15 rounded-2xl w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden shadow-2xl text-white">
        
        <!-- Header -->
        <header class="h-16 px-6 border-b border-white/10 flex items-center justify-between bg-neutral-950/80 flex-none">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Sparkles :size="18" />
            </div>
            <div>
              <div class="font-bold text-base tracking-tight flex items-center gap-2">
                Laser Preview Testing Lab
                <span class="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Isolated Component Sandbox
                </span>
              </div>
              <div class="text-xs text-neutral-400">Tuning 2D brushed stainless steel shader, specular highlights & micro-bevel depth</div>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <!-- Compare Button -->
            <button
              @click="compareMode = !compareMode"
              class="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 cursor-pointer"
              :class="compareMode ? 'bg-amber-500 text-black border-amber-400 font-bold' : 'bg-neutral-800 text-neutral-300 border-white/10 hover:bg-neutral-700'"
            >
              <Eye :size="14" />
              {{ compareMode ? 'Side-by-Side: ON' : 'Compare Flat vs Laser' }}
            </button>

            <!-- Close Button -->
            <button
              @click="emit('close')"
              class="w-9 h-9 rounded-full bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-neutral-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              aria-label="Close Laser Lab"
            >
              <X :size="18" />
            </button>
          </div>
        </header>

        <!-- Main Body (2 Columns) -->
        <div class="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          <!-- LEFT COLUMN: Interactive Stage Canvas -->
          <div class="flex-1 bg-[#181a1c] relative flex flex-col items-center justify-center p-6 overflow-hidden border-b lg:border-b-0 lg:border-r border-white/10">
            
            <!-- Zoom Controls Float -->
            <div class="absolute top-4 left-4 z-20 flex items-center gap-1 bg-black/60 backdrop-blur-md p-1 rounded-lg border border-white/10 text-xs">
              <ZoomIn :size="14" class="text-neutral-400 ml-1.5" />
              <button
                v-for="z in ([1, 1.8, 2.6] as const)"
                :key="z"
                @click="zoomLevel = z"
                class="px-2.5 py-1 rounded font-medium transition-colors cursor-pointer"
                :class="zoomLevel === z ? 'bg-white text-black font-bold' : 'text-neutral-400 hover:text-white'"
              >
                {{ z }}x
              </button>
            </div>

            <!-- Side by Side / Single Stage -->
            <div
              class="relative w-full h-full flex items-center justify-center transition-transform duration-300 origin-center"
              :style="{ transform: `scale(${zoomLevel})` }"
            >
              <!-- Tumbler Image -->
              <img
                :src="currentTumbler.img"
                :alt="currentTumbler.name"
                class="max-h-[480px] w-auto object-contain filter drop-shadow-2xl pointer-events-none transition-all duration-300"
              />

              <!-- Laser Bounding Box Stage -->
              <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div class="relative w-[191px] h-[280px] border border-dashed border-white/40 rounded-lg flex items-center justify-center p-2">
                  
                  <!-- COMPARE MODE: FLAT WHITE -->
                  <template v-if="compareMode">
                    <div class="absolute inset-0 flex flex-col items-center justify-center text-center opacity-90">
                      <img
                        v-if="activeMode === 'graphic'"
                        :src="currentGraphic.img"
                        class="w-24 h-24 object-contain brightness-0 invert"
                        alt="flat graphic"
                      />
                      <span
                        v-else
                        class="font-bold text-white tracking-wider"
                        :class="[selectedFont, fontSizeClass]"
                      >
                        {{ sampleText }}
                      </span>
                      <span class="absolute bottom-1 text-[9px] bg-red-600/80 px-1.5 py-0.5 rounded text-white font-mono">
                        OLD FLAT WHITE
                      </span>
                    </div>
                  </template>

                  <!-- REALISTIC LASER PREVIEW COMPONENT -->
                  <template v-else>
                    <LaserPreview
                      v-if="activeMode === 'text'"
                      type="text"
                      :text="sampleText"
                      :font-class="selectedFont"
                      :font-size-class="fontSizeClass"
                      :orientation="textOrientation"
                      :vertical-lines="verticalLines"
                      :is-light-tumbler="currentTumbler.isLight"
                      :depth-level="depthLevel"
                    />

                    <LaserPreview
                      v-else-if="activeMode === 'graphic'"
                      type="image"
                      :image-src="currentGraphic.img"
                      :image-style="{ width: '110px', height: '110px' }"
                      :is-light-tumbler="currentTumbler.isLight"
                      :depth-level="depthLevel"
                    />
                  </template>
                </div>
              </div>
            </div>

            <!-- Stage Caption Float -->
            <div class="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 text-xs text-neutral-300 flex items-center gap-2">
              <span class="size-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Engraved on: <strong>{{ currentTumbler.name }}</strong></span>
            </div>
          </div>

          <!-- RIGHT COLUMN: Streamlined Stanley Laser Controls -->
          <div class="w-full lg:w-96 p-6 flex flex-col gap-6 overflow-y-auto bg-neutral-950/60 no-scrollbar">
            
            <!-- 1. Mode Switcher (Text vs Graphic) -->
            <div class="flex flex-col gap-2">
              <label class="text-xs font-bold uppercase text-neutral-400 tracking-wider">Preview Mode</label>
              <div class="grid grid-cols-2 gap-2 bg-neutral-900 p-1 rounded-xl border border-white/10">
                <button
                  @click="activeMode = 'text'"
                  class="flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  :class="activeMode === 'text' ? 'bg-white text-black shadow' : 'text-neutral-400 hover:text-white'"
                >
                  <Type :size="14" />
                  Custom Text
                </button>
                <button
                  @click="activeMode = 'graphic'"
                  class="flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  :class="activeMode === 'graphic' ? 'bg-white text-black shadow' : 'text-neutral-400 hover:text-white'"
                >
                  <Image :size="14" />
                  PNG Graphic
                </button>
              </div>
            </div>

            <!-- 2. Tumbler Background Variant -->
            <div class="flex flex-col gap-2">
              <label class="text-xs font-bold uppercase text-neutral-400 tracking-wider">Select Tumbler Silhouette & Color</label>
              <div class="grid grid-cols-3 gap-2">
                <button
                  v-for="tumbler in tumblers"
                  :key="tumbler.id"
                  @click="selectedTumblerId = tumbler.id as any"
                  class="flex flex-col items-center gap-1 p-2 rounded-xl border transition-all cursor-pointer"
                  :class="selectedTumblerId === tumbler.id ? 'border-white bg-white/10 scale-105' : 'border-white/10 hover:border-white/30 bg-neutral-900'"
                >
                  <img :src="tumbler.img" class="h-12 w-auto object-contain" :alt="tumbler.name" />
                  <span class="text-[9px] truncate w-full text-center text-neutral-300">{{ tumbler.name.split(' ')[0] }}</span>
                </button>
              </div>
            </div>

            <!-- 3. Stanley Lid Collar Lighting Alignment Card -->
            <div class="bg-gradient-to-br from-neutral-900 to-neutral-950 p-4 rounded-xl border border-white/15 flex flex-col gap-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2 text-xs font-bold uppercase text-neutral-200">
                  <CheckCircle2 :size="14" class="text-emerald-400" />
                  Stanley Lid Collar Reflection
                </div>
                <span class="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Physical Lock
                </span>
              </div>
              
              <div class="text-[11px] text-neutral-400 leading-relaxed">
                The laser engraving directly adapts the cylindrical studio lighting from the Stanley stainless steel lid collar (specular highlight core at 63% width). When orientation switches to <strong>Vertical</strong>, the reflection angle automatically counter-rotates to stay aligned with the cylinder.
              </div>

              <!-- Micro Bevel Trench Relief -->
              <div class="flex flex-col gap-1.5 pt-2 border-t border-white/10">
                <span class="text-xs text-neutral-400">Powder Coat Laser Trench Depth:</span>
                <div class="grid grid-cols-3 gap-1.5 text-xs">
                  <button
                    v-for="depth in ([
                      { id: 'subtle', label: 'Subtle' },
                      { id: 'standard', label: 'Standard' },
                      { id: 'deep', label: 'Deep' }
                    ] as const)"
                    :key="depth.id"
                    @click="depthLevel = depth.id"
                    class="py-1.5 rounded-lg border text-center font-medium transition-colors cursor-pointer"
                    :class="depthLevel === depth.id ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold' : 'border-white/10 text-neutral-400 hover:text-white'"
                  >
                    {{ depth.label }}
                  </button>
                </div>
              </div>
            </div>

            <!-- 4. Content Controls (Text Mode) -->
            <div v-if="activeMode === 'text'" class="flex flex-col gap-4">
              <!-- Text Input -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-bold uppercase text-neutral-400 tracking-wider">Engraving Text</label>
                <textarea
                  v-model="sampleText"
                  rows="2"
                  class="bg-neutral-900 border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-white resize-none"
                  placeholder="Type sample text..."
                ></textarea>
              </div>

              <!-- Font Selection -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-bold uppercase text-neutral-400 tracking-wider">Font Family</label>
                <div class="grid grid-cols-2 gap-2">
                  <button
                    v-for="font in fontOptions"
                    :key="font.name"
                    @click="selectedFont = font.class"
                    class="py-2 px-3 rounded-lg border text-xs text-left transition-colors cursor-pointer truncate"
                    :class="selectedFont === font.class ? 'bg-white text-black font-bold border-white' : 'border-white/10 text-neutral-400 hover:text-white bg-neutral-900'"
                  >
                    {{ font.name }}
                  </button>
                </div>
              </div>

              <!-- Font Size & Orientation -->
              <div class="grid grid-cols-2 gap-3">
                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-bold uppercase text-neutral-400 tracking-wider">Size</label>
                  <div class="flex border border-white/10 rounded-lg overflow-hidden bg-neutral-900">
                    <button
                      v-for="sz in (['S', 'M', 'L', 'XL'] as const)"
                      :key="sz"
                      @click="selectedFontSize = sz"
                      class="flex-1 py-1.5 text-xs font-bold transition-colors cursor-pointer text-center"
                      :class="selectedFontSize === sz ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'"
                    >
                      {{ sz }}
                    </button>
                  </div>
                </div>

                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-bold uppercase text-neutral-400 tracking-wider">Orientation</label>
                  <div class="flex border border-white/10 rounded-lg overflow-hidden bg-neutral-900">
                    <button
                      @click="textOrientation = 'horizontal'"
                      class="flex-1 py-1.5 text-xs font-bold transition-colors cursor-pointer text-center"
                      :class="textOrientation === 'horizontal' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'"
                    >
                      Horiz
                    </button>
                    <button
                      @click="textOrientation = 'vertical'"
                      class="flex-1 py-1.5 text-xs font-bold transition-colors cursor-pointer text-center"
                      :class="textOrientation === 'vertical' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'"
                    >
                      Vert
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 5. Content Controls (Graphic Mode) -->
            <div v-else-if="activeMode === 'graphic'" class="flex flex-col gap-3">
              <label class="text-xs font-bold uppercase text-neutral-400 tracking-wider">Choose Sample PNG Graphic</label>
              <div class="grid grid-cols-3 gap-2">
                <button
                  v-for="graphic in sampleGraphics"
                  :key="graphic.id"
                  @click="selectedGraphicId = graphic.id"
                  class="flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all cursor-pointer"
                  :class="selectedGraphicId === graphic.id ? 'border-emerald-400 bg-emerald-500/10' : 'border-white/10 hover:border-white/30 bg-neutral-900'"
                >
                  <img :src="graphic.img" class="h-10 w-10 object-contain brightness-0 invert opacity-80" :alt="graphic.name" />
                  <span class="text-[10px] text-neutral-300 truncate w-full text-center">{{ graphic.name }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </Teleport>
</template>
