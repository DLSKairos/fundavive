import { PaginationMeta } from '../interfaces/pagination-meta.interface';

/**
 * Normaliza page/limit (mínimo 1, `limit` topado en 100) y calcula el
 * `skip` a usar con Prisma (`findMany({ skip, take })`).
 */
export function normalizePagination(page?: number, limit?: number): { page: number; limit: number; skip: number } {
  const normalizedPage = Math.max(1, Math.trunc(page ?? 1));
  const normalizedLimit = Math.min(100, Math.max(1, Math.trunc(limit ?? 20)));
  return {
    page: normalizedPage,
    limit: normalizedLimit,
    skip: (normalizedPage - 1) * normalizedLimit,
  };
}

export function buildPaginationMeta(page: number, limit: number, total: number): PaginationMeta {
  const totalPages = Math.ceil(total / limit) || 0;
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
