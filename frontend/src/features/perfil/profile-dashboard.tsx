import type { GrupoEdad, Perfil, Usuario } from "@/shared/api/api";
import type { ActualizarPerfilDatos, GamificacionMiRespuesta, ProgresoMiRespuesta } from "./profile.api";
import { useProfileDashboard } from "./hooks/use-profile-dashboard";
import { ProfileSectionNav, type ProfileSection } from "./componentes/profile-section-nav";
import { ProfileEditForm } from "./componentes/profile-edit-form";
import { ProfilePreferencesForm } from "./componentes/profile-preferences-form";
import { SeccionEncabezado } from "./componentes/seccion-encabezado";
import { SeccionMetricas } from "./componentes/seccion-metricas";
import { SeccionLogros } from "./componentes/seccion-logros";
import { SeccionCuenta } from "./componentes/seccion-cuenta";
import { SeccionPreferencias } from "./componentes/seccion-preferencias";

export type PerfilDashboardProps = {
  usuario: Usuario | undefined;
  perfil: Perfil;
  gamificacion: GamificacionMiRespuesta | undefined;
  progreso: ProgresoMiRespuesta | undefined;
  gruposEdad: GrupoEdad[];
  activeSection: ProfileSection;
  isSaving: boolean;
  onSectionChange: (section: ProfileSection) => void;
  onSaveProfile: (data: ActualizarPerfilDatos) => void;
  onVincularGoogle: () => void;
  onVincularCorreo: () => void;
  onVerLogros: () => void;
  onEmpezarTema: () => void;
  onCerrarSesion: () => void;
};

export function ProfileDashboard({
  usuario,
  perfil,
  gamificacion,
  progreso,
  gruposEdad,
  activeSection,
  isSaving,
  onSectionChange,
  onSaveProfile,
  onVincularGoogle,
  onVincularCorreo,
  onVerLogros,
  onEmpezarTema,
  onCerrarSesion,
}: PerfilDashboardProps) {
  const {
    logros,
    completados,
    esInvitado,
    proveedorLabel,
    avatarUrl,
    avatarClave,
    nombreVisible,
    grupoEdadLabel,
    tamanoTextoLabel,
  } = useProfileDashboard({ usuario, perfil, gamificacion, progreso, gruposEdad });

  return (
    <div className="profile-page">
      <ProfileSectionNav active={activeSection} onChange={onSectionChange} />

      {activeSection === "editar" ? (
        <ProfileEditForm
          perfil={perfil}
          gruposEdad={gruposEdad}
          avatarClave={avatarClave}
          isSaving={isSaving}
          onSave={onSaveProfile}
          onCancel={() => onSectionChange("resumen")}
        />
      ) : null}

      {activeSection === "ajustes" ? (
        <ProfilePreferencesForm
          perfil={perfil}
          usuario={usuario}
          isSaving={isSaving}
          onSave={onSaveProfile}
          onCancel={() => onSectionChange("resumen")}
          onVincularGoogle={onVincularGoogle}
          onVincularCorreo={onVincularCorreo}
          onLogout={onCerrarSesion}
        />
      ) : null}

      {activeSection === "resumen" ? (
        <div className="profile-dashboard-grid">
          <div className="profile-dashboard-grid__main">
            <SeccionEncabezado
              usuario={usuario}
              esInvitado={esInvitado}
              avatarUrl={avatarUrl}
              nombreVisible={nombreVisible}
              proveedorLabel={proveedorLabel}
              grupoEdadLabel={grupoEdadLabel}
              onEditar={() => onSectionChange("editar")}
              onAjustes={() => onSectionChange("ajustes")}
              onVincular={onVincularGoogle}
            />

            <SeccionMetricas gamificacion={gamificacion} completados={completados} />

            <SeccionLogros
              logros={logros}
              totalActividades={completados.actividades}
              onVerLogros={onVerLogros}
              onEmpezar={onEmpezarTema}
            />
          </div>

          <aside className="profile-dashboard-grid__aside">
            <SeccionCuenta
              esInvitado={esInvitado}
              proveedor={usuario?.proveedor ?? "invitado"}
              correo={usuario?.correo}
              onVincularGoogle={onVincularGoogle}
              onVincularCorreo={onVincularCorreo}
              onCerrarSesion={onCerrarSesion}
            />

            <SeccionPreferencias
              grupoEdadLabel={grupoEdadLabel}
              prefiereAudio={perfil.prefiere_audio}
              tamanoTextoLabel={tamanoTextoLabel}
              onEditarPerfil={() => onSectionChange("editar")}
              onEditarPreferencias={() => onSectionChange("ajustes")}
            />
          </aside>
        </div>
      ) : null}
    </div>
  );
}
