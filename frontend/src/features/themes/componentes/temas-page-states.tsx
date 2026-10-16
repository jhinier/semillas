import { BookOpenCheck, RefreshCw, SearchX } from "lucide-react";

export function TemasLoadingState() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Cargando temas">
      {[0, 1, 2].map((item) => (
        <div key={item} className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
          <div className="h-40 animate-pulse bg-slate-100" />
          <div className="space-y-3 p-5">
            <div className="h-5 w-2/3 animate-pulse rounded-full bg-slate-100" />
            <div className="h-8 w-4/5 animate-pulse rounded-xl bg-slate-100" />
            <div className="h-4 w-full animate-pulse rounded-full bg-slate-100" />
            <div className="h-10 w-full animate-pulse rounded-full bg-slate-100" />
          </div>
        </div>
      ))}
      <span className="sr-only">Cargando temas bíblicos...</span>
    </div>
  );
}

export function TemasErrorState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-red-100 bg-white px-4 py-16 text-center shadow-sm">
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
        <RefreshCw className="size-7" />
      </div>
      <h4 className="mb-1 text-base font-black text-slate-800">No pudimos cargar los temas</h4>
      <p className="max-w-[300px] text-sm font-semibold text-slate-400">
        Revisa tu conexión e inténtalo nuevamente.
      </p>
    </div>
  );
}

export function TemasEmptyState({ onReset }: { onReset?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-100 bg-white px-4 py-14 text-center shadow-sm">
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-500">
        <SearchX className="size-7" />
      </div>
      <h4 className="mb-1 text-base font-black text-slate-800">No encontramos temas</h4>
      <p className="max-w-[310px] text-sm font-semibold text-slate-400">
        Cambia la búsqueda, la pestaña o la Senda seleccionada.
      </p>
      {onReset ? (
        <button
          type="button"
          onClick={onReset}
          className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-slate-900 px-5 text-sm font-black text-white transition-colors hover:bg-primario"
        >
          <BookOpenCheck className="size-4" />
          Ver todos los temas
        </button>
      ) : null}
    </div>
  );
}
