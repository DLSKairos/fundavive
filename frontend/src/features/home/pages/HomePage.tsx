import { Hero } from '../components/Hero'
import { FieldWork } from '../components/FieldWork'
import { ImpactNumbers } from '../components/ImpactNumbers'
import { Documents } from '../components/Documents'
import { DonateCta } from '../components/DonateCta'

/** Página de inicio = ensamblaje de secciones. Para reordenar o quitar una sección, se hace aquí. */
export default function HomePage() {
  return (
    <>
      <Hero />
      <FieldWork />
      <ImpactNumbers />
      <Documents />
      <DonateCta />
    </>
  )
}
