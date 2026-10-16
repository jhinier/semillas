import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, mock } from "bun:test";

let archivarTema: typeof import("./admin.api")["archivarTema"];
let actualizarSendaAdmin: typeof import("./admin.api")["actualizarSendaAdmin"];
let crearSendaAdmin: typeof import("./admin.api")["crearSendaAdmin"];
let duplicarTema: typeof import("./admin.api")["duplicarTema"];
let obtenerAjustesAdmin: typeof import("./admin.api")["obtenerAjustesAdmin"];
let guardarAjustesAdmin: typeof import("./admin.api")["guardarAjustesAdmin"];
let obtenerSendaAdmin: typeof import("./admin.api")["obtenerSendaAdmin"];
let obtenerSendasAdmin: typeof import("./admin.api")["obtenerSendasAdmin"];
type CrearSendaSolicitud = import("./admin.api").CrearSendaSolicitud;
type SendaAdmin = import("./admin.api").SendaAdmin;

const originalFetch = globalThis.fetch;
const originalLocalStorage = globalThis.localStorage;

function crearLocalStorageFalso() {
  return {
    getItem: () => null,
    setItem: () => undefined,
    removeItem: () => undefined,
    clear: () => undefined,
    key: () => null,
    length: 0,
  } as Storage;
}

beforeEach(() => {
  globalThis.fetch = originalFetch;
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: crearLocalStorageFalso(),
  });
});

beforeAll(async () => {
  mock.restore();
  ({
    archivarTema,
    actualizarSendaAdmin,
    crearSendaAdmin,
    duplicarTema,
    obtenerAjustesAdmin,
    guardarAjustesAdmin,
    obtenerSendaAdmin,
    obtenerSendasAdmin,
  } = await import("./admin.api"));
});

afterAll(() => {
  mock.restore();
});

afterEach(() => {
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: originalLocalStorage,
  });
});

describe("admin.api", () => {
  it("expone una mutación para archivar temas", async () => {
    let metodo = "";
    let ruta = "";

    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const request = input instanceof Request ? input : new Request(String(input), init);
      metodo = request.method;
      ruta = new URL(request.url).pathname;

      return new Response(JSON.stringify({ exito: true, datos: { id: "tema-1", estado: "archivado" } }), {
        status: 200,
        headers: { "content-type": "application/json" }
      });
    }) as typeof fetch;

    const resultado = await archivarTema("tema-1");

    expect(metodo).toBe("POST");
    expect(ruta).toBe("/administracion/temas/tema-1/archivar");
    expect(resultado.estado).toBe("archivado");
  });

  it("expone una mutación para duplicar temas", async () => {
    let metodo = "";
    let ruta = "";

    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const request = input instanceof Request ? input : new Request(String(input), init);
      metodo = request.method;
      ruta = new URL(request.url).pathname;

      return new Response(JSON.stringify({
        exito: true,
        datos: {
          id: "tema-duplicado",
          slug: "la-creacion-copia-12345678",
          estado: "borrador"
        }
      }), {
        status: 201,
        headers: { "content-type": "application/json" }
      });
    }) as typeof fetch;

    const resultado = await duplicarTema("tema-1");

    expect(metodo).toBe("POST");
    expect(ruta).toBe("/administracion/temas/tema-1/duplicar");
    expect(resultado.id).toBe("tema-duplicado");
    expect(resultado.estado).toBe("borrador");
  });

  it("transporta la imagen de recurso al crear una senda", async () => {
    const imagenRecursoId = "550e8400-e29b-41d4-a716-446655440099";
    const solicitud: CrearSendaSolicitud = {
      codigo: "padre",
      nombre: "Senda del Padre",
      color_hex: "#3D8BD4",
      orden: 1,
      imagen_recurso_id: imagenRecursoId
    };
    let cuerpo: Record<string, unknown> | null = null;

    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const request = input instanceof Request ? input : new Request(String(input), init);
      cuerpo = JSON.parse(await request.text()) as Record<string, unknown>;

      const senda: SendaAdmin = {
        id: "senda-1",
        codigo: "padre",
        nombre: "Senda del Padre",
        descripcion: null,
        color_hex: "#3D8BD4",
        nombre_icono: null,
        orden: 1,
        activo: false,
        creado_en: "2026-07-12T00:00:00.000Z",
        imagen_recurso_id: imagenRecursoId
      };

      return new Response(JSON.stringify({ exito: true, datos: senda }), {
        status: 201,
        headers: { "content-type": "application/json" }
      });
    }) as typeof fetch;

    const resultado = await crearSendaAdmin(solicitud);

    expect(cuerpo).toMatchObject({ imagen_recurso_id: imagenRecursoId });
    expect(resultado.imagen_recurso_id).toBe(imagenRecursoId);
  });

  it("transporta y deserializa la imagen de recurso al actualizar una senda", async () => {
    const imagenRecursoId = "550e8400-e29b-41d4-a716-446655440099";
    let metodo = "";
    let ruta = "";
    let cuerpo: Record<string, unknown> | null = null;

    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const request = input instanceof Request ? input : new Request(String(input), init);
      metodo = request.method;
      ruta = new URL(request.url).pathname;
      cuerpo = JSON.parse(await request.text()) as Record<string, unknown>;

      return new Response(JSON.stringify({ exito: true, datos: {
        id: "senda-1",
        codigo: "padre",
        nombre: "Senda del Padre",
        descripcion: null,
        color_hex: "#3D8BD4",
        nombre_icono: null,
        imagen_recurso_id: imagenRecursoId,
        orden: 1,
        activo: true,
        creado_en: "2026-07-12T00:00:00.000Z"
      } }), { headers: { "content-type": "application/json" } });
    }) as typeof fetch;

    const resultado = await actualizarSendaAdmin("senda-1", { imagen_recurso_id: imagenRecursoId });

    expect(metodo).toBe("PATCH");
    expect(ruta).toBe("/administracion/sendas/senda-1");
    expect(cuerpo).toMatchObject({ imagen_recurso_id: imagenRecursoId });
    expect(resultado.imagen_recurso_id).toBe(imagenRecursoId);
  });

  it("deserializa imagen_recurso_id al listar y obtener una senda", async () => {
    const imagenRecursoId = "550e8400-e29b-41d4-a716-446655440099";
    const senda: SendaAdmin = {
      id: "senda-1",
      codigo: "padre",
      nombre: "Senda del Padre",
      descripcion: null,
      color_hex: "#3D8BD4",
      nombre_icono: null,
      imagen_recurso_id: imagenRecursoId,
      orden: 1,
      activo: true,
      creado_en: "2026-07-12T00:00:00.000Z"
    };

    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const request = input instanceof Request ? input : new Request(String(input), init);
      const ruta = new URL(request.url).pathname;
      const datos = ruta === "/administracion/sendas" ? [senda] : senda;

      return new Response(JSON.stringify({ exito: true, datos }), {
        headers: { "content-type": "application/json" }
      });
    }) as typeof fetch;

    const [sendas, sendaObtenida] = await Promise.all([
      obtenerSendasAdmin(),
      obtenerSendaAdmin("senda-1")
    ]);

    expect(sendas[0]?.imagen_recurso_id).toBe(imagenRecursoId);
    expect(sendaObtenida.imagen_recurso_id).toBe(imagenRecursoId);
  });

  it("expone lectura y guardado de ajustes del panel", async () => {
    let metodo = "";
    let ruta = "";
    let cuerpo: Record<string, unknown> | null = null;

    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const request = input instanceof Request ? input : new Request(String(input), init);
      metodo = request.method;
      ruta = new URL(request.url).pathname;
      if (request.method === "GET") {
        return new Response(JSON.stringify({
          exito: true,
          datos: {
            id: "global",
            nombre_plataforma: "Semillas",
            correo_soporte: "soporte@semillas.org",
            zona_horaria: "America/Guayaquil",
            notas_obligatorias_cambios: true,
            notas_obligatorias_rechazo: true,
            actualizado_en: "2026-07-13T00:00:00.000Z"
          }
        }), { headers: { "content-type": "application/json" } });
      }

      cuerpo = JSON.parse(await request.text()) as Record<string, unknown>;
      return new Response(JSON.stringify({
        exito: true,
        datos: {
          id: "global",
          nombre_plataforma: "Semillas",
          correo_soporte: "ayuda@semillas.org",
          zona_horaria: "America/Guayaquil",
          notas_obligatorias_cambios: false,
          notas_obligatorias_rechazo: true,
          actualizado_en: "2026-07-13T00:00:00.000Z"
        }
      }), { headers: { "content-type": "application/json" } });
    }) as typeof fetch;

    const ajustes = await obtenerAjustesAdmin();
    expect(metodo).toBe("GET");
    expect(ruta).toBe("/administracion/ajustes");
    expect(ajustes.nombre_plataforma).toBe("Semillas");

    const guardado = await guardarAjustesAdmin({ correo_soporte: "ayuda@semillas.org", notas_obligatorias_cambios: false });
    expect(metodo).toBe("PATCH");
    expect(ruta).toBe("/administracion/ajustes-plataforma");
    expect(cuerpo).toMatchObject({ correo_soporte: "ayuda@semillas.org", notas_obligatorias_cambios: false });
    expect(guardado.correo_soporte).toBe("ayuda@semillas.org");
  });
});
