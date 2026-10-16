type TabPortadaProps = {
  themeTitle: string;
  portadaUrl?: string | null;
  isUploading?: boolean;
  onChangePortada: () => void;
  onRemovePortada: () => void;
};

export function TabPortada({
  themeTitle,
  portadaUrl,
  isUploading = false,
  onChangePortada,
  onRemovePortada,
}: TabPortadaProps) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col gap-5 text-left">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-700">Imagen de portada <span className="text-red-500">*</span></label>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
          {portadaUrl ? (
            <img src={portadaUrl} alt={`Portada de ${themeTitle}`} className="h-48 w-full object-cover" />
          ) : (
            <div className="flex h-48 flex-col items-center justify-center gap-2 px-4 text-center">
              <i className="fa-regular fa-image text-3xl text-slate-300" />
              <span className="text-xs font-bold text-slate-500">Aún no hay portada</span>
              <span className="text-[10px] text-slate-400 font-semibold">Sube una imagen JPG, PNG o WebP para mostrarla en el tema.</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onChangePortada}
            disabled={isUploading}
            className="rounded-xl bg-green-600 px-4 py-2 text-xs font-bold text-white hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUploading ? "Subiendo…" : portadaUrl ? "Cambiar portada" : "Subir portada"}
          </button>
          {portadaUrl ? (
            <button
              type="button"
              onClick={onRemovePortada}
              disabled={isUploading}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Quitar portada
            </button>
          ) : null}
        </div>

        <span className="text-[10px] text-slate-400 font-bold">Recomendado: 1200x630px, formato JPG, PNG o WebP.</span>
      </div>
    </div>
  );
}
