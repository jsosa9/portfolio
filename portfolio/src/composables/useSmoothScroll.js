import { onMounted, onUnmounted } from 'vue'
import Lenis from 'lenis'

// Buttery/inertia scrolling via Lenis. Skips entirely if the user prefers
// reduced motion, or hands back a no-op cleanup so callers don't need to check.
export function useSmoothScroll() {
  let lenis = null
  let rafId = null

  onMounted(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
    })

    function raf(time) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)
  })

  onUnmounted(() => {
    if (rafId) cancelAnimationFrame(rafId)
    lenis?.destroy()
  })
}
