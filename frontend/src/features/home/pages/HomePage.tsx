import { Hero } from '../components/Hero'

/**
 * Página de inicio = ensamblaje de secciones. Se irán agregando en este orden:
 *  1. Hero (listo)  2. FieldWork (carrusel)  3. ImpactNumbers  4. Documents  5. DonateCta
 */
export default function HomePage() {
  return (
    <>
      <Hero />
    </>
  )
}
