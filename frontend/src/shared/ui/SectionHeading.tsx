import type { ReactNode } from 'react'
import styles from './SectionHeading.module.css'

type Props = { eyebrow: string; title: string; subtitle?: ReactNode; light?: boolean; center?: boolean }

/** Encabezado estándar de sección: etiqueta + título + subtítulo. */
export function SectionHeading({ eyebrow, title, subtitle, light, center }: Props) {
  return (
    <div className={`${styles.box} ${light ? styles.light : ''} ${center ? styles.center : ''}`}>
      <span className={styles.eyebrow}>{eyebrow}</span>
      <h2 className={styles.title}>{title}</h2>
      {subtitle && <p className={styles.sub}>{subtitle}</p>}
    </div>
  )
}
