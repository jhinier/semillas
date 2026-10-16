import { Loader, Plus } from "lucide-react";

interface Option {
  etiqueta: string;
  texto: string;
  correcta: boolean;
  orden: number;
}

interface ActivityFormPanelProps {
  isEditMode: boolean;
  selectedStepId: string;
  selectedActivityTypeId: string;
  title: string;
  prompt: string;
  feedback: string;
  xpReward: number;
  options: Option[];
  stepsData?: Array<{ id: string; tipo_paso?: { nombre?: string | null } | null }> | null;
  activityTypesData?: Array<{ id: string; nombre?: string | null }> | null;
  isSubmitting: boolean;
  onStepChange: (v: string) => void;
  onTypeChange: (v: string) => void;
  onTitleChange: (v: string) => void;
  onPromptChange: (v: string) => void;
  onFeedbackChange: (v: string) => void;
  onXpChange: (v: number) => void;
  onOptionChange: (idx: number, texto: string) => void;
  onCorrectChange: (idx: number) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export function ActivityFormPanel({
  isEditMode,
  selectedStepId,
  selectedActivityTypeId,
  title,
  prompt,
  feedback,
  xpReward,
  options,
  stepsData,
  activityTypesData,
  isSubmitting,
  onStepChange,
  onTypeChange,
  onTitleChange,
  onPromptChange,
  onFeedbackChange,
  onXpChange,
  onOptionChange,
  onCorrectChange,
  onSubmit,
  onClose,
}: ActivityFormPanelProps) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="bg-white rounded-2xl p-5 shadow-sm mb-6 grid gap-4 max-w-xl">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-green-950">
          {isEditMode ? "Editar actividad" : "Nueva actividad (Quiz)"}
        </h3>
        <button type="button" onClick={onClose} className="text-sm text-slate-400 hover:text-slate-600">
          Cancelar
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <select value={selectedStepId} onChange={(e) => onStepChange(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm">
          <option value="">Paso CRECER</option>
          {stepsData?.map((s) => <option key={s.id} value={s.id}>{s.tipo_paso?.nombre}</option>)}
        </select>
        <select value={selectedActivityTypeId} onChange={(e) => onTypeChange(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm">
          <option value="">Tipo</option>
          {activityTypesData?.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
        </select>
      </div>

      <input placeholder="Título" value={title} onChange={(e) => onTitleChange(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
      <textarea placeholder="Pregunta" value={prompt} onChange={(e) => onPromptChange(e.target.value)} rows={3} className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
      <input placeholder="Retroalimentación (opcional)" value={feedback} onChange={(e) => onFeedbackChange(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-green-950">XP</label>
        <input type="number" value={xpReward} onChange={(e) => onXpChange(Number(e.target.value))} className="w-20 px-3 py-2 rounded-xl border border-slate-200 text-sm" />
      </div>

      <div>
        <label className="text-sm font-medium text-green-950 mb-2 block">Opciones</label>
        {options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2 mb-2">
            <span className="w-6 text-sm font-bold text-green-950">{opt.etiqueta}.</span>
            <input
              placeholder={`Opción ${opt.etiqueta}`}
              value={opt.texto}
              onChange={(e) => onOptionChange(i, e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm"
            />
            <label className="flex items-center gap-1 text-xs text-green-600 whitespace-nowrap">
              <input
                type="radio"
                name="correctOption"
                checked={opt.correcta}
                onChange={() => onCorrectChange(i)}
              />
              Correcta
            </label>
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={(!selectedStepId && !isEditMode) || !title || !prompt || isSubmitting}
        className="bg-green-600 text-white py-2.5 rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader className="animate-spin" size={18} />
            {isEditMode ? "Actualizando..." : "Creando..."}
          </>
        ) : (
          <>
            <Plus size={18} />
            {isEditMode ? "Actualizar actividad" : "Crear actividad"}
          </>
        )}
      </button>
    </form>
  );
}
