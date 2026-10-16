import { Link } from "@tanstack/react-router";
import { CheckCircle2, Clock3, Download, HardDrive, LoaderCircle, RefreshCw, Sparkles, Trash2, WifiOff } from "lucide-react";
import type { TemaDescargaUI } from "../hooks/use-descargas-page";

export interface RecursoCardProps {
  tema: TemaDescargaUI;
  isOnline: boolean;
  onDownload: () => void;
  onDelete: () => void;
}

export function RecursoCard({ tema, isOnline, onDownload, onDelete }: RecursoCardProps) {
  const descargando = tema.progresoDescarga !== null;
  return <article className={`offline-theme-card ${tema.descargado ? "is-downloaded" : ""}`}>
    <div className="offline-theme-card__media">
      {tema.imagenUrl ? <img src={tema.imagenUrl} alt="" aria-hidden="true" loading="lazy" decoding="async" /> : <div className="offline-theme-card__placeholder" aria-hidden="true"><Download size={34} /></div>}
      <span className="offline-theme-card__senda" style={{ color: tema.color }}>{tema.senda}</span>
      {tema.descargado && <span className="offline-theme-card__ready"><CheckCircle2 size={14} aria-hidden="true" /> Listo offline</span>}
    </div>
    <div className="offline-theme-card__body">
      <div className="offline-theme-card__heading"><div><h3>{tema.titulo}</h3><p>{tema.descripcion}</p></div>{tema.actualizacionDisponible && <span className="offline-theme-card__update">Nueva versión</span>}</div>
      <div className="offline-theme-card__meta" aria-label="Datos del tema"><span><Clock3 size={15} aria-hidden="true" /> {tema.minutos} min</span><span><Sparkles size={15} aria-hidden="true" /> {tema.xp} XP</span>{tema.tamanoBytes !== null && <span><HardDrive size={15} aria-hidden="true" /> {formatBytes(tema.tamanoBytes)}</span>}{tema.medios !== null && <span>{tema.medios} recursos</span>}</div>
      {descargando && <div className="offline-theme-card__progress" aria-live="polite"><div className="offline-theme-card__progress-row"><span><LoaderCircle size={15} className="animate-spin" /> Preparando contenido</span><strong>{tema.progresoDescarga}%</strong></div><div className="offline-theme-card__progress-track"><span style={{ width: `${tema.progresoDescarga}%` }} /></div></div>}
      {tema.errorDescarga && <p className="offline-theme-card__error">{tema.errorDescarga}</p>}
      <div className="offline-theme-card__actions">
        {tema.descargado ? <><Link to="/app/temas/$themeId" params={{ themeId: tema.id }} className="offline-theme-card__primary">Abrir sin conexión</Link>{tema.actualizacionDisponible && <button type="button" className="offline-theme-card__secondary" onClick={onDownload} disabled={!isOnline || descargando}><RefreshCw size={17} aria-hidden="true" /> Actualizar</button>}<button type="button" className="offline-theme-card__delete" onClick={onDelete} disabled={descargando} aria-label={`Eliminar descarga de ${tema.titulo}`}><Trash2 size={18} /></button></> : <button type="button" className="offline-theme-card__primary" onClick={onDownload} disabled={!isOnline || descargando}>{isOnline ? <Download size={17} aria-hidden="true" /> : <WifiOff size={17} aria-hidden="true" />}{isOnline ? "Descargar" : "Necesita conexión"}</button>}
      </div>
    </div>
  </article>;
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 MB";
  const mb = bytes / 1024 / 1024;
  if (mb < 1) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return mb < 10 ? `${mb.toFixed(1)} MB` : `${Math.round(mb)} MB`;
}
