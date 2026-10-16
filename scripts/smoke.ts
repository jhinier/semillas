type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

type SmokeFailure = { check: string; detail: string };

export type SmokeResult = { ok: boolean; failures: SmokeFailure[] };

async function validarEnvelopeExito(response: Response) {
  const body = await response.json() as { exito?: boolean };
  return body.exito === true;
}

function validarHeadersFrontend(response: Response) {
  return Boolean(
    response.headers.get("content-security-policy") &&
      response.headers.get("strict-transport-security") &&
      response.headers.get("x-content-type-options")?.toLowerCase() === "nosniff",
  );
}

async function comprobar(
  fetcher: FetchLike,
  failures: SmokeFailure[],
  check: string,
  url: string,
  expectedStatus: number,
  validate?: (response: Response) => Promise<boolean>,
) {
  try {
    const response = await fetcher(url, { redirect: "manual" });
    if (response.status !== expectedStatus) {
      failures.push({ check, detail: `HTTP ${response.status}; esperado ${expectedStatus}` });
      return;
    }
    if (validate && !(await validate(response))) failures.push({ check, detail: "Respuesta con contrato inválido" });
  } catch (error) {
    failures.push({ check, detail: error instanceof Error ? error.message : "Error de red" });
  }
}

export async function ejecutarSmoke(
  apiUrl: string,
  frontendUrl: string,
  fetcher: FetchLike = fetch,
): Promise<SmokeResult> {
  const api = apiUrl.replace(/\/$/, "");
  const frontend = frontendUrl.replace(/\/$/, "");
  const failures: SmokeFailure[] = [];
  await comprobar(fetcher, failures, "health", `${api}/health`, 200, async (response) => {
    const body = await response.json() as { exito?: boolean };
    return body.exito === true;
  });
  await comprobar(fetcher, failures, "openapi", `${api}/openapi.json`, 200, async (response) => {
    const body = await response.json() as { openapi?: string; components?: { securitySchemes?: Record<string, unknown> } };
    return typeof body.openapi === "string" && Boolean(body.components?.securitySchemes);
  });
  await comprobar(fetcher, failures, "catalogo", `${api}/catalogo/grupos-etarios`, 200, validarEnvelopeExito);
  await comprobar(fetcher, failures, "sendas", `${api}/sendas`, 200, validarEnvelopeExito);
  await comprobar(fetcher, failures, "media-privada", `${api}/media/550e8400-e29b-41d4-a716-446655440099/url`, 401);
  await comprobar(fetcher, failures, "admin-sin-auth", `${api}/administracion/resumen`, 401);
  await comprobar(fetcher, failures, "landing", `${frontend}/`, 200, async (response) => validarHeadersFrontend(response));
  await comprobar(fetcher, failures, "deep-link", `${frontend}/app`, 200);
  await comprobar(fetcher, failures, "manifest", `${frontend}/manifest.webmanifest`, 200, async (response) => {
    const body = await response.json() as { lang?: string; icons?: unknown[] };
    return body.lang === "es" && Array.isArray(body.icons) && body.icons.length >= 2;
  });
  await comprobar(fetcher, failures, "service-worker", `${frontend}/sw.js`, 200);
  return { ok: failures.length === 0, failures };
}

if (import.meta.main) {
  const apiUrl = process.env.SMOKE_API_URL;
  const frontendUrl = process.env.SMOKE_FRONTEND_URL;
  if (!apiUrl || !frontendUrl) {
    console.error("Configura SMOKE_API_URL y SMOKE_FRONTEND_URL");
    process.exitCode = 1;
  } else {
    const result = await ejecutarSmoke(apiUrl, frontendUrl);
    if (result.ok) {
      console.log("Smoke válido: API pública/privada, headers, landing, deep-link y PWA");
    } else {
      for (const failure of result.failures) console.error(`[${failure.check}] ${failure.detail}`);
      process.exitCode = 1;
    }
  }
}
