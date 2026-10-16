import { afterEach, describe, expect, it } from "bun:test";
import app from "../../app";
import type { AppBindings } from "../../config/env";
import { limpiarRateLimitMemoria } from "../../shared/middleware/rate-limit.middleware";

type ErrorBody = { exito: false; codigo?: string; error: string };
type DeleteBody = { exito: true; datos: { deleted: boolean } };
type SignedUrlBody = { exito: true; datos: { url: string; expira_en_segundos: number } };

const env: AppBindings["Bindings"] = {
  APP_ENV: "development",
  CORS_BASE_DOMAIN: "localhost",
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_ANON_KEY: "test-anon-key",
  SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
  SUPABASE_PROJECT_REF: "test-project-ref",
};

const TOKEN_INVITADO = "guest-token-test-1234567890";

const admin = {
  id: "550e8400-e29b-41d4-a716-446655440010",
  rol: "administrador",
  proveedor: "invitado",
  nombre_visible: "Admin Semillas",
  correo: null,
  activo: true,
  token_invitado_hash: "c9c27b711102ce6c9dd22f9b6b6b08bec1c294ce4b2a636e31c5a85c6f6ee6b2",
};

const usuario = {
  ...admin,
  id: "550e8400-e29b-41d4-a716-446655440011",
  rol: "usuario",
};

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function crearImagen(nombre = "portada.png", tipo = "image/png", size = 4) {
  const firmaPng = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const relleno = new Uint8Array(Math.max(size - firmaPng.length, 0));
  return new File([firmaPng, relleno], nombre, { type: tipo });
}

function crearImagenFalsa(nombre = "falsa.png", tipo = "image/png") {
  return new File([new TextEncoder().encode("no-es-una-imagen")], nombre, { type: tipo });
}

function crearSolicitudSubida(archivo: File, tipo = "imagen", usuarioId = admin.id, titulo?: string, textoAlternativo = "Portada del tema") {
  const formData = new FormData();
  formData.append("archivo", archivo, archivo.name);
  formData.append("tipo", tipo);
  if (textoAlternativo) formData.append("texto_alternativo", textoAlternativo);
  if (titulo) formData.append("titulo", titulo);

  return new Request("http://localhost/media/subir", {
    method: "POST",
    headers: { "x-guest-user-id": usuarioId, "x-guest-token": TOKEN_INVITADO },
    body: formData,
  });
}

describe("media.routes", () => {
  it("rechaza subida de imagenes si el usuario no es administrador", async () => {
    const rutas: string[] = [];

    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const request = input instanceof Request ? input : new Request(String(input), init);
      const url = new URL(request.url);
      rutas.push(url.pathname);

      if (url.pathname.includes("/rest/v1/usuario_app")) {
        return new Response(JSON.stringify(usuario), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }

      return new Response(JSON.stringify({}), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }) as typeof fetch;

    const response = await app.fetch(crearSolicitudSubida(crearImagen(), "imagen", usuario.id), env);
    const body = (await response.json()) as ErrorBody;

    expect(response.status).toBe(403);
    expect(body.exito).toBe(false);
    expect(rutas.some((ruta) => ruta.includes("/storage/v1/object"))).toBe(false);
  });

  it("rechaza imagenes sobre 5 MB", async () => {
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const request = input instanceof Request ? input : new Request(String(input), init);
      const url = new URL(request.url);

      if (url.pathname.includes("/rest/v1/usuario_app")) {
        return new Response(JSON.stringify(admin), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }

      return new Response(JSON.stringify({}), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }) as typeof fetch;

    const imagenGrande = crearImagen("grande.png", "image/png", 5 * 1024 * 1024 + 1);
    const response = await app.fetch(crearSolicitudSubida(imagenGrande), env);
    const body = (await response.json()) as ErrorBody;

    expect(response.status).toBe(400);
    expect(body.codigo).toBe("FILE_TOO_LARGE");
  });

  it("rechaza imágenes sin texto alternativo", async () => {
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const request = input instanceof Request ? input : new Request(String(input), init);
      if (new URL(request.url).pathname.includes("/rest/v1/usuario_app")) {
        return new Response(JSON.stringify(admin), { status: 200, headers: { "content-type": "application/json" } });
      }
      return new Response(JSON.stringify({}), { status: 200, headers: { "content-type": "application/json" } });
    }) as typeof fetch;
    const response = await app.fetch(crearSolicitudSubida(crearImagen(), "imagen", admin.id, undefined, ""), env);
    expect(response.status).toBe(400);
    expect((await response.json() as ErrorBody).codigo).toBe("ALT_REQUIRED");
  });

  it("rechaza MIME de imagen no permitido aunque use prefijo image", async () => {
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const request = input instanceof Request ? input : new Request(String(input), init);
      const url = new URL(request.url);

      if (url.pathname.includes("/rest/v1/usuario_app")) {
        return new Response(JSON.stringify(admin), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }

      return new Response(JSON.stringify({}), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }) as typeof fetch;

    const response = await app.fetch(crearSolicitudSubida(crearImagen("vector.svg", "image/svg+xml")), env);
    const body = (await response.json()) as ErrorBody;

    expect(response.status).toBe(400);
    expect(body.codigo).toBe("INVALID_MIME_TYPE");
  });

  it("rechaza imagenes con MIME valido pero firma binaria invalida", async () => {
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const request = input instanceof Request ? input : new Request(String(input), init);
      const url = new URL(request.url);

      if (url.pathname.includes("/rest/v1/usuario_app")) {
        return new Response(JSON.stringify(admin), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }

      return new Response(JSON.stringify({}), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }) as typeof fetch;

    const response = await app.fetch(crearSolicitudSubida(crearImagenFalsa()), env);
    const body = (await response.json()) as ErrorBody;

    expect(response.status).toBe(400);
    expect(body.codigo).toBe("INVALID_FILE_SIGNATURE");
  });

  it("guarda bucket, clave y ruta firmada al registrar la imagen", async () => {
    limpiarRateLimitMemoria();
    const adminUpload = { ...admin, id: "550e8400-e29b-41d4-a716-446655440012" };
    let registroInsertado: Record<string, unknown> = {};
    let rutaActualizada = "";

    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const request = input instanceof Request ? input : new Request(String(input), init);
      const url = new URL(request.url);

      if (url.pathname.includes("/rest/v1/usuario_app")) {
        return new Response(JSON.stringify(adminUpload), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }

      if (url.pathname.includes("/storage/v1/object/media/")) {
        return new Response(JSON.stringify({ Key: url.pathname }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }

      if (url.pathname.includes("/rest/v1/recurso_multimedia") && request.method === "POST") {
        registroInsertado = await request.json();
        return new Response(
          JSON.stringify({
            id: "550e8400-e29b-41d4-a716-446655440099",
            ...registroInsertado,
            activo: true,
            creado_en: "2026-07-07T00:00:00.000Z",
            actualizado_en: "2026-07-07T00:00:00.000Z",
          }),
          { status: 201, headers: { "content-type": "application/json" } },
        );
      }

      if (url.pathname.includes("/rest/v1/recurso_multimedia") && request.method === "PATCH") {
        const actualizacion = await request.json() as { url_publica: string };
        rutaActualizada = actualizacion.url_publica;
        return new Response(
          JSON.stringify({
            id: "550e8400-e29b-41d4-a716-446655440099",
            ...registroInsertado,
            ...actualizacion,
            activo: true,
            creado_en: "2026-07-07T00:00:00.000Z",
            actualizado_en: "2026-07-07T00:00:00.000Z",
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

      return new Response(JSON.stringify({}), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }) as typeof fetch;

    const response = await app.fetch(crearSolicitudSubida(crearImagen("Portada Feliz.png"), "imagen", adminUpload.id, "Ilustración del tema"), env);

    expect(response.status).toBe(201);
    expect(registroInsertado?.bucket_almacenamiento).toBe("media");
    expect(registroInsertado?.clave_almacenamiento).toEqual(expect.stringMatching(/^imagen\//));
    expect(registroInsertado?.url_publica).toBe("");
    expect(registroInsertado?.titulo).toBe("Ilustración del tema");
    expect(rutaActualizada).toBe("/media/550e8400-e29b-41d4-a716-446655440099/url");
  });

  it("desactiva recursos multimedia con borrado logico", async () => {
    let actualizacion: Record<string, unknown> = {};
    let removioStorage = false;

    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const request = input instanceof Request ? input : new Request(String(input), init);
      const url = new URL(request.url);

      if (url.pathname.includes("/rest/v1/usuario_app")) {
        return new Response(JSON.stringify(admin), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }

      if (url.pathname.includes("/rest/v1/recurso_multimedia") && request.method === "GET") {
        return new Response(JSON.stringify({
          id: "550e8400-e29b-41d4-a716-446655440099",
          bucket_almacenamiento: "media",
          clave_almacenamiento: "imagen/admin/recurso.png",
        }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }

      if (url.pathname.includes("/storage/v1/object/media") && request.method === "DELETE") {
        removioStorage = true;
        return new Response(JSON.stringify([]), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }

      if (url.pathname.includes("/rest/v1/recurso_multimedia") && request.method === "PATCH") {
        actualizacion = await request.json();
        return new Response(JSON.stringify({}), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }

      return new Response(JSON.stringify({}), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }) as typeof fetch;

    const response = await app.fetch(
      new Request("http://localhost/media/550e8400-e29b-41d4-a716-446655440099", {
        method: "DELETE",
        headers: { "x-guest-user-id": admin.id, "x-guest-token": TOKEN_INVITADO },
      }),
      env,
    );
    const body = (await response.json()) as DeleteBody;

    expect(response.status).toBe(200);
    expect(body.datos.deleted).toBe(true);
    expect(actualizacion).toEqual(expect.objectContaining({ activo: false }));
    expect(typeof actualizacion.actualizado_en).toBe("string");
    expect(removioStorage).toBe(true);
  });

  it("rechaza borrar un recurso usado sin eliminarlo de Storage", async () => {
    let removioStorage = false;
    let desactivoRecurso = false;

    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const request = input instanceof Request ? input : new Request(String(input), init);
      const url = new URL(request.url);

      if (url.pathname.includes("/rest/v1/usuario_app")) {
        return new Response(JSON.stringify(admin), { status: 200, headers: { "content-type": "application/json" } });
      }

      if (url.pathname.includes("/rest/v1/recurso_multimedia") && request.method === "GET") {
        return new Response(JSON.stringify({
          id: "550e8400-e29b-41d4-a716-446655440099",
          bucket_almacenamiento: "media",
          clave_almacenamiento: "imagen/admin/recurso.png",
          activo: true,
        }), { status: 200, headers: { "content-type": "application/json" } });
      }

      if (url.pathname.includes("/rest/v1/tema") && request.method === "GET") {
        return new Response(JSON.stringify([{ id: "550e8400-e29b-41d4-a716-446655440201", titulo: "Tema en uso", slug: "tema-en-uso", portada_recurso_id: "550e8400-e29b-41d4-a716-446655440099" }]), { status: 200, headers: { "content-type": "application/json" } });
      }

      if (url.pathname.includes("/storage/v1/object/media") && request.method === "DELETE") {
        removioStorage = true;
      }

      if (url.pathname.includes("/rest/v1/recurso_multimedia") && request.method === "PATCH") {
        desactivoRecurso = true;
      }

      return new Response(JSON.stringify([]), { status: 200, headers: { "content-type": "application/json" } });
    }) as typeof fetch;

    const response = await app.fetch(
      new Request("http://localhost/media/550e8400-e29b-41d4-a716-446655440099", {
        method: "DELETE",
        headers: { "x-guest-user-id": admin.id, "x-guest-token": TOKEN_INVITADO },
      }),
      env,
    );
    const body = (await response.json()) as ErrorBody;

    expect(response.status).toBe(409);
    expect(body.error).toContain("está en uso");
    expect(removioStorage).toBe(false);
    expect(desactivoRecurso).toBe(false);
  });

  it("genera URL firmada corta para un recurso activo", async () => {
    let pidioUrlFirmada = false;

    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const request = input instanceof Request ? input : new Request(String(input), init);
      const url = new URL(request.url);

      if (url.pathname.includes("/rest/v1/usuario_app")) {
        return new Response(JSON.stringify(admin), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }

      if (url.pathname.includes("/rest/v1/recurso_multimedia") && request.method === "GET") {
        return new Response(JSON.stringify({
          id: "550e8400-e29b-41d4-a716-446655440099",
          bucket_almacenamiento: "media",
          clave_almacenamiento: "imagen/admin/recurso.png",
          activo: true,
        }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }

      if (url.pathname.includes("/storage/v1/object/sign/media/imagen/admin/recurso.png") && request.method === "POST") {
        pidioUrlFirmada = true;
        return new Response(JSON.stringify({ signedURL: "https://example.supabase.co/signed/recurso.png" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }

      return new Response(JSON.stringify({}), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }) as typeof fetch;

    const response = await app.fetch(
      new Request("http://localhost/media/550e8400-e29b-41d4-a716-446655440099/url", {
        headers: { "x-guest-user-id": admin.id, "x-guest-token": TOKEN_INVITADO },
      }),
      env,
    );
    const body = (await response.json()) as SignedUrlBody;

    expect(response.status).toBe(200);
    expect(body.datos.url).toContain("/signed/recurso.png");
    expect(body.datos.expira_en_segundos).toBe(300);
    expect(pidioUrlFirmada).toBe(true);
  });
});
