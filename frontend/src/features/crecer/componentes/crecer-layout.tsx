import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CloudOff,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { StateView } from "@/componentes/ui/state-view";
import { FASES_CRECER, type FaseCrecerConfig } from "../crecer-fases";
import { NarradorPaso } from "./narrador-paso";
import "./crecer-focus.css";

interface ContenidoPaso {
  titulo?: string;
  cuerpo?: string;
  instruccion_corta?: string | null;
  recurso_audio_id?: string | null;
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
  emptyMessage?: string;
}

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
  emptyMessage = "No hay contenido ni actividades disponibles para esta fase.",
}: CrecerLayoutProps) {
  const navigate = useNavigate();
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(() => {
    return window.localStorage.getItem("semillas-prefiere-audio") !== "false";
  });
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);

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

  const nextPhase = useMemo(
    () => FASES_CRECER.find((item) => item.numero === fase.numero + 1),
    [fase.numero],
  );

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
          <img src={fase.imagenSrc} alt="" aria-hidden="true" />
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
                    {activityCount} {activityCount === 1 ? "actividad" : "actividades"}
                  </span>
                ) : null}
              </div>

              {paso?.instruccion_corta ? (
                <p className="crecer-focus__instruction">{paso.instruccion_corta}</p>
              ) : null}

              {paso?.cuerpo ? (
                <div className="crecer-focus__reading">{paso.cuerpo}</div>
              ) : null}

              <NarradorPaso recursoAudioId={paso?.recurso_audio_id} habilitado={audioEnabled} />

              {children ? (
                <div className="crecer-focus__activities">{children}</div>
              ) : !paso ? (
                <div className="crecer-focus__empty">{emptyMessage}</div>
              ) : (
                <div className="crecer-focus__reading-tip">
                  <Check size={18} aria-hidden="true" />
                  Cuando termines de leer, continúa al siguiente paso.
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
            ) : null}
            <button
              type="button"
              className="crecer-focus__next"
              disabled={isSavingProgress}
              onClick={handleContinue}
            >
              <span className="crecer-focus__next-copy">
                <small>{nextPhase ? `Siguiente: ${nextPhase.nombre}` : "Tema completado"}</small>
                <strong>{isSavingProgress ? "Guardando..." : botonesAccion.siguiente.label || "Continuar"}</strong>
              </span>
              <ArrowRight aria-hidden="true" />
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
