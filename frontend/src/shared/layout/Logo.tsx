import logo from '@/assets/logo.png'

/** Imagotipo de la fundación. */
export function Logo({ height = 58 }: { height?: number }) {
  return <img src={logo} alt="Logo de la Fundación Vive por un Sueño" height={height} style={{ height, width: 'auto', display: 'block' }} />
}
