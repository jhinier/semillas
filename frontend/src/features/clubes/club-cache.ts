export const CLUB_CACHE_TTL_MS = 15 * 60 * 1000;

export function estaCacheSocialExpirada(timestamp: number, ahora = Date.now()): boolean {
  return ahora - timestamp > CLUB_CACHE_TTL_MS;
}
