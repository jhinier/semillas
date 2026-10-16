import { describe, expect, it, mock } from "bun:test";
import type { FuenteUsoMedia } from "./media.repository";
import { crearCasosUsoMedia } from "./media.use-cases";
import { construirUsosRecurso } from "./media.usage";

const RESOURCE_ID = "550e8400-e29b-41d4-a716-446655440099";
const THEME_ID = "550e8400-e29b-41d4-a716-446655440201";
const STEP_ID = "550e8400-e29b-41d4-a716-446655440301";
const STEP_TYPE_ID = "550e8400-e29b-41d4-a716-446655440302";

function fuentes(overrides: Partial<FuenteUsoMedia> = {}): FuenteUsoMedia {
  return {
    temas: [],
    sendas: [],
    contenidos: [],
    pasos: [],
    tiposPaso: [],
    actividades: [],
    ...overrides,
  };
}

describe("media use cases", () => {
  it("detecta referencias directas y referencias dentro de JSON", () => {
    const usos = construirUsosRecurso(
      RESOURCE_ID,
      fuentes({
        temas: [
          {
            id: THEME_ID,
            titulo: "El Buen Pastor",
            slug: "el-buen-pastor",
            portada_recurso_id: RESOURCE_ID,
          },
        ],
        pasos: [
          { id: STEP_ID, tema_id: THEME_ID, tipo_paso_id: STEP_TYPE_ID },
        ],
        tiposPaso: [
          { id: STEP_TYPE_ID, nombre: "Relatar", codigo: "relatar" },
        ],
        contenidos: [
          {
            id: "550e8400-e29b-41d4-a716-446655440401",
            titulo: "Historia",
            paso_id: STEP_ID,
            recurso_id: null,
            recurso_audio_id: RESOURCE_ID,
            datos_extra: { escena: { imagenRecursoId: RESOURCE_ID } },
          },
        ],
        actividades: [
          {
            id: "550e8400-e29b-41d4-a716-446655440501",
            titulo: "Ordena la historia",
            tema_id: THEME_ID,
            configuracion: { elementos: [{ imagen_recurso_id: RESOURCE_ID }] },
          },
        ],
      }),
    );

    expect(usos.map((uso) => uso.tipo)).toEqual([
      "tema",
      "paso",
      "paso",
      "actividad",
    ]);
    expect(usos.some((uso) => uso.contexto.includes("recurso de audio"))).toBe(true);
    expect(usos.some((uso) => uso.contexto.includes("imagenRecursoId"))).toBe(true);
    expect(usos.some((uso) => uso.href.includes("/activities"))).toBe(true);
  });

  it("bloquea la eliminación y devuelve el número real de usos", async () => {
    const eliminarArchivo = mock(async () => ({ error: null }));
    const desactivarRecurso = mock(async () => undefined);
    const casos = crearCasosUsoMedia({
      obtenerRecursoActivo: mock(async () => ({
        id: RESOURCE_ID,
        tipo: "imagen",
        titulo: "Portada",
        texto_alternativo: null,
        tipo_mime: "image/png",
        tamano_bytes: 1024,
        bucket_almacenamiento: "media",
        clave_almacenamiento: "imagen/portada.png",
        activo: true,
      })),
      listarFuentesUso: mock(async () =>
        fuentes({
          temas: [
            {
              id: THEME_ID,
              titulo: "El Buen Pastor",
              slug: "el-buen-pastor",
              portada_recurso_id: RESOURCE_ID,
            },
          ],
        }),
      ),
      eliminarArchivo,
      desactivarRecurso,
    } as never);

    const resultado = await casos.eliminar(
      RESOURCE_ID,
      "550e8400-e29b-41d4-a716-446655440010",
    );

    expect("error" in resultado).toBe(true);
    if ("error" in resultado && resultado.error) {
      expect(resultado.error.codigo).toBe("MEDIA_IN_USE");
      expect(resultado.error.mensaje).toContain("1 lugar");
    }
    expect(eliminarArchivo).not.toHaveBeenCalled();
    expect(desactivarRecurso).not.toHaveBeenCalled();
  });

  it("reemplaza el objeto manteniendo el mismo recurso", async () => {
    const actualizarRecurso = mock(async (_id: string, data: Record<string, unknown>) => ({
      id: RESOURCE_ID,
      tipo: "imagen",
      titulo: "Portada",
      texto_alternativo: "Portada actualizada",
      tipo_mime: data.tipo_mime,
      tamano_bytes: data.tamano_bytes,
      bucket_almacenamiento: data.bucket_almacenamiento,
      clave_almacenamiento: data.clave_almacenamiento,
      activo: true,
    }));
    const eliminarArchivo = mock(async () => ({ error: null }));
    const registrarAuditoria = mock(async () => undefined);
    const casos = crearCasosUsoMedia({
      bucket: "media",
      obtenerRecursoActivo: mock(async () => ({
        id: RESOURCE_ID,
        tipo: "imagen",
        titulo: "Portada",
        texto_alternativo: "Portada actualizada",
        tipo_mime: "image/png",
        tamano_bytes: 1024,
        bucket_almacenamiento: "media",
        clave_almacenamiento: "imagen/anterior.png",
        activo: true,
      })),
      subirArchivo: mock(async () => ({ error: null })),
      actualizarRecurso,
      eliminarArchivo,
      registrarAuditoria,
    } as never);

    const archivo = new File(
      [new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])],
      "nueva.png",
      { type: "image/png" },
    );
    const resultado = await casos.reemplazar({
      id: RESOURCE_ID,
      archivo,
      entrada: { anchoPx: 1200, altoPx: 800 },
      actorUsuarioId: "550e8400-e29b-41d4-a716-446655440010",
    });

    expect("recurso" in resultado).toBe(true);
    if ("recurso" in resultado && resultado.recurso) expect(resultado.recurso.id).toBe(RESOURCE_ID);
    expect(actualizarRecurso).toHaveBeenCalled();
    expect(eliminarArchivo).toHaveBeenCalledWith("media", "imagen/anterior.png");
    expect(registrarAuditoria).toHaveBeenCalled();
  });
});
