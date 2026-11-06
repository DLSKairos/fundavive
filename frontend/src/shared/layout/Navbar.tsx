import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { ROUTES } from '@/shared/lib/config'
import { Container, Button } from '@/shared/ui'
import { Brand } from './Brand'
import styles from './Navbar.module.css'

const LINKS = [
  { to: ROUTES.home, label: 'Inicio' },
  { to: ROUTES.about, label: 'Quiénes somos' },
  { to: ROUTES.contact, label: 'Contáctenos' },
  { to: ROUTES.volunteers, label: 'Voluntarios' },
  { to: ROUTES.donations, label: 'Donaciones' },
]

export function Navbar({ onAdminClick }: { onAdminClick?: () => void }) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <header className={styles.nav}>
      <Container>
        <div className={styles.fila}>
          <Brand logoHeight={58} />
          <nav className={`${styles.menu} ${open ? styles.abierto : ''}`}>
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.to === ROUTES.home} onClick={close} className={({ isActive }) => (isActive ? styles.act : '')}>
                {l.label}
              </NavLink>
            ))}
            <Button variant="negro" type="button" onClick={() => { close(); onAdminClick?.() }}>Admin</Button>
          </nav>
          <button className={styles.burger} onClick={() => setOpen((o) => !o)} aria-label="Abrir menú" aria-expanded={open}>
            <span /><span /><span />
          </button>
        </div>
      </Container>
    </header>
  )
}
