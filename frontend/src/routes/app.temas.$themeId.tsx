import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  Check,
  Clock3,
  Download,
  Play,
  RefreshCw,
  Sparkles,
  Trash2,
  WifiOff,
} from "lucide-react";
import { StateView } from "@/componentes/ui/state-view";
import { FASES_CRECER } from "@/features/crecer/crecer-fases";
import { useTemaDetalle } from "@/features/themes/hooks/use-tema-detalle";
import "./theme-detail.css";

export const Route = createFileRoute("/app/temas/$themeId")({
  component: ThemeDetailPage,
  validateSearch: z.object({
    paso: z.string().optional(),
  }),
});

function ThemeDetailPage() {
  const { themeId } = Route.useParams();
  const detalle = useTemaDetalle(themeId);
  const theme = detalle.theme;
  const isLoading = detalle.themeQuery.isLoading || detalle.meQuery.isLoading;
  const isError = detalle.themeQuery.isError || detalle.meQuery.isError;

  return (
    <StateView
      cargando={isLoading}
      error={isError ? "No pudimos cargar este tema. Intenta nuevamente." : null}
      mensajeCarga="Preparando tu tema..."
      colorCarga="#43a047"
    >
      <div className="theme-detail">
        <Link to="/app/temas" search={{}} className="theme-detail__back">
          <ArrowLeft aria-hidden="true" />
          Mis temas
        </Link>

        <section className="theme-detail__hero">
          <div className="theme-detail__media">
            {detalle.portadaQuery.data?.url ? (
              <img
                src={detalle.portadaQuery.data.url}
                alt={theme?.portada_recurso?.texto_alternativo || `Portada de ${theme?.titulo || "tema"}`}
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
            ) : (
              <div className="theme-detail__media-empty">
                <BookOpenCheck aria-hidden="true" />
                <span>Portada no disponible</span>
              </div>
            )}
            {detalle.temaDescargado ? (
              <span className="theme-detail__offline-badge">
                <Check size={15} aria-hidden="true" /> Disponible sin conexión
              </span>
            ) : null}
          </div>

          <div className="theme-detail__intro">
            <span
              className="theme-detail__senda"
              style={{
                color: theme?.senda?.color_hex || "#2563eb",
                backgroundColor: `${theme?.senda?.color_hex || "#2563eb"}12`,
              }}
            >
              <span style={{ backgroundColor: theme?.senda?.color_hex || "#2563eb" }} />
              {theme?.senda?.nombre || "Senda"}
            </span>
            <h1>{theme?.titulo || "Tema"}</h1>
            <p className="theme-detail__summary">
              {theme?.resumen || theme?.objetivo || "Descubre una nueva enseñanza de la Palabra de Dios."}
            </p>

            <div className="theme-detail__stats">
              <span><Sparkles aria-hidden="true" /> {theme?.xp_recompensa ?? 0} XP</span>
              <span><Clock3 aria-hidden="true" /> {theme?.minutos_estimados ?? 10} min</span>
              <span><BookOpenCheck aria-hidden="true" /> {detalle.pasosDisponibles} pasos</span>
            </div>

            <div className="theme-detail__progress-card">
              <div>
                <strong>Tu progreso</strong>
                <span>{detalle.progresoReal}%</span>
              </div>
              <div className="theme-detail__progress-track" aria-label={`${detalle.progresoReal}% completado`}>
                <span style={{ width: `${detalle.progresoReal}%` }} />
              </div>
              <small>
                {detalle.progresoReal === 0
                  ? "Comienza con Conectar y avanza a tu ritmo."
                  : detalle.progresoReal === 100
                    ? "Tema completado. Puedes repasarlo cuando quieras."
                    : "Retoma desde el último paso guardado."}
              </small>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-violet-100 bg-violet-50/60 p-3">
              <div className="min-w-0 flex-1">
                <p className="m-0 text-sm font-black text-slate-800">Contenido sin conexión</p>
                <p className="m-0 mt-0.5 text-xs leading-relaxed text-slate-500">
                  {detalle.temaDescargado
                    ? detalle.actualizacionDisponible
                      ? "Hay una versión más reciente disponible."
                      : "Este tema está listo para abrirse sin internet."
                    : "Guarda los pasos, imágenes, audios y actividades en este dispositivo."}
                </p>
                {detalle.downloadProgress !== null ? (
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-violet-100" aria-label={`Descarga ${detalle.downloadProgress}%`}>
                    <div className="h-full rounded-full bg-violet-600 transition-all" style={{ width: `${detalle.downloadProgress}%` }} />
                  </div>
                ) : null}
              </div>
              {detalle.temaDescargado && !detalle.actualizacionDisponible ? (
                <button type="button" onClick={() => void detalle.handleEliminarDescarga()} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 text-sm font-black text-rose-600 hover:bg-rose-50">
                  <Trash2 size={17} /> Eliminar
                </button>
              ) : (
                <button type="button" onClick={() => void detalle.handleDescargar()} disabled={!detalle.isOnline || detalle.isDownloading} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-violet-600 px-4 text-sm font-black text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-slate-300">
                  {!detalle.isOnline ? <WifiOff size={17} /> : detalle.actualizacionDisponible ? <RefreshCw size={17} className={detalle.isDownloading ? "animate-spin" : ""} /> : <Download size={17} />}
                  {!detalle.isOnline ? "Sin conexión" : detalle.actualizacionDisponible ? "Actualizar" : detalle.isDownloading ? "Descargando..." : "Descargar"}
                </button>
              )}
            </div>

            <div className="theme-detail__actions">
              <Link to={detalle.rutaContinuacion} params={{ themeId }} className="theme-detail__primary" onClick={detalle.handleIniciarClick}>
                <Play fill="currentColor" aria-hidden="true" />
                {detalle.progresoReal === 0 ? "Comenzar lección" : detalle.progresoReal === 100 ? "Repasar lección" : "Continuar lección"}
                <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        <section className="theme-detail__journey" aria-labelledby="journey-title">
          <div className="theme-detail__section-heading">
            <div>
              <span>METODOLOGÍA CRECER</span>
              <h2 id="journey-title">Tu recorrido en seis pasos</h2>
            </div>
            <p>Lee, participa y aplica cada enseñanza antes de recibir tu recompensa.</p>
          </div>
          <ol className="theme-detail__steps">
            {FASES_CRECER.map((fase, index) => {
              const isComplete = index < detalle.pasosEstimadosCompletados;
              const isCurrent = detalle.progresoReal > 0 && index === Math.min(detalle.pasosEstimadosCompletados, FASES_CRECER.length - 1);
              return (
                <li key={fase.codigo} className={isComplete ? "is-complete" : isCurrent ? "is-current" : ""}>
                  <span className="theme-detail__step-number">{isComplete ? <Check aria-hidden="true" /> : fase.numero}</span>
                  <div>
                    <strong>{fase.nombre}</strong>
                    <p>{fase.descripcion}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <div className="theme-detail__mobile-dock">
          <Link to={detalle.rutaContinuacion} params={{ themeId }} onClick={detalle.handleIniciarClick}>
            <Play fill="currentColor" aria-hidden="true" />
            {detalle.progresoReal === 0 ? "Comenzar" : "Continuar"}
          </Link>
        </div>
      </div>
    </StateView>
  );
}
