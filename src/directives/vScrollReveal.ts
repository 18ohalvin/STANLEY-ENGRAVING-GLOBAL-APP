import type { Directive } from 'vue'

export const vScrollReveal: Directive<HTMLElement, { delay?: number; threshold?: number } | undefined> = {
  mounted(el, binding) {
    const delay = binding.value?.delay || 0
    const threshold = binding.value?.threshold || 0.12

    // Set initial transition delay if specified
    if (delay > 0) {
      el.style.transitionDelay = `${delay}ms`
    }

    // Fallback for browsers without IntersectionObserver
    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-revealed')
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add('is-revealed')
            observer.unobserve(el)
          }
        })
      },
      {
        threshold,
        rootMargin: '0px 0px -40px 0px'
      }
    )

    observer.observe(el)
    ;(el as any)._revealObserver = observer
  },
  unmounted(el) {
    if ((el as any)._revealObserver) {
      ;(el as any)._revealObserver.disconnect()
      delete (el as any)._revealObserver
    }
  }
}

/**
 * Automatically initializes scroll reveal on all elements matching `.scroll-reveal*`
 */
export function initGlobalScrollReveal(root: Document | HTMLElement = document) {
  if (typeof IntersectionObserver === 'undefined') {
    root.querySelectorAll('.scroll-reveal, .scroll-reveal-scale, .scroll-reveal-left, .scroll-reveal-right').forEach((el) => {
      el.classList.add('is-revealed')
    })
    return
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed')
          observer.unobserve(entry.target)
        }
      })
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -30px 0px'
    }
  )

  const elements = root.querySelectorAll('.scroll-reveal, .scroll-reveal-scale, .scroll-reveal-left, .scroll-reveal-right')
  elements.forEach((el) => {
    observer.observe(el)
  })

  return observer
}
