import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, RotateCcw, X } from "lucide-react";
import { useState } from "react";
import type { Actividad } from "../../../shared/api/api";
import { randomUUID } from "../../../shared/utils/uuid";
import { responderActividad } from "../../activities/activities.api";
import { playSound } from "../../../lib/audio";
import { Boton } from "../../../componentes/ui/boton";

type ResultadoRespuesta = Awaited<ReturnType<typeof responderActividad>>;

type Props = {
  actividad: Actividad;
  onComplete?: (actividadId: string, xp?: number) => void;
};

export function OpcionMultipleServidor({ actividad, onComplete }: Props) {
  const queryClient = useQueryClient();
  const [seleccionada, setSeleccionada] = useState<string | null>(null);
  const [resultado, setResultado] = useState<ResultadoRespuesta | null>(null);

  const respuestaMutation = useMutation({
    mutationFn: (opcionId: string) =>
      responderActividad(actividad.id, {
        evento_id_cliente: randomUUID(),
        opcion_id_seleccionada: opcionId,
        ocurrido_en_cliente: new Date().toISOString(),
        dispositivo_id: "web",
      }),
    onSuccess(data) {
      setResultado(data);
      playSound(data.resultado.correcta ? "acertado" : "error");

      if (data.resultado.correcta && onComplete) {
        onComplete(actividad.id, data.resultado.xp_otorgada);
      }

      queryClient.invalidateQueries({ queryKey: ["gamification", "me"] });
      queryClient.invalidateQueries({ queryKey: ["progress"] });
    },
  });

  const responder = (opcionId: string) => {
    if (respuestaMutation.isPending || resultado) return;
    setSeleccionada(opcionId);
    respuestaMutation.mutate(opcionId);
  };

  const reintentar = () => {
    setSeleccionada(null);
    setResultado(null);
    respuestaMutation.reset();
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-3">
      {actividad.opciones.map((opcion) => {
        const esSeleccionada = seleccionada === opcion.id;
        const esCorrecta = resultado?.resultado.opcion_correcta_id === opcion.id;
        const respondida = Boolean(resultado);

        let clases = "border-slate-200 bg-white hover:border-violet-300 hover:bg-violet-50/40";
        if (respondida && esCorrecta) clases = "border-green-500 bg-green-50";
        else if (respondida && esSeleccionada) clases = "border-red-400 bg-red-50";
        else if (respondida) clases = "border-slate-200 bg-slate-50 opacity-60";

        return (
          <button
            key={opcion.id}
            type="button"
            disabled={respuestaMutation.isPending || respondida}
            onClick={() => responder(opcion.id)}
            className={`flex w-full items-center gap-3 rounded-xl border-2 p-4 text-left transition-all disabled:cursor-default ${clases}`}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-sm font-black text-violet-700 shadow-sm">
              {opcion.etiqueta ?? opcion.orden}
            </span>
            <span className="flex-1 font-semibold text-slate-700">{opcion.texto}</span>
            {respuestaMutation.isPending && esSeleccionada ? <Loader2 className="animate-spin text-violet-600" size={20} /> : null}
            {respondida && esCorrecta ? <Check className="text-green-600" size={22} /> : null}
            {respondida && esSeleccionada && !esCorrecta ? <X className="text-red-500" size={22} /> : null}
          </button>
        );
      })}

      {respuestaMutation.isError ? (
        <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">
          {respuestaMutation.error instanceof Error
            ? respuestaMutation.error.message
            : "No se pudo verificar la respuesta."}
        </p>
      ) : null}

      {resultado ? (
        <div className={`mt-2 rounded-xl p-4 ${resultado.resultado.correcta ? "bg-green-50" : "bg-red-50"}`}>
          <p className={`font-black ${resultado.resultado.correcta ? "text-green-700" : "text-red-700"}`}>
            {resultado.resultado.correcta ? "¡Correcto!" : "Respuesta incorrecta"}
          </p>
          <p className="mt-1 text-sm font-medium text-slate-600">
            {resultado.resultado.retroalimentacion
              ?? (resultado.resultado.correcta
                ? `Ganaste ${resultado.resultado.xp_otorgada} XP.`
                : "Revisa la respuesta correcta e inténtalo nuevamente.")}
          </p>
          {!resultado.resultado.correcta ? (
            <Boton variante="contorno" tamano="pequeno" onClick={reintentar} className="mt-3">
              <RotateCcw size={15} />
              Intentar otra vez
            </Boton>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
