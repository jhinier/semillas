import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CloudOff,
  Lock,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { StateView } from "@/componentes/ui/state-view";
import { FASES_CRECER, type FaseCrecerConfig } from "../crecer-fases";
import type { DetalleSendaEdad } from "../hooks/use-crecer-fase";
import { NarradorPaso } from "./narrador-paso";
import {
  useResolvedMediaUrl,
  sendaPadreImg,
  sendaHijoImg,
  sendaEspirituImg,
  obtenerIlustracionFallback,
} from "@/features/media/use-resolved-media-url";
import "./crecer-focus.css";

interface ContenidoPaso {
  titulo?: string;
  cuerpo?: string;
  instruccion_corta?: string | null;
  recurso_id?: string | null;
  recurso_audio_id?: string | null;
  datos_extra?: Record<string, unknown> | null;
  detalle_senda?: DetalleSendaEdad;
  cita_biblica?: string;
  versiculo_clave?: string;
}

interface RutaAccion {
  to: string;
  label?: string;
  themeId?: string;
}

interface BotonesAccion {
  siguiente: RutaAccion;
  regresar: RutaAccion;
}

interface CrecerLayoutProps {
  fase: FaseCrecerConfig;
  themeId?: string;
  themeTitle?: string;
  paso: ContenidoPaso | null;
  pasoId?: string;
  isLoading: boolean;
  isError: boolean;
  children?: ReactNode;
  botonesAccion: BotonesAccion;
  onCompleteStep?: () => Promise<void>;
  isSavingProgress?: boolean;
  progressError?: unknown;
  activityCount?: number;
  completedActivityCount?: number;
  canContinue?: boolean;
  emptyMessage?: string;
}

const IMAGEN_PILAR: Record<"padre" | "hijo" | "espiritu", string> = {
  padre: sendaPadreImg,
  hijo: sendaHijoImg,
  espiritu: sendaEspirituImg,
};

export function CrecerLayout({
  fase,
  themeId = "story-theme",
  themeTitle,
  paso,
  isLoading,
  isError,
  children,
  botonesAccion,
  onCompleteStep,
  isSavingProgress = false,
  progressError,
  activityCount = 0,
  completedActivityCount = 0,
  canContinue = true,
  emptyMessage = "No hay contenido ni actividades disponibles para esta fase.",
}: CrecerLayoutProps) {
  const navigate = useNavigate();
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(() => {
    return window.localStorage.getItem("semillas-prefiere-audio") !== "false";
  });
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [visualImgSrc, setVisualImgSrc] = useState(fase.imagenSrc);

  useEffect(() => {
    setVisualImgSrc(fase.imagenSrc);
  }, [fase.imagenSrc]);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  const recursoPasoMedia = useResolvedMediaUrl({
    resourceId: paso?.recurso_id ?? null,
    fallbackHint: paso?.titulo || fase.codigo,
    useFallbackOnError: false,
  });

  const nextPhase = useMemo(
    () => FASES_CRECER.find((item) => item.numero === fase.numero + 1),
    [fase.numero],
  );

  const detalleSenda = useMemo<DetalleSendaEdad | null>(() => {
    if (paso?.detalle_senda) return paso.detalle_senda;
    const extra = paso?.datos_extra?.detalle_senda;
    if (extra && typeof extra === "object" && "pilares" in (extra as Record<string, unknown>)) {
      return extra as DetalleSendaEdad;
    }
    return null;
  }, [paso]);

  const citaBiblica =
    paso?.cita_biblica ??
    (typeof paso?.datos_extra?.cita_biblica === "string"
      ? paso.datos_extra.cita_biblica
      : detalleSenda?.citaBiblica);

  const versiculoClave =
    paso?.versiculo_clave ??
    (typeof paso?.datos_extra?.versiculo_clave === "string"
      ? paso.datos_extra.versiculo_clave
      : detalleSenda?.versiculoClave);

  const textoNarracion = useMemo(() => {
    if (!paso) return null;
    const partes = [
      paso.titulo,
      paso.instruccion_corta,
      paso.cuerpo,
      ...(versiculoClave && (fase.codigo === "relatar" || fase.codigo === "ensenar")
        ? [`Versículo clave: ${versiculoClave}`]
        : []),
      ...(detalleSenda
        ? [
            detalleSenda.resumenSenda,
            ...detalleSenda.pilares.map(
              (p) => `${p.titulo}. ${p.versiculo}. ${p.descripcion}`,
            ),
          ]
        : []),
    ].filter((item): item is string => Boolean(item && item.trim()));
    return partes.length > 0 ? partes.join(". ") : null;
  }, [paso, detalleSenda, versiculoClave, fase.codigo]);

  const bloqueadoPorActividades = activityCount > 0 && !canContinue;

  const toggleAudio = () => {
    const next = !audioEnabled;
    setAudioEnabled(next);
    window.localStorage.setItem("semillas-prefiere-audio", String(next));
  };

  const navigateTo = (route: RutaAccion) => {
    navigate({
      to: route.to as never,
      params: route.themeId ? ({ themeId: route.themeId } as never) : undefined,
      search: route.to === "/app/temas" ? ({} as never) : undefined,
    });
  };

  const handleContinue = async () => {
    if (bloqueadoPorActividades) {
      setActionError(
        `Debes completar todas las actividades de este paso antes de continuar (${completedActivityCount}/${activityCount}).`,
      );
      return;
    }
    setActionError(null);
    try {
      await onCompleteStep?.();
      navigateTo(botonesAccion.siguiente);
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "No pudimos guardar tu avance. Revisa tu conexión e inténtalo de nuevo.",
      );
    }
  };

  const style = {
    "--lesson-accent": fase.colorAccent,
    "--lesson-soft": fase.colorSuave ?? "#eef6ef",
  } as CSSProperties;

  return (
    <div className="crecer-focus" style={style}>
      <header className="crecer-focus__topbar">
        <button
          type="button"
          className="crecer-focus__icon-button"
          aria-label="Salir de la lección"
          onClick={() => setShowExitDialog(true)}
        >
          <X aria-hidden="true" />
        </button>

        <div className="crecer-focus__progress" aria-label={`Paso ${fase.numero} de 6`}>
          <div className="crecer-focus__progress-copy">
            <strong>{fase.nombre}</strong>
            <span>Paso {fase.numero} de 6</span>
          </div>
          <div className="crecer-focus__segments" aria-hidden="true">
            {FASES_CRECER.map((item) => (
              <span
                key={item.codigo}
                className={
                  item.numero < fase.numero
                    ? "is-complete"
                    : item.numero === fase.numero
                      ? "is-current"
                      : ""
                }
              />
            ))}
          </div>
        </div>

        <button
          type="button"
          className="crecer-focus__icon-button"
          aria-label={audioEnabled ? "Desactivar audio" : "Activar audio"}
          aria-pressed={audioEnabled}
          onClick={toggleAudio}
        >
          {audioEnabled ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}
        </button>
      </header>

      {!isOnline ? (
        <div className="crecer-focus__offline" role="status">
          <CloudOff size={16} aria-hidden="true" />
          Estás sin conexión. Guardaremos tu avance en este dispositivo.
        </div>
      ) : null}

      <main className="crecer-focus__main">
        <section className="crecer-focus__visual" aria-label={`Ilustración de ${fase.nombre}`}>
          <img
            src={recursoPasoMedia.src || visualImgSrc}
            alt=""
            aria-hidden="true"
            onError={() => {
              if (recursoPasoMedia.src) {
                void recursoPasoMedia.handleImageError();
              } else {
                setVisualImgSrc(obtenerIlustracionFallback(fase.codigo));
              }
            }}
          />
          <div className="crecer-focus__visual-overlay" />
          <div className="crecer-focus__visual-copy">
            <span>CRECER · {fase.numero}/6</span>
            <strong>{fase.nombre}</strong>
            <p>{fase.descripcion || "Avanza paso a paso en tu aprendizaje."}</p>
          </div>
        </section>

        <section className="crecer-focus__panel">
          <StateView
            cargando={isLoading}
            error={isError ? "No pudimos cargar esta fase. Intenta nuevamente." : null}
            colorCarga={fase.colorAccent}
            mensajeCarga={`Preparando ${fase.nombre.toLowerCase()}...`}
          >
            <div className="crecer-focus__content">
              <div className="crecer-focus__content-header">
                <div>
                  <span className="crecer-focus__eyebrow">
                    {themeTitle || "Tu lección"}
                  </span>
                  {paso?.titulo ? <h1>{paso.titulo}</h1> : <h1>{fase.nombre}</h1>}
                </div>
                {activityCount > 0 ? (
                  <span className="crecer-focus__activity-count">
                    {completedActivityCount}/{activityCount}{" "}
                    {activityCount === 1 ? "actividad" : "actividades"}
                  </span>
                ) : null}
              </div>

              {paso?.instruccion_corta ? (
                <p className="crecer-focus__instruction">{paso.instruccion_corta}</p>
              ) : null}

              <NarradorPaso
                recursoAudioId={paso?.recurso_audio_id}
                textoNarracion={textoNarracion}
                tituloPaso={
                  fase.codigo === "relatar"
                    ? "Escuchar el relato de la historia"
                    : "Escucha este paso"
                }
                habilitado={audioEnabled}
              />

              {paso?.cuerpo ? (
                <div className="crecer-focus__reading">{paso.cuerpo}</div>
              ) : null}

              {versiculoClave && (fase.codigo === "relatar" || fase.codigo === "ensenar") ? (
                <blockquote
                  className="my-2 rounded-2xl border border-emerald-200 bg-emerald-50/75 p-4 text-sm text-emerald-950"
                  aria-label="Cita bíblica y versículo clave"
                >
                  <div className="mb-1 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-emerald-700">
                    <BookOpen size={15} aria-hidden="true" />
                    <span>Cita bíblica y versículo clave · {citaBiblica || "TLA"}</span>
                  </div>
                  <p className="m-0 font-semibold italic leading-relaxed text-emerald-950">
                    {versiculoClave}
                  </p>
                </blockquote>
              ) : null}

              {detalleSenda ? (
                <section
                  className="crecer-trinidad"
                  aria-label={`Pilares de ${detalleSenda.nombreSenda} para ${detalleSenda.etiquetaEdad}`}
                >
                  <div className="crecer-trinidad__banner">
                    <div className="crecer-trinidad__badge">
                      <Sparkles size={16} aria-hidden="true" />
                      <span>
                        {detalleSenda.nombreSenda} · Franja <strong>{detalleSenda.etiquetaEdad}</strong> ({detalleSenda.rangoEdad}) · Cita base: <strong>{detalleSenda.citaBiblica}</strong>
                      </span>
                    </div>
                    <p>{detalleSenda.resumenSenda}</p>
                  </div>

                  <div className="crecer-trinidad__grid">
                    {detalleSenda.pilares.map((pilar, index) => (
                      <article
                        key={`${pilar.clave}-${index}`}
                        className={`crecer-trinidad__card is-${pilar.clave}`}
                      >
                        <div className="crecer-trinidad__card-media">
                          <img
                            src={IMAGEN_PILAR[pilar.clave]}
                            alt={pilar.senda}
                            loading="lazy"
                          />
                          <span className="crecer-trinidad__senda-pill">{pilar.senda}</span>
                        </div>
                        <div className="crecer-trinidad__card-body">
                          <h3>{pilar.titulo}</h3>
                          <p className="crecer-trinidad__verse">{pilar.versiculo}</p>
                          <p className="crecer-trinidad__desc">{pilar.descripcion}</p>
                          <div className="crecer-trinidad__apply">
                            <strong>En tu vida:</strong> {pilar.aplicacion}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ) : null}

              {children ? (
                <div className="crecer-focus__activities">{children}</div>
              ) : !paso ? (
                <div className="crecer-focus__empty">{emptyMessage}</div>
              ) : (
                <div className="crecer-focus__reading-tip">
                  <Check size={18} aria-hidden="true" />
                  Cuando termines de leer o escuchar, continúa al siguiente paso.
                </div>
              )}
            </div>
          </StateView>
        </section>
      </main>

      {!isLoading && !isError ? (
        <footer className="crecer-focus__actions">
          <button
            type="button"
            className="crecer-focus__back"
            onClick={() => navigateTo(botonesAccion.regresar)}
          >
            <ArrowLeft aria-hidden="true" />
            <span>Anterior</span>
          </button>

          <div className="crecer-focus__next-wrap">
            {actionError || progressError ? (
              <p className="crecer-focus__action-error" role="alert">
                {actionError || "No pudimos guardar tu avance. Intenta nuevamente."}
              </p>
            ) : bloqueadoPorActividades ? (
              <p className="crecer-focus__action-hint" role="status">
                Completa las actividades para habilitar el botón de continuar ({completedActivityCount}/{activityCount}).
              </p>
            ) : null}
            <button
              type="button"
              className="crecer-focus__next"
              disabled={isSavingProgress || bloqueadoPorActividades}
              aria-disabled={isSavingProgress || bloqueadoPorActividades}
              onClick={handleContinue}
            >
              <span className="crecer-focus__next-copy">
                <small>
                  {bloqueadoPorActividades
                    ? `Actividades completadas: ${completedActivityCount} de ${activityCount}`
                    : nextPhase
                      ? `Siguiente: ${nextPhase.nombre}`
                      : "Senda completada"}
                </small>
                <strong>
                  {isSavingProgress
                    ? "Guardando..."
                    : bloqueadoPorActividades
                      ? "Completa las actividades para continuar"
                      : botonesAccion.siguiente.label || "Continuar"}
                </strong>
              </span>
              {bloqueadoPorActividades ? (
                <Lock aria-hidden="true" />
              ) : (
                <ArrowRight aria-hidden="true" />
              )}
            </button>
          </div>
        </footer>
      ) : null}

      {showExitDialog ? (
        <div className="crecer-exit" role="presentation" onMouseDown={() => setShowExitDialog(false)}>
          <div
            className="crecer-exit__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="crecer-exit-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="crecer-exit__icon">
              <ArrowLeft aria-hidden="true" />
            </div>
            <h2 id="crecer-exit-title">¿Salir de la lección?</h2>
            <p>Tu avance guardado se conservará y podrás continuar después.</p>
            <div className="crecer-exit__actions">
              <button type="button" onClick={() => setShowExitDialog(false)}>
                Seguir aprendiendo
              </button>
              <button
                type="button"
                className="is-danger"
                onClick={() => navigate({ to: "/app/temas/$themeId", params: { themeId } })}
              >
                Salir por ahora
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
