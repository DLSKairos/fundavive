# Arquitectura del frontend – Fundación Vive por un Sueño

Arquitectura **modular por features** (React + Vite + TypeScript).

```
src/
├─ app/            Ensamblaje: App, router (rutas) y layouts. No tiene lógica de negocio.
├─ shared/         Lo reutilizable por TODAS las features
│  ├─ ui/          Button, Container, SectionHeading, PageBanner, Modal, Reveal
│  ├─ layout/      Navbar, Footer, Brand, Logo, WhatsAppFab
│  ├─ hooks/       useReveal, useCountUp
│  ├─ lib/         api.ts (cliente HTTP), config.ts (API_URL y ROUTES)
│  └─ styles/      tokens.css (colores/fuentes de marca), global.css
├─ features/       Un módulo por funcionalidad del negocio
│  ├─ home/        components/ (Hero, ...), pages/HomePage.tsx
│  ├─ about/       pages/AboutPage.tsx
│  ├─ contact/  volunteers/  donations/
│  ├─ notice/      Aviso al abrir la página
│  └─ admin/       Acceso administrador
└─ assets/         Imágenes
```

## Reglas (para que los módulos sean reutilizables)
1. `shared` NO importa de `features`. Las features SÍ pueden importar de `shared`.
2. Una feature NO importa de otra feature (si algo lo usan dos, se sube a `shared`).
3. Cada feature se usa desde afuera solo por su `index.ts`.
4. Cada componente: `Componente.tsx` + `Componente.module.css` (CSS Modules: los estilos no se pisan).
5. Colores, fuentes y medidas SOLO con variables de `tokens.css` (nunca hex sueltos).
6. Todo llamado al backend pasa por `shared/lib/api.ts`; cada feature tendrá su `api/` con sus funciones.
7. Las rutas viven en `ROUTES` (config.ts) y se declaran en `app/router.tsx`.
8. Imports con alias: `@/shared/ui`, `@/features/home/...` (el `@` apunta a `src/`).

## Estructura interna de una feature (cuando crezca)
```
features/donations/
├─ components/   piezas de pantalla (DonationForm, DonorWall...)
├─ api/          funciones que llaman al backend (initDonation, getStatus...)
├─ hooks/        lógica (useDonation...)
├─ types.ts      tipos TypeScript
├─ pages/        DonationsPage.tsx
└─ index.ts      lo único que se exporta hacia afuera
```
