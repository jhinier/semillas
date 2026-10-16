import { Link2, Pencil, Settings, ShieldCheck } from "lucide-react";
import type { Usuario } from "@/shared/api/api";

interface SeccionEncabezadoProps {
  usuario: Usuario | undefined;
  esInvitado: boolean;
  avatarUrl: string;
  nombreVisible: string;
  proveedorLabel: string;
  grupoEdadLabel: string;
  onEditar: () => void;
  onAjustes: () => void;
  onVincular: () => void;
}

export function SeccionEncabezado({
  usuario,
  esInvitado,
  avatarUrl,
  nombreVisible,
  proveedorLabel,
  grupoEdadLabel,
  onEditar,
  onAjustes,
  onVincular,
}: SeccionEncabezadoProps) {
  return (
    <section className="profile-hero-card">
      <div className="profile-hero-card__main">
        <div className="profile-hero-card__avatar">
          <img src={avatarUrl} alt={`Avatar de ${nombreVisible}`} />
        </div>

        <div className="profile-hero-card__identity">
          <p className="profile-eyebrow">Mi perfil</p>
          <h1>{nombreVisible}</h1>
          <p className="profile-hero-card__group">{grupoEdadLabel}</p>
          <div className="profile-hero-card__badges">
            <span className="profile-status-badge">{proveedorLabel}</span>
            {!esInvitado && usuario?.correo ? (
              <span className="profile-account-email" title={usuario.correo}>
                {usuario.correo}
              </span>
            ) : null}
          </div>
        </div>

        <div className="profile-hero-card__actions">
          <button type="button" className="profile-action-button" onClick={onEditar}>
            <Pencil size={18} aria-hidden="true" />
            <span>Editar perfil</span>
          </button>
          <button type="button" className="profile-action-button profile-action-button--secondary" onClick={onAjustes}>
            <Settings size={18} aria-hidden="true" />
            <span>Preferencias</span>
          </button>
        </div>
      </div>

      <div className={`profile-hero-card__notice ${esInvitado ? "is-warning" : "is-success"}`}>
        <span className="profile-hero-card__notice-icon" aria-hidden="true">
          {esInvitado ? <Link2 size={20} /> : <ShieldCheck size={20} />}
        </span>
        <div>
          <strong>{esInvitado ? "Protege tu progreso" : "Tu progreso está sincronizado"}</strong>
          <p>
            {esInvitado
              ? "Vincula una cuenta para conservar tus temas, XP e insignias si cambias de dispositivo."
              : "Tu perfil, preferencias y avances están asociados a tu cuenta."}
          </p>
        </div>
        {esInvitado ? (
          <button type="button" className="profile-notice-cta" onClick={onVincular}>
            Vincular ahora
          </button>
        ) : null}
      </div>
    </section>
  );
}
