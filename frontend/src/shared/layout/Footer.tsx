import { Link } from 'react-router-dom'
import { ROUTES } from '@/shared/lib/config'
import { Container } from '@/shared/ui'
import { Brand } from './Brand'
import styles from './Footer.module.css'

export function Footer() {
  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.grid}>
          <div>
            <Brand light logoHeight={64} />
            <p className={styles.desc}>Restauración integral de familias vulnerables, con amor y esperanza.</p>
            {/* TODO: datos reales desde /api/settings (WhatsApp, redes) cuando David los cargue */}
            <p className={styles.info}>Dirección de la fundación (por definir)</p>
            <p className={styles.info}>correo@fundacion.org</p>
          </div>
          <div>
            <h4>Navegación</h4>
            <ul>
              <li><Link to={ROUTES.home}>Inicio</Link></li>
              <li><Link to={ROUTES.about}>Quiénes somos</Link></li>
              <li><Link to={ROUTES.contact}>Contáctenos</Link></li>
              <li><Link to={ROUTES.volunteers}>Voluntarios</Link></li>
              <li><Link to={ROUTES.donations}>Donaciones</Link></li>
            </ul>
          </div>
          <div>
            <h4>Síguenos</h4>
            <ul><li><a href="#">Instagram</a></li><li><a href="#">TikTok</a></li></ul>
          </div>
        </div>
        <p className={styles.peq}>© {new Date().getFullYear()} Fundación Vive por un Sueño. Todos los derechos reservados.</p>
      </Container>
    </footer>
  )
}
