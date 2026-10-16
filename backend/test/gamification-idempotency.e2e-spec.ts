import { describe, expect, it } from "bun:test";

describe("gamification idempotency database contract", () => {
  it("declares unique reward keys for theme, badge and challenge sources", async () => {
    const migration = await Bun.file(new URL("../../supabase/migrations/20260713000005_gamification_idempotency.sql", import.meta.url)).text();

    expect(migration).toContain("uq_evento_progreso_recompensa_tema");
    expect(migration).toContain("uq_evento_progreso_recompensa_logro");
    expect(migration).toContain("uq_evento_progreso_recompensa_reto");
  });
});
