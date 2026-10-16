import { Loader2, UploadCloud } from "lucide-react";

type UploadProgress = {
  actual: number;
  total: number;
  nombre: string;
};

interface AdminMediaUploadProgressProps {
  progress: UploadProgress | null;
}

export function AdminMediaUploadProgress({
  progress,
}: AdminMediaUploadProgressProps) {
  if (!progress) return null;

  const percentage = Math.round((progress.actual / progress.total) * 100);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 w-[min(360px,calc(100vw-2.5rem))] rounded-2xl border border-violet-200 bg-white p-4 shadow-2xl"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
          <UploadCloud size={20} aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <strong className="text-sm font-black text-slate-900">
              Subiendo recursos
            </strong>
            <span className="text-xs font-extrabold text-violet-700">
              {progress.actual}/{progress.total}
            </span>
          </div>
          <p className="mt-1 truncate text-xs font-semibold text-slate-500">
            {progress.nombre}
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
            <span
              className="block h-full rounded-full bg-violet-600 transition-[width]"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
            <Loader2 size={12} className="animate-spin" /> Procesando archivo…
          </div>
        </div>
      </div>
    </div>
  );
}
