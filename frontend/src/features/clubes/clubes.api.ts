import { peticion, RUTAS_API } from "../../shared/api/api";
import { db } from "@/lib/offline/db";
import { obtenerScopeOffline } from "@/lib/offline/user-scope";
import { estaCacheSocialExpirada } from "./club-cache";
export { CLUB_CACHE_TTL_MS, estaCacheSocialExpirada } from "./club-cache";

async function readCache<T>(key: string): Promise<T | null> {
  const scope = await obtenerScopeOffline();
  if (!scope) return null;
  const entry = await db.clubsCache.get(`${scope}:${key}`);
  if (!entry) return null;
  if (estaCacheSocialExpirada(entry.timestamp)) {
    await db.clubsCache.delete(entry.key);
    return null;
  }
  return entry.data as T;
}
async function writeCache<T>(key: string, value: T): Promise<void> {
  const scope = await obtenerScopeOffline();
  if (!scope) return;
  await db.clubsCache.put({ key: `${scope}:${key}`, data: value, timestamp: Date.now() });
}

async function cachedRequest<T>(key: string, request: () => Promise<T>): Promise<T> {
  if (!navigator.onLine) {
    const cached = await readCache<T>(key);
    if (cached) return cached;
    throw new Error("Conéctate a internet una vez para cargar tus clubes.");
  }
  try {
    const data = await request();
    await writeCache(key, data);
    return data;
  } catch (error) {
    const cached = await readCache<T>(key);
    if (cached) return cached;
    throw error;
  }
}
function requireOnline() {
  if (!navigator.onLine) throw new Error("Esta acción necesita conexión a internet.");
}

export type RolMiembroClub = "propietario" | "lider" | "miembro";

export type Club = {
  id: string;
  nombre: string;
  descripcion: string | null;
  codigo_invitacion: string;
  creado_por: string;
  activo: boolean;
  creado_en: string;
  member_count?: number;
  rol_miembro?: RolMiembroClub;
  unido_en?: string;
};

export type ClubPublico = Omit<Club, "codigo_invitacion">;

export type MiembroClub = {
  miembro_token: string;
  es_actual: boolean;
  rol_miembro: RolMiembroClub;
  unido_en: string;
  apodo: string;
  clave_avatar: string | null;
  url_avatar: string | null;
  xp_total: number;
  xp_semana: number;
  actividades_semana: number;
};

export type ClubDetalle = Club & {
  created_by: { id: string; nombre_visible: string } | null;
  membership: { rol_miembro: RolMiembroClub; unido_en: string };
  members: MiembroClub[];
};

export type MiembroRankingClub = MiembroClub & {
  numero_ranking: number;
};

export type CodigoMetricaReto = "xp_grupal" | "actividades_completadas" | "temas_completados";

export type RetoCooperativo = {
  id: string;
  club_id: string | null;
  nombre: string;
  descripcion: string | null;
  codigo_metrica: CodigoMetricaReto;
  valor_objetivo: number;
  xp_reto: number;
  fecha_inicio: string;
  fecha_fin: string;
  creado_por: string | null;
  creado_en: string;
  progreso_actual: number;
  mi_aporte: number;
  porcentaje: number;
  completado: boolean;
  recompensa_reclamada: boolean;
};

export function listarClubes() {
  return peticion<ClubPublico[]>(RUTAS_API.CLUBES.LISTAR);
}

export function listarMisClubes() {
  return cachedRequest("mine", () => peticion<Club[]>(RUTAS_API.CLUBES.MIOS));
}

export function obtenerClub(idClub: string) {
  return cachedRequest(`detail:${idClub}`, () => peticion<ClubDetalle>(RUTAS_API.CLUBES.DETALLE(idClub)));
}

export function crearClub(datos: { nombre: string; descripcion?: string }) {
  requireOnline();
  return peticion<Club>(RUTAS_API.CLUBES.CREAR, { metodo: "POST", cuerpo: datos });
}

export function actualizarClub(idClub: string, datos: { nombre?: string; descripcion?: string }) {
  requireOnline();
  return peticion<Club>(RUTAS_API.CLUBES.DETALLE(idClub), { metodo: "PATCH", cuerpo: datos });
}

export function regenerarCodigoClub(idClub: string) {
  requireOnline();
  return peticion<Club>(RUTAS_API.CLUBES.REGENERAR_CODIGO(idClub), { metodo: "POST" });
}

export function unirseAClub(datos: { codigo_acceso: string }) {
  requireOnline();
  return peticion<{ unido: boolean; ya_era_miembro: boolean; club: Club }>(RUTAS_API.CLUBES.UNIRSE, {
    metodo: "POST",
    cuerpo: datos,
  });
}

export function salirDeClub(idClub: string) {
  requireOnline();
  return peticion<{ left: true }>(RUTAS_API.CLUBES.SALIR(idClub), { metodo: "POST" });
}

export function archivarClub(idClub: string) {
  requireOnline();
  return peticion<{ archived: true }>(RUTAS_API.CLUBES.DETALLE(idClub), { metodo: "DELETE" });
}

export function quitarMiembroClub(idClub: string, miembroToken: string) {
  requireOnline();
  return peticion<{ removed: true }>(RUTAS_API.CLUBES.MIEMBRO(idClub, miembroToken), { metodo: "DELETE" });
}

export function transferirLiderazgoClub(idClub: string, miembroToken: string) {
  requireOnline();
  return peticion<{ transferred: true }>(RUTAS_API.CLUBES.TRANSFERIR(idClub), {
    metodo: "POST",
    cuerpo: { miembro_token: miembroToken },
  });
}

export function obtenerRankingClub(idClub: string) {
  return cachedRequest(`ranking:${idClub}`, () => peticion<MiembroRankingClub[]>(RUTAS_API.CLUBES.RANKING(idClub)));
}

export function listarRetosClub(idClub: string) {
  return cachedRequest(`challenges:${idClub}`, () => peticion<RetoCooperativo[]>(RUTAS_API.CLUBES.RETOS(idClub)));
}

export function crearRetoCooperativo(
  idClub: string,
  datos: {
    nombre: string;
    descripcion?: string;
    codigo_metrica: CodigoMetricaReto;
    valor_objetivo: number;
    xp_reto?: number;
    fecha_inicio: string;
    fecha_fin: string;
  },
) {
  requireOnline();
  return peticion<RetoCooperativo>(RUTAS_API.CLUBES.RETOS(idClub), {
    metodo: "POST",
    cuerpo: { xp_reto: 100, ...datos },
  });
}

export function reclamarRecompensaReto(idClub: string, retoId: string) {
  requireOnline();
  return peticion<{ reclamado: boolean; ya_reclamada: boolean; xp_otorgada: number }>(
    RUTAS_API.CLUBES.RECLAMAR_RETO(idClub, retoId),
    { metodo: "POST" },
  );
}

export type CategoriaReporteClub = "contenido_inapropiado" | "acoso" | "datos_personales" | "otro";

export function reportarEnClub(idClub: string, datos: { miembro_token: string; categoria: CategoriaReporteClub; detalle?: string }) {
  requireOnline();
  return peticion<{ id: string }>(RUTAS_API.CLUBES.REPORTES(idClub), { metodo: "POST", cuerpo: datos });
}
