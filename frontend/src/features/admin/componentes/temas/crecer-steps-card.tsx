import { Loader } from "lucide-react";

interface PasoItem {
  id: string;
  tipo_paso?: {
    nombre?: string | null;
    color_hex?: string | null;
  } | null;
  contenidos?: Array<unknown>;
}

interface CrecerStepsCardProps {
  pasos: PasoItem[];
  isLoading: boolean;
}

export function CrecerStepsCard({ pasos, isLoading }: CrecerStepsCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h3 className="font-bold text-neutro-oscuro-max mb-3">
        Pasos CRECER ({pasos.length})
      </h3>
      {isLoading && <Loader className="animate-spin text-primario" size={16} />}
      {pasos.length === 0 && !isLoading && (
        <p className="text-sm text-neutro">Sin pasos CRECER aún.</p>
      )}
      <div className="grid gap-2">
        {pasos.map((step) => (
          <div
            key={step.id}
            className="flex items-center gap-3 rounded-xl p-3 border border-slate-100"
          >
            <span
              className="w-2 h-8 rounded-full shrink-0"
              style={{ backgroundColor: step.tipo_paso?.color_hex ?? "#ccc" }}
            />
            <div>
              <p className="font-semibold text-sm text-neutro-oscuro-max">
                {step.tipo_paso?.nombre}
              </p>
              <p className="text-xs text-neutro">
                {step.contenidos?.length ?? 0} contenido(s)
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
