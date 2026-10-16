import { AlertCircle, Check, CloudOff, RefreshCw } from "lucide-react";
import { useSyncStatus } from "@/lib/offline";

export function SyncStatusBadge() {
  const { data: status } = useSyncStatus();
  if (!status) return null;

  if (!status.isOnline) {
    return (
      <div className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
        <CloudOff size={12} />
        <span>Modo sin conexión</span>
      </div>
    );
  }

  if (status.isSyncing) {
    return (
      <div className="flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
        <RefreshCw size={12} className="animate-spin" />
        <span>Reintentando</span>
      </div>
    );
  }

  if (status.failedCount > 0) {
    return (
      <div className="flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700">
        <AlertCircle size={12} />
        <span>Requiere revisión ({status.failedCount})</span>
      </div>
    );
  }

  if (status.pendingCount > 0) {
    return (
      <div className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
        <RefreshCw size={12} className="animate-spin" />
        <span>{status.pendingCount} pendiente{status.pendingCount !== 1 ? "s" : ""}</span>
      </div>
    );
  }

  if (status.lastSyncExito) {
    return (
      <div className="flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
        <Check size={12} />
        <span>Sincronizado</span>
      </div>
    );
  }

  return null;
}

export function OfflineBanner() {
  const { data: status } = useSyncStatus();
  if (status?.isOnline !== false) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-[100] flex min-h-10 items-center justify-center gap-2 bg-slate-900 px-4 py-2 text-center text-sm font-bold text-white shadow-lg" role="status">
      <CloudOff size={16} />
      <span>Sin conexión. Usa tus temas descargados; el progreso se sincronizará después.</span>
    </div>
  );
}
