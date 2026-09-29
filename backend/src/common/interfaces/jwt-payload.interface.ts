/**
 * Payload embebido en el JWT emitido por `AuthService.login`/`refresh`.
 * Se mantiene deliberadamente mínimo (sin datos sensibles).
 */
export interface JwtPayload {
  id: number;
  username: string;
  email: string;
}
