import { describe, expect, it } from "bun:test";

import { obtenerRutaPostLogin } from "./post-login";

describe("obtenerRutaPostLogin", () => {
  it("manda a administracion si el usuario tiene rol administrador", () => {
    expect(
      obtenerRutaPostLogin(
        {
          id: "perfil-1",
          usuario_id: "usuario-1",
          apodo: "Admin",
          grupo_edad_id: null,
          url_avatar: null,
          clave_avatar: null,
          prefiere_audio: false,
          tamano_texto_preferido: "mediano",
        },
        {
          id: "usuario-1",
          rol: "administrador",
          proveedor: "correo",
          nombre_visible: "Admin",
          correo: "admin@correo.com",
        },
      ),
    ).toBe("/admin");
  });

  it("manda al onboarding si no hay franja elegida", () => {
    expect(
      obtenerRutaPostLogin({
        id: "perfil-1",
        usuario_id: "usuario-1",
        apodo: "Ana",
        grupo_edad_id: null,
        url_avatar: null,
        clave_avatar: null,
        prefiere_audio: false,
        tamano_texto_preferido: "mediano",
      }),
    ).toBe("/onboarding");
  });

  it("manda a customize si ya hay franja pero falta apodo", () => {
    expect(
      obtenerRutaPostLogin({
        id: "perfil-1",
        usuario_id: "usuario-1",
        apodo: "",
        grupo_edad_id: "grupo-1",
        url_avatar: null,
        clave_avatar: null,
        prefiere_audio: false,
        tamano_texto_preferido: "mediano",
      }),
    ).toBe("/onboarding/customize");
  });

  it("manda al app cuando el onboarding ya está completo", () => {
    expect(
      obtenerRutaPostLogin({
        id: "perfil-1",
        usuario_id: "usuario-1",
        apodo: "Ana",
        grupo_edad_id: "grupo-1",
        url_avatar: null,
        clave_avatar: null,
        prefiere_audio: false,
        tamano_texto_preferido: "mediano",
      }),
    ).toBe("/app");
  });
});
