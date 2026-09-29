/**
 * Prisma mapea columnas `BigInt` (p. ej. `tamanoArchivo` en `ImagenCarrusel`,
 * `ImagenSeccion` y `PdfInformativo`) al tipo nativo `bigint` de JS, que
 * `JSON.stringify`/`res.json()` NO puede serializar (lanza `TypeError`).
 * Los tamaños de archivo nunca se acercan a `Number.MAX_SAFE_INTEGER`, así
 * que convertir a `number` en el borde de la respuesta HTTP es seguro.
 */
export function bigIntToNumber(value: bigint | null | undefined): number | null {
  return value === null || value === undefined ? null : Number(value);
}
