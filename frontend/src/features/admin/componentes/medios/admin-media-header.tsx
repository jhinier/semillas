import { LibraryBig, Upload } from "lucide-react";

type AdminMediaHeaderProps = {
  totalItems: number;
  isUploading: boolean;
  onSubirRecurso: () => void;
};

export function AdminMediaHeader({
  totalItems,
  isUploading,
  onSubirRecurso,
}: AdminMediaHeaderProps) {
  return (
    <section className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white px-5 py-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
          <LibraryBig size={23} aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Biblioteca multimedia
            </h1>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-extrabold text-slate-600">
              {totalItems} {totalItems === 1 ? "recurso" : "recursos"}
            </span>
          </div>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Organiza imágenes, audios, videos y documentos usados en Semillas.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onSubirRecurso}
        disabled={isUploading}
        className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 text-sm font-extrabold text-white shadow-[0_10px_22px_rgba(109,53,232,0.24)] transition hover:bg-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Upload size={17} aria-hidden="true" />
        {isUploading ? "Subiendo archivos…" : "Subir recursos"}
      </button>
    </section>
  );
}
