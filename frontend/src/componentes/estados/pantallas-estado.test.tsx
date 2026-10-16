import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { PantallaNoEncontrado } from "./pantalla-no-encontrado";
import { PantallaAccesoDenegado } from "./pantalla-acceso-denegado";
import { PantallaErrorRuta } from "./pantalla-error-ruta";

function instalarMocks() {
  Object.defineProperty(globalThis, "localStorage", {
    value: {
      getItem: () => null,
      setItem: () => undefined,
      removeItem: () => undefined,
      clear: () => undefined,
    },
    configurable: true,
  });
  Object.defineProperty(globalThis, "window", {
    value: { location: { pathname: "/app" }, addEventListener: () => undefined, removeEventListener: () => undefined, dispatchEvent: () => undefined },
    configurable: true,
  });
  Object.defineProperty(globalThis, "document", {
    value: { title: "" },
    configurable: true,
  });
}

describe("pantallas de estado", () => {
  it("PantallaNoEncontrado muestra 404 y rutas de salida segun sesion", () => {
    instalarMocks();
    const html = renderToStaticMarkup(<PantallaNoEncontrado />);

    expect(html).toContain("Pagina no encontrada");
    expect(html).toContain('href="/');
  });

  it("PantallaNoEncontrado envia a /app cuando hay sesion activa", () => {
    instalarMocks();
    const storage = new Map<string, string>([["semillas_guest_user_id", "gid"], ["semillas_guest_token", "tok"]]);
    Object.defineProperty(globalThis, "localStorage", {
      value: {
        getItem: (k: string) => storage.get(k) ?? null,
        setItem: () => undefined,
        removeItem: () => undefined,
        clear: () => undefined,
      },
      configurable: true,
    });

    const html = renderToStaticMarkup(<PantallaNoEncontrado />);

    expect(html).toContain('href="/app"');
    expect(html).toContain("Volver a mi inicio");
  });

  it("PantallaAccesoDenegado expone 403 con volver y login", () => {
    instalarMocks();
    const html = renderToStaticMarkup(<PantallaAccesoDenegado />);

    expect(html).toContain("Acceso restringido");
    expect(html).toContain('href="/app"');
    expect(html).toContain("Iniciar sesion con otra cuenta");
  });

  it("PantallaErrorRuta permite reintentar y volver al inicio", () => {
    instalarMocks();
    const html = renderToStaticMarkup(<PantallaErrorRuta reset={() => undefined} />);

    expect(html).toContain("Algo se rompio");
    expect(html).toContain("Reintentar");
    expect(html).toContain('href="/"');
  });
});
