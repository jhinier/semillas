import { useEffect, useRef } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  CloudOff,
  Database,
  HardDrive,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Wifi,
  X,
} from "lucide-react";
import { solicitarAlmacenamientoPersistente } from "@/lib/offline/media-cache";
import { toast } from "sonner";
import { formatBytes } from "./recurso-card";

export interface OfflineManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isOnline: boolean;
  storage: {
    usageBytes: number;
    quotaBytes: number;
    percentage: number;
    persisted: boolean;
  } | undefined;
  packageBytes: number;
  downloadedCount: number;
  pendingCount: number;
  failedCount: number;
  lastSyncTimestamp: string | null;
  isSyncing: boolean;
  onSync: () => void;
  onRetryFailed: () => void;
  onDiscardFailed: () => void;
  onDeleteAll: () => void;
}

export function OfflineManagerDialog({
  open,
  onOpenChange,
  isOnline,
  storage,
  packageBytes,
  downloadedCount,
  pendingCount,
  failedCount,
  lastSyncTimestamp,
  isSyncing,
  onSync,
  onRetryFailed,
  onDiscardFailed,
  onDeleteAll,
}: OfflineManagerDialogProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.setTimeout(() => closeRef.current?.focus(), 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
      if (event.key !== "Tab") return;
      const dialog = closeRef.current?.closest('[role="dialog"]');
      const focusables = dialog?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables?.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previous?.focus();
    };
  }, [onOpenChange, open]);

  if (!open) return null;

  const handlePersist = async () => {
    const granted = await solicitarAlmacenamientoPersistente().catch(() => false);
    if (granted) toast.success("El dispositivo intentará conservar tus descargas.");
    else toast.info("El navegador administrará el espacio automáticamente.");
  };

  return (
    <div className="offline-manager" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onOpenChange(false);
    }}>
      <section
        className="offline-manager__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="offline-manager-title"
        aria-describedby="offline-manager-description"
      >
        <header className="offline-manager__header">
          <div>
            <span className="offline-manager__eyebrow">CONTENIDO SIN CONEXIÓN</span>
            <h2 id="offline-manager-title">Gestionar descargas</h2>
            <p id="offline-manager-description">Controla el espacio, la sincronización y los temas guardados en este dispositivo.</p>
          </div>
          <button ref={closeRef} type="button" className="offline-manager__close" onClick={() => onOpenChange(false)} aria-label="Cerrar gestor de descargas">
            <X size={21} />
          </button>
        </header>

        <div className="offline-manager__status-grid">
          <article>
            <span className={`offline-manager__status-icon ${isOnline ? "is-online" : "is-offline"}`}>
              {isOnline ? <Wifi size={20} /> : <CloudOff size={20} />}
            </span>
            <div><strong>{isOnline ? "Con conexión" : "Sin conexión"}</strong><span>{isOnline ? "Puedes descargar y sincronizar" : "Solo se abrirá lo que ya descargaste"}</span></div>
          </article>
          <article>
            <span className="offline-manager__status-icon"><Database size={20} /></span>
            <div><strong>{downloadedCount} {downloadedCount === 1 ? "tema guardado" : "temas guardados"}</strong><span>{formatBytes(packageBytes)} en paquetes educativos</span></div>
          </article>
          <article>
            <span className={`offline-manager__status-icon ${failedCount > 0 ? "is-warning" : "is-ok"}`}>
              {failedCount > 0 ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
            </span>
            <div><strong>{pendingCount} pendientes · {failedCount} con error</strong><span>{lastSyncTimestamp ? `Última sincronización: ${formatDate(lastSyncTimestamp)}` : "Todavía no se ha sincronizado"}</span></div>
          </article>
        </div>

        <section className="offline-manager__storage">
          <div className="offline-manager__storage-heading">
            <div className="offline-manager__storage-icon"><HardDrive size={21} /></div>
            <div><h3>Almacenamiento del sitio</h3><p>{formatBytes(storage?.usageBytes ?? 0)} usados de {storage?.quotaBytes ? formatBytes(storage.quotaBytes) : "una cuota administrada por el navegador"}</p></div>
          </div>
          <div className="offline-manager__storage-track"><span style={{ width: `${storage?.percentage ?? 0}%` }} /></div>
          <div className="offline-manager__storage-actions">
            <span className={storage?.persisted ? "is-ok" : ""}><ShieldCheck size={16} /> {storage?.persisted ? "Descargas protegidas contra limpieza automática" : "El navegador podría liberar espacio si el dispositivo se llena"}</span>
            {!storage?.persisted && <button type="button" onClick={handlePersist}>Solicitar protección</button>}
          </div>
        </section>

        {failedCount > 0 && (
          <div className="offline-manager__failure-actions" role="alert">
            <div><AlertTriangle size={18} /><span><strong>{failedCount} {failedCount === 1 ? "evento necesita" : "eventos necesitan"} atención.</strong> Reintenta primero; descarta solo si el error no puede recuperarse.</span></div>
            <div>
              <button type="button" onClick={onDiscardFailed}>Descartar errores</button>
              <button type="button" onClick={onRetryFailed} disabled={!isOnline || isSyncing}>Reintentar</button>
            </div>
          </div>
        )}

        <footer className="offline-manager__footer">
          <button type="button" className="offline-manager__danger" onClick={onDeleteAll} disabled={downloadedCount === 0}>
            <Trash2 size={17} /> Eliminar todas las descargas
          </button>
          <button type="button" className="offline-manager__primary" onClick={onSync} disabled={!isOnline || isSyncing || pendingCount === 0}>
            <RefreshCw size={17} className={isSyncing ? "animate-spin" : ""} />
            {isSyncing ? "Sincronizando…" : "Sincronizar ahora"}
          </button>
        </footer>
      </section>
    </div>
  );
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "desconocida";
  return new Intl.DateTimeFormat("es-EC", { dateStyle: "short", timeStyle: "short" }).format(date);
}
