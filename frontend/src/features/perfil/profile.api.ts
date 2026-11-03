import { peticion } from "../../shared/api/api";
import { RUTAS_API } from "../../shared/api/rutas-api";
import type { GrupoEdad, Perfil, Usuario } from "../../shared/api/api";
import { db, type PerfilLocal } from "@/lib/offline/db";
import { obtenerScopeOffline } from "@/lib/offline/user-scope";
import { claveCacheScope } from "@/lib/offline/scoped-cache";
import { sessionStorageApi } from "../../shared/api/session";
import { GRUPOS_EDAD_OFFLINE } from "../catalog/catalog.api";
import { obtenerGamificacionPropia } from "../gamification/gamification.api";
import { supabase } from "@/shared/auth/supabase";

const CACHE_KEY_PROGRESO = "semillas_progreso_cache_v1";
const CACHE_KEY_PERFIL = "semillas_perfil_cache_v1";
const LAST_SCOPE_KEY = "semillas_last_scope_id";

export type MiPerfilRespuesta = {
  usuario: Usuario;
  perfil: Perfil;
  grupos_edad?: GrupoEdad[];
};

export async function resolverPerfilDesdeSupabase(): Promise<MiPerfilRespuesta | null> {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) return null;

    const authUser = session.user;

    // 1. Intentar consultar usuario_app en Supabase
    let usuarioDb: {
      id?: string;
      rol?: string;
      proveedor?: string;
      nombre_visible?: string;
      correo?: string | null;
    } | null = null;

    try {
      const { data, error } = await supabase
        .from("usuario_app")
        .select("id, rol, proveedor, nombre_visible, correo")
        .or(`id.eq.${authUser.id},id_externo.eq.${authUser.id},correo.eq.${authUser.email}`)
        .maybeSingle();
      if (!error && data) usuarioDb = data;
    } catch {
      // Ignorar fallo de RLS o red
    }

    // 2. Determinar rol
    const metaRol =
      (authUser.app_metadata?.rol as string | undefined) ||
      (authUser.app_metadata?.role as string | undefined) ||
      (authUser.user_metadata?.rol as string | undefined) ||
      (authUser.user_metadata?.role as string | undefined);

    const esAdminPorCorreo =
      Boolean(authUser.email && (
        authUser.email.toLowerCase().includes("admin") ||
        authUser.email.toLowerCase().startsWith("admin@")
      ));

    let rol: Usuario["rol"] = "usuario";
    if (
      usuarioDb?.rol === "administrador" ||
      metaRol === "administrador" ||
      metaRol === "admin" ||
      esAdminPorCorreo
    ) {
      rol = "administrador";
    } else if (usuarioDb?.rol === "padre" || metaRol === "padre") {
      rol = "padre";
    }

    // 3. Determinar nombre visible
    const nombreVisible =
      usuarioDb?.nombre_visible ||
      (authUser.user_metadata?.nombre_visible as string | undefined) ||
      (authUser.user_metadata?.full_name as string | undefined) ||
      (authUser.user_metadata?.name as string | undefined) ||
      (authUser.email ? authUser.email.split("@")[0] : null) ||
      (rol === "administrador" ? "Administrador" : "Semillero");

    // 4. Determinar proveedor
    const proveedorRaw =
      usuarioDb?.proveedor ||
      authUser.app_metadata?.provider ||
      "correo";
    const proveedor: Usuario["proveedor"] =
      proveedorRaw === "google" ? "google" : proveedorRaw === "facebook" ? "facebook" : "correo";

    // 5. Consultar perfil en Supabase
    let perfilDb: Partial<Perfil> | null = null;
    try {
      const { data, error } = await supabase
        .from("perfil")
        .select("*")
        .eq("usuario_id", usuarioDb?.id ?? authUser.id)
        .maybeSingle();
      if (!error && data) perfilDb = data;
    } catch {
      // Ignorar fallo de consulta
    }

    const ahora = new Date().toISOString();
    const usuarioId = usuarioDb?.id ?? authUser.id;

    const usuario: Usuario = {
      id: usuarioId,
      rol,
      proveedor,
      nombre_visible: nombreVisible,
      correo: authUser.email ?? null,
    };

    const grupoEdadGuardado =
      (typeof localStorage !== "undefined" ? localStorage.getItem("onboarding_grupo_edad_id") : null) ||
      "semillas";

    const perfil: Perfil = {
      id: perfilDb?.id ?? usuarioId,
      usuario_id: usuarioId,
      apodo: perfilDb?.apodo ?? nombreVisible,
      grupo_edad_id: perfilDb?.grupo_edad_id ?? (rol === "administrador" ? null : grupoEdadGuardado),
      url_avatar: perfilDb?.url_avatar ?? null,
      clave_avatar: perfilDb?.clave_avatar ?? "1",
      prefiere_audio: perfilDb?.prefiere_audio ?? true,
      tamano_texto_preferido:
        (perfilDb?.tamano_texto_preferido as Perfil["tamano_texto_preferido"]) ?? "mediano",
      creado_en: perfilDb?.creado_en ?? ahora,
      actualizado_en: perfilDb?.actualizado_en ?? ahora,
    };

    // Intentar registrar en usuario_app en segundo plano si no existe todavía
    if (!usuarioDb) {
      void supabase
        .from("usuario_app")
        .upsert(
          {
            id: usuarioId,
            id_externo: authUser.id,
            correo: authUser.email,
            nombre_visible: nombreVisible,
            rol,
            proveedor,
            activo: true,
          },
          { onConflict: "id" },
        )
        .then(() => undefined, () => undefined);
    }

    return {
      usuario,
      perfil,
      grupos_edad: GRUPOS_EDAD_OFFLINE,
    };
  } catch {
    return null;
  }
}

export async function obtenerMiPerfil(): Promise<MiPerfilRespuesta> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return obtenerPerfilLocalOSeguro();
  }

  try {
    const respuesta = await peticion<MiPerfilRespuesta>("/perfil");
    await guardarPerfilLocal(respuesta.usuario, respuesta.perfil, respuesta.grupos_edad);
    return {
      ...respuesta,
      grupos_edad: respuesta.grupos_edad?.length ? respuesta.grupos_edad : GRUPOS_EDAD_OFFLINE,
    };
  } catch {
    // Si la API del backend no responde, resolver directamente desde la sesión de Supabase
    const perfilSupabase = await resolverPerfilDesdeSupabase();
    if (perfilSupabase) {
      await guardarPerfilLocal(perfilSupabase.usuario, perfilSupabase.perfil, perfilSupabase.grupos_edad);
      return perfilSupabase;
    }
    return obtenerPerfilLocalOSeguro();
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

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function guardarActualizacionPerfilLocal(datos: ActualizarPerfilDatos): Promise<Perfil> {
  const now = new Date().toISOString();
  const actual = await obtenerPerfilLocalOSeguro();
  const scopeId =
    (await obtenerScopeOffline()) ??
    (actual.usuario.proveedor === "invitado"
      ? `invitado:${actual.usuario.id}`
      : `usuario:${actual.usuario.id}`);

  const grupoEdadFinal =
    datos.grupo_edad_id !== undefined ? datos.grupo_edad_id : actual.perfil.grupo_edad_id;
  const apodoFinal = datos.apodo?.trim() || actual.perfil.apodo || "Semillero";
  const claveAvatarFinal =
    datos.clave_avatar !== undefined
      ? datos.clave_avatar
      : datos.url_avatar && !/^https?:\/\//i.test(datos.url_avatar)
        ? datos.url_avatar
        : actual.perfil.clave_avatar ?? "1";
  const urlAvatarFinal =
    datos.url_avatar && /^https?:\/\//i.test(datos.url_avatar)
      ? datos.url_avatar
      : actual.perfil.url_avatar ?? null;
  const prefiereAudioFinal =
    datos.prefiere_audio !== undefined ? datos.prefiere_audio : actual.perfil.prefiere_audio;
  const tamanoTextoFinal =
    (datos.tamano_texto_preferido as Perfil["tamano_texto_preferido"]) ??
    actual.perfil.tamano_texto_preferido ??
    "mediano";

  const perfilActualizado: Perfil = {
    ...actual.perfil,
    apodo: apodoFinal,
    grupo_edad_id: grupoEdadFinal,
    url_avatar: urlAvatarFinal,
    clave_avatar: claveAvatarFinal,
    prefiere_audio: prefiereAudioFinal,
    tamano_texto_preferido: tamanoTextoFinal,
    actualizado_en: now,
  };

  try {
    const existing =
      (scopeId ? await db.perfil.where("scopeId").equals(scopeId).first() : undefined) ??
      (await db.perfil.where("usuarioId").equals(actual.usuario.id).first());

    const registro: PerfilLocal = {
      localId: existing?.localId ?? actual.perfil.id ?? crypto.randomUUID(),
      serverId: existing?.serverId ?? actual.perfil.id,
      usuarioId: actual.usuario.id,
      usuarioRol: actual.usuario.rol,
      usuarioProveedor: actual.usuario.proveedor,
      usuarioNombreVisible: apodoFinal,
      usuarioCorreo: actual.usuario.correo,
      apodo: apodoFinal,
      grupoEdadId: grupoEdadFinal,
      urlAvatar: urlAvatarFinal,
      claveAvatar: claveAvatarFinal,
      prefiereAudio: prefiereAudioFinal,
      tamanoTextoPreferido: tamanoTextoFinal,
      createdAt: existing?.createdAt ?? actual.perfil.creado_en ?? now,
      updatedAt: now,
      syncStatus: "pending",
      scopeId,
    };
    await db.perfil.put(registro);
  } catch {
    // ignorar fallo de IndexedDB
  }

  try {
    localStorage.setItem(LAST_SCOPE_KEY, scopeId);
    localStorage.setItem(
      CACHE_KEY_PERFIL,
      JSON.stringify({
        usuario: { ...actual.usuario, nombre_visible: apodoFinal },
        perfil: perfilActualizado,
        grupos_edad: actual.grupos_edad ?? GRUPOS_EDAD_OFFLINE,
        savedAt: now,
      }),
    );
  } catch {
    // ignorar
  }

  return perfilActualizado;
}

export async function actualizarPerfil(datos: ActualizarPerfilDatos): Promise<Perfil> {
  const payload: ActualizarPerfilDatos = { ...datos };
  if (payload.url_avatar && !/^https?:\/\//i.test(payload.url_avatar)) {
    payload.clave_avatar = payload.clave_avatar ?? payload.url_avatar;
    payload.url_avatar = null;
  }

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return guardarActualizacionPerfilLocal(datos);
  }

  // Si grupo_edad_id no es UUID (ej. 'semillas' elegido en modo offline), no enviarlo como UUID inválido al backend pero sí guardarlo localmente
  const payloadRemoto: ActualizarPerfilDatos = {
    ...payload,
    grupo_edad_id:
      payload.grupo_edad_id && !UUID_REGEX.test(payload.grupo_edad_id)
        ? undefined
        : payload.grupo_edad_id,
  };

  try {
    const perfil = await peticion<Perfil>("/perfil/actualizar", {
      metodo: "PATCH",
      cuerpo: payloadRemoto,
    });

    await guardarActualizacionPerfilLocal({
      apodo: perfil.apodo,
      grupo_edad_id: perfil.grupo_edad_id ?? datos.grupo_edad_id,
      url_avatar: perfil.url_avatar,
      clave_avatar: perfil.clave_avatar ?? datos.clave_avatar,
      prefiere_audio: perfil.prefiere_audio,
      tamano_texto_preferido: perfil.tamano_texto_preferido,
    });

    return {
      ...perfil,
      grupo_edad_id: perfil.grupo_edad_id ?? datos.grupo_edad_id ?? null,
    };
  } catch {
    return guardarActualizacionPerfilLocal(datos);
  }
}

export type GamificacionMiRespuesta = {
  nivel: {
    usuario_id: string | null;
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
    } | null;
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
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    const local = await leerCacheProgreso();
    if (local) return local;
    return { progresos_tema: [], progresos_actividad: [] };
  }

  try {
    const data = await peticion<ProgresoMiRespuesta>("/progreso/mi");
    await guardarCacheProgreso(data);
    return data;
  } catch {
    const local = await leerCacheProgreso();
    if (local) return local;
    return { progresos_tema: [], progresos_actividad: [] };
  }
}

export async function obtenerMiGamificacion(): Promise<GamificacionMiRespuesta> {
  return obtenerGamificacionPropia();
}

export function reclamarCuentaInvitada() {
  return peticion<{ vinculada: boolean; usuario: Usuario }>(RUTAS_API.PERFIL.VINCULAR_CUENTA, {
    metodo: "POST",
  });
}

async function guardarCacheProgreso(data: ProgresoMiRespuesta): Promise<void> {
  const scope = (await obtenerScopeOffline()) ?? "default";
  const clave = claveCacheScope(CACHE_KEY_PROGRESO, scope);
  if (!clave) return;
  try {
    localStorage.setItem(clave, JSON.stringify({ data, savedAt: new Date().toISOString() }));
  } catch {
    // localStorage puede estar lleno o bloqueado; no es crítico
  }
}

async function leerCacheProgreso(): Promise<ProgresoMiRespuesta | null> {
  const scope = (await obtenerScopeOffline()) ?? "default";
  const clave = claveCacheScope(CACHE_KEY_PROGRESO, scope);
  if (clave) {
    try {
      const raw = localStorage.getItem(clave);
      if (raw) {
        const parsed = JSON.parse(raw) as { data?: ProgresoMiRespuesta };
        if (parsed.data) return parsed.data;
      }
    } catch {
      // cache corrupto, ignorar
    }
  }
  return null;
}

async function guardarPerfilLocal(
  usuario: Usuario,
  perfil: Perfil | null,
  gruposEdad?: GrupoEdad[],
): Promise<void> {
  if (sessionStorageApi.isExplicitlyLoggedOut()) return;
  const now = new Date().toISOString();
  const scopeId =
    usuario.proveedor === "invitado" ? `invitado:${usuario.id}` : `usuario:${usuario.id}`;

  if (usuario.proveedor === "invitado") {
    if (!sessionStorageApi.getGuestUserId()) {
      sessionStorageApi.setGuestUserId(usuario.id);
    }
  } else {
    sessionStorageApi.setAuthUserId(usuario.id);
  }

  const perfilNormalizado: Perfil = {
    id: perfil?.id ?? usuario.id,
    usuario_id: usuario.id,
    apodo: perfil?.apodo ?? usuario.nombre_visible ?? "Semillero",
    grupo_edad_id: perfil?.grupo_edad_id ?? null,
    url_avatar: perfil?.url_avatar ?? null,
    clave_avatar: perfil?.clave_avatar ?? "1",
    prefiere_audio: perfil?.prefiere_audio ?? true,
    tamano_texto_preferido: perfil?.tamano_texto_preferido ?? "mediano",
    creado_en: perfil?.creado_en ?? now,
    actualizado_en: perfil?.actualizado_en ?? now,
  };

  try {
    localStorage.setItem(LAST_SCOPE_KEY, scopeId);
    localStorage.setItem(
      CACHE_KEY_PERFIL,
      JSON.stringify({
        usuario,
        perfil: perfilNormalizado,
        grupos_edad: gruposEdad?.length ? gruposEdad : GRUPOS_EDAD_OFFLINE,
        savedAt: now,
      }),
    );
  } catch {
    // ignorar
  }

  try {
    const existing = await db.perfil.where("usuarioId").equals(usuario.id).first();
    const registro: PerfilLocal = {
      localId: existing?.localId ?? perfil?.id ?? crypto.randomUUID(),
      serverId: perfil?.id || undefined,
      usuarioId: usuario.id,
      usuarioRol: usuario.rol,
      usuarioProveedor: usuario.proveedor,
      usuarioNombreVisible: usuario.nombre_visible,
      usuarioCorreo: usuario.correo,
      apodo: perfilNormalizado.apodo,
      grupoEdadId: perfilNormalizado.grupo_edad_id,
      urlAvatar: perfilNormalizado.url_avatar,
      claveAvatar: perfilNormalizado.clave_avatar ?? "1",
      prefiereAudio: perfilNormalizado.prefiere_audio,
      tamanoTextoPreferido: perfilNormalizado.tamano_texto_preferido,
      createdAt: perfil?.creado_en ?? existing?.createdAt ?? now,
      updatedAt: perfil?.actualizado_en ?? now,
      syncStatus: "synced",
      scopeId,
    };
    await db.perfil.put(registro);
  } catch {
    // ignorar fallo de IndexedDB
  }
}

async function obtenerPerfilLocal(): Promise<MiPerfilRespuesta | null> {
  try {
    const scopeId = await obtenerScopeOffline();
    let local = scopeId ? await db.perfil.where("scopeId").equals(scopeId).first() : undefined;
    // Si estamos en un scope de usuario registrado (usuario:...), NUNCA tomar el perfil de un invitado
    if (!local && (!scopeId || scopeId.startsWith("invitado:"))) {
      const todos = await db.perfil.toArray();
      local = todos
        .filter((p) => (p.scopeId ? p.scopeId.startsWith("invitado:") : false) || p.usuarioRol === "invitado")
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
    }
    if (local) {
      if (scopeId?.startsWith("usuario:") && local.usuarioRol === "invitado") {
        return null;
      }
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
        grupos_edad: GRUPOS_EDAD_OFFLINE,
      };
    }
  } catch {
    // continuar al cache en localStorage
  }

  try {
    const raw = typeof localStorage !== "undefined" ? localStorage.getItem(CACHE_KEY_PERFIL) : null;
    if (raw) {
      const parsed = JSON.parse(raw) as MiPerfilRespuesta;
      const scopeId = await obtenerScopeOffline();
      if (parsed?.usuario && parsed?.perfil) {
        if (scopeId?.startsWith("usuario:") && parsed.usuario.rol === "invitado") {
          return null;
        }
        return {
          ...parsed,
          grupos_edad: parsed.grupos_edad?.length ? parsed.grupos_edad : GRUPOS_EDAD_OFFLINE,
        };
      }
    }
  } catch {
    // ignorar
  }

  return null;
}

async function obtenerPerfilLocalOSeguro(): Promise<MiPerfilRespuesta> {
  const local = await obtenerPerfilLocal();
  if (local) return local;

  const authUserId = sessionStorageApi.getAuthUserId();
  const guestId = sessionStorageApi.getGuestUserId();
  const hasToken = Boolean(sessionStorageApi.getAccessToken());
  const ahora = new Date().toISOString();

  // Si hay un usuario autenticado o token activo, NUNCA inventar rol 'invitado'
  if ((authUserId && !guestId) || hasToken) {
    const idUsuario = authUserId || "usuario-autenticado";
    let rol: Usuario["rol"] = "usuario";
    let nombreVisible = "Semillero";
    let correo: string | null = null;

    try {
      const raw = typeof localStorage !== "undefined" ? localStorage.getItem(CACHE_KEY_PERFIL) : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.usuario?.rol === "administrador") rol = "administrador";
        if (parsed?.usuario?.nombre_visible) nombreVisible = parsed.usuario.nombre_visible;
        if (parsed?.usuario?.correo) correo = parsed.usuario.correo;
      }
    } catch {}

    return {
      usuario: {
        id: idUsuario,
        rol,
        proveedor: "correo",
        nombre_visible: nombreVisible,
        correo,
      },
      perfil: {
        id: idUsuario,
        usuario_id: idUsuario,
        apodo: nombreVisible,
        grupo_edad_id: "semillas",
        url_avatar: null,
        clave_avatar: "1",
        prefiere_audio: true,
        tamano_texto_preferido: "mediano",
        creado_en: ahora,
        actualizado_en: ahora,
      },
      grupos_edad: GRUPOS_EDAD_OFFLINE,
    };
  }

  const idInvitado = guestId || "offline-guest-semillas";
  const grupoEdadGuardado =
    (typeof localStorage !== "undefined" ? localStorage.getItem("onboarding_grupo_edad_id") : null) ||
    "semillas";

  return {
    usuario: {
      id: idInvitado,
      rol: "invitado",
      proveedor: "invitado",
      nombre_visible: "Semillero",
      correo: null,
    },
    perfil: {
      id: idInvitado,
      usuario_id: idInvitado,
      apodo: "Semillero",
      grupo_edad_id: grupoEdadGuardado,
      url_avatar: null,
      clave_avatar: "1",
      prefiere_audio: true,
      tamano_texto_preferido: "mediano",
      creado_en: ahora,
      actualizado_en: ahora,
    },
    grupos_edad: GRUPOS_EDAD_OFFLINE,
  };
}
