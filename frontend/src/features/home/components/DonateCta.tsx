import { Container, Button, Reveal } from '@/shared/ui'
import { ROUTES } from '@/shared/lib/config'
import styles from './DonateCta.module.css'

/** Llamado final a donar o ser voluntario. */
export function DonateCta() {
  return (
    <section className={styles.sec}>
      <Container>
        <Reveal>
          <div className={styles.caja}>
            <span className={`${styles.dot} ${styles.c1}`} />
            <span className={`${styles.dot} ${styles.c2}`} />
            <div className={styles.texto}>
              <h2>Tu aporte cambia una historia</h2>
              <p>Con tu donación o con tu tiempo ayudas a que más mujeres, niños, niñas y adolescentes construyan un futuro lleno de esperanza.</p>
            </div>
            <div className={styles.botones}>
              <Button to={ROUTES.donations} variant="blanco">Donar ahora</Button>
              <Button to={ROUTES.volunteers} variant="lineaClara">Quiero ser voluntario</Button>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
