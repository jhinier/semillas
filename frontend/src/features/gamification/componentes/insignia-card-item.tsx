import * as React from "react";
import { CheckCircle2, Gift, LockKeyhole, Sparkles, Share2, Loader2 } from "lucide-react";

export interface InsigniaCardItemProps {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  criterio: string;
  bono_xp: number;
  imagen: string;
  obtenido: boolean;
  pendienteReclamar: boolean;
  ganadoEn?: string | null;
  reclamadoEn?: string | null;
  reclamando?: boolean;
  onReclamar?: (id: string) => void;
  onCompartir?: () => void;
}

export const InsigniaCardItem: React.FC<InsigniaCardItemProps> = ({
  id,
  nombre,
  descripcion,
  criterio,
  bono_xp,
  imagen,
  obtenido,
  pendienteReclamar,
  ganadoEn,
  reclamando = false,
  onReclamar,
  onCompartir,
}) => {
  const [compartiendo, setCompartiendo] = React.useState(false);

  const handleReclamar = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!reclamando && onReclamar) {
      onReclamar(id);
    }
  };

  const handleClickCompartir = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (compartiendo || !onCompartir) return;
    setCompartiendo(true);
    try {
      await onCompartir();
    } finally {
      setCompartiendo(false);
    }
  };

  // Estado visual: pendiente de reclamar > obtenido > bloqueado
  const claseEstado = pendienteReclamar
    ? "is-claimable"
    : obtenido
      ? "is-earned"
      : "is-locked";

  return (
    <article className={`logro-card ${claseEstado}`}>
      <div className="logro-card__visual">
        <img src={imagen} alt="" aria-hidden="true" loading="lazy" decoding="async" />
        <span className="logro-card__state-icon" aria-hidden="true">
          {pendienteReclamar
            ? <Gift size={18} className="logro-card__state-icon--claimable" />
            : obtenido
              ? <CheckCircle2 size={18} />
              : <LockKeyhole size={17} />}
        </span>
        {pendienteReclamar && (
          <span className="logro-card__claim-pulse" aria-hidden="true" />
        )}
      </div>

      <div className="logro-card__content">
        <div className="logro-card__heading">
          <h2>{nombre}</h2>
          <span className="logro-card__xp">
            <Sparkles size={14} aria-hidden="true" />
            +{bono_xp} XP
          </span>
        </div>

        <p className="logro-card__criterion">{criterio}</p>
        <p className="logro-card__description">{descripcion}</p>

        <div className="logro-card__footer">
          {pendienteReclamar ? (
            // Logro desbloqueado, pendiente de reclamar
            <button
              type="button"
              className="logro-card__reclamar-btn"
              onClick={handleReclamar}
              disabled={reclamando}
              aria-label={`Reclamar insignia: ${nombre}`}
            >
              {reclamando ? (
                <>
                  <span className="logro-card__reclamar-spinner" aria-hidden="true" />
                  Reclamando…
                </>
              ) : (
                <>
                  <Gift size={14} aria-hidden="true" />
                  ¡Reclamar!
                </>
              )}
            </button>
          ) : (
            // Logro bloqueado o ya reclamado
            <span className={`logro-card__status ${obtenido ? "is-earned" : ""}`}>
              {obtenido ? "Obtenida" : "Por obtener"}
            </span>
          )}

          {obtenido && !pendienteReclamar && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {ganadoEn && (
                <time dateTime={ganadoEn} className="logro-card__date">
                  {new Intl.DateTimeFormat("es-EC", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(ganadoEn))}
                </time>
              )}
              {onCompartir && (
                <button
                  type="button"
                  className="logro-card__compartir-btn"
                  onClick={(e) => void handleClickCompartir(e)}
                  disabled={compartiendo}
                  aria-label={`Compartir insignia: ${nombre}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.35rem',
                    background: 'transparent', border: 'none', color: '#16a34a',
                    fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                    padding: '0.2rem 0.5rem', borderRadius: '4px',
                  }}
                >
                  {compartiendo ? <Loader2 size={14} className="animate-spin" /> : <Share2 size={14} />}
                  Compartir
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
};
