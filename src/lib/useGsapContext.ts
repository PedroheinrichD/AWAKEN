import { useLayoutEffect, useRef } from "react"
import type { DependencyList, RefObject } from "react"
import { gsap } from "./gsap"

export function useGsapContext<T extends HTMLElement>(
  callback: (context: gsap.Context) => void,
  deps: DependencyList = [],
): RefObject<T | null> {
  const scope = useRef<T>(null)

  useLayoutEffect(() => {
    if (!scope.current) return
    const ctx = gsap.context(callback, scope)
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return scope
}
