/** Construye claves de cache que no pueden colisionar entre identidades. */
export function claveCacheScope(base: string, scopeId: string | null | undefined): string | null {
  if (!scopeId) return null;
  return `${base}:${scopeId}`;
}
