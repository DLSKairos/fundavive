import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react'
import { Link } from 'react-router-dom'
import styles from './Button.module.css'

type Variant = 'rojo' | 'linea' | 'blanco' | 'negro' | 'teal' | 'ocre'

type Common = { variant?: Variant; block?: boolean }
type AsButton = Common & ButtonHTMLAttributes<HTMLButtonElement> & { to?: undefined }
type AsLink = Common & AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }

/** Botón reutilizable. Con la prop `to` se comporta como enlace interno. */
export function Button(props: AsButton | AsLink) {
  const { variant = 'rojo', block, className, ...rest } = props
  const cls = [styles.btn, styles[variant], block ? styles.block : '', className ?? ''].join(' ')

  if ('to' in rest && rest.to !== undefined) {
    const { to, ...a } = rest as AsLink
    return <Link to={to} className={cls} {...a} />
  }
  const { to: _omit, ...b } = rest as AsButton
  void _omit
  return <button className={cls} {...b} />
}
