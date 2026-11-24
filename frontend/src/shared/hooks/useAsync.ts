import { useEffect, useState } from 'react'

type State<T> = { loading: boolean; data: T | null; error: Error | null }

/**
 * Ejecuta una función asíncrona (normalmente una llamada al backend) al montar el componente.
 * `fetcher` debe ser una función estable (definida fuera del componente).
 * Devuelve { loading, data, error }.
 */
export function useAsync<T>(fetcher: () => Promise<T>): State<T> {
  const [state, setState] = useState<State<T>>({ loading: true, data: null, error: null })

  useEffect(() => {
    let active = true
    fetcher()
      .then((data) => {
        if (active) setState({ loading: false, data, error: null })
      })
      .catch((error: Error) => {
        if (active) setState({ loading: false, data: null, error })
      })
    return () => {
      active = false
    }
  }, [fetcher])

  return state
}
