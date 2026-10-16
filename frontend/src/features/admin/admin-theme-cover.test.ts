import { describe, expect, it } from "bun:test";
import {
  INTERVALO_RENOVACION_PORTADA_ADMIN_MS,
  crearConsultaPortadaFirmadaAdmin,
  obtenerIdPortadaTemaAdmin,
  resolverPortadaTemaAdmin,
} from "./admin-theme-cover";

describe("resolverPortadaTemaAdmin", () => {
  it("renueva la firma antes de que venza", () => {
    expect(INTERVALO_RENOVACION_PORTADA_ADMIN_MS).toBeLessThan(300_000);
  });

  it("obtiene el recurso anidado de un tema no publicado", () => {
    expect(
      obtenerIdPortadaTemaAdmin({
        id: "tema-borrador",
        portada_recurso_id: null,
        portada_recurso: { id: "portada-borrador" },
      }),
    ).toBe("portada-borrador");
  });

  it("solicita la URL firmada autenticada para la portada de un borrador", async () => {
    const recursosSolicitados: string[] = [];
    const consulta = crearConsultaPortadaFirmadaAdmin(
      {
        id: "tema-borrador",
        portada_recurso_id: "portada-borrador",
      },
      async (recursoId) => {
        recursosSolicitados.push(recursoId);
        return {
          url: "https://storage.ejemplo.com/object/sign/media/portada.png?token=temporal",
          expira_en_segundos: 300,
        };
      },
    );

    await expect(consulta.queryFn()).resolves.toEqual({
      url: "https://storage.ejemplo.com/object/sign/media/portada.png?token=temporal",
      expira_en_segundos: 300,
    });
    expect(consulta.queryKey).toEqual(["admin", "recurso-url", "portada-borrador"]);
    expect(recursosSolicitados).toEqual(["portada-borrador"]);
  });

  it("prioriza la URL firmada sobre la URL pública de un bucket privado", () => {
    expect(
      resolverPortadaTemaAdmin({
        titulo: "El amor de Dios",
        urlFirmada: "https://storage.ejemplo.com/object/sign/media/portada.png?token=temporal",
      }),
    ).toBe("https://storage.ejemplo.com/object/sign/media/portada.png?token=temporal");
  });

  it("muestra una imagen de respaldo cuando el tema no tiene portada", () => {
    expect(
      resolverPortadaTemaAdmin({
        titulo: "El amor de Dios",
        urlFirmada: null,
      }),
    ).toBe("https://api.dicebear.com/7.x/shapes/svg?seed=El%20amor%20de%20Dios");
  });
});
