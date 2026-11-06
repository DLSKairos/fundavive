import { Container, Button } from '@/shared/ui'
import { Logo } from '@/shared/layout'
import { ROUTES } from '@/shared/lib/config'
import hero from '@/assets/hero.jpg'
import styles from './Hero.module.css'

/** Portada del inicio: la foto se mueve despacio (zoom suave). TODO: tomar la foto de /api/secciones-imagenes. */
export function Hero() {
  return (
    <section className={styles.hero}>
      <Container>
        <div className={styles.grid}>
          <div>
            <span className={styles.badge}>Restauración integral de familias</span>
            <h1 className={styles.titulo}>Cada familia merece <em>vivir</em> su sueño</h1>
            <p className={styles.lead}>
              Acompañamos a mujeres en condición de vulnerabilidad y a niños, niñas y adolescentes en riesgo social,
              para que descubran su potencial y construyan un proyecto de vida digno, basado en el amor.
            </p>
            <div className={styles.acciones}>
              <Button to={ROUTES.donations}>Realizar una donación</Button>
              <Button to={ROUTES.volunteers} variant="linea">Ser voluntario</Button>
            </div>
          </div>
          <div className={styles.visual}>
            <div className={styles.marco}>
              <div className={styles.foto} style={{ backgroundImage: `url(${hero})` }} role="img" aria-label="Voluntaria compartiendo con niños y niñas" />
            </div>
            <div className={styles.sello}><Logo height={72} /></div>
          </div>
        </div>
      </Container>
    </section>
  )
}
