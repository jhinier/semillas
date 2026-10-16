import { CheckCircle2, Link2, Mail, ShieldCheck } from "lucide-react";

import { Boton } from "@/componentes/ui/boton";

interface SeccionCuentaProps {
  esInvitado: boolean;
  proveedor: string;
  correo?: string | null;
  onVincularGoogle: () => void;
  onVincularCorreo: () => void;
  onCerrarSesion: () => void;
}

export function SeccionCuenta({
  esInvitado,
  proveedor,
  correo,
  onVincularGoogle,
  onVincularCorreo,
  onCerrarSesion,
}: SeccionCuentaProps) {
  const esGoogle = proveedor === "google";

  return (
    <section className="profile-side-card">
      <div className="profile-side-card__heading">
        <div>
          <p className="profile-eyebrow">Cuenta</p>
          <h2>Acceso y respaldo</h2>
        </div>
        <span className={`profile-side-card__status ${esInvitado ? "is-warning" : "is-success"}`}>
          {esInvitado ? <Link2 size={17} /> : <ShieldCheck size={17} />}
        </span>
      </div>

      <div className="profile-account-summary">
        <strong>{esInvitado ? "Cuenta invitada" : "Cuenta vinculada"}</strong>
        <p>
          {esInvitado
            ? "Tu avance vive en este dispositivo hasta que vincules una cuenta."
            : esGoogle
              ? "Tu progreso está protegido con Google."
              : "Tu progreso está protegido con tu correo."}
        </p>
        {!esInvitado && correo ? <span>{correo}</span> : null}
      </div>

      <div className="profile-account-actions">
        {esInvitado ? (
          <>
            <button type="button" className="profile-account-button" onClick={onVincularGoogle}>
              <Link2 size={18} aria-hidden="true" />
              Vincular con Google
            </button>
            <button type="button" className="profile-account-button" onClick={onVincularCorreo}>
              <Mail size={18} aria-hidden="true" />
              Vincular con correo
            </button>
          </>
        ) : esGoogle ? (
          <div className="profile-account-verified">
            <CheckCircle2 size={18} aria-hidden="true" />
            Google vinculado
          </div>
        ) : (
          <button type="button" className="profile-account-button" onClick={onVincularGoogle}>
            <Link2 size={18} aria-hidden="true" />
            Añadir acceso con Google
          </button>
        )}

        <Boton
          variante="contorno"
          onClick={onCerrarSesion}
          clase="profile-account-logout"
        >
          Cerrar sesión
        </Boton>
      </div>
    </section>
  );
}
