import { expect, test } from "bun:test";
import { ejecutarSmoke } from "./smoke";

test("smoke valida contratos mínimos de API y PWA", async () => {
  const fetcher = async (url: string) => {
    if (url.endsWith("/health")) return Response.json({ exito: true }, { status: 200 });
    if (url.endsWith("/openapi.json")) return Response.json({ openapi: "3.1.0", components: { securitySchemes: { bearerAuth: {} } } });
    if (url.endsWith("/catalogo/grupos-etarios") || url.endsWith("/sendas")) return Response.json({ exito: true, datos: [] });
    if (url.endsWith("/manifest.webmanifest")) return Response.json({ lang: "es", icons: [{}, {}] });
    if (url.includes("/media/")) return new Response("", { status: 401 });
    if (url.endsWith("/administracion/resumen")) return new Response("", { status: 401 });
    if (url.endsWith("/") || url.endsWith("/app")) {
      return new Response("", { status: 200, headers: {
        "content-security-policy": "default-src 'self'",
        "strict-transport-security": "max-age=31536000",
        "x-content-type-options": "nosniff",
      } });
    }
    return new Response("", { status: 200 });
  };
  expect((await ejecutarSmoke("https://api.test", "https://web.test", fetcher)).ok).toBe(true);
});

test("smoke falla si health o manifest no cumplen", async () => {
  const fetcher = async (url: string) => {
    if (url.endsWith("/health")) return Response.json({ exito: false }, { status: 200 });
    if (url.endsWith("/openapi.json")) return Response.json({ openapi: "3.1.0", components: { securitySchemes: {} } });
    if (url.endsWith("/catalogo/grupos-etarios") || url.endsWith("/sendas")) return Response.json({ exito: true, datos: [] });
    if (url.endsWith("/manifest.webmanifest")) return Response.json({ lang: "en", icons: [] });
    if (url.includes("/media/") || url.endsWith("/administracion/resumen")) return new Response("", { status: 401 });
    if (url.endsWith("/") || url.endsWith("/app")) return new Response("", { status: 200, headers: {
      "content-security-policy": "default-src 'self'",
      "strict-transport-security": "max-age=31536000",
      "x-content-type-options": "nosniff",
    } });
    return new Response("", { status: 200 });
  };
  const result = await ejecutarSmoke("https://api.test", "https://web.test", fetcher);
  expect(result.ok).toBe(false);
  expect(result.failures.map((failure) => failure.check)).toEqual(expect.arrayContaining(["health", "manifest"]));
});
