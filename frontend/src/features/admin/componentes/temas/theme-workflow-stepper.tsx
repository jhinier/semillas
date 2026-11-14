import { Link } from "@tanstack/react-router";
import { Check, Lock } from "lucide-react";

import type { CompletitudTema } from "../../admin.api";

export type ThemeWorkflowStep = 1 | 2 | 3 | 4 | 5;

type ThemeWorkflowStepperProps = {
  currentStep: ThemeWorkflowStep;
  themeId?: string;
  themeEstado?: string | null;
  completitud?: CompletitudTema | null;
};

type StepConfig = {
  step: ThemeWorkflowStep;
  title: string;
  subtitle: string;
};

const STEPS: StepConfig[] = [
  { step: 1, title: "Datos base", subtitle: "Información y versículo" },
  { step: 2, title: "Portada", subtitle: "Imagen del tema" },
  { step: 3, title: "CRECER", subtitle: "6 momentos" },
  { step: 4, title: "Actividades", subtitle: "Juegos y retos" },
  { step: 5, title: "Publicar", subtitle: "Revisar y publicar" },
];

function criterioCompleto(completitud: CompletitudTema | null | undefined, codigo: string): boolean {
  return Boolean(completitud?.criterios?.some((c) => c.codigo === codigo && c.completo));
}

export function ThemeWorkflowStepper({
  currentStep,
  themeId,
  themeEstado,
  completitud,
}: ThemeWorkflowStepperProps) {
  const esLibrePorEstado =
    themeEstado === "publicado" || themeEstado === "aprobado" || themeEstado === "revision";

  const tieneBase = Boolean(themeId);
  const tienePortada = criterioCompleto(completitud, "portada");
  const contenidosCreados = completitud?.estadisticas?.contenidos_creados ?? 0;
  const tieneCrecerIniciado = contenidosCreados > 0 || criterioCompleto(completitud, "contenido_crecer");
  const tieneActividades =
    (completitud?.estadisticas?.actividades ?? 0) > 0 || criterioCompleto(completitud, "actividades");

  const isStepDone = (step: ThemeWorkflowStep): boolean => {
    if (!themeId) return false;
    switch (step) {
      case 1:
        return tieneBase;
      case 2:
        return tienePortada;
      case 3:
        return criterioCompleto(completitud, "contenido_crecer");
      case 4:
        return tieneActividades;
      case 5:
        return themeEstado === "publicado" || Boolean(completitud?.listo_para_revision);
    }
  };

  const getLockedReason = (step: ThemeWorkflowStep): string | null => {
    if (step <= currentStep || esLibrePorEstado) return null;
    if (!themeId) return "Guarda primero los datos básicos (Paso 1).";
    if (step === 3 && !tienePortada) {
      return "Asigna primero una imagen de portada en el Paso 2.";
    }
    if (step === 4 && (!tienePortada || !tieneCrecerIniciado)) {
      return !tienePortada
        ? "Asigna primero la portada en el Paso 2."
        : "Guarda al menos un momento de enseñanza CRECER en el Paso 3.";
    }
    if (step === 5 && (!tienePortada || !tieneCrecerIniciado || !tieneActividades)) {
      if (!tienePortada) return "Asigna primero la portada en el Paso 2.";
      if (!tieneCrecerIniciado) return "Completa contenido CRECER en el Paso 3.";
      return "Crea al menos una actividad en el Paso 4.";
    }
    return null;
  };

  return (
    <nav className="admin-theme-flow-stepper" aria-label="Flujo secuencial del tema">
      {STEPS.map((item) => {
        const active = item.step === currentStep;
        const done = isStepDone(item.step);
        const lockedReason = getLockedReason(item.step);

        const content = (
          <>
            <span className="admin-theme-flow-stepper__badge">
              {done ? <Check size={14} /> : lockedReason ? <Lock size={13} /> : item.step}
            </span>
            <span className="admin-theme-flow-stepper__copy">
              <strong>
                {item.step}. {item.title}
              </strong>
              <small>{lockedReason ? "Pendiente de paso previo" : item.subtitle}</small>
            </span>
          </>
        );

        const className = [
          "admin-theme-flow-stepper__item",
          active ? "is-active" : "",
          done && !active ? "is-done" : "",
          lockedReason ? "is-locked" : "",
        ]
          .filter(Boolean)
          .join(" ");

        if (!themeId || lockedReason) {
          return (
            <button
              key={item.step}
              type="button"
              disabled
              className={className}
              title={lockedReason ?? "Paso actual"}
            >
              {content}
            </button>
          );
        }

        if (item.step === 1) {
          return (
            <Link
              key={item.step}
              to="/admin/temas/$themeId/edit"
              params={{ themeId }}
              search={{ tab: "general" }}
              className={className}
              aria-current={active ? "step" : undefined}
            >
              {content}
            </Link>
          );
        }

        if (item.step === 2) {
          return (
            <Link
              key={item.step}
              to="/admin/temas/$themeId/edit"
              params={{ themeId }}
              search={{ tab: "portada" }}
              className={className}
              aria-current={active ? "step" : undefined}
            >
              {content}
            </Link>
          );
        }

        if (item.step === 3) {
          return (
            <Link
              key={item.step}
              to="/admin/temas/$themeId/crecer"
              params={{ themeId }}
              className={className}
              aria-current={active ? "step" : undefined}
            >
              {content}
            </Link>
          );
        }

        if (item.step === 4) {
          return (
            <Link
              key={item.step}
              to="/admin/temas/$themeId/activities"
              params={{ themeId }}
              className={className}
              aria-current={active ? "step" : undefined}
            >
              {content}
            </Link>
          );
        }

        return (
          <Link
            key={item.step}
            to="/admin/temas/$themeId/edit"
            params={{ themeId }}
            search={{ tab: "publicacion" }}
            className={className}
            aria-current={active ? "step" : undefined}
          >
            {content}
          </Link>
        );
      })}
    </nav>
  );
}
