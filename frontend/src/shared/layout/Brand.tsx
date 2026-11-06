import { Link } from 'react-router-dom'
import { ROUTES } from '@/shared/lib/config'
import { Logo } from './Logo'
import styles from './Brand.module.css'

/** Logo + nombre de la fundación (se usa en el menú y en el footer). */
export function Brand({ light, logoHeight = 58 }: { light?: boolean; logoHeight?: number }) {
  return (
    <Link to={ROUTES.home} className={`${styles.marca} ${light ? styles.light : ''}`} aria-label="Ir al inicio">
      <Logo height={logoHeight} />
      <span className={styles.txt}>
        <small>Fundación</small>
        <strong>VIVE<i>POR</i>UN SUEÑO</strong>
      </span>
    </Link>
  )
}
