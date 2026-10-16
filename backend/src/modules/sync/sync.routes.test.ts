import { describe, expect, it } from "bun:test";
import { createMiddleware } from "hono/factory";
import type { AppBindings } from "../../config/env";
import { crearModuloSync } from "./sync.routes";

describe("sync.routes", () => {
  it("devuelve eventos y progreso al consultar pull", async () => {
    const llamadas: string[] = [];

    const repositorio = {
      listarEventosUsuario: async () => {
        llamadas.push("listarEventosUsuario");
        return [
          {
            id: "evento-1",
            usuarioId: "usuario-1",
            idEventoCliente: "550e8400-e29b-41d4-a716-446655440000",
            tipoEvento: "tema_iniciado",
            temaId: "tema-1",
            pasoId: null,
            actividadId: null,
            correcta: null,
            puntaje: null,
            xpOtorgada: 10,
            datos: { origen: "offline" },
            ocurridoEnCliente: new Date("2026-01-01T00:00:00.000Z"),
            dispositivoId: "dispositivo-1",
            recibidoEnServidor: new Date("2026-01-02T00:00:00.000Z")
          }
        ];
      },
      listarProgresoTemas: async () => {
        llamadas.push("listarProgresoTemas");
        return [
          {
            usuarioId: "usuario-1",
            temaId: "tema-1",
            estado: "en_progreso",
            porcentaje: 50,
            iniciadoEn: new Date("2026-01-01T00:00:00.000Z"),
            completadoEn: null,
            ultimoPasoId: null,
            actualizadoEn: new Date("2026-01-02T00:00:00.000Z")
          }
        ];
      },
      listarProgresoActividades: async () => {
        llamadas.push("listarProgresoActividades");
        return [
          {
            usuarioId: "usuario-1",
            actividadId: "actividad-1",
            intentos: 2,
            mejorPuntaje: 100,
            completado: true,
            completadoEn: new Date("2026-01-03T00:00:00.000Z"),
            actualizadoEn: new Date("2026-01-04T00:00:00.000Z")
          }
        ];
      },
      registrarEvento: async () => {
        throw new Error("No se esperaba registrarEvento en pull");
      },
      obtenerProgresoTema: async () => undefined,
      crearProgresoTema: async () => undefined,
      actualizarProgresoTema: async () => undefined,
      obtenerProgresoActividad: async () => undefined,
      crearProgresoActividad: async () => undefined,
      actualizarProgresoActividad: async () => undefined,
      validarRespuestaActividad: async () => null,
      aplicarRespuestaActividad: async () => undefined,
      validarActividadCompletada: async () => null,
      aplicarActividadCompletada: async () => undefined,
      registrarPasoActual: async () => undefined,
      validarTemaCompletable: async () => null,
      marcarTemaCompletado: async () => undefined,
      evaluarLogrosUsuario: async () => []
    };

    const authStub = createMiddleware<AppBindings>(async (c, next) => {
      c.set("user", {
        id: "usuario-1",
        role: "invitado",
        displayName: "Semillero",
        email: null,
        provider: "invitado"
      });

      await next();
    });

    const app = crearModuloSync({ repositorio, authMiddleware: authStub });

    const respuesta = await app.fetch(new Request("http://localhost/pull?since=2026-01-01T00:00:00.000Z"));

    expect(respuesta.status).toBe(200);
    expect(llamadas).toEqual([
      "listarEventosUsuario",
      "listarProgresoTemas",
      "listarProgresoActividades"
    ]);

    const cuerpo = (await respuesta.json()) as {
      exito: boolean;
      datos: {
        eventos: unknown[];
        progreso: { temas: unknown[]; actividades: unknown[] };
      };
    };
    expect(cuerpo.exito).toBe(true);
    expect(cuerpo.datos.eventos).toHaveLength(1);
    expect(cuerpo.datos.progreso.temas).toHaveLength(1);
    expect(cuerpo.datos.progreso.actividades).toHaveLength(1);
  });
});
