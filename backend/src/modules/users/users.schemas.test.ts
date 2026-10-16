import { describe, expect, it } from "bun:test";
import { updateProfileSchema } from "./users.schemas";

describe("updateProfileSchema", () => {
  it("acepta preferencias de perfil sin edad exacta", () => {
    const resultado = updateProfileSchema.safeParse({
      apodo: "Semillero",
      grupo_edad_id: "550e8400-e29b-41d4-a716-446655440000",
      url_avatar: "https://cdn.example.com/avatar.webp",
      prefiere_audio: true,
      tamano_texto_preferido: "grande",
    });
    expect(resultado.success).toBe(true);
  });

  it("acepta una clave de avatar local sin relajar la validación de URL", () => {
    const resultado = updateProfileSchema.safeParse({ clave_avatar: "1" });

    expect(resultado.success).toBe(true);
  });

  it("rechaza URL inválida y campos de edad exacta", () => {
    const resultado = updateProfileSchema.safeParse({ url_avatar: "not-a-url", edad: 8, fecha_nacimiento: "2018-01-01" });
    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      expect(resultado.error.issues.map((issue) => issue.path[0])).toContain("url_avatar");
      expect(resultado.error.issues.some((issue) => issue.code === "unrecognized_keys")).toBe(true);
    }
  });
});
