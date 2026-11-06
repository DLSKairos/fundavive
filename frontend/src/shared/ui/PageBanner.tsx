import type { ReactNode } from 'react'
import { Container } from './Container'
import styles from './PageBanner.module.css'

type Props = { color: 'ocre' | 'rojo' | 'teal'; eyebrow: string; title: string; children?: ReactNode; narrow?: boolean }

/** Banda de color con título que abre cada página interna. */
export function PageBanner({ color, eyebrow, title, children, narrow }: Props) {
  return (
    <div className={`${styles.banda} ${styles[color]}`}>
      <span className={`${styles.dot} ${styles.x1}`} />
      <span className={`${styles.dot} ${styles.x2}`} />
      <Container narrow={narrow}>
        <div className={styles.contenido}>
          <span className={styles.eyebrow}>{eyebrow}</span>
          <h1>{title}</h1>
          {children && <p>{children}</p>}
        </div>
      </Container>
    </div>
  )
}
