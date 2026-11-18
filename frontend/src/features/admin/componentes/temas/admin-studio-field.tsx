import type { ReactNode } from "react";

type AdminStudioFieldProps = {
  htmlFor?: string;
  esGrupo?: boolean;
  label: string;
  help?: string;
  wide?: boolean;
  required?: boolean;
  invalid?: boolean;
  children: ReactNode;
};

/** Campo estándar del editor admin con soporte uniforme para asterisco obligatorio y estado en rojo. */
export function AdminStudioField({
  htmlFor,
  esGrupo = false,
  label,
  help,
  wide,
  required,
  invalid,
  children,
}: AdminStudioFieldProps) {
  const className = `admin-field ${wide ? "admin-field--wide" : ""} ${invalid ? "admin-field--invalid" : ""}`;
  const header = (
    <span>
      {label}
      {required ? (
        <em className="ml-0.5 not-italic text-red-500" aria-hidden="true">
          *
        </em>
      ) : null}
    </span>
  );

  if (esGrupo) {
    return (
      <div className={className} role="group" aria-label={label}>
        {header}
        {children}
        {help ? <small>{help}</small> : null}
      </div>
    );
  }

  return (
    <label htmlFor={htmlFor} className={className}>
      {header}
      {children}
      {help ? <small>{help}</small> : null}
    </label>
  );
}

/** Pastilla de atención en cabecera de sección cuando quedan campos obligatorios por corregir. */
export function AvisoSeccionObligatoria({
  cantidadFaltantes,
  singular,
  plural,
}: {
  cantidadFaltantes: number;
  singular: string;
  plural: string;
}) {
  if (cantidadFaltantes <= 0) return null;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-extrabold text-red-700 dark:border-red-500/40 dark:bg-red-950/50 dark:text-red-300">
      {cantidadFaltantes === 1 ? singular : `${cantidadFaltantes} ${plural}`}
    </span>
  );
}

/** Clases de contenedor para rejillas de selección (sendas o edades) en estado normal o inválido. */
export function claseContenedorSelectorPaso1(invalid: boolean) {
  return `grid grid-cols-1 gap-3.5 sm:grid-cols-3 ${
    invalid
      ? "rounded-2xl border border-red-400 bg-red-50/40 p-2.5 dark:border-red-500/60 dark:bg-red-950/20"
      : ""
  }`;
}

/** Clases de cada tarjeta seleccionable (senda o edad) resaltando bordes en rojo si falta elegir. */
export function claseTarjetaSelectorPaso1(selected: boolean, invalid: boolean) {
  if (selected) {
    return "rounded-2xl border p-4 text-left transition border-violet-500 bg-violet-50 dark:border-violet-400 dark:bg-violet-950/60";
  }
  if (invalid) {
    return "rounded-2xl border p-4 text-left transition border-red-300 bg-red-50/60 hover:border-red-400 dark:border-red-500/60 dark:bg-red-950/30";
  }
  return "rounded-2xl border p-4 text-left transition border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900";
}

/** Desplaza suavemente hasta el primer campo con error y enfoca su control interactivo. */
export function enfocarCampoPaso1(elementId: string) {
  if (typeof document === "undefined") return;
  const target = document.getElementById(elementId);
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "center" });
  if (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    target instanceof HTMLButtonElement
  ) {
    target.focus({ preventScroll: true });
    return;
  }
  const focusable = target.querySelector<HTMLElement>(
    "input, textarea, select, button",
  );
  focusable?.focus({ preventScroll: true });
}
