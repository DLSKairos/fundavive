import { apiData } from '@/shared/lib/api'

/** Configuración del aviso (GET /api/noticias-modal). Es `null` si no hay aviso activo. */
export type NoticeConfig = {
  titulo: string
  subtitulo: string | null
  badgeTexto: string
  highlightTexto: string | null
  urlDestino: string
  etiquetaBoton: string
  imagenUrl: string | null
}

export const getNotice = () => apiData<NoticeConfig | null>('/noticias-modal')
