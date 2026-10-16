import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  obtenerGamificacionPropia,
  reclamarLogroApi,
  type LogroGamificacion,
  type ReglaNivelGamificacion,
  type GamificacionPropia,
} from "../../gamification/gamification.api";
import type { CategoriaLogro } from "../../gamification/componentes/logros-tabs-filter";
import { crearTarjetaInsignia, descargarTarjetaInsignia } from "../utils/crear-tarjeta-insignia";

/**
 * Fallback alineado con los INSERT iniciales del SQL de Semillas.
 * La fuente preferida es `catalogo_logros` entregada por la API.
 */
const LOGROS_FALLBACK: LogroGamificacion[] = [
  {
    id: "fallback-primera-leccion",
    codigo: "primera_leccion",
    nombre: "Primer paso",
    descripcion: "Completaste tu primera lección.",
    url_icono: null,
    codigo_criterio: "temas_completados",
    valor_criterio: 1,
    bono_xp: 20,
    activo: true,
    creado_en: "",
  },
  {
    id: "fallback-racha-siete-dias",
    codigo: "racha_siete_dias",
    nombre: "Semilla constante",
    descripcion: "Mantén una racha de 7 días seguidos.",
    url_icono: null,
    codigo_criterio: "dias_racha",
    valor_criterio: 7,
    bono_xp: 50,
    activo: true,
    creado_en: "",
  },
  {
    id: "fallback-explorador-palabra",
    codigo: "explorador_palabra",
    nombre: "Explorador de la Palabra",
    descripcion: "Completa 10 actividades en total.",
    url_icono: null,
    codigo_criterio: "actividades_completadas",
    valor_criterio: 10,
    bono_xp: 50,
    activo: true,
    creado_en: "",
  },
];

/** Fallback alineado con `regla_nivel` del SQL. */
const REGLAS_NIVEL_FALLBACK: ReglaNivelGamificacion[] = [
  { numero_nivel: 1, nombre: "Brote", xp_minima: 0 },
  { numero_nivel: 2, nombre: "Raíz", xp_minima: 100 },
  { numero_nivel: 3, nombre: "Tallo", xp_minima: 250 },
  { numero_nivel: 4, nombre: "Rama", xp_minima: 500 },
  { numero_nivel: 5, nombre: "Árbol", xp_minima: 1000 },
  { numero_nivel: 6, nombre: "Cosecha", xp_minima: 2000 },
  { numero_nivel: 7, nombre: "Explorador", xp_minima: 3000 },
];

export type InsigniaPresentacion = LogroGamificacion & {
  criterio: string;
  /** true = el logro existe en logro_usuario (desbloqueado o reclamado) */
  obtenido: boolean;
  /** true = desbloqueado pero NO reclamado aún */
  pendienteReclamar: boolean;
  ganadoEn: string | null;
  reclamadoEn: string | null;
};

export function useLogrosPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<CategoriaLogro>("todas");
  const [sharedBadge, setSharedBadge] = useState<string | null>(null);
  // Estado del modal de celebración
  const [modalCelebracion, setModalCelebracion] = useState<{
    nombre: string;
    bonoXp: number;
    imagen: string;
  } | null>(null);

  const query = useQuery({
    queryKey: ["gamification", "me"],
    queryFn: obtenerGamificacionPropia,
    staleTime: 1000 * 60 * 3,
  });

  const reclamarMutation = useMutation({
    mutationFn: (logroId: string) => reclamarLogroApi(logroId),
    onSuccess: (data, logroId) => {
      // Actualización optimista de la cache para quitar el punto rojo de inmediato
      queryClient.setQueryData<GamificacionPropia>(["gamification", "me"], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pendientes_reclamar: Math.max(0, (oldData.pendientes_reclamar ?? 0) - 1),
          logros: oldData.logros.map((l) =>
            l.logro_id === logroId ? { ...l, reclamado_en: new Date().toISOString() } : l
          ),
          nivel: oldData.nivel
            ? { ...oldData.nivel, xp_total: oldData.nivel.xp_total + data.bono_xp }
            : null,
        };
      });

      // Invalidar para refrescar asíncronamente desde el backend
      void queryClient.invalidateQueries({ queryKey: ["gamification", "me"] });
      // Limpiar cache local storage de gamificación
      localStorage.removeItem("semillas_gamification_cache_v1");

      // Buscar la imagen de la insignia reclamada en el catálogo actual
      const insignia = insigniasCompletas.find((i) => i.id === logroId);
      const imagen = insignia
        ? (insignia.url_icono ?? "")
        : "";

      // Mostrar modal de celebración con la insignia y el bono XP
      setModalCelebracion({
        nombre: data.nombre,
        bonoXp: data.bono_xp,
        imagen,
      });

      console.log(`🏅 ¡Logro "${data.nombre}" reclamado! +${data.bono_xp} XP`);
    },
    onError: (error) => {
      console.error("Error al reclamar logro:", error);
      toast.error(error instanceof Error ? error.message : "No se pudo reclamar el logro.");
    },
  });

  const nivel = query.data?.nivel;
  const logrosObtenidos = query.data?.logros ?? [];
  const catalogo = useMemo(
    () => (query.data?.catalogo_logros?.length ? query.data.catalogo_logros : LOGROS_FALLBACK).filter((logro) => logro.activo),
    [query.data?.catalogo_logros],
  );

  const reglasNivel = useMemo(
    () => (query.data?.reglas_nivel?.length ? query.data.reglas_nivel : REGLAS_NIVEL_FALLBACK).slice().sort((a, b) => a.xp_minima - b.xp_minima),
    [query.data?.reglas_nivel],
  );

  const xpInfo = useMemo(() => {
    const xpTotal = nivel?.xp_total ?? 0;
    const reglaActual =
      reglasNivel
        .filter((regla) => regla.xp_minima <= xpTotal)
        .at(-1) ?? reglasNivel[0] ?? REGLAS_NIVEL_FALLBACK[0]!;
    const siguienteRegla = reglasNivel.find((regla) => regla.xp_minima > xpTotal) ?? null;
    const tramo = siguienteRegla ? siguienteRegla.xp_minima - reglaActual.xp_minima : 1;
    const avance = Math.max(0, xpTotal - reglaActual.xp_minima);
    const porcentaje = siguienteRegla ? Math.min(100, Math.round((avance / tramo) * 100)) : 100;

    return {
      xpTotal,
      numNivel: nivel?.numero_nivel ?? reglaActual.numero_nivel,
      nombreNivel: nivel?.nombre_nivel || reglaActual.nombre,
      xpRestantes: siguienteRegla ? Math.max(0, siguienteRegla.xp_minima - xpTotal) : 0,
      porcentaje,
      nombreSiguienteNivel: siguienteRegla?.nombre ?? null,
      esNivelMaximo: siguienteRegla === null,
    };
  }, [nivel, reglasNivel]);

  const insigniasCompletas = useMemo<InsigniaPresentacion[]>(() => {
    // Mapa: codigo → registro del logro del usuario (incluye reclamado_en)
    const obtenidosPorCodigo = new Map(
      logrosObtenidos
        .filter((registro) => registro.logro?.codigo)
        .map((registro) => [registro.logro!.codigo, registro]),
    );

    const mapeadas = catalogo.map((logro) => {
      const registro = obtenidosPorCodigo.get(logro.codigo);
      const obtenido = Boolean(registro);
      const reclamadoEn = registro?.reclamado_en ?? null;
      // pendienteReclamar: desbloqueado pero reclamado_en = null
      const pendienteReclamar = obtenido && reclamadoEn === null;

      // Quitamos del mapa los que ya procesamos
      if (registro) obtenidosPorCodigo.delete(logro.codigo);

      return {
        ...logro,
        id: registro ? registro.logro_id : logro.id,
        criterio: construirCriterio(logro.codigo_criterio, logro.valor_criterio),
        obtenido,
        pendienteReclamar,
        ganadoEn: registro?.ganado_en ?? null,
        reclamadoEn,
      };
    });

    // Agregar los obtenidos que NO están en el catálogo (por ejemplo, porque el catálogo
    // falló o no se cargó y solo tenemos el LOGROS_FALLBACK, pero la DB tiene más logros)
    const extras: InsigniaPresentacion[] = Array.from(obtenidosPorCodigo.values()).map((registro) => {
      const logro = registro.logro!;
      const reclamadoEn = registro.reclamado_en ?? null;
      return {
        ...logro,
        id: registro.logro_id,
        criterio: construirCriterio(logro.codigo_criterio, logro.valor_criterio),
        obtenido: true,
        pendienteReclamar: reclamadoEn === null,
        ganadoEn: registro.ganado_en,
        reclamadoEn,
      };
    });

    return [...mapeadas, ...extras];
  }, [catalogo, logrosObtenidos]);

  /** Filtrado por pestaña activa */
  const insignias = useMemo(() => {
    if (activeTab === "obtenidas") {
      // "Obtenidas" incluye tanto las reclamadas como las pendientes de reclamar
      return insigniasCompletas.filter((insignia) => insignia.obtenido);
    }
    if (activeTab === "pendientes") return insigniasCompletas.filter((insignia) => !insignia.obtenido);
    return insigniasCompletas;
  }, [activeTab, insigniasCompletas]);

  const resumen = useMemo(() => {
    const obtenidas = insigniasCompletas.filter((insignia) => insignia.obtenido).length;
    return {
      total: insigniasCompletas.length,
      obtenidas,
      pendientes: Math.max(0, insigniasCompletas.length - obtenidas),
    };
  }, [insigniasCompletas]);

  const primerLogroObtenido = insigniasCompletas.find((insignia) => insignia.obtenido && insignia.reclamadoEn !== null) ?? null;
  const proximaInsignia = insigniasCompletas.find((insignia) => !insignia.obtenido) ?? null;

  const handleReclamar = (logroId: string) => {
    reclamarMutation.mutate(logroId);
  };

  const cerrarModalCelebracion = () => setModalCelebracion(null);

  const handleShare = async (badgeNombre: string, imagenUrl: string) => {
    const texto = `¡Obtuve la insignia "${badgeNombre}" en Semillas!`;
    try {
      const archivo = await crearTarjetaInsignia(badgeNombre, imagenUrl);
      const puedeCompartirArchivo =
        typeof navigator.share === "function" &&
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [archivo] });

      if (puedeCompartirArchivo) {
        await navigator.share({
          title: "Mi logro en Semillas",
          text: texto,
          files: [archivo],
        });
      } else {
        descargarTarjetaInsignia(archivo);
      }

      setSharedBadge(badgeNombre);
      window.setTimeout(() => setSharedBadge(null), 2000);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      console.error("No se pudo compartir la insignia", error);
    }
  };

  return {
    query,
    xpInfo,
    insignias,
    resumen,
    primerLogroObtenido,
    proximaInsignia,
    activeTab,
    setActiveTab,
    sharedBadge,
    handleShare,
    handleReclamar,
    reclamandoId: reclamarMutation.isPending ? reclamarMutation.variables : null,
    modalCelebracion,
    cerrarModalCelebracion,
    insigniasCompletas,
  };
}

function construirCriterio(codigo: string, valor: number | null): string {
  const cantidad = valor ?? 1;
  switch (codigo) {
    case "temas_completados":
      return `Completa ${cantidad} ${cantidad === 1 ? "tema" : "temas"}`;
    case "actividades_completadas":
      return `Completa ${cantidad} actividades`;
    case "dias_racha":
      return `${cantidad} días de racha`;
    default:
      return "Sigue aprendiendo para desbloquearla";
  }
}
