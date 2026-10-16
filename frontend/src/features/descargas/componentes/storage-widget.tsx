import { CheckCircle2, CloudOff, Database, HardDrive, RefreshCw, Settings2 } from "lucide-react";
import { formatBytes } from "./recurso-card";

export interface StorageWidgetProps {
  usageBytes: number;
  quotaBytes: number;
  packageBytes: number;
  percentage: number;
  persisted: boolean;
  downloadedCount: number;
  isOnline: boolean;
  pendingCount: number;
  onGestionarClick: () => void;
  onSync: () => void;
  isSyncing: boolean;
}

export function StorageWidget({
  usageBytes,
  quotaBytes,
  packageBytes,
  percentage,
  persisted,
  downloadedCount,
  isOnline,
  pendingCount,
  onGestionarClick,
  onSync,
  isSyncing,
}: StorageWidgetProps) {
  return (
    <section className="offline-storage-card" aria-label="Resumen del almacenamiento offline">
      <div className="offline-storage-card__main">
        <div className="offline-storage-card__icon"><HardDrive size={21} aria-hidden="true" /></div>
        <div className="offline-storage-card__copy">
          <div className="offline-storage-card__title-row">
            <h2>Contenido en este dispositivo</h2>
            <span>{downloadedCount} {downloadedCount === 1 ? "tema" : "temas"}</span>
          </div>
          <p>{formatBytes(packageBytes)} en paquetes de Semillas · {formatBytes(usageBytes)} usados por la app</p>
          <div className="offline-storage-card__track" aria-label={`${percentage}% del almacenamiento disponible utilizado`}>
            <span style={{ width: `${percentage}%` }} />
          </div>
          <div className="offline-storage-card__foot">
            <span><Database size={14} /> {quotaBytes > 0 ? `${formatBytes(quotaBytes)} disponibles para el sitio` : "Cuota calculada por el dispositivo"}</span>
            <span className={persisted ? "is-ok" : ""}>
              {persisted ? <CheckCircle2 size={14} /> : <CloudOff size={14} />}
              {persisted ? "Almacenamiento protegido" : "Protección no concedida"}
            </span>
          </div>
        </div>
      </div>

      <div className="offline-storage-card__actions">
        {pendingCount > 0 && (
          <button type="button" className="offline-storage-card__sync" onClick={onSync} disabled={!isOnline || isSyncing}>
            <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} />
            Sincronizar {pendingCount}
          </button>
        )}
        <button type="button" className="offline-storage-card__manage" onClick={onGestionarClick}>
          <Settings2 size={16} /> Gestionar
        </button>
      </div>
    </section>
  );
}
