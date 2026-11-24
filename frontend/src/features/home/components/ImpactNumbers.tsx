import { Container, SectionHeading } from '@/shared/ui'
import { useReveal } from '@/shared/hooks/useReveal'
import { useCountUp } from '@/shared/hooks/useCountUp'
import { IMPACT_STATS } from '../data/impact'
import styles from './ImpactNumbers.module.css'

function Stat({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const [ref, visible] = useReveal<HTMLDivElement>(0.6)
  const current = useCountUp(value, visible)
  return (
    <div ref={ref} className={styles.stat}>
      <b>{current.toLocaleString('es-CO')}{suffix}</b>
      <span>{label}</span>
    </div>
  )
}

/** Franja oscura con cifras que cuentan hacia arriba al llegar a ellas. */
export function ImpactNumbers() {
  return (
    <section className={styles.sec}>
      <Container>
        <div className={styles.centro}>
          <SectionHeading light center eyebrow="Resultados" title="Nuestro impacto en números" />
          <div className={styles.stats}>
            {IMPACT_STATS.map((s) => (
              <Stat key={s.label} {...s} />
            ))}
          </div>
          <p className={styles.nota}>* Cifras de ejemplo: la fundación debe entregar los datos reales.</p>
        </div>
      </Container>
    </section>
  )
}
