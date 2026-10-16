import { describe, expect, it, mock } from "bun:test";

mock.module("@/shared/config/env", () => ({
  env: {
    apiUrl: "https://api.example.test",
    supabaseUrl: "https://supabase.example.test",
    supabaseAnonKey: "anon-key",
  },
}));

import type { ActividadAdmin } from "@/features/admin/admin.api";

const {
  filtrarActividadesPreview,
  obtenerCodigosPasosCompletosPreview,
  obtenerContenidoPreview,
} = await import("./use-theme-preview-page");

describe("helpers de la vista previa administrativa", () => {
  const steps = [
    {
      id: "paso-conectar",
      tipo_paso: { codigo: "conectar" },
      contenidos: [
        {
          id: "contenido-1",
          grupo_edad_id: "semillas",
          titulo: "Hola",
          cuerpo: "Contenido para Semillas",
        },
        {
          id: "contenido-2",
          grupo_edad_id: "exploradores",
          titulo: "Explora",
          cuerpo: "Contenido para Exploradores",
        },
      ],
    },
    {
      id: "paso-relatar",
      tipo_paso: { codigo: "relatar" },
      contenidos: [
        {
          id: "contenido-3",
          grupo_edad_id: "semillas",
          titulo: "Historia",
          cuerpo: "",
        },
      ],
    },
  ];

  it("selecciona el contenido por momento CRECER y franja, no por identificadores visibles", () => {
    const result = obtenerContenidoPreview(steps, "conectar", "exploradores");

    expect(result.step?.id).toBe("paso-conectar");
    expect(result.content?.titulo).toBe("Explora");
    expect(result.content?.cuerpo).toBe("Contenido para Exploradores");
  });

  it("permite una fase vacía sin caer en la primera configurada", () => {
    const result = obtenerContenidoPreview(steps, "ensenar", "semillas");

    expect(result.step).toBeNull();
    expect(result.content).toBeNull();
  });

  it("calcula la cobertura únicamente con título y cuerpo completos", () => {
    const completed = obtenerCodigosPasosCompletosPreview(steps, "semillas");

    expect([...completed]).toEqual(["conectar"]);
  });

  it("filtra actividades primero por franja y luego por paso", () => {
    const activities = [
      { id: "a-1", grupo_edad_id: "semillas", paso_id: "paso-conectar" },
      { id: "a-2", grupo_edad_id: "semillas", paso_id: "paso-relatar" },
      { id: "a-3", grupo_edad_id: "exploradores", paso_id: "paso-conectar" },
    ] as unknown as ActividadAdmin[];

    const result = filtrarActividadesPreview(
      activities,
      "semillas",
      "paso-conectar",
    );

    expect(result.byAge.map((activity) => activity.id)).toEqual(["a-1", "a-2"]);
    expect(result.byStep.map((activity) => activity.id)).toEqual(["a-1"]);
  });
});
