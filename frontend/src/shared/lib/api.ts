import { API_URL } from './config'

export class ApiError extends Error {
  readonly status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

type Options = Omit<RequestInit, 'body'> & { body?: unknown }

/** Cliente HTTP único del frontend. Todas las features lo usan para hablar con el backend. */
export async function api<T>(path: string, { body, headers, ...rest }: Options = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...headers },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const data = await res.json().catch(() => null)
    throw new ApiError(res.status, data?.message ?? res.statusText)
  }
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T)
}
