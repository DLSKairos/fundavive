import { useEffect, type ReactNode } from 'react'
import styles from './Modal.module.css'

type Props = { open: boolean; onClose: () => void; labelledBy?: string; children: ReactNode }

/** Ventana emergente genérica: se cierra con Esc, con la X o haciendo clic fuera. Sirve para el aviso y para el login de admin. */
export function Modal({ open, onClose, labelledBy, children }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.caja} role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
        <button className={styles.cerrar} onClick={onClose} aria-label="Cerrar">×</button>
        {children}
      </div>
    </div>
  )
}
