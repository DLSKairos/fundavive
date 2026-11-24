import { apiData } from '@/shared/lib/api'
import { useAsync } from '@/shared/hooks/useAsync'

type SectionImage = { pagina: string; clave: string; urlImagen: string }

// Una sola petición para todas las páginas: se guarda y se reutiliza.
let cache: Promise<SectionImage[]> | null = null

function getSectionImages(): Promise<SectionImage[]> {
  cache ??= apiData<SectionImage[]>('/secciones-imagenes').catch(() => {
    cache = null
    return []
  })
  return cache
}

/** URL de la imagen de un espacio fijo del backend (ej.: 'inicio' + 'hero'), o null si aún no hay. */
export function useSectionImage(pagina: string, clave: string): string | null {
  const { data } = useAsync(getSectionImages)
  return data?.find((i) => i.pagina === pagina && i.clave === clave)?.urlImagen ?? null
}
