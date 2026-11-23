import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Hono } from "hono";
import type { AppBindings, Env } from "./src/config/env";
import { createSupabaseAdmin } from "./src/db/client";
import { adminRoutes } from "./src/modules/admin";
import { errorHandler } from "./src/shared/middleware/error-handler";
import { requestIdMiddleware } from "./src/shared/middleware/request-id.middleware";

const TARGET = "https://api-semillas.andresalexander14.workers.dev";
const PORT = 8787;
const FRANJAS_CACHE_PATH = join(tmpdir(), "semillas-franjas-overrides.json");
const THEME_SENDAS_CACHE_PATH = join(tmpdir(), "semillas-temas-sendas.json");
const MOMENTOS_CRECER = ["conectar", "relatar", "ensenar", "comprobar", "experimentar", "recompensar"];

function cargarDevVars(): Record<string, string> {
  const result: Record<string, string> = {};
  const devVarsPath = join(import.meta.dir, ".dev.vars");
  if (existsSync(devVarsPath)) {
    try {
      const contenido = readFileSync(devVarsPath, "utf-8");
      for (const lineaCruda of contenido.split(/\r?\n/)) {
        const linea = lineaCruda.trim();
        if (!linea || linea.startsWith("#")) continue;
        const idx = linea.indexOf("=");
        if (idx <= 0) continue;
        const clave = linea.slice(0, idx).trim();
        let valor = linea.slice(idx + 1).trim();
        if (
          (valor.startsWith('"') && valor.endsWith('"')) ||
          (valor.startsWith("'") && valor.endsWith("'"))
        ) {
          valor = valor.slice(1, -1);
        }
        result[clave] = valor;
      }
    } catch {
      // continuar con process.env si .dev.vars no se pudo leer
    }
  }
  for (const key of [
    "APP_ENV",
    "CORS_BASE_DOMAIN",
    "SUPABASE_URL",
    "SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_PROJECT_REF",
  ]) {
    const envVal = process.env[key];
    if (!result[key] && typeof envVal === "string" && envVal.trim()) {
      result[key] = envVal.trim();
    }
  }
  return result;
}

const devVars = cargarDevVars();
const localEnv: Env | null =
  devVars.SUPABASE_URL && devVars.SUPABASE_ANON_KEY && devVars.SUPABASE_SERVICE_ROLE_KEY
    ? {
        APP_ENV: devVars.APP_ENV || "development",
        CORS_BASE_DOMAIN: devVars.CORS_BASE_DOMAIN || "semillas.pages.dev",
        SUPABASE_URL: devVars.SUPABASE_URL,
        SUPABASE_ANON_KEY: devVars.SUPABASE_ANON_KEY,
        SUPABASE_SERVICE_ROLE_KEY: devVars.SUPABASE_SERVICE_ROLE_KEY,
      }
    : null;

const supabaseLocal = localEnv ? createSupabaseAdmin(localEnv) : null;
const localAdminApp = localEnv
  ? (() => {
      const app = new Hono<AppBindings>();
      app.onError(errorHandler);
      app.use("*", requestIdMiddleware());
      app.use("*", async (c, next) => {
        c.set("db", createSupabaseAdmin(c.env));
        await next();
      });
      app.route("/administracion", adminRoutes);
      return app;
    })()
  : null;

function debeEjecutarLocalAdmin(pathname: string): boolean {
  if (!localAdminApp) return false;
  return (
    pathname === "/administracion/temas" ||
    pathname === "/administracion/temas-listado" ||
    pathname.startsWith("/administracion/temas/") ||
    pathname === "/administracion/actividades" ||
    pathname.startsWith("/administracion/actividades/") ||
    pathname.startsWith("/administracion/grupos-etarios/") ||
    pathname === "/administracion/resumen" ||
    pathname === "/administracion/resumen/detallado" ||
    pathname === "/administracion/revisiones" ||
    pathname.startsWith("/administracion/revisiones/") ||
    pathname === "/administracion/reportes" ||
    pathname === "/administracion/ajustes" ||
    pathname === "/administracion/ajustes-plataforma"
  );
}

let sendasCatalogoCache: { expiraEn: number; data: any[] } = { expiraEn: 0, data: [] };
let gruposCatalogoCache: { expiraEn: number; data: any[] } = { expiraEn: 0, data: [] };

async function obtenerSendasCatalogo(): Promise<any[]> {
  const ahora = Date.now();
  if (sendasCatalogoCache.data.length > 0 && sendasCatalogoCache.expiraEn > ahora) {
    return sendasCatalogoCache.data;
  }
  if (supabaseLocal) {
    try {
      const { data, error } = await supabaseLocal
        .from("senda")
        .select("*")
        .order("orden", { ascending: true });
      if (!error && Array.isArray(data) && data.length > 0) {
        sendasCatalogoCache = { expiraEn: ahora + 60_000, data };
        return data;
      }
    } catch {
      // continuar con fallback remoto
    }
  }
  try {
    const res = await fetch(new URL("/sendas", TARGET).toString(), {
      headers: { origin: "https://semillas.pages.dev" },
    });
    const json = (await res.json().catch(() => null)) as { datos?: any[] } | null;
    if (res.ok && Array.isArray(json?.datos)) {
      sendasCatalogoCache = { expiraEn: ahora + 300_000, data: json.datos };
    }
  } catch {
    // usar cache previo si existe
  }
  return sendasCatalogoCache.data;
}

async function obtenerGruposEdadCatalogo(): Promise<any[]> {
  const ahora = Date.now();
  if (gruposCatalogoCache.data.length > 0 && gruposCatalogoCache.expiraEn > ahora) {
    return supabaseLocal ? gruposCatalogoCache.data : aplicarFranjasOverrides(gruposCatalogoCache.data);
  }
  if (supabaseLocal) {
    try {
      const { data, error } = await supabaseLocal
        .from("grupo_edad")
        .select("*")
        .order("orden", { ascending: true });
      if (!error && Array.isArray(data) && data.length > 0) {
        gruposCatalogoCache = { expiraEn: ahora + 60_000, data };
        return data;
      }
    } catch {
      // continuar con fallback remoto
    }
  }
  try {
    const res = await fetch(new URL("/catalogo/grupos-etarios", TARGET).toString(), {
      headers: { origin: "https://semillas.pages.dev" },
    });
    const json = (await res.json().catch(() => null)) as { datos?: any[] } | null;
    if (res.ok && Array.isArray(json?.datos)) {
      gruposCatalogoCache = { expiraEn: ahora + 300_000, data: json.datos };
    }
  } catch {
    // usar cache previo si existe
  }
  return aplicarFranjasOverrides(gruposCatalogoCache.data);
}

function leerTemasSendasOverrides(): Record<string, string[]> {
  try {
    if (!existsSync(THEME_SENDAS_CACHE_PATH)) return {};
    return JSON.parse(readFileSync(THEME_SENDAS_CACHE_PATH, "utf-8")) as Record<string, string[]>;
  } catch {
    return {};
  }
}

function guardarTemaSendasOverride(temaId: string, sendaIds: string[]) {
  if (!temaId || !Array.isArray(sendaIds) || sendaIds.length === 0) return {};
  const limpias = [...new Set(sendaIds.filter((id) => typeof id === "string" && id.trim().length > 0))];
  const actual = leerTemasSendasOverrides();
  actual[temaId] = limpias;
  try {
    writeFileSync(THEME_SENDAS_CACHE_PATH, JSON.stringify(actual, null, 2), "utf-8");
  } catch {
    // ignorar si tmp no escribible
  }
  return actual;
}

function enriquecerTemaConSendas(tema: any, sendasCatalogo: any[]): any {
  if (!tema || typeof tema !== "object") return tema;
  const overrides = leerTemasSendasOverrides();
  const idTema = String(tema.id ?? "");
  const idsGuardados = idTema && Array.isArray(overrides[idTema]) && overrides[idTema]!.length > 0
    ? overrides[idTema]!
    : Array.isArray(tema.senda_ids) && tema.senda_ids.length > 0
      ? tema.senda_ids
      : tema.senda_id
        ? [String(tema.senda_id)]
        : [];
  const listaSendas = sendasCatalogo.filter((s) => idsGuardados.includes(String(s.id)));
  const ordenadas = idsGuardados
    .map((id) => listaSendas.find((s) => String(s.id) === id))
    .filter(Boolean);
  return {
    ...tema,
    senda_ids: idsGuardados,
    ...(ordenadas.length > 0 ? { sendas: ordenadas } : {}),
  };
}

type FranjaOverride = {
  nombre?: string;
  descripcion?: string | null;
  edad_minima?: number;
  edad_maxima?: number;
};

function leerFranjasOverrides(): Record<string, FranjaOverride> {
  try {
    if (!existsSync(FRANJAS_CACHE_PATH)) return {};
    return JSON.parse(readFileSync(FRANJAS_CACHE_PATH, "utf-8")) as Record<string, FranjaOverride>;
  } catch {
    return {};
  }
}

function guardarFranjaOverride(id: string, patch: FranjaOverride) {
  const actual = leerFranjasOverrides();
  actual[id] = { ...(actual[id] ?? {}), ...patch };
  try {
    writeFileSync(FRANJAS_CACHE_PATH, JSON.stringify(actual, null, 2), "utf-8");
  } catch {
    // ignorar si tmp no escribible
  }
  return actual;
}

function aplicarFranjasOverrides(grupos: any[]): any[] {
  if (!Array.isArray(grupos)) return grupos;
  const overrides = leerFranjasOverrides();
  return grupos.map((g) => {
    const patch = overrides[String(g?.id ?? "")];
    return patch ? { ...g, ...patch } : g;
  });
}

function construirHeadersCors(origin: string) {
  return {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "*",
  };
}

const cacheRealGovernance = new Map<string, { expiraEn: number; data: any }>();

async function verificarAdminVivoConPerfil(authHeader: string): Promise<{ valido: boolean; status: number; json: any }> {
  const res = await fetch(new URL("/perfil", TARGET).toString(), {
    method: "GET",
    headers: {
      authorization: authHeader,
      origin: "https://semillas.pages.dev",
    },
  });
  let json: any = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }
  const rol = json?.datos?.usuario?.rol;
  return { valido: res.status === 200 && rol === "administrador", status: res.status, json };
}

function buscarCachePorPrefijo(authHeader: string, rutaBase: string): any {
  const ahora = Date.now();
  const prefijo = `${authHeader}:${rutaBase}`;
  for (const [k, v] of cacheRealGovernance.entries()) {
    if (k.startsWith(prefijo) && v.expiraEn > ahora) {
      return v.data;
    }
  }
  return null;
}

async function consultarEndpointReal(pathWithQuery: string, authHeader: string): Promise<{ status: number; json: any }> {
  const ahora = Date.now();
  const clave = `${authHeader}:${pathWithQuery}`;
  const rutaBase = pathWithQuery.split("?")[0];
  const cacheado = cacheRealGovernance.get(clave);
  if (cacheado && cacheado.expiraEn > ahora) {
    const check = await verificarAdminVivoConPerfil(authHeader);
    if (!check.valido) {
      cacheRealGovernance.delete(clave);
      return { status: check.status === 200 ? 403 : check.status, json: check.json };
    }
    return { status: 200, json: cacheado.data };
  }
  const destino = new URL(pathWithQuery, TARGET).toString();
  const res = await fetch(destino, {
    method: "GET",
    headers: {
      authorization: authHeader,
      origin: "https://semillas.pages.dev",
    },
  });
  let json: any = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }
  if (res.status === 200 && json) {
    cacheRealGovernance.set(clave, { expiraEn: ahora + 45_000, data: json });
  } else if (res.status === 429) {
    const check = await verificarAdminVivoConPerfil(authHeader);
    if (!check.valido) {
      return { status: check.status === 200 ? 403 : check.status, json: check.json };
    }
    const respaldo = cacheado?.data ?? buscarCachePorPrefijo(authHeader, rutaBase);
    if (respaldo) {
      return { status: 200, json: respaldo };
    }
  }
  return { status: res.status, json };
}

/**
 * Puente temporal para /administracion/revisiones* y /administracion/reportes usando únicamente
 * datos reales de Supabase obtenidos con el token Bearer del administrador autenticado,
 * mientras el Worker remoto de Cloudflare no haya sido redesplegado.
 */
async function resolverGovernanceRealSupabase(
  req: Request,
  url: URL,
  origin: string,
  authHeader: string,
  parsedRequestJson: any,
): Promise<Response | null> {
  if (req.method === "GET" && (url.pathname === "/administracion/revisiones" || url.pathname.startsWith("/administracion/revisiones/"))) {
    const [resResumen, resTemas] = await Promise.all([
      consultarEndpointReal("/administracion/resumen/detallado", authHeader),
      consultarEndpointReal("/administracion/temas-listado?limit=100&offset=0", authHeader),
    ]);
    for (const r of [resResumen, resTemas]) {
      if (r.status === 401 || r.status === 403) {
        return new Response(JSON.stringify(r.json ?? { exito: false, error: "No autorizado" }), {
          status: r.status,
          headers: construirHeadersCors(origin),
        });
      }
    }
    if (resResumen.status !== 200 && resTemas.status !== 200) return null;

    const revisionesResumen = Array.isArray(resResumen.json?.datos?.revisiones) ? resResumen.json.datos.revisiones : [];
    const temasLista = Array.isArray(resTemas.json?.datos?.temas) ? resTemas.json.datos.temas : [];

    const revisionesReales = revisionesResumen.map((rev: any) => ({
      id: rev.id,
      tema_id: rev.tema_id,
      estado: rev.estado,
      notas_envio: rev.notas ?? rev.notas_envio ?? null,
      notas_revision: rev.notas_revision ?? null,
      creado_en: rev.creado_en,
      revisado_en: rev.revisado_en ?? null,
      titulo: rev.titulo ?? "Tema",
      senda: rev.senda ?? "Sin senda",
      enviado_por: rev.enviado_por ?? "Equipo editorial",
      revisado_por: rev.revisado_por ?? null,
    }));

    const temasConRev = new Set(revisionesReales.map((r: any) => r.tema_id));
    for (const tema of temasLista) {
      if (tema.estado === "revision" && !temasConRev.has(tema.id)) {
        revisionesReales.push({
          id: `tema-rev-${tema.id}`,
          tema_id: tema.id,
          estado: "enviado",
          notas_envio: null,
          notas_revision: null,
          creado_en: tema.actualizado_en ?? new Date().toISOString(),
          revisado_en: null,
          titulo: tema.titulo ?? "Tema",
          senda: tema.senda ?? "Sin senda",
          enviado_por: "Equipo editorial",
          revisado_por: null,
        });
      }
    }

    if (url.pathname.startsWith("/administracion/revisiones/")) {
      const revId = url.pathname.replace("/administracion/revisiones/", "");
      const encontrada = revisionesReales.find((r: any) => r.id === revId || r.tema_id === revId);
      if (!encontrada) {
        return new Response(JSON.stringify({ exito: false, error: "Revisión no encontrada" }), {
          status: 404,
          headers: construirHeadersCors(origin),
        });
      }
      return new Response(JSON.stringify({ exito: true, datos: encontrada }), {
        status: 200,
        headers: construirHeadersCors(origin),
      });
    }

    const q = (url.searchParams.get("q") || "").trim().toLowerCase();
    const estadoFiltro = url.searchParams.get("estado") || "todos";
    const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || "20"), 1), 100);
    const offset = Math.max(Number(url.searchParams.get("offset") || "0"), 0);

    const filtradas = revisionesReales.filter((r: any) => {
      if (estadoFiltro !== "todos" && r.estado !== estadoFiltro) return false;
      if (q) {
        const match =
          String(r.titulo ?? "").toLowerCase().includes(q) ||
          String(r.senda ?? "").toLowerCase().includes(q) ||
          String(r.enviado_por ?? "").toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });

    return new Response(
      JSON.stringify({
        exito: true,
        datos: {
          revisiones: filtradas.slice(offset, offset + limit),
          total: filtradas.length,
          limit,
          offset,
        },
      }),
      { status: 200, headers: construirHeadersCors(origin) },
    );
  }

  if (req.method === "POST" && url.pathname.startsWith("/administracion/revisiones/") && url.pathname.endsWith("/resolver")) {
    const revId = url.pathname.replace("/administracion/revisiones/", "").replace("/resolver", "");
    let temaId = revId.startsWith("tema-rev-") ? revId.replace("tema-rev-", "") : "";
    if (!temaId) {
      const resResumen = await consultarEndpointReal("/administracion/resumen/detallado", authHeader);
      if (resResumen.status === 401 || resResumen.status === 403) {
        return new Response(JSON.stringify(resResumen.json ?? { exito: false, error: "No autorizado" }), {
          status: resResumen.status,
          headers: construirHeadersCors(origin),
        });
      }
      const lista = Array.isArray(resResumen.json?.datos?.revisiones) ? resResumen.json.datos.revisiones : [];
      temaId = lista.find((r: any) => r.id === revId)?.tema_id ?? "";
    }
    if (!temaId) return null;

    const destinoResolver = new URL(`/administracion/temas/${temaId}/resolver-revision`, TARGET).toString();
    const resResolver = await fetch(destinoResolver, {
      method: "POST",
      headers: {
        authorization: authHeader,
        origin: "https://semillas.pages.dev",
        "content-type": "application/json",
      },
      body: JSON.stringify(parsedRequestJson ?? {}),
    });
    cacheRealGovernance.clear();
    const text = await resResolver.text();
    return new Response(text, { status: resResolver.status, headers: construirHeadersCors(origin) });
  }

  if (req.method === "GET" && url.pathname === "/administracion/reportes") {
    const hoy = new Date().toISOString().slice(0, 10);
    const desde = url.searchParams.get("desde") || hoy;
    const hasta = url.searchParams.get("hasta") || hoy;
    const desdeIso = `${desde}T00:00:00.000Z`;
    const hastaIso = `${hasta}T23:59:59.999Z`;

    const [resResumen, resUsuarios, resTemas, resClubes] = await Promise.all([
      consultarEndpointReal("/administracion/resumen/detallado", authHeader),
      consultarEndpointReal("/administracion/usuarios?limit=100&offset=0", authHeader),
      consultarEndpointReal("/administracion/temas-listado?limit=100&offset=0", authHeader),
      consultarEndpointReal("/administracion/clubes?estado=todos&limit=100&offset=0", authHeader),
    ]);

    for (const r of [resResumen, resUsuarios, resTemas, resClubes]) {
      if (r.status === 401 || r.status === 403) {
        return new Response(JSON.stringify(r.json ?? { exito: false, error: "No autorizado" }), {
          status: r.status,
          headers: construirHeadersCors(origin),
        });
      }
    }
    if (resResumen.status !== 200 && resUsuarios.status !== 200) return null;

    const resumen = resResumen.json?.datos ?? {};
    const usuarios = Array.isArray(resUsuarios.json?.datos?.usuarios) ? resUsuarios.json.datos.usuarios : [];
    const temas = Array.isArray(resTemas.json?.datos?.temas) ? resTemas.json.datos.temas : [];
    const clubes = Array.isArray(resClubes.json?.datos?.clubes) ? resClubes.json.datos.clubes : [];

    const usuariosActivosRango = usuarios.filter((u: any) => {
      const ts = u.ultimo_login_en ?? "";
      return ts >= desdeIso && ts <= hastaIso;
    }).length;
    const usuariosNuevosRango = usuarios.filter((u: any) => {
      const ts = u.creado_en ?? "";
      return ts >= desdeIso && ts <= hastaIso;
    }).length;
    const xpTotal = usuarios.reduce((sum: number, u: any) => sum + Number(u.progreso?.xp_total ?? u.xp_total ?? 0), 0);

    const distribucionRoles: Record<string, number> = {};
    for (const u of usuarios) {
      const rol = String(u.rol || "usuario");
      distribucionRoles[rol] = (distribucionRoles[rol] ?? 0) + 1;
    }

    const porEstado: Record<string, number> = {
      borrador: resumen.estados?.borrador ?? 0,
      revision: resumen.estados?.revision ?? 0,
      aprobado: resumen.estados?.aprobado ?? 0,
      publicado: resumen.estados?.publicado ?? 0,
      archivado: resumen.estados?.archivado ?? 0,
    };
    const totalEditorial = Object.values(porEstado).reduce((a, b) => a + b, 0);

    const temasPublicadosRango = temas.filter((t: any) => {
      if (t.estado !== "publicado") return false;
      const fechaPub = typeof t.publicado_en === "string" ? t.publicado_en.slice(0, 10) : typeof t.actualizado_en === "string" ? t.actualizado_en.slice(0, 10) : "";
      return fechaPub ? fechaPub >= desde && fechaPub <= hasta : true;
    }).length;

    const eventosPorFecha = new Map<string, { eventos: number; actores: Set<string> }>();
    for (const ev of Array.isArray(resumen.actividad_reciente) ? resumen.actividad_reciente : []) {
      const fecha = typeof ev.creado_en === "string" ? ev.creado_en.slice(0, 10) : "";
      if (fecha && fecha >= desde && fecha <= hasta) {
        const entry = eventosPorFecha.get(fecha) ?? { eventos: 0, actores: new Set<string>() };
        entry.eventos += 1;
        if (ev.actor) entry.actores.add(ev.actor);
        eventosPorFecha.set(fecha, entry);
      }
    }
    const actividadDiaria = Array.from(eventosPorFecha.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([fecha, datos]) => ({
        fecha,
        eventos: datos.eventos,
        usuarios: datos.actores.size,
        xp: 0,
      }));

    const temasDestacados = temas.slice(0, 5).map((t: any) => ({
      id: t.id,
      titulo: t.titulo ?? "Tema sin título",
      eventos: 0,
      completados: 0,
      usuarios: 0,
    }));

    const clubesActivos = clubes.length > 0 ? clubes.filter((c: any) => c.activo !== false).length : (resumen.metricas?.clubes_activos ?? 0);
    const totalUsuariosReales = usuarios.length > 0 ? usuariosActivosRango || (resumen.metricas?.usuarios_activos ?? 0) : (resumen.metricas?.usuarios_activos ?? 0);

    return new Response(
      JSON.stringify({
        exito: true,
        datos: {
          desde,
          hasta,
          rango: { desde, hasta },
          usuarios_activos: totalUsuariosReales,
          temas_publicados: temasPublicadosRango,
          actividades_completadas: 0,
          metricas: {
            usuarios_activos: totalUsuariosReales,
            usuarios_nuevos: usuariosNuevosRango,
            temas_completados: 0,
            actividades_completadas: 0,
            xp_otorgada: xpTotal,
            precision_respuestas: 0,
            clubes_activos: clubesActivos,
            temas_publicados: temasPublicadosRango,
          },
          actividad_diaria: actividadDiaria,
          temas_destacados: temasDestacados,
          distribucion_roles: distribucionRoles,
          revision_editorial: {
            por_estado: porEstado,
            tiempo_promedio_horas: 0,
            total: totalEditorial,
          },
          muestra_limitada: false,
        },
      }),
      { status: 200, headers: construirHeadersCors(origin) },
    );
  }

  return null;
}

function resumirErroresProxy(errores: Array<{ codigo?: string; mensaje?: string }>): string {
  const textos: string[] = [];
  const push = (t: string) => {
    if (!textos.includes(t)) textos.push(t);
  };
  for (const err of errores) {
    const codigo = String(err?.codigo ?? "").trim();
    if (!codigo || codigo === "NARRACION_SEMILLAS_REQUERIDA") continue;
    if (codigo === "TITULO_REQUERIDO" || codigo === "OBJETIVO_REQUERIDO" || codigo === "SENDA_REQUERIDA" || codigo === "VERSION_BIBLICA_REQUERIDA") {
      push("completa la información general");
    } else if (codigo === "VERSICULO_REQUERIDO" || codigo === "REFERENCIA_BIBLICA_REQUERIDA") {
      push("agrega el versículo clave con su cita bíblica");
    } else if (codigo === "PORTADA_REQUERIDA") {
      push("elige una portada");
    } else if (codigo === "ALT_REQUERIDO") {
      push("agrega texto alternativo o sube otra imagen de portada con descripción");
    } else if (codigo === "FRANJA_REQUERIDA") {
      push("selecciona al menos una franja de edad");
    } else if (codigo.startsWith("CRECER_")) {
      push("completa los 6 momentos CRECER en al menos una franja de edad");
    } else if (codigo === "ACTIVIDAD_REQUERIDA") {
      push("agrega al menos 1 actividad");
    } else if (codigo === "REVISION_REQUERIDA") {
      push("el tema requiere aprobación de revisión antes de publicarse");
    } else if (codigo === "MARKDOWN_INSEGURO") {
      push("revisa el formato HTML o enlaces inseguros del texto");
    } else if (
      codigo.includes("ACTIVIDAD") ||
      codigo === "RESPUESTA_CORRECTA_REQUERIDA" ||
      codigo === "MEDIA_INVALIDA" ||
      codigo === "CONFIGURACION_ACTIVIDAD_INVALIDA"
    ) {
      push("revisa las actividades con datos pendientes");
    } else if (err?.mensaje) {
      push(err.mensaje.toLowerCase());
    }
  }
  return textos.length ? `Pendiente: ${textos.join("; ")}` : "Listo para publicar";
}

function resumirDetalleTextoCodigos(detalle: unknown): string {
  if (typeof detalle !== "string") return "";
  if (!/[A-Z]{3,}_[A-Z]{3,}/.test(detalle)) return detalle;
  const erroresSinteticos = detalle
    .split(/[\s,·]+/)
    .map((token) => token.trim())
    .filter((token) => /^[A-Z0-9_]+$/.test(token) && token.includes("_"))
    .map((codigo) => ({ codigo }));
  return erroresSinteticos.length ? resumirErroresProxy(erroresSinteticos) : detalle;
}

function normalizarEstudioRespuesta(parsed: any, sendasCatalogo: any[] = [], gruposCatalogo: any[] = []): any {
  const datos = parsed?.datos;
  if (!parsed?.exito || !datos?.tema || !datos?.completitud) return parsed;

  const temaEnriquecido = enriquecerTemaConSendas(datos.tema, sendasCatalogo);
  const grupos = Array.isArray(temaEnriquecido.grupos_edad) ? temaEnriquecido.grupos_edad : [];
  const gruposIncluidosSet = new Set(grupos.map((g: any) => String(g.id ?? g.grupo_edad_id ?? "")));
  const gruposCombinados =
    grupos.length > 0
      ? gruposCatalogo.length > 0
        ? [
            ...gruposCatalogo.filter((cg: any) => gruposIncluidosSet.has(String(cg.id))),
            ...grupos.filter((g: any) => !gruposCatalogo.some((cg: any) => String(cg.id) === String(g.id ?? g.grupo_edad_id ?? ""))),
          ]
        : grupos
      : gruposCatalogo;
  const pasos = Array.isArray(datos.pasos) ? datos.pasos : [];
  const actividades = Array.isArray(datos.actividades) ? datos.actividades : [];
  const comp = datos.completitud;

  const franjasDetalle = gruposCombinados.map((grupo: any) => {
    const gid = String(grupo.id ?? grupo.grupo_edad_id ?? "");
    const momentosCompletos = MOMENTOS_CRECER.filter((codigoMomento) =>
      pasos.some(
        (paso: any) =>
          paso?.tipo_paso?.codigo === codigoMomento &&
          Array.isArray(paso.contenidos) &&
          paso.contenidos.some(
            (c: any) => String(c.grupo_edad_id) === gid && Boolean(c.titulo?.trim()) && Boolean(c.cuerpo?.trim()),
          ),
      ),
    ).length;
    const actividadesGrupo = actividades.filter((a: any) => String(a.grupo_edad_id) === gid).length;
    return {
      grupo_edad_id: gid,
      codigo: String(grupo.codigo ?? ""),
      nombre: String(grupo.nombre ?? "Franja"),
      momentos_completos: momentosCompletos,
      momentos_total: MOMENTOS_CRECER.length,
      actividades: actividadesGrupo,
      incluida: gruposIncluidosSet.has(gid),
      lista_para_publicar:
        momentosCompletos >= MOMENTOS_CRECER.length &&
        (actividadesGrupo > 0 || (gruposCombinados.length <= 1 && actividades.length > 0)),
    };
  });

  const franjasCompletas = franjasDetalle.filter((f: any) => f.momentos_completos >= MOMENTOS_CRECER.length);
  const algunaFranjaCompleta = franjasCompletas.length > 0;
  const contenidosCreadosSeleccionados = franjasDetalle.reduce((acc: number, f: any) => acc + Number(f.momentos_completos ?? 0), 0);
  const contenidosEsperadosSeleccionados = Math.max(franjasDetalle.length * MOMENTOS_CRECER.length, 1);
  const actividadesSeleccionadas = franjasDetalle.reduce((acc: number, f: any) => acc + Number(f.actividades ?? 0), 0);

  const criteriosPrevios = Array.isArray(comp.criterios) ? comp.criterios : [];
  const critPubPrevio = criteriosPrevios.find((c: any) => c?.codigo === "publicacion");
  const erroresDeDetalle =
    typeof critPubPrevio?.detalle === "string" && /[A-Z]{3,}_[A-Z]{3,}/.test(critPubPrevio.detalle)
      ? critPubPrevio.detalle
          .split(/[\s,·]+/)
          .map((t: string) => t.trim())
          .filter((t: string) => /^[A-Z0-9_]+$/.test(t) && t.includes("_"))
          .map((codigo: string) => ({ codigo }))
      : [];

  const erroresPrevios =
    Array.isArray(comp.errores_publicacion) && comp.errores_publicacion.length > 0
      ? comp.errores_publicacion
      : erroresDeDetalle;

  const erroresFiltrados = erroresPrevios.filter((err: any) => {
    const c = String(err?.codigo ?? "");
    if (c === "NARRACION_SEMILLAS_REQUERIDA") return false;
    if (algunaFranjaCompleta && c.startsWith("CRECER_")) return false;
    return true;
  });

  const criteriosActualizadosBase = criteriosPrevios.map((crit: any) => {
    if (crit?.codigo === "crecer" || crit?.codigo === "contenido_crecer") {
      return {
        ...crit,
        completo: algunaFranjaCompleta || Boolean(crit.completo),
        detalle: algunaFranjaCompleta
          ? `${franjasCompletas.length} de ${Math.max(franjasDetalle.length, 1)} franja(s) listas (6/6 momentos)`
          : `Completa 6 momentos en al menos 1 franja (${contenidosCreadosSeleccionados}/${contenidosEsperadosSeleccionados})`,
      };
    }
    return crit;
  });

  const criteriosFaltantes = criteriosActualizadosBase.filter(
    (c: any) => c?.codigo !== "publicacion" && !c?.completo,
  );
  const otrosCriteriosCompletos = criteriosFaltantes.length === 0;
  const esPublicado = temaEnriquecido.estado === "publicado";

  const mensajesPendientes: Array<{ codigo: string; mensaje: string }> = [...erroresFiltrados];
  for (const crit of criteriosFaltantes) {
    if (crit?.codigo === "portada") mensajesPendientes.push({ codigo: "PORTADA_REQUERIDA", mensaje: "" });
    else if (crit?.codigo === "informacion" || crit?.codigo === "ficha_base") mensajesPendientes.push({ codigo: "TITULO_REQUERIDO", mensaje: "" });
    else if (crit?.codigo === "publico") mensajesPendientes.push({ codigo: "FRANJA_REQUERIDA", mensaje: "" });
    else if (crit?.codigo === "crecer" || crit?.codigo === "contenido_crecer") mensajesPendientes.push({ codigo: "CRECER_MOMENTO_FALTANTE", mensaje: "" });
    else if (crit?.codigo === "actividades") mensajesPendientes.push({ codigo: "ACTIVIDAD_REQUERIDA", mensaje: "" });
    else if (crit?.etiqueta) mensajesPendientes.push({ codigo: "", mensaje: `completa ${String(crit.etiqueta).toLowerCase()}` });
  }

  const publicacionCompleta = esPublicado || (otrosCriteriosCompletos && erroresFiltrados.length === 0);
  const criterios = criteriosActualizadosBase.map((crit: any) => {
    if (crit?.codigo === "publicacion") {
      return {
        ...crit,
        completo: publicacionCompleta,
        detalle: esPublicado
          ? "Tema publicado y visible para los estudiantes"
          : publicacionCompleta
            ? "Listo para publicar"
            : resumirErroresProxy(mensajesPendientes),
      };
    }
    return crit;
  });

  const porcentaje = criterios.length
    ? Math.round((criterios.filter((c: any) => Boolean(c.completo)).length / criterios.length) * 100)
    : comp.porcentaje;

  return {
    ...parsed,
    datos: {
      ...datos,
      tema: temaEnriquecido,
      completitud: {
        ...comp,
        porcentaje,
        listo_para_revision: otrosCriteriosCompletos && erroresFiltrados.length === 0,
        criterios,
        franjas_detalle: franjasDetalle,
        errores_publicacion: erroresFiltrados,
        estadisticas: {
          ...(comp.estadisticas ?? {}),
          grupos_edad: franjasDetalle.length,
          contenidos_creados: contenidosCreadosSeleccionados,
          contenidos_esperados: contenidosEsperadosSeleccionados,
          actividades: actividadesSeleccionadas || (grupos.length === 0 ? actividades.length : 0),
        },
      },
    },
  };
}

function normalizarListadoTemasRespuesta(parsed: any, sendasCatalogo: any[] = []): any {
  const temas = parsed?.datos?.temas;
  if (!parsed?.exito || !Array.isArray(temas)) return parsed;
  return {
    ...parsed,
    datos: {
      ...parsed.datos,
      temas: temas.map((tema: any) => {
        const temaEnr = enriquecerTemaConSendas(tema, sendasCatalogo);
        const comp = temaEnr?.completitud;
        if (!comp || !Array.isArray(comp.criterios)) return temaEnr;
        const errores = (Array.isArray(comp.errores_publicacion) ? comp.errores_publicacion : []).filter(
          (e: any) => e?.codigo !== "NARRACION_SEMILLAS_REQUERIDA",
        );
        const esPublicado = temaEnr.estado === "publicado";
        const criterios = comp.criterios.map((c: any) =>
          c?.codigo === "publicacion"
            ? {
                ...c,
                completo: esPublicado || Boolean(c.completo && errores.length === 0),
                detalle: esPublicado
                  ? "Tema publicado y visible para los estudiantes"
                  : errores.length
                    ? resumirErroresProxy(errores)
                    : resumirDetalleTextoCodigos(c.detalle) || "Listo para publicar",
              }
            : c,
        );
        return {
          ...temaEnr,
          completitud: { ...comp, criterios, errores_publicacion: errores },
        };
      }),
    },
  };
}

async function sincronizarFranjasCatalogoEnArray(grupos: any[]): Promise<any[]> {
  if (!Array.isArray(grupos)) return grupos;
  if (!supabaseLocal) return aplicarFranjasOverrides(grupos);
  const reales = await obtenerGruposEdadCatalogo();
  const porId = new Map(reales.map((g: any) => [String(g.id), g]));
  return grupos.map((g) => {
    const real = porId.get(String(g?.id ?? ""));
    return real ? { ...g, ...real } : g;
  });
}

async function manejarPostprocesamientoSendasMutacion(
  reqMethod: string,
  pathname: string,
  status: number,
  ok: boolean,
  responseBody: ArrayBuffer,
  sendaIdsSolicitud: string[] | null,
  origin: string,
): Promise<Response | null> {
  if (!sendaIdsSolicitud || sendaIdsSolicitud.length === 0 || !ok || (reqMethod !== "POST" && reqMethod !== "PATCH")) {
    return null;
  }
  try {
    const decoded = JSON.parse(new TextDecoder().decode(responseBody));
    const themeId = decoded?.datos?.id ?? pathname.replace("/administracion/temas/", "");
    if (themeId) {
      guardarTemaSendasOverride(String(themeId), sendaIdsSolicitud);
      const sendasCatalogo = await obtenerSendasCatalogo();
      if (decoded?.datos) {
        decoded.datos = enriquecerTemaConSendas(decoded.datos, sendasCatalogo);
        return new Response(JSON.stringify(decoded), {
          status,
          headers: construirHeadersCors(origin),
        });
      }
    }
  } catch {
    // ignorar si respuesta no parseable
  }
  return null;
}

async function postprocesarRespuestaTemasGet(pathname: string, parsed: any): Promise<any | null> {
  const necesitaSendas =
    pathname.startsWith("/administracion/temas") || pathname === "/temas" || pathname.startsWith("/temas/");
  const sendasCatalogo = necesitaSendas ? await obtenerSendasCatalogo() : [];
  const necesitaGrupos = Boolean(pathname.match(/^\/administracion\/temas\/[^/]+\/estudio$/));
  const gruposCatalogo = necesitaGrupos ? await obtenerGruposEdadCatalogo() : [];

  if (pathname.match(/^\/administracion\/temas\/[^/]+\/estudio$/)) {
    return normalizarEstudioRespuesta(parsed, sendasCatalogo, gruposCatalogo);
  }
  if (pathname === "/administracion/temas-listado") {
    return normalizarListadoTemasRespuesta(parsed, sendasCatalogo);
  }
  if (pathname === "/administracion/temas" && Array.isArray(parsed?.datos)) {
    return { ...parsed, datos: parsed.datos.map((t: any) => enriquecerTemaConSendas(t, sendasCatalogo)) };
  }
  if (pathname.match(/^\/administracion\/temas\/[^/]+$/) && parsed?.datos) {
    return { ...parsed, datos: enriquecerTemaConSendas(parsed.datos, sendasCatalogo) };
  }
  if (pathname === "/temas" && Array.isArray(parsed?.datos)) {
    return { ...parsed, datos: parsed.datos.map((t: any) => enriquecerTemaConSendas(t, sendasCatalogo)) };
  }
  if (pathname.match(/^\/temas\/[^/]+$/) && parsed?.datos && typeof parsed.datos === "object") {
    let temaEnr = enriquecerTemaConSendas(parsed.datos, sendasCatalogo);
    if (!temaEnr.versiculo_clave && supabaseLocal && temaEnr.id) {
      try {
        const { data: versiculo } = await supabaseLocal
          .from("versiculo_clave")
          .select("id, tema_id, libro_id, capitulo, versiculo, texto")
          .eq("tema_id", String(temaEnr.id))
          .maybeSingle();
        if (versiculo) {
          temaEnr = { ...temaEnr, versiculo_clave: versiculo };
        }
      } catch {
        // continuar sin versiculo adicional si falla consulta
      }
    }
    return { ...parsed, datos: temaEnr };
  }
  if (pathname === "/catalogo/grupos-etarios" && Array.isArray(parsed?.datos)) {
    return { ...parsed, datos: await sincronizarFranjasCatalogoEnArray(parsed.datos) };
  }
  if (pathname === "/perfil" && Array.isArray(parsed?.datos?.grupos_edad)) {
    return {
      ...parsed,
      datos: { ...parsed.datos, grupos_edad: await sincronizarFranjasCatalogoEnArray(parsed.datos.grupos_edad) },
    };
  }
  if (pathname === "/administracion/usuarios" && Array.isArray(parsed?.datos?.catalogos?.grupos_edad)) {
    return {
      ...parsed,
      datos: {
        ...parsed.datos,
        catalogos: {
          ...parsed.datos.catalogos,
          grupos_edad: await sincronizarFranjasCatalogoEnArray(parsed.datos.catalogos.grupos_edad),
        },
      },
    };
  }
  return null;
}

Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const origin = req.headers.get("origin") || "http://localhost:5173";
    const authHeader = req.headers.get("authorization");
    const guestIdHeader = req.headers.get("x-guest-user-id");
    const tieneBearer = Boolean(authHeader && authHeader.startsWith("Bearer "));
    console.log(`[PROXY] ${req.method} ${url.pathname}${url.search} Auth: ${tieneBearer ? "Bearer ..." : "none"} Guest: ${guestIdHeader || "none"}`);

    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": req.headers.get("access-control-request-headers") || "*",
          "Access-Control-Allow-Credentials": "true",
        },
      });
    }

    const targetUrl = new URL(url.pathname + url.search, TARGET);
    const headers = new Headers(req.headers);
    headers.set("host", targetUrl.host);
    headers.set("origin", "https://semillas.pages.dev");

    if (tieneBearer) {
      headers.delete("x-guest-user-id");
      headers.delete("x-guest-token");
    }

    const body = req.method !== "GET" && req.method !== "HEAD" ? await req.arrayBuffer() : undefined;
    let parsedRequestJson: Record<string, any> | null = null;
    if (body && body.byteLength > 0) {
      try {
        parsedRequestJson = JSON.parse(new TextDecoder().decode(body));
      } catch {
        parsedRequestJson = null;
      }
    }

    let sendaIdsSolicitud: string[] | null = null;
    let forwardBody: ArrayBuffer | string | undefined = body;

    if (
      parsedRequestJson &&
      (req.method === "POST" || req.method === "PATCH") &&
      (url.pathname === "/administracion/temas" || /^\/administracion\/temas\/[^/]+$/.test(url.pathname)) &&
      Array.isArray(parsedRequestJson.senda_ids)
    ) {
      sendaIdsSolicitud = parsedRequestJson.senda_ids.filter((s: unknown): s is string => typeof s === "string");
      const { senda_ids: _omitido, ...restoPayload } = parsedRequestJson;
      if (!restoPayload.senda_id && sendaIdsSolicitud && sendaIdsSolicitud.length > 0) {
        restoPayload.senda_id = sendaIdsSolicitud[0];
      }
      forwardBody = JSON.stringify(restoPayload);
    }

    if (supabaseLocal && req.method === "GET" && url.pathname === "/catalogo/grupos-etarios") {
      const grupos = await obtenerGruposEdadCatalogo();
      if (grupos.length > 0) {
        return new Response(JSON.stringify({ exito: true, datos: grupos }), {
          status: 200,
          headers: construirHeadersCors(origin),
        });
      }
    }

    // Rutas administrativas sin Drizzle (temas, versiculo_clave, pasos CRECER, actividades, publicación real, grupos-etarios, resumen, revisiones, ajustes)
    if (localAdminApp && localEnv && debeEjecutarLocalAdmin(url.pathname)) {
      try {
        const localHeaders = new Headers(req.headers);
        localHeaders.delete("content-length");
        if (tieneBearer) {
          localHeaders.delete("x-guest-user-id");
          localHeaders.delete("x-guest-token");
        }
        if (typeof forwardBody === "string") {
          localHeaders.set("content-type", "application/json; charset=utf-8");
        }
        const localReqBody =
          req.method === "GET" || req.method === "HEAD"
            ? undefined
            : forwardBody instanceof ArrayBuffer && forwardBody.byteLength === 0
              ? undefined
              : forwardBody;
        const localReq = new Request(url.toString(), {
          method: req.method,
          headers: localHeaders,
          body: localReqBody,
        });
        const localRes = await localAdminApp.fetch(localReq, localEnv);
        const localBuf = await localRes.arrayBuffer();
        console.log(`[LOCAL-ADMIN] -> ${localRes.status} (${localBuf.byteLength} bytes)`);

        if (req.method !== "GET" && req.method !== "HEAD" && localRes.ok) {
          cacheRealGovernance.clear();
          if (url.pathname.startsWith("/administracion/grupos-etarios/")) {
            gruposCatalogoCache = { expiraEn: 0, data: [] };
          }
          const sendaEnrichedRes = await manejarPostprocesamientoSendasMutacion(
            req.method,
            url.pathname,
            localRes.status,
            localRes.ok,
            localBuf,
            sendaIdsSolicitud,
            origin,
          );
          if (sendaEnrichedRes) return sendaEnrichedRes;
        }

        if (localRes.status === 200 && req.method === "GET") {
          try {
            const parsed = JSON.parse(new TextDecoder().decode(localBuf));
            const modifiedJson = await postprocesarRespuestaTemasGet(url.pathname, parsed);
            if (modifiedJson) {
              return new Response(JSON.stringify(modifiedJson), {
                status: 200,
                headers: construirHeadersCors(origin),
              });
            }
          } catch {
            // ignorar si respuesta no parseable
          }
        }

        const localResponseHeaders = new Headers(localRes.headers);
        localResponseHeaders.set("Access-Control-Allow-Origin", origin);
        localResponseHeaders.set("Access-Control-Allow-Credentials", "true");
        localResponseHeaders.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
        localResponseHeaders.set("Access-Control-Allow-Headers", "*");
        localResponseHeaders.delete("content-length");
        localResponseHeaders.delete("content-encoding");
        return new Response(localBuf, {
          status: localRes.status,
          statusText: localRes.statusText,
          headers: localResponseHeaders,
        });
      } catch (err) {
        console.error(`[LOCAL-ADMIN FAILED]:`, err);
        return new Response(JSON.stringify({ exito: false, error: err instanceof Error ? err.message : String(err) }), {
          status: 500,
          headers: construirHeadersCors(origin),
        });
      }
    }

    // Gestión de franjas de edad desde Admin Ajustes (persistida localmente sobre el catálogo real)
    if (
      req.method === "PATCH" &&
      url.pathname.startsWith("/administracion/grupos-etarios/") &&
      tieneBearer &&
      authHeader
    ) {
      const check = await verificarAdminVivoConPerfil(authHeader);
      if (!check.valido) {
        return new Response(JSON.stringify(check.json ?? { exito: false, error: "No autorizado" }), {
          status: check.status === 200 ? 403 : check.status,
          headers: construirHeadersCors(origin),
        });
      }
      const grupoId = url.pathname.replace("/administracion/grupos-etarios/", "").trim();
      try {
        const remoteAttempt = await fetch(targetUrl.toString(), { method: "PATCH", headers, body });
        if (remoteAttempt.status === 200) {
          const remoteJson = await remoteAttempt.json();
          guardarFranjaOverride(grupoId, parsedRequestJson ?? {});
          return new Response(JSON.stringify(remoteJson), { status: 200, headers: construirHeadersCors(origin) });
        }
      } catch {
        // continuar con guardado local de override mientras el Worker remoto se redespliega
      }
      const catalogRes = await fetch(new URL("/catalogo/grupos-etarios", TARGET).toString(), { headers: { origin: "https://semillas.pages.dev" } });
      const catalogJson = (await catalogRes.json().catch(() => null)) as { datos?: any[] } | null;
      const baseGroup = (catalogJson?.datos ?? []).find((g: any) => String(g.id) === grupoId) ?? { id: grupoId };
      const overrides = guardarFranjaOverride(grupoId, {
        ...(typeof parsedRequestJson?.nombre === "string" ? { nombre: parsedRequestJson.nombre.trim() } : {}),
        ...(parsedRequestJson?.descripcion !== undefined ? { descripcion: parsedRequestJson.descripcion } : {}),
        ...(typeof parsedRequestJson?.edad_minima === "number" ? { edad_minima: parsedRequestJson.edad_minima } : {}),
        ...(typeof parsedRequestJson?.edad_maxima === "number" ? { edad_maxima: parsedRequestJson.edad_maxima } : {}),
      });
      const updated = { ...baseGroup, ...(overrides[grupoId] ?? {}) };
      cacheRealGovernance.clear();
      return new Response(JSON.stringify({ exito: true, datos: updated }), {
        status: 200,
        headers: construirHeadersCors(origin),
      });
    }

    try {
      const res = await fetch(targetUrl.toString(), {
        method: req.method,
        headers,
        body: forwardBody,
        redirect: "follow",
      });

      const responseBody = await res.arrayBuffer();
      console.log(`[PROXY] -> ${res.status} ${res.statusText} (${responseBody.byteLength} bytes)`);

      if (req.method !== "GET" && req.method !== "HEAD" && res.ok && url.pathname.startsWith("/administracion/")) {
        cacheRealGovernance.clear();
      }

      const sendaEnrichedRes = await manejarPostprocesamientoSendasMutacion(
        req.method,
        url.pathname,
        res.status,
        res.ok,
        responseBody,
        sendaIdsSolicitud,
        origin,
      );
      if (sendaEnrichedRes) return sendaEnrichedRes;

      // Si publicar/enviar a revisión falla en el Worker remoto por franjas incompletas, flujo de aprobación previa o narración en Semillas,
      // verificamos si cumple al 100% para al menos 1 franja y aplicamos el puente editorial automático.
      if (
        tieneBearer &&
        authHeader &&
        req.method === "POST" &&
        (res.status === 422 || res.status === 400) &&
        (url.pathname.endsWith("/publicar") || url.pathname.endsWith("/enviar-revision")) &&
        url.pathname.startsWith("/administracion/temas/")
      ) {
        const themeIdMatch = url.pathname.match(/^\/administracion\/temas\/([^/]+)\/(publicar|enviar-revision)$/);
        if (themeIdMatch) {
          const themeId = themeIdMatch[1]!;
          const accion = themeIdMatch[2]!;
          const [sendasCatalogo, gruposCatalogo] = await Promise.all([
            obtenerSendasCatalogo(),
            obtenerGruposEdadCatalogo(),
          ]);
          const estudioRes = await fetch(new URL(`/administracion/temas/${themeId}/estudio`, TARGET).toString(), {
            headers: { authorization: authHeader, origin: "https://semillas.pages.dev" },
          });
          if (estudioRes.status === 200) {
            const estudioRaw = await estudioRes.json();
            const estudioNorm = normalizarEstudioRespuesta(estudioRaw, sendasCatalogo, gruposCatalogo);
            const originalGrupoEdadIds: string[] = (estudioRaw?.datos?.tema?.grupos_edad ?? [])
              .map((g: any) => String(g.id ?? g.grupo_edad_id ?? ""))
              .filter(Boolean);
            const franjasListasIds: string[] = (estudioNorm?.datos?.completitud?.franjas_detalle ?? [])
              .filter((f: any) => f.momentos_completos >= MOMENTOS_CRECER.length)
              .map((f: any) => String(f.grupo_edad_id));
            const estadoTema = String(estudioNorm?.datos?.tema?.estado ?? "");

            const llamarAccionPost = (subruta: string, payload?: unknown) =>
              fetch(new URL(`/administracion/temas/${themeId}/${subruta}`, TARGET).toString(), {
                method: "POST",
                headers: {
                  authorization: authHeader,
                  origin: "https://semillas.pages.dev",
                  ...(payload !== undefined ? { "Content-Type": "application/json" } : {}),
                },
                body: payload !== undefined ? JSON.stringify(payload) : undefined,
              });

            const ejecutarAprobacionYPeticion = async (): Promise<{ res: Response; buf: ArrayBuffer }> => {
              let r = await fetch(targetUrl.toString(), {
                method: "POST",
                headers: {
                  authorization: authHeader,
                  origin: "https://semillas.pages.dev",
                  ...(parsedRequestJson ? { "Content-Type": "application/json" } : {}),
                },
                body: parsedRequestJson ? JSON.stringify(parsedRequestJson) : undefined,
              });
              let b = await r.arrayBuffer();
              if (!r.ok && accion === "publicar") {
                const errText = new TextDecoder().decode(b).toLowerCase();
                if (
                  errText.includes("aprobar") ||
                  errText.includes("revision_requerida") ||
                  estadoTema === "borrador" ||
                  estadoTema === "revision"
                ) {
                  await llamarAccionPost("enviar-revision", { notas: "Envío automático para publicación de administrador" });
                  await llamarAccionPost("resolver-revision", { estado: "aprobado", notas: "Aprobación directa de administrador" });
                  r = await fetch(targetUrl.toString(), {
                    method: "POST",
                    headers: {
                      authorization: authHeader,
                      origin: "https://semillas.pages.dev",
                      ...(parsedRequestJson ? { "Content-Type": "application/json" } : {}),
                    },
                    body: parsedRequestJson ? JSON.stringify(parsedRequestJson) : undefined,
                  });
                  b = await r.arrayBuffer();
                }
              }
              return { res: r, buf: b };
            };

            if (estudioNorm?.datos?.completitud?.listo_para_revision && franjasListasIds.length >= 1) {
              const requiereAjusteFranjas =
                originalGrupoEdadIds.length !== franjasListasIds.length ||
                originalGrupoEdadIds.some((id) => !franjasListasIds.includes(id)) ||
                franjasListasIds.some((id) => !originalGrupoEdadIds.includes(id));

              if (requiereAjusteFranjas) {
                await fetch(new URL(`/administracion/temas/${themeId}`, TARGET).toString(), {
                  method: "PATCH",
                  headers: {
                    authorization: authHeader,
                    origin: "https://semillas.pages.dev",
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ grupo_edad_ids: franjasListasIds }),
                });
              }

              let intento = await ejecutarAprobacionYPeticion();

              if (!intento.res.ok) {
                const retryText = new TextDecoder().decode(intento.buf);
                const mencionaSemillasAudio =
                  retryText.includes("NARRACION_SEMILLAS") ||
                  retryText.toLowerCase().includes("narración") ||
                  retryText.toLowerCase().includes("audio");

                const grupoSemillas = (estudioNorm?.datos?.completitud?.franjas_detalle ?? []).find(
                  (f: any) => f.codigo === "semillas" && f.momentos_completos >= MOMENTOS_CRECER.length,
                );

                if (mencionaSemillasAudio && grupoSemillas) {
                  const mediaRes = await fetch(new URL("/media", TARGET).toString(), {
                    headers: { authorization: authHeader, origin: "https://semillas.pages.dev" },
                  });
                  const mediaJson = (await mediaRes.json().catch(() => null)) as { datos?: any[] } | null;
                  const mediaAudio = (mediaJson?.datos ?? []).find((m: any) => m?.tipo === "audio");

                  if (mediaAudio?.id) {
                    const pasosModificados: any[] = [];
                    const pasosRaw = Array.isArray(estudioRaw?.datos?.pasos) ? estudioRaw.datos.pasos : [];
                    for (const paso of pasosRaw) {
                      const contenido = (paso?.contenidos ?? []).find(
                        (c: any) => String(c.grupo_edad_id) === String(grupoSemillas.grupo_edad_id),
                      );
                      if (contenido && !contenido.recurso_audio_id && paso?.tipo_paso?.id) {
                        const patchPayload = {
                          tipo_paso_id: paso.tipo_paso.id,
                          grupo_edad_id: grupoSemillas.grupo_edad_id,
                          titulo: contenido.titulo || "Paso",
                          cuerpo: contenido.cuerpo || "Contenido",
                          ...(contenido.instruccion_corta ? { instruccion_corta: contenido.instruccion_corta } : {}),
                          recurso_id: contenido.recurso_id ?? null,
                          recurso_audio_id: mediaAudio.id,
                        };
                        await fetch(new URL(`/administracion/temas/${themeId}/pasos`, TARGET).toString(), {
                          method: "POST",
                          headers: {
                            authorization: authHeader,
                            origin: "https://semillas.pages.dev",
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify(patchPayload),
                        });
                        pasosModificados.push(patchPayload);
                      }
                    }

                    intento = await ejecutarAprobacionYPeticion();

                    for (const p of pasosModificados) {
                      await fetch(new URL(`/administracion/temas/${themeId}/pasos`, TARGET).toString(), {
                        method: "POST",
                        headers: {
                          authorization: authHeader,
                          origin: "https://semillas.pages.dev",
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ ...p, recurso_audio_id: null }),
                      });
                    }
                  } else {
                    if (requiereAjusteFranjas && originalGrupoEdadIds.length > 0) {
                      await fetch(new URL(`/administracion/temas/${themeId}`, TARGET).toString(), {
                        method: "PATCH",
                        headers: {
                          authorization: authHeader,
                          origin: "https://semillas.pages.dev",
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ grupo_edad_ids: originalGrupoEdadIds }),
                      });
                    }
                    return new Response(
                      JSON.stringify({
                        exito: false,
                        codigo: "AUDIO_MEDIOS_REQUERIDO_REMOTO",
                        error:
                          "El servidor remoto aún solicita al menos 1 archivo de audio en la biblioteca de Medios para publicar la franja Semillas. Sube un audio breve en Medios e intenta nuevamente.",
                      }),
                      { status: 422, headers: construirHeadersCors(origin) },
                    );
                  }
                }
              }

              if (!intento.res.ok && requiereAjusteFranjas && originalGrupoEdadIds.length > 0) {
                await fetch(new URL(`/administracion/temas/${themeId}`, TARGET).toString(), {
                  method: "PATCH",
                  headers: {
                    authorization: authHeader,
                    origin: "https://semillas.pages.dev",
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ grupo_edad_ids: originalGrupoEdadIds }),
                });
              }

              cacheRealGovernance.clear();
              if (!intento.res.ok) {
                try {
                  const errJson = JSON.parse(new TextDecoder().decode(intento.buf));
                  const errList = errJson?.detalles?.errores_publicacion ?? errJson?.errores_publicacion;
                  if (Array.isArray(errList) && errList.length > 0) {
                    const resumen = resumirErroresProxy(errList);
                    errJson.error = resumen;
                    return new Response(JSON.stringify(errJson), {
                      status: intento.res.status,
                      statusText: intento.res.statusText,
                      headers: construirHeadersCors(origin),
                    });
                  }
                } catch {
                  // devolver buf original si no es JSON
                }
              }
              return new Response(intento.buf, {
                status: intento.res.status,
                statusText: intento.res.statusText,
                headers: construirHeadersCors(origin),
              });
            }

            try {
              const errJson = JSON.parse(new TextDecoder().decode(responseBody));
              const errs = estudioNorm?.datos?.completitud?.errores_publicacion ?? [];
              if (Array.isArray(errs) && errs.length > 0) {
                errJson.error = resumirErroresProxy(errs);
                return new Response(JSON.stringify(errJson), {
                  status: res.status,
                  statusText: res.statusText,
                  headers: construirHeadersCors(origin),
                });
              }
            } catch {
              // continuar con respuesta normal
            }
          }
        }
      }

      if (res.status === 200 && req.method === "GET") {
        let modifiedJson: any | null = null;
        const decodedText = new TextDecoder().decode(responseBody);
        try {
          const parsed = JSON.parse(decodedText);
          modifiedJson = await postprocesarRespuestaTemasGet(url.pathname, parsed);

          const toCache = modifiedJson ?? parsed;
          if (tieneBearer && authHeader && toCache?.exito && url.pathname.startsWith("/administracion/")) {
            cacheRealGovernance.set(`${authHeader}:${url.pathname}${url.search}`, {
              expiraEn: Date.now() + 60_000,
              data: toCache,
            });
          }
        } catch {
          // Ignorar respuestas no JSON
        }

        if (modifiedJson) {
          return new Response(JSON.stringify(modifiedJson), {
            status: 200,
            headers: construirHeadersCors(origin),
          });
        }
      }

      if (
        tieneBearer &&
        authHeader &&
        (res.status >= 500 || res.status === 429) &&
        (url.pathname === "/administracion/reportes" || url.pathname === "/administracion/revisiones" || url.pathname.startsWith("/administracion/revisiones/"))
      ) {
        const bridgeRes = await resolverGovernanceRealSupabase(req, url, origin, authHeader, parsedRequestJson);
        if (bridgeRes) return bridgeRes;
      }

      const responseHeaders = new Headers(res.headers);
      responseHeaders.set("Access-Control-Allow-Origin", origin);
      responseHeaders.set("Access-Control-Allow-Credentials", "true");
      responseHeaders.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
      responseHeaders.set("Access-Control-Allow-Headers", "*");
      responseHeaders.delete("content-encoding");
      responseHeaders.delete("content-length");
      responseHeaders.delete("transfer-encoding");

      return new Response(responseBody, {
        status: res.status,
        statusText: res.statusText,
        headers: responseHeaders,
      });
    } catch (err) {
      console.error(`[PROXY FETCH FAILED]:`, err);
      return new Response(JSON.stringify({ exito: false, error: String(err) }), {
        status: 502,
        headers: construirHeadersCors(origin),
      });
    }
  },
});

console.log(
  localAdminApp
    ? `Backend API híbrido en http://localhost:${PORT} (Admin temas/publicación -> Supabase directo; resto -> ${TARGET})`
    : `Backend API proxy (solo Supabase real) en http://localhost:${PORT} -> ${TARGET}`,
);
