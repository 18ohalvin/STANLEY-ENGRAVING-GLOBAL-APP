<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import DesktopApp from '@/desktop/DesktopApp.vue'
import MobileApp from '@/mobile/MobileApp.vue'

const isMobile = ref(false)

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
</template>

