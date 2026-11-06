import styles from './WhatsAppFab.module.css'

/** Botón flotante de WhatsApp. TODO: número real desde GET /api/settings/whatsapp */
export function WhatsAppFab({ phone }: { phone?: string }) {
  const href = phone ? `https://wa.me/${phone}` : '/contactenos'
  return (
    <a className={styles.wa} href={href} aria-label="Escríbenos por WhatsApp">
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" width="30" height="30">
        <path d="M12 2C6.5 2 2 6.2 2 11.4c0 2 .7 3.9 1.9 5.4L3 21.5l4.9-1.3c1.3.6 2.7 1 4.1 1 5.5 0 10-4.2 10-9.4S17.5 2 12 2zm0 16.9c-1.3 0-2.5-.3-3.6-.9l-.3-.2-2.200.6.6-2.100-.2-.3a7.300 7.300 0 0 1-1.200-4c0-4 3.500-7.300 7.900-7.300s7.900 3.300 7.900 7.300-3.500 6.900-7.900 6.900z" />
      </svg>
    </a>
  )
}
