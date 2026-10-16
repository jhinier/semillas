import { describe, expect, it } from "bun:test";
import {
  actualizarLogroAdminSchema,
  adminLogrosListSchema,
  crearLogroAdminSchema,
  criteriosLogro,
} from "./admin-logros.schemas";

describe("schemas administrativos de logros", () => {
  it("valida la creación con criterio permitido", () => {
    const parsed = crearLogroAdminSchema.parse({
      codigo: "primer-tema",
      nombre: "Primer paso",
      descripcion: "Completaste tu primer tema",
      url_icono: "https://cdn.example.com/medios/logros/primer-tema.png",
      bono_xp: 30,
      codigo_criterio: "temas_completados",
      valor_criterio: 1,
    });
    expect(parsed.codigo).toBe("primer-tema");
    expect(parsed.codigo_criterio).toBe("temas_completados");
  });

  it("normaliza bono_xp y url_icono opcionales", () => {
    const parsed = crearLogroAdminSchema.parse({
      codigo: "racha-3",
      nombre: "Tres dias seguidos",
      codigo_criterio: "dias_racha",
      valor_criterio: 3,
    });
    expect(parsed.bono_xp).toBe(0);
    expect(parsed.descripcion).toBeUndefined();
    expect(parsed.url_icono).toBeUndefined();
  });

  it("rechaza un código con caracteres no permitidos", () => {
    const resultado = crearLogroAdminSchema.safeParse({
      codigo: "Primer Tema!",
      nombre: "Nombre valido",
      codigo_criterio: "temas_completados",
      valor_criterio: 1,
    });
    expect(resultado.success).toBe(false);
  });

  it("rechaza un criterio fuera del conjunto permitido", () => {
    const resultado = crearLogroAdminSchema.safeParse({
      codigo: "nivel-5",
      nombre: "Nivel cinco",
      codigo_criterio: "nivel_alcanzado",
      valor_criterio: 5,
    });
    expect(resultado.success).toBe(false);
  });

  it("rechaza una actualización vacía", () => {
    expect(actualizarLogroAdminSchema.safeParse({}).success).toBe(false);
  });

  it("permite actualización parcial", () => {
    const parsed = actualizarLogroAdminSchema.parse({ bono_xp: 60 });
    expect(parsed.bono_xp).toBe(60);
  });

  it("interpreta query string con coerción de números", () => {
    const parsed = adminLogrosListSchema.parse({
      estado: "activo",
      limit: "10",
      offset: "0",
      criterio: "actividades_completadas",
    });
    expect(parsed.limit).toBe(10);
    expect(parsed.offset).toBe(0);
    expect(parsed.criterio).toBe("actividades_completadas");
  });

  it("expone los criterios soportados", () => {
    expect(criteriosLogro).toContain("temas_completados");
    expect(criteriosLogro).toContain("actividades_completadas");
    expect(criteriosLogro).toContain("dias_racha");
    expect(criteriosLogro).toHaveLength(3);
  });
});