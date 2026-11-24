import { API_URL } from '@/shared/lib/config'
import { apiData } from '@/shared/lib/api'
import type { CarouselImage, PdfDoc } from '../types'

export const getCarouselImages = () => apiData<CarouselImage[]>('/home/images')
export const getPdfs = () => apiData<PdfDoc[]>('/home/pdfs')

export const pdfDownloadUrl = (id: number) => `${API_URL}/home/pdfs/${id}/download`
export const pdfViewUrl = (id: number) => `${API_URL}/home/pdfs/${id}/view`
