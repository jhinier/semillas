import { beforeAll, describe, expect, it } from "bun:test";
import type { ActividadAdmin } from "../admin.api";

let getActivityLibraryStatus: typeof import("./use-admin-activities")["getActivityLibraryStatus"];
let countActivityLibraryStatuses: typeof import("./use-admin-activities")["countActivityLibraryStatuses"];
let filterActivityLibrary: typeof import("./use-admin-activities")["filterActivityLibrary"];

beforeAll(async () => {
  process.env.VITE_API_URL = "http://localhost";
  process.env.VITE_SUPABASE_URL = "http://localhost";
  process.env.VITE_SUPABASE_ANON_KEY = "clave-de-prueba";
  ({ getActivityLibraryStatus, countActivityLibraryStatuses, filterActivityLibrary } = await import(
    "./use-admin-activities"
  ));
});

function crearActividad(overrides: Partial<ActividadAdmin> = {}): ActividadAdmin {
  return {
    id: "act-1",
    tema_id: "tema-1",
    paso_id: "paso-1",
    grupo_edad_id: "semillas",
    tipo_actividad_id: "tipo-1",
    titulo: "Quiz de prueba",
    consigna: "Responde correctamente",
    retroalimentacion: null,
    orden: 1,
    xp_recompensa: 20,
    limite_tiempo_seg: null,
    dificultad: "normal",
    obligatorio: true,
    configuracion: {},
    opciones: [],
    estado: "borrador",
    creado_en: null,
    actualizado_en: null,
    tipo_actividad: { id: "tipo-1", codigo: "cuestionario", nombre: "Cuestionario" },
    tema: null,
    grupo_edad: { id: "semillas", codigo: "semillas", nombre: "Semillas" },
    ...overrides,
  };
}

describe("use-admin-activities helpers", () => {
  it("normaliza estado 'activo' heredando el estado del tema o cayendo en 'borrador'", () => {
    expect(
      getActivityLibraryStatus(
        crearActividad({ estado: "activo", tema: { id: "t1", titulo: "Amor", slug: "amor", estado: "publicado" } }),
      ),
    ).toBe("publicada");

    expect(
      getActivityLibraryStatus(
        crearActividad({ estado: "activo", tema: { id: "t2", titulo: "Fe", slug: "fe", estado: "revision" } }),
      ),
    ).toBe("revision");

    expect(
      getActivityLibraryStatus(
        crearActividad({ estado: "activo", tema: { id: "t3", titulo: "Borrador", slug: "borrador", estado: "borrador" } }),
      ),
    ).toBe("borrador");

    expect(getActivityLibraryStatus(crearActividad({ estado: "activo" }))).toBe("borrador");
  });

  it("mantiene coincidencia exacta entre statusCounts y filterActivityLibrary para cualquier estado", () => {
    const lista: ActividadAdmin[] = [
      crearActividad({ id: "a1", estado: "activo", tema: { id: "t1", titulo: "Publicado", slug: "p", estado: "publicado" } }),
      crearActividad({ id: "a2", estado: "publicada" }),
      crearActividad({ id: "a3", estado: "activo", tema: { id: "t2", titulo: "En revisión", slug: "r", estado: "revision" } }),
      crearActividad({ id: "a4", estado: "activo", tema: { id: "t3", titulo: "Copia", slug: "c", estado: "borrador" } }),
      crearActividad({ id: "a5", estado: "activo" }),
    ];

    const counts = countActivityLibraryStatuses(lista);
    expect(counts).toEqual({
      todas: 5,
      publicada: 2,
      revision: 1,
      borrador: 2,
    });

    expect(filterActivityLibrary(lista, { activeStatus: "todas" }).length).toBe(counts.todas);
    expect(filterActivityLibrary(lista, { activeStatus: "publicada" }).length).toBe(counts.publicada);
    expect(filterActivityLibrary(lista, { activeStatus: "revision" }).length).toBe(counts.revision);
    expect(filterActivityLibrary(lista, { activeStatus: "borrador" }).length).toBe(counts.borrador);
  });
});
