import type { ReactNode } from 'react'
import { useReveal } from '@/shared/hooks/useReveal'
import styles from './Reveal.module.css'

/** Envuelve cualquier bloque para que aparezca con animación al hacer scroll. */
export function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const [ref, visible] = useReveal<HTMLDivElement>()
  return (
    <div ref={ref} className={`${styles.rev} ${visible ? styles.vis : ''}`} style={{ transitionDelay: `${delay}s` }}>
      {children}
    </div>
  )
}
