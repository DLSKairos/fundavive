import { useEffect, useState } from 'react'
import { Modal, Button } from '@/shared/ui'
import { Logo } from '@/shared/layout'
import { useAsync } from '@/shared/hooks/useAsync'
import { getNotice, type NoticeConfig } from './api/notice.api'
import styles from './NoticeModal.module.css'

const seenKey = (n: NoticeConfig) => `fundavive.aviso.${n.titulo}|${n.subtitulo ?? ''}`

function wasSeen(n: NoticeConfig): boolean {
  try { return sessionStorage.getItem(seenKey(n)) === '1' } catch { return false }
}
function markSeen(n: NoticeConfig) {
  try { sessionStorage.setItem(seenKey(n), '1') } catch { /* sin almacenamiento: no pasa nada */ }
}

/**
 * Aviso al abrir la página. Se muestra solo si el backend tiene un aviso activo,
 * y una vez por visita (por pestaña) para no molestar.
 */
export function NoticeModal() {
  const { data } = useAsync(getNotice)
  const [ready, setReady] = useState(false)
  const [closed, setClosed] = useState(false)

  useEffect(() => {
    if (!data || wasSeen(data)) return
    const t = setTimeout(() => setReady(true), 900)
    return () => clearTimeout(t)
  }, [data])

  if (!data) return null

  const close = () => {
    markSeen(data)
    setClosed(true)
  }
  const external = /^https?:\/\//.test(data.urlDestino)

  return (
    <Modal open={ready && !closed} onClose={close} labelledBy="notice-title">
      <div
        className={styles.top}
        style={data.imagenUrl ? { backgroundImage: `url("${data.imagenUrl}")` } : undefined}
      >
        {!data.imagenUrl && <Logo height={96} />}
        <span className={styles.badge}>{data.badgeTexto}</span>
      </div>
      <div className={styles.body}>
        <h3 id="notice-title">{data.titulo}</h3>
        {data.subtitulo && <p>{data.subtitulo}</p>}
        {data.highlightTexto && <div className={styles.hl}>{data.highlightTexto}</div>}
        <div className={styles.acc}>
          <button type="button" className={styles.link} onClick={close}>Más tarde</button>
          {external ? (
            <Button href={data.urlDestino} target="_blank" rel="noopener noreferrer" onClick={close}>{data.etiquetaBoton} →</Button>
          ) : (
            <Button to={data.urlDestino} onClick={close}>{data.etiquetaBoton} →</Button>
          )}
        </div>
      </div>
    </Modal>
  )
}
