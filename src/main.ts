import { createApp, type App as VueApp } from 'vue'
import App from './App.vue'
import './index.css'

import { vScrollReveal, initGlobalScrollReveal } from './directives/vScrollReveal'

declare global {
  interface Window {
    mountStanleyApp?: (selector?: string | HTMLElement) => VueApp
  }
}

export function initStanleyApp(target: string | HTMLElement = '#app'): VueApp {
  const app = createApp(App)
  app.directive('scroll-reveal', vScrollReveal)
  app.mount(target)
  
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      initGlobalScrollReveal()
    }, 100)
  }
  
  return app
}

// Auto-mount if running in standalone/dev mode
if (typeof document !== 'undefined') {
  const defaultMount = document.querySelector('#app')
  if (defaultMount) {
    initStanleyApp('#app')
  }
}

// Expose global initializer for Shopify Theme / App Proxy script injection
if (typeof window !== 'undefined') {
  window.mountStanleyApp = initStanleyApp
}
