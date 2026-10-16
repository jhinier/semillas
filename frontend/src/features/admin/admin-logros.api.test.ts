import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, mock } from "bun:test";
import { sessionStorageApi } from "../../shared/api/session";

let archivarLogroAdmin: typeof import("./admin-logros.api")["archivarLogroAdmin"];
let actualizarLogroAdmin: typeof import("./admin-logros.api")["actualizarLogroAdmin"];
let crearLogroAdmin: typeof import("./admin-logros.api")["crearLogroAdmin"];
let listarLogrosAdmin: typeof import("./admin-logros.api")["listarLogrosAdmin"];
let obtenerCatalogoLogrosAdmin: typeof import("./admin-logros.api")["obtenerCatalogoLogrosAdmin"];
let obtenerLogroAdmin: typeof import("./admin-logros.api")["obtenerLogroAdmin"];
let reactivarLogroAdmin: typeof import("./admin-logros.api")["reactivarLogroAdmin"];

const fetchOriginal = globalThis.fetch;
const navigatorOriginal = globalThis.navigator;
const getGuestUserIdOriginal = sessionStorageApi.getGuestUserId;
const getGuestTokenOriginal = sessionStorageApi.getGuestToken;
const getAccessTokenOriginal = sessionStorageApi.getAccessToken;

beforeAll(async () => {
  process.env.VITE_API_URL = "http://localhost";
  process.env.VITE_SUPABASE_URL = "http://localhost";
  process.env.VITE_SUPABASE_ANON_KEY = "clave-de-prueba";
  mock.restore();
  ({
    archivarLogroAdmin,
    actualizarLogroAdmin,
    crearLogroAdmin,
    listarLogrosAdmin,
    obtenerCatalogoLogrosAdmin,
    obtenerLogroAdmin,
    reactivarLogroAdmin,
  } = await import("./admin-logros.api"));
});

afterAll(() => {
  mock.restore();
});

function configurarConexion(enLinea: boolean) {
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: { onLine: enLinea },
  });
}

beforeEach(() => {
  globalThis.fetch = fetchOriginal;
  sessionStorageApi.getGuestUserId = () => null;
  sessionStorageApi.getGuestToken = () => null;
  sessionStorageApi.getAccessToken = () => null;
  configurarConexion(true);
});

afterEach(() => {
  globalThis.fetch = fetchOriginal;
  sessionStorageApi.getGuestUserId = getGuestUserIdOriginal;
  sessionStorageApi.getGuestToken = getGuestTokenOriginal;
  sessionStorageApi.getAccessToken = getAccessTokenOriginal;
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: navigatorOriginal,
  });
});

describe("admin-logros.api", () => {
  it("lista logros aplicando filtros opcionales", async () => {
    let ruta = "";
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const solicitud = input instanceof Request ? input : new Request(String(input), init);
      ruta = `${new URL(solicitud.url).pathname}${new URL(solicitud.url).search}`;
      return new Response(JSON.stringify({ exito: true, datos: { logros: [], meta: { total: 0, limit: 20, offset: 0 } } }), {
        headers: { "content-type": "application/json" },
      });
    }) as unknown as typeof fetch;

    await listarLogrosAdmin({
      estado: "activo",
      criterio: "temas_completados",
      q: "amor",
      limit: 10,
      offset: 0,
    });

    expect(ruta).toBe(
      "/administracion/logros?estado=activo&limit=10&offset=0&q=amor&criterio=temas_completados",
    );
  });

  it("obtiene el catálogo ordenado por nombre", async () => {
    let ruta = "";
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const solicitud = input instanceof Request ? input : new Request(String(input), init);
      ruta = new URL(solicitud.url).pathname;
      return new Response(JSON.stringify({ exito: true, datos: [{ id: "l1", codigo: "a", nombre: "A" }] }), {
        headers: { "content-type": "application/json" },
      });
    }) as unknown as typeof fetch;

    const catalogo = await obtenerCatalogoLogrosAdmin();

    expect(ruta).toBe("/administracion/logros/catalogo");
    expect(catalogo).toHaveLength(1);
  });

  it("crea, actualiza, archiva y reactiva un logro", async () => {
    const solicitudes: Array<{ metodo: string; ruta: string; cuerpo: unknown }> = [];
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const solicitud = input instanceof Request ? input : new Request(String(input), init);
      solicitudes.push({
        metodo: solicitud.method,
        ruta: new URL(solicitud.url).pathname,
        cuerpo: solicitud.method === "GET" ? null : JSON.parse((await solicitud.clone().text()) || "null"),
      });
      return new Response(JSON.stringify({ exito: true, datos: { id: "l1" } }), {
        headers: { "content-type": "application/json" },
      });
    }) as unknown as typeof fetch;

    await crearLogroAdmin({
      codigo: "primer-tema",
      nombre: "Primer tema",
      codigo_criterio: "temas_completados",
      valor_criterio: 1,
      bono_xp: 30,
    });
    await actualizarLogroAdmin("l1", { bono_xp: 60 });
    await archivarLogroAdmin("l1");
    await reactivarLogroAdmin("l1");

    expect(solicitudes).toEqual([
      { metodo: "POST", ruta: "/administracion/logros", cuerpo: { codigo: "primer-tema", nombre: "Primer tema", codigo_criterio: "temas_completados", valor_criterio: 1, bono_xp: 30 } },
      { metodo: "PATCH", ruta: "/administracion/logros/l1", cuerpo: { bono_xp: 60 } },
      { metodo: "POST", ruta: "/administracion/logros/l1/archivar", cuerpo: null },
      { metodo: "POST", ruta: "/administracion/logros/l1/reactivar", cuerpo: null },
    ]);
  });

  it("obtiene el detalle de un logro", async () => {
    let ruta = "";
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const solicitud = input instanceof Request ? input : new Request(String(input), init);
      ruta = new URL(solicitud.url).pathname;
      return new Response(
        JSON.stringify({
          exito: true,
          datos: {
            id: "l1",
            codigo: "primer-tema",
            nombre: "Primer tema",
            descripcion: null,
            url_icono: null,
            bono_xp: 30,
            codigo_criterio: "temas_completados",
            valor_criterio: 1,
            activo: true,
            creado_en: "2026-07-13T00:00:00.000Z",
            otorgados: 0,
          },
        }),
        { headers: { "content-type": "application/json" } },
      );
    }) as unknown as typeof fetch;

    const detalle = await obtenerLogroAdmin("l1");

    expect(ruta).toBe("/administracion/logros/l1");
    expect(detalle.codigo).toBe("primer-tema");
  });

  it("propaga el error de red al fallar la consulta", async () => {
    configurarConexion(false);
    let intentos = 0;
    globalThis.fetch = (async () => {
      intentos += 1;
      throw new TypeError("Failed to fetch");
    }) as unknown as typeof fetch;

    await expect(listarLogrosAdmin({ estado: "todos", limit: 20, offset: 0 })).rejects.toThrow(
      "Error de conexión",
    );
    expect(intentos).toBe(1);
  });
});
