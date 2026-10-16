import { describe, expect, it } from "bun:test";
import { readFileSync, existsSync } from "fs";

const DOCS_FILES = [
  "backend/api.http",
  "docs/backend-api.md",
  "docs/superpowers/specs/2026-07-06-api-espanol-exacto-design.md",
  "AGENTS.md",
  "CLAUDE.md",
  "GEMINI.md",
].filter((f) => existsSync(f));

const FORBIDDEN_TOKENS = [
  "display_name",
  "nickname",
  "provider",
  "role",
  "theme_id",
  "step_id",
  "activity_id",
  "pathId",
  "ageGroupId",
  "/auth/guest",
  "/me/profile",
  "/themes",
  "/activities",
  "/progress",
  "/gamification",
];

const CANONICAL_TOKENS = [
  "apodo",
  "grupo_edad_id",
  "senda_id",
  "tema_id",
  "paso_id",
  "actividad_id",
  "usuario",
  "perfil",
  "autenticacion",
  "progreso",
  "gamificacion",
];

describe("contrato público 100% español", () => {
  for (const file of DOCS_FILES) {
    const content = readFileSync(file, "utf-8");

    for (const token of FORBIDDEN_TOKENS) {
      it(`[${file}] no contiene el token legacy "${token}"`, () => {
        expect(content).not.toInclude(token);
      });
    }

    for (const token of CANONICAL_TOKENS) {
      it(`[${file}] contiene el token canónico "${token}"`, () => {
        expect(content).toInclude(token);
      });
    }
  }
});
