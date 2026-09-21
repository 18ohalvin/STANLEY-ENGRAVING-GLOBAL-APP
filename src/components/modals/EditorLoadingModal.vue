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
  const duration = 1400 // 1.4 seconds smooth loading line animation

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
        class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white text-black select-none gpu-accelerated"
      >
        <!-- Center Content Box (Figma Node 4625:2082 & 5125:1513) -->
        <div class="flex flex-col items-center justify-center gap-10">
          <!-- Stanley Logo + DESIGN STUDIO Text Header (Exact baseline alignment as shown in image) -->
          <div class="flex items-end gap-4 sm:gap-5">
            <img
              :src="stanleyLogo"
              alt="Stanley 1913"
              class="h-[28px] sm:h-[30px] w-auto object-contain opacity-90"
            />
            <span class="font-['Stanley_Favorit',sans-serif] font-bold text-[15px] sm:text-[16px] text-black uppercase tracking-normal opacity-90 leading-none pb-[1px]">
              DESIGN STUDIO
            </span>
          </div>

          <!-- Loading Progress Bar (Figma Node 5125:1513 - w-[304px] h-[3px]) -->
          <div class="w-[304px] h-[3px] bg-[#e5e5e5] rounded-full overflow-hidden relative">
            <div
              class="bg-black h-full rounded-full transition-all duration-75 ease-out transform-gpu"
              :style="{ width: `${progress}%` }"
            ></div>
          </div>
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
