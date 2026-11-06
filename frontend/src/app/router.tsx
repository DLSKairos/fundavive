import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { MainLayout } from './layouts/MainLayout'

// Cada página se carga solo cuando se visita (lazy) y vive dentro de su feature.
const HomePage = lazy(() => import('@/features/home/pages/HomePage'))
const AboutPage = lazy(() => import('@/features/about/pages/AboutPage'))
const ContactPage = lazy(() => import('@/features/contact/pages/ContactPage'))
const VolunteersPage = lazy(() => import('@/features/volunteers/pages/VolunteersPage'))
const DonationsPage = lazy(() => import('@/features/donations/pages/DonationsPage'))

const page = (el: React.ReactNode) => <Suspense fallback={null}>{el}</Suspense>

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: '/', element: page(<HomePage />) },
      { path: '/quienes-somos', element: page(<AboutPage />) },
      { path: '/contactenos', element: page(<ContactPage />) },
      { path: '/voluntarios', element: page(<VolunteersPage />) },
      { path: '/donaciones', element: page(<DonationsPage />) },
    ],
  },
])
