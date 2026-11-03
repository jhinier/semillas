import type { GamificationRepository } from "../gamification.repository";

type LogroFila = {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  codigoCriterio?: string;
  codigo_criterio?: string;
  valorCriterio?: number | null;
  valor_criterio?: number | null;
  bonoXp?: number;
  bono_xp?: number;
  urlIcono?: string | null;
  url_icono?: string | null;
  activo: boolean;
  creadoEn?: Date | string;
  creado_en?: Date | string;
};

type LogroUsuarioFila = {
  usuario_id: string;
  logro_id: string;
  ganado_en: Date;
  reclamado_en: Date | null;
  logro: LogroFila | null;
};

type ReglaNivelFila = {
  numeroNivel: number;
  nombre: string;
  xpMinima: number;
};

function serializarLogro(logro: LogroFila | Record<string, unknown>) {
  const raw = logro as Record<string, unknown>;
  const codigoCriterio = raw.codigo_criterio ?? raw.codigoCriterio ?? "";
  const valorCriterioRaw = raw.valor_criterio ?? raw.valorCriterio;
  const bonoXpRaw = raw.bono_xp ?? raw.bonoXp ?? 0;
  const urlIconoRaw = raw.url_icono ?? raw.urlIcono ?? null;
  const creadoEnRaw = raw.creado_en ?? raw.creadoEn;
  const creadoEnStr =
    creadoEnRaw instanceof Date
      ? creadoEnRaw.toISOString()
      : typeof creadoEnRaw === "string"
        ? creadoEnRaw
        : "";

  return {
    id: String(raw.id ?? ""),
    codigo: String(raw.codigo ?? ""),
    nombre: String(raw.nombre ?? ""),
    descripcion: (raw.descripcion ?? null) as string | null,
    codigo_criterio: String(codigoCriterio),
    valor_criterio:
      valorCriterioRaw !== null && valorCriterioRaw !== undefined
        ? Number(valorCriterioRaw)
        : null,
    bono_xp: Number(bonoXpRaw),
    url_icono: (urlIconoRaw ?? null) as string | null,
    activo: Boolean(raw.activo ?? true),
    creado_en: creadoEnStr,
  };
}

export function crearCasoObtenerMiGamificacion(repositorio: GamificationRepository) {
  return async function obtenerMiGamificacion(usuarioId: string) {
    const listarCatalogo =
      "listarCatalogoLogrosActivos" in repositorio &&
      typeof repositorio.listarCatalogoLogrosActivos === "function"
        ? repositorio.listarCatalogoLogrosActivos()
        : Promise.resolve([]);

    const [nivel, logros, pendientes_reclamar, reglas_nivel, racha, catalogo] = await Promise.all([
      repositorio.obtenerNivelUsuario(usuarioId),
      repositorio.listarLogrosUsuario(usuarioId),
      repositorio.contarLogrosPendientesReclamar(usuarioId),
      repositorio.listarReglasNivel(),
      repositorio.obtenerRachaUsuario(usuarioId),
      listarCatalogo,
    ]);

    const logrosTipados = logros as LogroUsuarioFila[];
    const reglasTipadas = reglas_nivel as ReglaNivelFila[];
    const catalogoTipado = (Array.isArray(catalogo) ? catalogo : []) as LogroFila[];

    return {
      nivel: nivel
        ? {
            usuario_id: String(nivel.usuario_id ?? ""),
            xp_total: Number(nivel.xp_total ?? 0),
            numero_nivel: Number(nivel.numero_nivel ?? 0),
            nombre_nivel: String(nivel.nombre_nivel ?? "")
          }
        : null,
      logros: logrosTipados.map((logroUsuario) => ({
        usuario_id: String(logroUsuario.usuario_id ?? ""),
        logro_id: String(logroUsuario.logro_id ?? ""),
        ganado_en: logroUsuario.ganado_en.toISOString(),
        reclamado_en: logroUsuario.reclamado_en ? logroUsuario.reclamado_en.toISOString() : null,
        ...(logroUsuario.logro ? { logro: serializarLogro(logroUsuario.logro) } : {})
      })),
      catalogo_logros: catalogoTipado.map((item) => serializarLogro(item)),
      reglas_nivel: reglasTipadas.map((regla) => ({
        numero_nivel: regla.numeroNivel,
        nombre: regla.nombre,
        xp_minima: regla.xpMinima
      })),
      racha: { actual: racha.actual, mejor: racha.mejor },
      pendientes_reclamar,
    };
  };
}
