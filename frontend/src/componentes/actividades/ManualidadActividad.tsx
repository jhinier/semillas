import { Check, CheckCircle2, Circle, Scissors, Paintbrush, ArrowRight } from "lucide-react";
import iconoCandado from "../../assets/images/icons/candado.webp";
import { useManualidad } from "./hooks/use-manualidad";

interface ManualidadActividadProps {
  actividad: {
    id: string;
    xp_recompensa?: number;
    retroalimentacion?: string;
    configuracion?: {
      materiales?: string[];
      pasos?: string[];
    };
  };
  onComplete: (actividadId: string, xpRecompensa: number) => void;
}

export function ManualidadActividad({ actividad, onComplete }: ManualidadActividadProps) {
  const {
    materialesCheck,
    currentStep,
    completed,
    todosMaterialesListos,
    toggleMaterial,
    nextStep,
  } = useManualidad({ actividad, onComplete });

  const materiales = actividad.configuracion?.materiales || [];
  const pasos = actividad.configuracion?.pasos || [];

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto py-2 animate-in fade-in zoom-in-95">

      {!completed ? (
        <div className="w-full flex flex-col gap-8">

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 text-pink-100 opacity-50">
              <Scissors size={100} />
            </div>
            <h3 className="text-xl font-bold text-slate-700 flex items-center gap-2 mb-2 relative z-10">
              <Paintbrush className="text-pink-500" /> Materiales Necesarios
            </h3>
            <p className="text-sm text-slate-500 mb-5 relative z-10 font-medium">
              Toca cada material para marcarlo cuando ya lo tengas listo en tu mesa.
            </p>

            {materiales.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10">
                {materiales.map((material: string, index: number) => {
                  const isChecked = materialesCheck.includes(index);

                  return (
                    <button
                      key={index}
                      onClick={() => toggleMaterial(index)}
                      className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left font-semibold ${
                        isChecked
                          ? "bg-green-100 border-green-500 text-green-900 shadow-sm"
                          : "bg-slate-100 border-slate-300 text-slate-800 hover:bg-pink-50 hover:border-pink-400"
                      }`}
                    >
                      {isChecked ? (
                        <CheckCircle2 className="text-green-500 shrink-0" size={24} />
                      ) : (
                        <Circle className="text-slate-300 shrink-0" size={24} />
                      )}
                      <span className={`font-medium ${isChecked ? "line-through opacity-80" : ""}`}>
                        {material}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-slate-500 relative z-10">No necesitas materiales especiales para esta actividad.</p>
            )}
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm relative">

            {!todosMaterialesListos && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300">
                <img src={iconoCandado} alt="Bloqueado" className="w-16 h-16 mb-4 opacity-80 drop-shadow-sm" />
                <p className="text-slate-700 font-bold text-center px-6 text-lg">Prepara todos tus materiales primero para desbloquear las instrucciones.</p>
              </div>
            )}
            <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-4 mb-6">
              <h3 className="text-xl font-bold text-slate-700">Instrucciones</h3>
              <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm font-bold shadow-sm whitespace-nowrap">
                Paso {currentStep + 1} de {pasos.length}
              </span>
            </div>

            {pasos.length > 0 ? (
              <div className="flex flex-col items-center gap-6">
                <div className="w-full bg-pink-50 border-2 border-pink-100 p-8 rounded-2xl text-center min-h-[120px] flex items-center justify-center transition-all animate-in slide-in-from-right-4">
                  <p className="text-2xl font-medium text-slate-800">
                    {pasos[currentStep]}
                  </p>
                </div>

                <button
                  onClick={nextStep}
                  className="w-full sm:w-auto bg-pink-100 hover:bg-pink-200 text-pink-700 border-2 border-pink-300 font-bold px-8 py-4 rounded-2xl transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-sm"
                >
                  {currentStep === pasos.length - 1 ? "¡Terminé mi manualidad!" : "Siguiente paso"}
                  {currentStep === pasos.length - 1 ? <Check size={20} strokeWidth={3} /> : <ArrowRight size={20} strokeWidth={3} />}
                </button>
              </div>
            ) : (
              <p className="text-slate-500">Sigue las instrucciones de tu profesor.</p>
            )}
          </div>

        </div>
      ) : (
        <div className="w-full p-8 bg-green-50 rounded-3xl border-2 border-green-200 text-center animate-in zoom-in-95 mt-8 shadow-sm">
          <div className="flex justify-center mb-6 text-green-500">
            <div className="bg-white p-4 rounded-full shadow-md">
              <Check size={64} strokeWidth={3} />
            </div>
          </div>
          <h4 className="text-3xl font-bold text-green-800 mb-4">¡Excelente Trabajo!</h4>
          {actividad.retroalimentacion ? (
            <p className="text-green-700 text-xl font-medium max-w-lg mx-auto">{actividad.retroalimentacion}</p>
          ) : (
            <p className="text-green-700 text-xl font-medium">Has completado tu manualidad con éxito.</p>
          )}
        </div>
      )}
    </div>
  );
}
