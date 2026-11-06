/** Configuración global leída de las variables de entorno (.env). */
export const API_URL: string = import.meta.env.VITE_API_URL ?? '/api'

/** Rutas del sitio en un solo lugar: si cambia una URL, se cambia aquí. */
export const ROUTES = {
  home: '/',
  about: '/quienes-somos',
  contact: '/contactenos',
  volunteers: '/voluntarios',
  donations: '/donaciones',
} as const
