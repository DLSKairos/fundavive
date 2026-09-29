import { NotFoundException } from '@nestjs/common';
import { PaginaCms } from "@prisma/client";

/**
 * Normaliza el parámetro de ruta `:pagina` (acepta guiones, p. ej.
 * `quienes-somos`) al valor del enum `PaginaCms` (`quienes_somos`) y valida
 * que exista. Lanza 404 si la página no es una de las soportadas.
 */
export function normalizarPaginaCms(paginaParam: string): PaginaCms {
  const normalizado = paginaParam.replace(/-/g, '_');
  if (!Object.values(PaginaCms).includes(normalizado as PaginaCms)) {
    throw new NotFoundException(`La página '${paginaParam}' no existe`);
  }
  return normalizado as PaginaCms;
}
