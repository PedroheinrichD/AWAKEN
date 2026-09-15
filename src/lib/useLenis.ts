import Lenis from "lenis"
import { useEffect } from "react"
import { gsap, ScrollTrigger, prefersReducedMotion } from "./gsap"

export function useLenis(): void {
  useEffect(() => {
    if (prefersReducedMotion()) return

    const lenis = new Lenis({
      lerp: 0.09,
      smoothWheel: true,
      wheelMultiplier: 0.9,
    })

    lenis.on("scroll", ScrollTrigger.update)

    function raf(time: number) {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(raf)
      lenis.destroy()
    }
  }, [])
}
