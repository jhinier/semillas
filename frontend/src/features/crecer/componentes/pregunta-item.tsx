import type { ReactNode } from "react";
import type { Actividad as ActividadAPI } from "@/shared/api/api";

interface Opcion {
  id: string;
  etiqueta?: string | null;
  texto: string;
  correcta?: boolean;
}

type Actividad = Omit<ActividadAPI, "opciones"> & { opciones?: Opcion[] };

interface PreguntaItemProps {
  actividad: Actividad;
  children?: ReactNode;
}

export function PreguntaItem({ actividad, children }: PreguntaItemProps) {
  return (
    <article className="crecer-question-card">
      <h3>{actividad.titulo}</h3>
      {actividad.consigna ? <p>{actividad.consigna}</p> : null}
      {children}
    </article>
  );
}
