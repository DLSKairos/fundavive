import type { ReactNode } from 'react'
import styles from './Container.module.css'

/** Centra el contenido con el ancho máximo del sitio. */
export function Container({ children, narrow }: { children: ReactNode; narrow?: boolean }) {
  return <div className={`${styles.wrap} ${narrow ? styles.narrow : ''}`}>{children}</div>
}
