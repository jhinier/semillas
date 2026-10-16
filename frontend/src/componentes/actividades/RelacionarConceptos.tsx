import { RefreshCcw, Sparkles } from "lucide-react";
import { type JSX } from "react";

import { Boton } from "@/componentes/ui/boton";

import { type ParConcepto } from "./relacionar-conceptos.utils";
import { ActividadHeader } from "./ActividadHeader";
import { ConceptoCard } from "./ConceptoCard";
import { CompletadoBanner } from "./CompletadoBanner";
import { FeedbackBanner } from "./FeedbackBanner";
import { RelacionCard } from "./RelacionCard";
import { useRelacionarConceptos, type FeedbackRelacion } from "./hooks/use-relacionar-conceptos";

export type RelacionarConceptosProps = {
  pares: ParConcepto[];
  titulo?: string;
  descripcion?: string;
  xp?: number;
  mostrarPistas?: boolean;
  onComplete?: () => void;
};

export function RelacionarConceptos({
  pares,
  titulo = "Relaciona los conceptos",
  descripcion = "Une cada concepto con la relacion correcta.",
  xp,
  mostrarPistas = false,
  onComplete,
}: RelacionarConceptosProps): JSX.Element {
  const {
    relaciones,
    conceptoSeleccionadoId,
    conceptoArrastradoId,
    completadas,
    feedback,
    estaCompletada,
    seleccionarConcepto,
    seleccionarRelacion,
    soltarSobreRelacion,
    reiniciarActividad,
    setConceptoArrastradoId,
  } = useRelacionarConceptos({ pares, onComplete });

  return (
    <section className="mx-auto flex w-full max-w-md flex-col gap-4 rounded-[2rem] bg-[#F7F4EC] p-4 text-[#123B2C] shadow-[0_18px_50px_rgba(18,59,44,0.12)] sm:p-5">
      <ActividadHeader titulo={titulo} descripcion={descripcion} xp={xp} />

      <p id="relacionar-conceptos-ayuda" className="rounded-2xl bg-white/70 px-4 py-3 text-sm font-bold text-[#49695D]">
        Toca o arrastra un concepto hacia su pareja.
      </p>

      <div role="group" aria-describedby="relacionar-conceptos-ayuda" className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-3">
          <p className="px-1 text-xs font-black uppercase tracking-[0.14em] text-[#2E9E5B]">Conceptos</p>
          {pares.map((par) => (
            <ConceptoCard
              key={par.id}
              par={par}
              completada={completadas.includes(par.id)}
              seleccionada={conceptoSeleccionadoId === par.id}
              mostrarPistas={mostrarPistas}
              onSeleccionar={seleccionarConcepto}
              onDragStart={setConceptoArrastradoId}
              onDragEnd={() => setConceptoArrastradoId(null)}
            />
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <p className="px-1 text-xs font-black uppercase tracking-[0.14em] text-[#EE6C4D]">Relaciones</p>
          {relaciones.map((relacion) => (
            <RelacionCard
              key={relacion.id}
              relacion={relacion}
              completada={completadas.includes(relacion.id)}
              onSeleccionar={seleccionarRelacion}
              onDrop={soltarSobreRelacion}
            />
          ))}
        </div>
      </div>

      {feedback && <FeedbackBanner tipo={feedback.tipo} mensaje={feedback.mensaje} />}

      {estaCompletada && <CompletadoBanner />}

      <Boton
        variante="exito"
        tamano="grande"
        anchoCompleto
        iconoIzquierdo={<RefreshCcw className="size-5" />}
        onClick={reiniciarActividad}
      >
        Intentar otra vez
      </Boton>
    </section>
  );
}
