import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react'
import { Link } from 'react-router-dom'
import styles from './Button.module.css'

type Variant = 'rojo' | 'linea' | 'lineaClara' | 'blanco' | 'negro' | 'teal' | 'ocre'

type Common = { variant?: Variant; block?: boolean }
type AsButton = Common & ButtonHTMLAttributes<HTMLButtonElement> & { to?: undefined; href?: undefined }
type AsLink = Common & AnchorHTMLAttributes<HTMLAnchorElement> & { to: string; href?: undefined }
type AsAnchor = Common & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; to?: undefined }

/**
 * Botón reutilizable.
 *  - con `to`: enlace interno del sitio
 *  - con `href`: enlace externo o descarga
 *  - sin ninguno: botón normal
 */
export function Button(props: AsButton | AsLink | AsAnchor) {
  const { variant = 'rojo', block, className, to, href, ...rest } = props
  const cls = [styles.btn, styles[variant], block ? styles.block : '', className ?? ''].join(' ')

  if (to !== undefined) {
    return <Link to={to} className={cls} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)} />
  }
  if (href !== undefined) {
    return <a href={href} className={cls} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)} />
  }
  return <button className={cls} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)} />
}
