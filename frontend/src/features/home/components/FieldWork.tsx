import { Container, SectionHeading, Reveal } from '@/shared/ui'
import { useAsync } from '@/shared/hooks/useAsync'
import { Logo } from '@/shared/layout'
import fallbackPhoto from '@/assets/hero.jpg'
import { getCarouselImages } from '../api/home.api'
import styles from './FieldWork.module.css'

type Card = { key: string; title: string; image: string | null; sample: boolean }

// Se muestran mientras el backend no tenga imágenes cargadas (o si no responde).
const SAMPLE: Card[] = [
  { key: 's1', title: 'Estrategias educativas', image: fallbackPhoto, sample: false },
  { key: 's2', title: 'Capacitación para el emprendimiento', image: null, sample: true },
  { key: 's3', title: 'Fortalecimiento espiritual', image: null, sample: true },
  { key: 's4', title: 'Acompañamiento a mujeres', image: null, sample: true },
  { key: 's5', title: 'Niñez libre de violencia', image: null, sample: true },
  { key: 's6', title: 'Apoyo comunitario y consejería', image: null, sample: true },
]

/** Carrusel infinito "Nuestro trabajo en el terreno". Imágenes: GET /api/home/images */
export function FieldWork() {
  const { data } = useAsync(getCarouselImages)

  const real: Card[] = (data ?? []).map((i) => ({
    key: `i${i.id}`,
    title: i.titulo ?? '',
    image: i.urlImagen,
    sample: false,
  }))
  const base = real.length > 0 ? real : SAMPLE
  // Mínimo 6 tarjetas para que el recorrido no tenga huecos aunque haya pocas fotos.
  const cards = base.length >= 6 ? base : Array.from({ length: 6 }, (_, i) => base[i % base.length])

  return (
    <section className={styles.sec}>
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Nuestro trabajo en el terreno"
            title="Así acompañamos a las familias"
            subtitle="Educación, emprendimiento y fortalecimiento espiritual, de la mano de la comunidad."
          />
        </Reveal>
      </Container>
      <div className={styles.marquee}>
        <div className={styles.track}>
          {[0, 1].map((copy) =>
            cards.map((c, i) => (
              <article
                key={`${copy}-${c.key}-${i}`}
                className={`${styles.card} ${styles[`g${(i % 5) + 1}`]}`}
                aria-hidden={copy === 1}
              >
                {c.image ? (
                  <div className={styles.foto} style={{ backgroundImage: `url("${c.image}")` }} />
                ) : (
                  <div className={styles.wm}><Logo height={150} /></div>
                )}
                {c.sample && <span className={styles.tag}>Foto de ejemplo</span>}
                {c.title && <h3>{c.title}</h3>}
              </article>
            )),
          )}
        </div>
      </div>
    </section>
  )
}
