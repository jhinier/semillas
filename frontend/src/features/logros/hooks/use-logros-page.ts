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

const LOGROS_FALLBACK: LogroGamificacion[] = [
  {
    id: "fallback-primera-leccion",
    codigo: "primera_leccion",
    nombre: "Primer paso",
    descripcion: "Se otorga al completar tu primer tema bíblico completo en Semillas.",
    url_icono: null,
    codigo_criterio: "temas_completados",
    valor_criterio: 1,
    bono_xp: 20,
    activo: true,
    creado_en: "",
  },
  {
    id: "fallback-amor-de-dios",
    codigo: "tema-amor-de-dios",
    nombre: "El Amor de Dios",
    descripcion: "Se otorga al completar los 6 pasos CRECER y las actividades del tema «El Amor de Dios».",
    url_icono: null,
    codigo_criterio: "temas_completados",
    valor_criterio: 1,
    bono_xp: 25,
    activo: true,
    creado_en: "",
  },
  {
    id: "fallback-explorador-palabra",
    codigo: "explorador_palabra",
    nombre: "Explorador de la Palabra",
    descripcion: "Se otorga al resolver correctamente 10 actividades interactivas en tus lecciones.",
    url_icono: null,
    codigo_criterio: "actividades_completadas",
    valor_criterio: 10,
    bono_xp: 50,
    activo: true,
    creado_en: "",
  },
  {
    id: "fallback-racha-siete-dias",
    codigo: "racha_siete_dias",
    nombre: "Semilla constante",
    descripcion: "Se otorga por mantener una racha de aprendizaje durante 7 días seguidos.",
    url_icono: null,
    codigo_criterio: "dias_racha",
    valor_criterio: 7,
    bono_xp: 50,
    activo: true,
    creado_en: "",
  },
];

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
  obtenido: boolean;
  pendienteReclamar: boolean;
  ganadoEn: string | null;
  reclamadoEn: string | null;
};

export function useLogrosPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<CategoriaLogro>("todas");
  const [sharedBadge, setSharedBadge] = useState<string | null>(null);
  const [modalCelebracion, setModalCelebracion] = useState<{
    nombre: string;
    bonoXp: number;
    imagen: string;
  } | null>(null);

  const query = useQuery({
    queryKey: ["gamification", "me"],
    queryFn: obtenerGamificacionPropia,
    staleTime: 1000 * 30,
  });

  const reclamarMutation = useMutation({
    mutationFn: (logroId: string) => reclamarLogroApi(logroId),
    onSuccess: (data, logroId) => {
      queryClient.setQueryData<GamificacionPropia>(["gamification", "me"], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pendientes_reclamar: Math.max(0, (oldData.pendientes_reclamar ?? 0) - 1),
          logros: oldData.logros.map((l) =>
            l.logro_id === logroId ? { ...l, reclamado_en: new Date().toISOString() } : l,
          ),
          nivel: oldData.nivel
            ? { ...oldData.nivel, xp_total: oldData.nivel.xp_total + data.bono_xp }
            : null,
        };
      });

      void queryClient.invalidateQueries({ queryKey: ["gamification", "me"] });
      void queryClient.invalidateQueries({ queryKey: ["me"] });
      localStorage.removeItem("semillas_gamification_cache_v1");
      localStorage.removeItem("semillas_gamification_cache_v2");

      const insignia = insigniasCompletas.find((i) => i.id === logroId);
      const imagen = insignia ? (insignia.url_icono ?? "") : "";

      setModalCelebracion({
        nombre: data.nombre,
        bonoXp: data.bono_xp,
        imagen,
      });
    },
    onError: (error) => {
      console.error("Error al reclamar logro:", error);
      toast.error(error instanceof Error ? error.message : "No se pudo reclamar el logro.");
    },
  });

  const nivel = query.data?.nivel;
  const logrosObtenidos = query.data?.logros ?? [];
  const catalogo = useMemo(
    () =>
      (query.data?.catalogo_logros?.length ? query.data.catalogo_logros : LOGROS_FALLBACK).filter(
        (logro) => logro.activo,
      ),
    [query.data?.catalogo_logros],
  );

  const reglasNivel = useMemo(
    () =>
      (query.data?.reglas_nivel?.length ? query.data.reglas_nivel : REGLAS_NIVEL_FALLBACK)
        .slice()
        .sort((a, b) => a.xp_minima - b.xp_minima),
    [query.data?.reglas_nivel],
  );

  const xpInfo = useMemo(() => {
    const xpTotal = nivel?.xp_total ?? 0;
    const reglaActual =
      reglasNivel.filter((regla) => regla.xp_minima <= xpTotal).at(-1) ??
      reglasNivel[0] ??
      REGLAS_NIVEL_FALLBACK[0]!;
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
    const obtenidosPorCodigo = new Map(
      logrosObtenidos
        .filter((registro) => registro.logro?.codigo)
        .map((registro) => [registro.logro!.codigo, registro]),
    );

    const mapeadas = catalogo.map((logro) => {
      const registro = obtenidosPorCodigo.get(logro.codigo);
      const obtenido = Boolean(registro);
      const reclamadoEn = registro?.reclamado_en ?? null;
      const pendienteReclamar = obtenido && reclamadoEn === null;

      if (registro) obtenidosPorCodigo.delete(logro.codigo);

      const detalles = enriquecerExplicacionInsignia(logro, obtenido);

      return {
        ...logro,
        bono_xp: detalles.bonoXp,
        descripcion: detalles.descripcion,
        id: registro ? registro.logro_id : logro.id,
        criterio: detalles.criterio,
        obtenido,
        pendienteReclamar,
        ganadoEn: registro?.ganado_en ?? null,
        reclamadoEn,
      };
    });

    const extras: InsigniaPresentacion[] = Array.from(obtenidosPorCodigo.values()).map(
      (registro) => {
        const logro = registro.logro!;
        const reclamadoEn = registro.reclamado_en ?? null;
        const detalles = enriquecerExplicacionInsignia(logro, true);
        return {
          ...logro,
          bono_xp: detalles.bonoXp,
          descripcion: detalles.descripcion,
          id: registro.logro_id,
          criterio: detalles.criterio,
          obtenido: true,
          pendienteReclamar: reclamadoEn === null,
          ganadoEn: registro.ganado_en,
          reclamadoEn,
        };
      },
    );

    return [...mapeadas, ...extras];
  }, [catalogo, logrosObtenidos]);

  const insignias = useMemo(() => {
    if (activeTab === "obtenidas") {
      return insigniasCompletas.filter((insignia) => insignia.obtenido);
    }
    if (activeTab === "pendientes")
      return insigniasCompletas.filter((insignia) => !insignia.obtenido);
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

  const primerLogroObtenido =
    insigniasCompletas.find((insignia) => insignia.obtenido && insignia.reclamadoEn !== null) ??
    insigniasCompletas.find((insignia) => insignia.obtenido) ??
    null;
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

function enriquecerExplicacionInsignia(
  logro: LogroGamificacion,
  obtenido: boolean,
): { criterio: string; descripcion: string; bonoXp: number } {
  const codigo = (logro.codigo ?? "").toLowerCase();
  const nombre = (logro.nombre ?? "").toLowerCase();
  const criterioCodigo = (logro.codigo_criterio ?? "").toLowerCase();
  const cantidad = logro.valor_criterio && logro.valor_criterio > 0 ? logro.valor_criterio : 1;
  const descOriginal = (logro.descripcion ?? "").trim();

  // Casos específicos de temas o insignias con descripción genérica en la BD
  if (codigo === "tema-amor-de-dios" || nombre.includes("amor de dios")) {
    return {
      criterio: obtenido
        ? "Motivo: Completaste el tema «El Amor de Dios»"
        : "Requisito: Completa el tema «El Amor de Dios»",
      descripcion:
        descOriginal && !descOriginal.toLowerCase().includes("insignia de logro")
          ? `${descOriginal} (Otorgada por finalizar los 6 pasos CRECER de este tema).`
          : "Se gana al completar los 6 pasos CRECER y las actividades del tema «El Amor de Dios».",
      bonoXp: logro.bono_xp > 0 ? logro.bono_xp : 25,
    };
  }

  if (codigo === "primera_leccion" || codigo === "insignia_1" || codigo === "insignia-1" || nombre === "insignia 1") {
    return {
      criterio: obtenido
        ? "Motivo: Completaste tu primer tema bíblico"
        : "Requisito: Completa tu primer tema bíblico",
      descripcion:
        !descOriginal || descOriginal.toLowerCase().includes("primera insignia de logro")
          ? "Se gana al finalizar con éxito tu primera lección completa dentro de Semillas."
          : descOriginal,
      bonoXp: logro.bono_xp > 0 ? logro.bono_xp : 20,
    };
  }

  if (codigo === "insignia_2" || codigo === "insignia-2" || nombre === "insignia 2") {
    return {
      criterio: obtenido
        ? "Motivo: Completaste 2 temas bíblicos"
        : "Requisito: Completa 2 temas bíblicos",
      descripcion:
        !descOriginal || descOriginal.toLowerCase().includes("segunda insignia de logro")
          ? "Se gana por tu constancia al avanzar y completar dos temas de aprendizaje."
          : descOriginal,
      bonoXp: logro.bono_xp > 0 ? logro.bono_xp : 30,
    };
  }

  if (codigo === "insignia_3" || codigo === "insignia-3" || nombre === "insignia 3") {
    return {
      criterio: obtenido
        ? "Motivo: Completaste las actividades de comprobación"
        : "Requisito: Completa 3 actividades interactivas",
      descripcion:
        !descOriginal || descOriginal.toLowerCase().includes("tercera insignia de logro")
          ? "Se gana por resolver correctamente las actividades prácticas y juegos de comprobación en tus temas."
          : descOriginal,
      bonoXp: logro.bono_xp > 0 ? logro.bono_xp : 30,
    };
  }

  switch (criterioCodigo) {
    case "temas_completados":
      return {
        criterio: obtenido
          ? `Motivo: Completaste ${cantidad} ${cantidad === 1 ? "tema bíblico" : "temas bíblicos"}`
          : `Requisito: Completa ${cantidad} ${cantidad === 1 ? "tema bíblico" : "temas bíblicos"}`,
        descripcion:
          descOriginal ||
          `Se desbloquea al completar ${cantidad} ${cantidad === 1 ? "tema" : "temas"} del recorrido CRECER.`,
        bonoXp: logro.bono_xp > 0 ? logro.bono_xp : cantidad * 20,
      };
    case "actividades_completadas":
      return {
        criterio: obtenido
          ? `Motivo: Completaste ${cantidad} ${cantidad === 1 ? "actividad" : "actividades"}`
          : `Requisito: Completa ${cantidad} ${cantidad === 1 ? "actividad" : "actividades"}`,
        descripcion:
          descOriginal ||
          `Se desbloquea al resolver ${cantidad} ${cantidad === 1 ? "actividad interactiva" : "actividades interactivas"}.`,
        bonoXp: logro.bono_xp > 0 ? logro.bono_xp : 50,
      };
    case "dias_racha":
      return {
        criterio: obtenido
          ? `Motivo: Alcanzaste ${cantidad} ${cantidad === 1 ? "día" : "días"} de racha`
          : `Requisito: Mantén ${cantidad} ${cantidad === 1 ? "día" : "días"} de racha`,
        descripcion:
          descOriginal ||
          `Se desbloquea al aprender en Semillas durante ${cantidad} ${cantidad === 1 ? "día seguido" : "días seguidos"}.`,
        bonoXp: logro.bono_xp > 0 ? logro.bono_xp : 50,
      };
    default:
      return {
        criterio: obtenido
          ? `Motivo: ${descOriginal || `Obtuviste el logro «${logro.nombre}» por tu avance`}`
          : "Requisito: Completa temas y actividades para desbloquearla",
        descripcion:
          descOriginal ||
          "Reconocimiento otorgado por tu dedicación y aprendizaje en los temas bíblicos de Semillas.",
        bonoXp: logro.bono_xp > 0 ? logro.bono_xp : 25,
      };
  }
}
