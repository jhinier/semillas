import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../db/database.types";
import type {
  CreateAdminUserInput,
  ReportsQueryInput,
  ResolveReviewInput,
  ReviewListQueryInput,
  UpdatePlatformSettingsInput,
} from "./admin.schemas";

type Cliente = SupabaseClient<Database>;
type Dependencias = { supabase: Cliente };

const sinCliente = (supabase: Cliente) => typeof (supabase as unknown as { from?: unknown }).from !== "function";

type ErrorSupabaseLike = { message?: string; code?: string; details?: string | null };

function aErrorReal(error: ErrorSupabaseLike): Error {
  const partes = [error.code, error.message, error.details].filter(Boolean);
  return new Error(partes.length > 0 ? partes.join(": ") : "Error al consultar administración en Supabase");
}

type FilaRevisionDirecta = {
  id: string;
  tema_id: string;
  estado: string;
  notas?: string | null;
  notas_envio?: string | null;
  notas_revision?: string | null;
  creado_en: string;
  revisado_en: string | null;
  tema?: { titulo?: string | null; senda?: { nombre?: string | null } | null } | null;
  enviado?: { nombre_visible?: string | null } | null;
  revisado?: { nombre_visible?: string | null } | null;
};

function mapearRevisionContenido(fila: FilaRevisionDirecta) {
  return {
    id: fila.id,
    tema_id: fila.tema_id,
    estado: fila.estado,
    notas_envio: fila.notas_envio ?? fila.notas ?? null,
    notas_revision: fila.notas_revision ?? null,
    creado_en: fila.creado_en,
    revisado_en: fila.revisado_en,
    titulo: fila.tema?.titulo ?? null,
    senda: fila.tema?.senda?.nombre ?? null,
    enviado_por: fila.enviado?.nombre_visible ?? null,
    revisado_por: fila.revisado?.nombre_visible ?? null,
  };
}

const SELECT_REVISION_DIRECTA =
  "id, tema_id, estado, notas, creado_en, revisado_en, tema:tema_id(titulo, senda:senda_id(nombre)), enviado:enviado_por(nombre_visible), revisado:revisado_por(nombre_visible)";

async function consultarRevisionesDirectas(supabase: Cliente, query: ReviewListQueryInput) {
  let consulta = supabase
    .from("revision_contenido")
    .select(SELECT_REVISION_DIRECTA, { count: "exact" })
    .order("creado_en", { ascending: false });
  if (query.estado !== "todos") consulta = consulta.eq("estado", query.estado);

  const { data, count, error } = query.q
    ? await consulta.limit(500)
    : await consulta.range(query.offset, query.offset + query.limit - 1);
  if (error) throw aErrorReal(error);

  const mapeadas = (data ?? []).map((fila) => mapearRevisionContenido(fila as unknown as FilaRevisionDirecta));
  if (!query.q) {
    return { revisiones: mapeadas, total: count ?? mapeadas.length, limit: query.limit, offset: query.offset };
  }
  const termino = query.q.trim().toLowerCase();
  const filtradas = mapeadas.filter(
    (rev) =>
      rev.titulo?.toLowerCase().includes(termino) ||
      rev.senda?.toLowerCase().includes(termino) ||
      rev.enviado_por?.toLowerCase().includes(termino),
  );
  return {
    revisiones: filtradas.slice(query.offset, query.offset + query.limit),
    total: filtradas.length,
    limit: query.limit,
    offset: query.offset,
  };
}

export function crearAdminGovernanceRepository({ supabase }: Dependencias) {
  return {
    async listarRevisiones(query: ReviewListQueryInput) {
      if (sinCliente(supabase)) return { revisiones: [], total: 0, limit: query.limit, offset: query.offset };
      let consulta = supabase.from("v_admin_revisiones").select("*", { count: "exact" });
      if (query.q) consulta = consulta.or(`titulo.ilike.%${query.q}%,senda.ilike.%${query.q}%`);
      if (query.estado !== "todos") consulta = consulta.eq("estado", query.estado);
      const { data, count, error } = await consulta.range(query.offset, query.offset + query.limit - 1);
      if (!error) {
        return { revisiones: data ?? [], total: count ?? 0, limit: query.limit, offset: query.offset };
      }
      return consultarRevisionesDirectas(supabase, query);
    },

    async obtenerRevision(id: string) {
      if (sinCliente(supabase)) throw new Error("Revisión no encontrada");
      const { data, error } = await supabase.from("v_admin_revisiones").select("*").eq("id", id).maybeSingle();
      if (!error) {
        if (!data) throw new Error("Revisión no encontrada");
        return data;
      }
      const directa = await supabase
        .from("revision_contenido")
        .select(SELECT_REVISION_DIRECTA)
        .eq("id", id)
        .maybeSingle();
      if (directa.error) throw aErrorReal(directa.error);
      if (!directa.data) throw new Error("Revisión no encontrada");
      return mapearRevisionContenido(directa.data as unknown as FilaRevisionDirecta);
    },

    async resolverRevision(id: string, input: ResolveReviewInput, adminId: string) {
      if (sinCliente(supabase)) throw new Error("Revisión no encontrada");
      const revision = await this.obtenerRevision(id);
      const ahora = new Date().toISOString();
      const { data, error } = await supabase.from("revision_contenido").update({
        estado: input.estado,
        notas_revision: input.notas ?? null,
        revisado_por: adminId,
        revisado_en: ahora,
      }).eq("id", id).select("id, tema_id, estado, notas, creado_en, revisado_en").single();

      let filaActualizada: Record<string, unknown> | null = data as Record<string, unknown> | null;
      if (error) {
        if (error.code === "42703" || error.code === "PGRST204") {
          const respaldo = await supabase.from("revision_contenido").update({
            estado: input.estado,
            notas: input.notas ?? null,
            revisado_por: adminId,
            revisado_en: ahora,
          }).eq("id", id).select("id, tema_id, estado, notas, creado_en, revisado_en").single();
          if (respaldo.error) throw aErrorReal(respaldo.error);
          filaActualizada = respaldo.data as Record<string, unknown> | null;
        } else {
          throw aErrorReal(error);
        }
      }

      if (revision.tema_id) {
        const estadoTema = input.estado === "aprobado" ? "aprobado" : "borrador";
        await supabase.from("tema").update({ estado: estadoTema, actualizado_en: ahora }).eq("id", revision.tema_id);
      }
      return { ...revision, ...(filaActualizada ?? {}), notas_revision: input.notas ?? revision.notas_revision ?? null };
    },

    async obtenerReportes(query: ReportsQueryInput) {
      if (sinCliente(supabase)) {
        return {
          desde: query.desde,
          hasta: query.hasta,
          rango: { desde: query.desde, hasta: query.hasta },
          usuarios_activos: 0,
          temas_publicados: 0,
          actividades_completadas: 0,
          metricas: {
            usuarios_activos: 0,
            usuarios_nuevos: 0,
            temas_completados: 0,
            actividades_completadas: 0,
            xp_otorgada: 0,
            precision_respuestas: 0,
            clubes_activos: 0,
            temas_publicados: 0,
          },
          actividad_diaria: [],
          temas_destacados: [],
          distribucion_roles: {},
          revision_editorial: {
            por_estado: { borrador: 0, revision: 0, aprobado: 0, publicado: 0, archivado: 0 },
            tiempo_promedio_horas: 0,
            total: 0,
          },
          muestra_limitada: false,
        };
      }
      const desdeIso = `${query.desde}T00:00:00.000Z`;
      const hastaIso = `${query.hasta}T23:59:59.999Z`;
      const [
        usuarios,
        temas,
        actividades,
        usuariosNuevosRes,
        temasCompletadosRes,
        clubesActivosRes,
        rolesRes,
        temasEstadoRes,
        eventosRes,
      ] = await Promise.all([
        supabase.from("usuario_app").select("id", { count: "exact", head: true }).gte("ultimo_login_en", desdeIso).lte("ultimo_login_en", hastaIso),
        supabase.from("tema").select("id", { count: "exact", head: true }).eq("estado", "publicado").gte("publicado_en", query.desde).lte("publicado_en", query.hasta),
        supabase.from("progreso_actividad_usuario").select("actividad_id", { count: "exact", head: true }).gte("completado_en", desdeIso).lte("completado_en", hastaIso),
        supabase.from("usuario_app").select("id", { count: "exact", head: true }).gte("creado_en", desdeIso).lte("creado_en", hastaIso),
        supabase.from("progreso_tema_usuario").select("tema_id", { count: "exact", head: true }).eq("estado", "completado").gte("completado_en", desdeIso).lte("completado_en", hastaIso),
        supabase.from("club").select("id", { count: "exact", head: true }).eq("activo", true),
        supabase.from("usuario_app").select("rol").limit(1000),
        supabase.from("tema").select("id, titulo, estado").limit(1000),
        supabase.from("evento_progreso").select("ocurrido_en_cliente, usuario_id, tipo_evento, tema_id, correcta, xp_otorgada").gte("ocurrido_en_cliente", desdeIso).lte("ocurrido_en_cliente", hastaIso).limit(2000),
      ]);
      for (const resultado of [usuarios, temas, actividades]) {
        if (resultado.error) throw aErrorReal(resultado.error);
      }

      const countUsuarios = usuarios.count ?? 0;
      const countTemas = temas.count ?? 0;
      const countActividades = actividades.count ?? 0;
      const countUsuariosNuevos = usuariosNuevosRes.error ? 0 : (usuariosNuevosRes.count ?? 0);
      const countTemasCompletados = temasCompletadosRes.error ? 0 : (temasCompletadosRes.count ?? 0);
      const countClubesActivos = clubesActivosRes.error ? 0 : (clubesActivosRes.count ?? 0);

      const distribucionRoles: Record<string, number> = {};
      if (!rolesRes.error && Array.isArray(rolesRes.data)) {
        for (const fila of rolesRes.data) {
          const rol = fila.rol || "usuario";
          distribucionRoles[rol] = (distribucionRoles[rol] ?? 0) + 1;
        }
      }

      const porEstado: Record<string, number> = { borrador: 0, revision: 0, aprobado: 0, publicado: 0, archivado: 0 };
      const titulosTemas = new Map<string, string>();
      let totalTemasEstado = 0;
      if (!temasEstadoRes.error && Array.isArray(temasEstadoRes.data)) {
        totalTemasEstado = temasEstadoRes.data.length;
        for (const fila of temasEstadoRes.data) {
          porEstado[fila.estado] = (porEstado[fila.estado] ?? 0) + 1;
          titulosTemas.set(fila.id, fila.titulo);
        }
      } else {
        porEstado.publicado = countTemas;
      }

      let xpOtorgada = 0;
      let respuestasTotales = 0;
      let respuestasCorrectas = 0;
      const mapaDiario = new Map<string, { eventos: number; usuarios: Set<string>; xp: number }>();
      const mapaTemas = new Map<string, { eventos: number; completados: number; usuarios: Set<string> }>();
      const listaEventos = !eventosRes.error && Array.isArray(eventosRes.data) ? eventosRes.data : [];

      for (const ev of listaEventos) {
        const xp = typeof ev.xp_otorgada === "number" ? ev.xp_otorgada : 0;
        xpOtorgada += xp;
        if (typeof ev.correcta === "boolean") {
          respuestasTotales += 1;
          if (ev.correcta) respuestasCorrectas += 1;
        }
        const fecha = typeof ev.ocurrido_en_cliente === "string" ? ev.ocurrido_en_cliente.slice(0, 10) : "";
        if (fecha) {
          const actual = mapaDiario.get(fecha) ?? { eventos: 0, usuarios: new Set<string>(), xp: 0 };
          actual.eventos += 1;
          actual.xp += xp;
          if (ev.usuario_id) actual.usuarios.add(ev.usuario_id);
          mapaDiario.set(fecha, actual);
        }
        if (ev.tema_id) {
          const temaStat = mapaTemas.get(ev.tema_id) ?? { eventos: 0, completados: 0, usuarios: new Set<string>() };
          temaStat.eventos += 1;
          if (ev.tipo_evento === "tema_completado") temaStat.completados += 1;
          if (ev.usuario_id) temaStat.usuarios.add(ev.usuario_id);
          mapaTemas.set(ev.tema_id, temaStat);
        }
      }

      const actividadDiaria = Array.from(mapaDiario.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([fecha, datos]) => ({
          fecha,
          eventos: datos.eventos,
          usuarios: datos.usuarios.size,
          xp: datos.xp,
        }));

      const temasDestacados = Array.from(mapaTemas.entries())
        .sort(([, a], [, b]) => b.eventos - a.eventos)
        .slice(0, 5)
        .map(([id, datos]) => ({
          id,
          titulo: titulosTemas.get(id) ?? "Tema sin título",
          eventos: datos.eventos,
          completados: datos.completados,
          usuarios: datos.usuarios.size,
        }));

      const precisionRespuestas = respuestasTotales > 0 ? Math.round((respuestasCorrectas / respuestasTotales) * 100) : 0;

      return {
        desde: query.desde,
        hasta: query.hasta,
        rango: { desde: query.desde, hasta: query.hasta },
        usuarios_activos: countUsuarios,
        temas_publicados: countTemas,
        actividades_completadas: countActividades,
        metricas: {
          usuarios_activos: countUsuarios,
          usuarios_nuevos: countUsuariosNuevos,
          temas_completados: countTemasCompletados,
          actividades_completadas: countActividades,
          xp_otorgada: xpOtorgada,
          precision_respuestas: precisionRespuestas,
          clubes_activos: countClubesActivos,
          temas_publicados: countTemas,
        },
        actividad_diaria: actividadDiaria,
        temas_destacados: temasDestacados,
        distribucion_roles: distribucionRoles,
        revision_editorial: {
          por_estado: porEstado,
          tiempo_promedio_horas: 0,
          total: totalTemasEstado,
        },
        muestra_limitada: listaEventos.length >= 2000,
      };
    },

    async actualizarAjustes(input: UpdatePlatformSettingsInput, adminId: string) {
      const valores = [
        ["nombre_plataforma", input.nombre_plataforma], ["correo_soporte", input.correo_soporte], ["zona_horaria", input.zona_horaria],
        ["notas_obligatorias_cambios", input.notas_obligatorias_cambios], ["notas_obligatorias_rechazo", input.notas_obligatorias_rechazo],
      ] as const;
      if (sinCliente(supabase)) return { id: "principal", ...input, actualizado_por: adminId };
      const { error } = await supabase.from("configuracion_plataforma").upsert(valores.map(([clave, valor]) => ({ clave, categoria: "administracion", valor, actualizado_por: adminId })), { onConflict: "clave" });
      if (error) throw aErrorReal(error);
      return { id: "principal", ...input };
    },

    async crearUsuario(input: CreateAdminUserInput, adminId: string) {
      if (sinCliente(supabase)) return { id: `pending-${adminId}`, correo: input.correo, nombre_visible: input.nombre_visible, rol: input.rol };
      const { data, error } = await supabase.auth.admin.createUser({ email: input.correo, password: input.password, email_confirm: input.confirmar_correo, user_metadata: { nombre_visible: input.nombre_visible } });
      if (error) throw aErrorReal(error);
      return { id: data.user?.id, correo: input.correo, nombre_visible: input.nombre_visible, rol: input.rol };
    },
  };
}
