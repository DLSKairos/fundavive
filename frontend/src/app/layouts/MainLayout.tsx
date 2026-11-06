import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Navbar, Footer, WhatsAppFab } from '@/shared/layout'
import { NoticeModal } from '@/features/notice'
import { AdminLoginModal } from '@/features/admin'

/** Estructura común de todas las páginas: menú + contenido + pie + ventanas globales. */
export function MainLayout() {
  const { pathname } = useLocation()
  const [adminOpen, setAdminOpen] = useState(false)
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <>
      <Navbar onAdminClick={() => setAdminOpen(true)} />
      <main>
        <Outlet />
      </main>
      <Footer />
      <WhatsAppFab />
      <NoticeModal />
      <AdminLoginModal open={adminOpen} onClose={() => setAdminOpen(false)} />
    </>
  )
}
