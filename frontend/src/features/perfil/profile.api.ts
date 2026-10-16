import { peticion } from "../../shared/api/api";
import { RUTAS_API } from "../../shared/api/rutas-api";
import type { Perfil, Usuario } from "../../shared/api/api";
import { db, type PerfilLocal } from "@/lib/offline/db";
import { obtenerScopeOffline } from "@/lib/offline/user-scope";
import { claveCacheScope } from "@/lib/offline/scoped-cache";

const CACHE_KEY_PROGRESO = "semillas_progreso_cache_v1";

export async function obtenerMiPerfil() {
  if (!navigator.onLine) return obtenerPerfilLocalOError();

  try {
    const respuesta = await peticion<{ usuario: Usuario; perfil: Perfil }>("/perfil");
    await guardarPerfilLocal(respuesta.usuario, respuesta.perfil);
    return respuesta;
  } catch (error) {
    const local = await obtenerPerfilLocal();
    if (local) return local;
    throw error;
  }
}

export type ActualizarPerfilDatos = {
  apodo?: string;
  grupo_edad_id?: string | null;
  url_avatar?: string | null;
  clave_avatar?: string | null;
  prefiere_audio?: boolean;
  tamano_texto_preferido?: string;
};

export async function actualizarPerfil(datos: ActualizarPerfilDatos) {
  const perfil = await peticion<Perfil>("/perfil/actualizar", {
    metodo: "PATCH",
    cuerpo: datos,
  });
  const scopeId = await obtenerScopeOffline();
  const local = scopeId ? await db.perfil.where("scopeId").equals(scopeId).first() : undefined;
  if (local) {
    await db.perfil.update(local.localId, {
      apodo: perfil.apodo,
      grupoEdadId: perfil.grupo_edad_id,
      urlAvatar: perfil.url_avatar,
      claveAvatar: perfil.clave_avatar,
      prefiereAudio: perfil.prefiere_audio,
      tamanoTextoPreferido: perfil.tamano_texto_preferido,
      updatedAt: perfil.actualizado_en ?? new Date().toISOString(),
      syncStatus: "synced",
    });
  }
  return perfil;
}

export type GamificacionMiRespuesta = {
  nivel: {
    usuario_id: string;
    xp_total: number;
    numero_nivel: number;
    nombre_nivel: string;
  } | null;
  logros: Array<{
    usuario_id: string;
    logro_id: string;
    ganado_en: string;
    logro?: {
      id: string;
      codigo: string;
      nombre: string;
      descripcion: string | null;
      codigo_criterio: string;
      valor_criterio: number | null;
      bono_xp: number;
      url_icono: string | null;
      activo: boolean;
      creado_en: string;
    };
  }>;
};

export type ProgresoMiRespuesta = {
  progresos_tema: Array<{
    usuario_id: string;
    tema_id: string;
    estado: string;
    porcentaje: number;
    iniciado_en: string | null;
    completado_en: string | null;
    ultimo_paso_id: string | null;
    actualizado_en: string;
  }>;
  progresos_actividad: Array<{
    usuario_id: string;
    actividad_id: string;
    intentos: number;
    mejor_puntaje: number;
    completado: boolean;
    completado_en: string | null;
    actualizado_en: string;
  }>;
};

export async function obtenerMiProgreso(): Promise<ProgresoMiRespuesta> {
  if (!navigator.onLine) {
    const local = await leerCacheProgreso();
    if (local) return local;
    return { progresos_tema: [], progresos_actividad: [] };
  }

  try {
    const data = await peticion<ProgresoMiRespuesta>("/progreso/mi");
    await guardarCacheProgreso(data);
    return data;
  } catch (error) {
    const local = await leerCacheProgreso();
    if (local) return local;
    throw error;
  }
}

export function obtenerMiGamificacion() {
  return peticion<GamificacionMiRespuesta>("/gamificacion/mi");
}

export function reclamarCuentaInvitada() {
  return peticion<{ vinculada: boolean; usuario: Usuario }>(RUTAS_API.PERFIL.VINCULAR_CUENTA, {
    metodo: "POST",
  });
}

async function guardarCacheProgreso(data: ProgresoMiRespuesta): Promise<void> {
  const clave = claveCacheScope(CACHE_KEY_PROGRESO, await obtenerScopeOffline());
  if (!clave) return;
  try {
    localStorage.setItem(clave, JSON.stringify({ data, savedAt: new Date().toISOString() }));
  } catch {
    // localStorage puede estar lleno o bloqueado; no es crítico
  }
}

async function leerCacheProgreso(): Promise<ProgresoMiRespuesta | null> {
  const clave = claveCacheScope(CACHE_KEY_PROGRESO, await obtenerScopeOffline());
  if (!clave) return null;
  try {
    const raw = localStorage.getItem(clave);
    if (raw) {
      const parsed = JSON.parse(raw) as { data?: ProgresoMiRespuesta };
      if (parsed.data) return parsed.data;
    }
  } catch {
    // cache corrupto, ignorar
  }
  return null;
}

async function guardarPerfilLocal(usuario: Usuario, perfil: Perfil | null): Promise<void> {
  const now = new Date().toISOString();
  const scopeId = usuario.proveedor === "invitado" ? `invitado:${usuario.id}` : `usuario:${usuario.id}`;
  const existing = await db.perfil.where("usuarioId").equals(usuario.id).first();
  const registro: PerfilLocal = {
    localId: existing?.localId ?? perfil?.id ?? crypto.randomUUID(),
    serverId: perfil?.id || undefined,
    usuarioId: usuario.id,
    usuarioRol: usuario.rol,
    usuarioProveedor: usuario.proveedor,
    usuarioNombreVisible: usuario.nombre_visible,
    usuarioCorreo: usuario.correo,
    apodo: perfil?.apodo ?? usuario.nombre_visible,
    grupoEdadId: perfil?.grupo_edad_id ?? null,
    urlAvatar: perfil?.url_avatar ?? null,
    claveAvatar: perfil?.clave_avatar ?? null,
    prefiereAudio: perfil?.prefiere_audio ?? true,
    tamanoTextoPreferido: perfil?.tamano_texto_preferido ?? "mediano",
    createdAt: perfil?.creado_en ?? existing?.createdAt ?? now,
    updatedAt: perfil?.actualizado_en ?? now,
    syncStatus: "synced",
    scopeId,
  };
  await db.perfil.put(registro);
}

async function obtenerPerfilLocal() {
  const scopeId = await obtenerScopeOffline();
  const local = scopeId ? await db.perfil.where("scopeId").equals(scopeId).first() : undefined;
  if (!local) return null;
  return {
    usuario: {
      id: local.usuarioId,
      rol: local.usuarioRol,
      proveedor: local.usuarioProveedor,
      nombre_visible: local.usuarioNombreVisible,
      correo: local.usuarioCorreo,
    } satisfies Usuario,
    perfil: {
      id: local.serverId ?? local.localId,
      usuario_id: local.usuarioId,
      apodo: local.apodo,
      grupo_edad_id: local.grupoEdadId,
      url_avatar: local.urlAvatar,
      clave_avatar: local.claveAvatar,
      prefiere_audio: local.prefiereAudio,
      tamano_texto_preferido: local.tamanoTextoPreferido,
      creado_en: local.createdAt,
      actualizado_en: local.updatedAt,
    } satisfies Perfil,
  };
}

async function obtenerPerfilLocalOError() {
  const local = await obtenerPerfilLocal();
  if (!local) throw new Error("Abre Semillas con conexión al menos una vez antes de usar tu perfil offline.");
  return local;
}
