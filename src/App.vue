<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import DesktopApp from '@/desktop/DesktopApp.vue'
import MobileApp from '@/mobile/MobileApp.vue'
import LaserLabModal from '@/components/lab/LaserLabModal.vue'
import { Sparkles } from 'lucide-vue-next'

const isMobile = ref(false)
const showLaserLab = ref(false)

const evaluateDeviceMode = () => {
  if (typeof window === 'undefined') return
  const urlParams = new URLSearchParams(window.location.search)
  const modeParam = urlParams.get('mode')

  if (modeParam === 'mobile') {
    isMobile.value = true
    return
  }
  if (modeParam === 'desktop') {
    isMobile.value = false
    return
  }

  // Breakpoint: under 768px activates independent mobile version
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  evaluateDeviceMode()
  window.addEventListener('resize', evaluateDeviceMode)
})

onUnmounted(() => {
  window.removeEventListener('resize', evaluateDeviceMode)
})
</script>

<template>
  <!-- Isolated Mobile Mode -->
  <MobileApp v-if="isMobile" />

  <!-- Untouched Desktop Mode -->
  <DesktopApp v-else />

  <!-- Floating Laser Lab Sandbox Launcher -->
  <button
    @click="showLaserLab = true"
    class="fixed bottom-5 right-5 z-[999] px-4 py-2.5 rounded-full bg-neutral-900/90 text-white text-xs font-semibold tracking-wider uppercase border border-emerald-500/40 shadow-xl backdrop-blur-md flex items-center gap-2 hover:bg-neutral-800 hover:border-emerald-400 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer group"
    title="Open Laser Preview Sandbox Lab"
  >
    <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
    <Sparkles :size="14" class="text-emerald-400 group-hover:rotate-12 transition-transform" />
    <span>Laser Lab</span>
  </button>

  <!-- Laser Lab Modal -->
  <LaserLabModal
    v-if="showLaserLab"
    @close="showLaserLab = false"
  />
</template>

