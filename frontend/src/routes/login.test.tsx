import { describe, expect, it } from "bun:test";

import { obtenerMensajeRedireccionLogin } from "./login";

describe("obtenerMensajeRedireccionLogin", () => {
  it("devuelve un mensaje visible cuando el backend no responde", () => {
    expect(obtenerMensajeRedireccionLogin("backend_unavailable")).toEqual({
      mensaje: "No pudimos verificar tu acceso porque el backend no respondió.",
      descripcion: "Revisa tu conexión o intenta de nuevo en unos minutos.",
    });
  });

  it("no muestra aviso para redirecciones normales", () => {
    expect(obtenerMensajeRedireccionLogin(undefined)).toBeNull();
  });
});
