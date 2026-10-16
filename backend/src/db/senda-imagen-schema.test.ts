import { describe, expect, it } from "bun:test";
import { readFile } from "node:fs/promises";

describe("esquema de imagen de senda", () => {
  it("declara una referencia opcional a recurso_multimedia en las dos fuentes SQL", async () => {
    const [base, migracion] = await Promise.all([
      readFile("../semilla_base.sql", "utf8"),
      readFile("../supabase/migrations/20260712000005_senda_imagen_recurso.sql", "utf8"),
    ]);

    expect(base).toMatch(
      /imagen_recurso_id\s+uuid.*REFERENCES\s+recurso_multimedia\(id\).*ON DELETE SET NULL/is,
    );
    expect(migracion).toMatch(
      /ALTER TABLE senda ADD COLUMN IF NOT EXISTS imagen_recurso_id uuid REFERENCES recurso_multimedia\(id\) ON DELETE SET NULL/i,
    );
  });

  it("expone imagen_recurso_id nullable en los tipos generados de senda", async () => {
    const tipos = await readFile("src/db/database.types.ts", "utf8");
    const bloqueSenda = tipos.match(/senda: \{(?<contenido>[\s\S]*?)\n      \}/)?.groups?.contenido;

    expect(bloqueSenda).toBeDefined();
    expect(bloqueSenda).toMatch(/imagen_recurso_id: string \| null/);
    expect(bloqueSenda).toMatch(/imagen_recurso_id\?: string \| null/);
    expect(bloqueSenda).toMatch(
      /foreignKeyName: "senda_imagen_recurso_id_fkey"[\s\S]*columns: \["imagen_recurso_id"\][\s\S]*referencedRelation: "recurso_multimedia"[\s\S]*referencedColumns: \["id"\]/,
    );
  });
});
