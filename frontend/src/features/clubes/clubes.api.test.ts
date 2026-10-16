import { describe, expect, it } from "bun:test";
import { CLUB_CACHE_TTL_MS, estaCacheSocialExpirada } from "./club-cache";

describe("cache social", () => {
  it("expira snapshots después del TTL corto", () => {
    const ahora = 1_000_000;
    expect(estaCacheSocialExpirada(ahora - CLUB_CACHE_TTL_MS + 1, ahora)).toBe(false);
    expect(estaCacheSocialExpirada(ahora - CLUB_CACHE_TTL_MS - 1, ahora)).toBe(true);
  });
});
