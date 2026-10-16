import { CloudOff, DownloadCloud, Settings2, Wifi } from "lucide-react";

export interface DescargasBannerProps {
  visible: boolean;
  isOnline: boolean;
  downloadedCount: number;
  pendingCount: number;
  onCerrar: () => void;
  onGestionar: () => void;
}

export function DescargasBanner({
  visible,
  isOnline,
  downloadedCount,
  pendingCount,
  onCerrar,
  onGestionar,
}: DescargasBannerProps) {
  if (!visible) return null;

  return (
    <section className="downloads-hero" aria-label="Estado del contenido sin conexión">
      <div className="downloads-hero__icon" aria-hidden="true">
        {isOnline ? <DownloadCloud size={26} /> : <CloudOff size={26} />}
      </div>

      <div className="downloads-hero__copy">
        <span className="downloads-hero__eyebrow">
          {isOnline ? <Wifi size={14} aria-hidden="true" /> : <CloudOff size={14} aria-hidden="true" />}
          {isOnline ? "Con conexión" : "Modo sin conexión"}
        </span>
        <h2>{isOnline ? "Lleva tus lecciones contigo" : "Sigue aprendiendo sin internet"}</h2>
        <p>
          {isOnline
            ? "Descarga temas completos con historias, audios, imágenes y actividades para abrirlos cuando no tengas señal."
            : downloadedCount > 0
              ? `Tienes ${downloadedCount} ${downloadedCount === 1 ? "tema listo" : "temas listos"} en este dispositivo.`
              : "Todavía no hay temas descargados. Conéctate para preparar tu primera lección offline."}
        </p>
      </div>

      <div className="downloads-hero__actions">
        {pendingCount > 0 && (
          <span className="downloads-hero__pending">
            {pendingCount} {pendingCount === 1 ? "cambio pendiente" : "cambios pendientes"}
          </span>
        )}
        <button type="button" className="downloads-hero__manage" onClick={onGestionar}>
          <Settings2 size={17} aria-hidden="true" />
          Gestionar
        </button>
        <button type="button" className="downloads-hero__close" onClick={onCerrar} aria-label="Ocultar información de descargas">
          ×
        </button>
      </div>
    </section>
  );
}
