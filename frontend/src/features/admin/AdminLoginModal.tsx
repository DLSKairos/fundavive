import { Modal, Button } from '@/shared/ui'

/** Acceso administrador. TODO: POST /api/auth/login y guardar el token. */
export function AdminLoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} labelledBy="admin-title">
      <form onSubmit={(e) => e.preventDefault()} style={{ padding: 32, display: 'grid', gap: 14 }}>
        <h3 id="admin-title" style={{ fontSize: '1.6rem' }}>Acceso administrador</h3>
        <input type="text" placeholder="Usuario" autoComplete="username" />
        <input type="password" placeholder="Contraseña" autoComplete="current-password" />
        <Button variant="negro" type="submit" block>Ingresar</Button>
      </form>
    </Modal>
  )
}
