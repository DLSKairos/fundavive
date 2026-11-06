import { useEffect, useState } from 'react'
import { Modal, Button } from '@/shared/ui'
import { ROUTES } from '@/shared/lib/config'
import { Logo } from '@/shared/layout'

/** Aviso al abrir la página. TODO: leer título/subtítulo/destacado de GET /api/noticias-modal y respetar si está activo. */
export function NoticeModal() {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setOpen(true), 900)
    return () => clearTimeout(t)
  }, [])
  const close = () => setOpen(false)

  return (
    <Modal open={open} onClose={close} labelledBy="notice-title">
      <div style={{ background: 'linear-gradient(120deg,var(--rojo),var(--ocre) 70%,var(--amarillo))', padding: 24, display: 'flex', justifyContent: 'flex-end' }}>
        <Logo height={90} />
      </div>
      <div style={{ padding: '30px 32px', background: 'var(--crema)' }}>
        <h3 id="notice-title" style={{ fontSize: '1.75rem', marginBottom: 12 }}>Nueva campaña destacada</h3>
        <p style={{ marginBottom: 24, color: 'var(--texto-suave)' }}>Aquí irá el subtítulo de la campaña o noticia que la fundación quiera resaltar.</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <Button variant="linea" onClick={close}>Más tarde</Button>
          <Button to={ROUTES.donations} onClick={close}>Quiero ayudar →</Button>
        </div>
      </div>
    </Modal>
  )
}
