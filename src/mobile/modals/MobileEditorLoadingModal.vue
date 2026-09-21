<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import stanleyLogo from '@/assets/images/stanley-logo.png'

const props = defineProps<{
  isLoading: boolean
  productName?: string
}>()

const emit = defineEmits<{
  (e: 'complete'): void
}>()

const progress = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

watch(
  () => props.isLoading,
  (newVal) => {
    if (newVal) {
      startLoading()
    } else {
      resetLoading()
    }
  },
  { immediate: true }
)

function startLoading() {
  resetLoading()
  progress.value = 0

  const startTime = Date.now()
  const duration = 1400 // 1.4s smooth loading line animation matching desktop

  timer = setInterval(() => {
    const elapsed = Date.now() - startTime
    const currentProgress = Math.min(100, Math.round((elapsed / duration) * 100))
    progress.value = currentProgress

    if (currentProgress >= 100) {
      resetLoading()
      setTimeout(() => {
        emit('complete')
      }, 150)
    }
  }, 20)
}

function resetLoading() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

onUnmounted(() => {
  resetLoading()
})
</script>

<template>
  <Teleport to="body">
    <Transition name="loading-fade">
      <div
        v-if="isLoading"
        class="fixed inset-0 z-[120] bg-white flex flex-col items-center justify-between py-20 px-6 select-none font-['Stanley_Favorit',sans-serif]"
        data-node-id="5238:6523"
        data-name="Loading State"
      >
        <!-- Top Spacer to keep center content vertically centered -->
        <div class="w-full h-8 flex-none"></div>

        <!-- Center Branding (Figma Node 5668:2392): Stanley Logo + DESIGN STUDIO Text -->
        <div class="flex items-end gap-[8px] select-none" data-node-id="5668:2392">
          <img
            :src="stanleyLogo"
            alt="STANLEY"
            class="h-[20px] w-auto object-contain"
            data-node-id="5668:2393"
          />
          <span
            class="font-['Stanley_Favorit',sans-serif] font-bold text-[12px] text-black leading-none pb-[1px] tracking-normal"
            data-node-id="5668:2394"
          >
            DESIGN STUDIO
          </span>
        </div>

        <!-- Bottom Loading Bar (Figma Node 5238:6579: w-[125px] h-[2px]) -->
        <div class="w-[125px] h-[2px] bg-[#e5e5e5] rounded-full overflow-hidden relative flex-none mb-6" data-node-id="5238:6579">
          <div
            class="bg-black h-full rounded-full transition-all duration-75 ease-out transform-gpu"
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.loading-fade-enter-active,
.loading-fade-leave-active {
  transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.loading-fade-enter-from,
.loading-fade-leave-to {
  opacity: 0;
}
</style>
