import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, mock } from "bun:test";

type Modulo = typeof import("./admin.api");
let modulo: Modulo;

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
  modulo = await import("./admin.api");
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

interface LlamadaCapturada {
  metodo: string;
  ruta: string;
  body: Record<string, unknown> | null;
}

function configurarFetch(responder: (captura: LlamadaCapturada) => Response) {
  const captura: LlamadaCapturada = { metodo: "", ruta: "", body: null };
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const request = input instanceof Request ? input : new Request(String(input), init);
    captura.metodo = request.method;
    captura.ruta = new URL(request.url).pathname + new URL(request.url).search;
    if (request.body) {
      captura.body = JSON.parse(await request.text()) as Record<string, unknown>;
    }
    return responder(captura);
  }) as typeof fetch;
  return captura;
}

describe("admin.api governance", () => {
  it("construye el endpoint de revisiones con filtros y paginación", async () => {
    const captura = configurarFetch(() =>
      new Response(JSON.stringify({ exito: true, datos: { revisiones: [], total: 0, limit: 20, offset: 0 } }), { headers: { "content-type": "application/json" } }),
    );

    await modulo.obtenerRevisionesAdmin({ q: "creación", estado: "enviado", limit: 10, offset: 5 });

    expect(captura.metodo).toBe("GET");
    expect(captura.ruta).toBe("/administracion/revisiones?q=creaci%C3%B3n&estado=enviado&limit=10&offset=5");
  });

  it("resuelve una revisión por su identificador", async () => {
    const captura = configurarFetch(() =>
      new Response(JSON.stringify({ exito: true, datos: { id: "rev-1", tema_id: "tema-1", estado: "aprobado" } }), { headers: { "content-type": "application/json" } }),
    );

    await modulo.resolverRevisionAdmin("rev-1", { estado: "aprobado", notas: "Listo" });

    expect(captura.metodo).toBe("POST");
    expect(captura.ruta).toBe("/administracion/revisiones/rev-1/resolver");
    expect(captura.body).toMatchObject({ estado: "aprobado", notas: "Listo" });
  });

  it("envía el rango al endpoint de reportes", async () => {
    const captura = configurarFetch(() =>
      new Response(JSON.stringify({ exito: true, datos: { rango: { desde: "2026-07-01", hasta: "2026-07-31" } } }), { headers: { "content-type": "application/json" } }),
    );

    await modulo.obtenerReportesAdmin({ desde: "2026-07-01", hasta: "2026-07-31" });

    expect(captura.ruta).toBe("/administracion/reportes?desde=2026-07-01&hasta=2026-07-31");
  });

  it("crea una cuenta administrativa mediante POST con cuerpo completo", async () => {
    const captura = configurarFetch(() =>
      new Response(JSON.stringify({ exito: true, datos: { id: "usuario-1" } }), { status: 201, headers: { "content-type": "application/json" } }),
    );

    await modulo.crearUsuarioAdmin({
      correo: "persona@semillas.test",
      password: "Temporal-2026",
      nombre_visible: "Persona",
      apodo: "Persona",
      rol: "usuario",
      grupo_edad_id: null,
      avatar_url: null,
      prefiere_audio: true,
      tamano_texto_preferido: "mediano",
      confirmar_correo: true,
    });

    expect(captura.metodo).toBe("POST");
    expect(captura.ruta).toBe("/administracion/usuarios/cuenta");
    expect(captura.body).toMatchObject({ correo: "persona@semillas.test", rol: "usuario", confirmar_correo: true });
  });

  it("guarda los ajustes de plataforma en el endpoint de gobernanza", async () => {
    const captura = configurarFetch(() =>
      new Response(JSON.stringify({ exito: true, datos: { id: "cfg-1" } }), { headers: { "content-type": "application/json" } }),
    );

    await modulo.guardarAjustesAdmin({
      nombre_plataforma: "Semillas",
      correo_soporte: "soporte@semillas.test",
      zona_horaria: "America/Guayaquil",
      notas_obligatorias_cambios: true,
      notas_obligatorias_rechazo: true,
    });

    expect(captura.metodo).toBe("PATCH");
    expect(captura.ruta).toBe("/administracion/ajustes-plataforma");
    expect(captura.body).toMatchObject({ nombre_plataforma: "Semillas", correo_soporte: "soporte@semillas.test" });
  });
});
