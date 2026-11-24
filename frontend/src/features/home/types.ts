/** Imagen del carrusel (GET /api/home/images) */
export type CarouselImage = {
  id: number
  titulo: string | null
  descripcion: string | null
  urlImagen: string
  orden: number
}

/** Documento PDF (GET /api/home/pdfs) */
export type PdfDoc = {
  id: number
  titulo: string
  descripcion: string | null
  nombreArchivo: string
  urlPdf: string
  tamanoArchivo: number | null
  descargas: number
}
