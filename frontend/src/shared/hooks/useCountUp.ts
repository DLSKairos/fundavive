import { useEffect, useState } from 'react'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Cuenta desde 0 hasta `target` cuando `start` es true (números de impacto). */
export function useCountUp(target: number, start: boolean, duration = 1900) {
  const [value, setValue] = useState(0)
  const reduced = prefersReducedMotion()

  useEffect(() => {
    if (!start || reduced) return
    let raf = 0
    let t0: number | null = null
    const step = (t: number) => {
      t0 ??= t
      const p = Math.min((t - t0) / duration, 1)
      setValue(Math.round(target * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, start, duration, reduced])

  // Con "reducir movimiento" activado, se muestra el número final sin animar.
  return reduced && start ? target : value
}
