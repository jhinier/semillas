import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ProfileDashboard } from "@/features/perfil/profile-dashboard";
import type { ProfileSection } from "@/features/perfil/componentes/profile-section-nav";
import "@/routes/app-perfil.css";

const gruposEdad = [
  {
    id: "grupo-semillas",
    codigo: "semillas",
    nombre: "Semillas",
    edad_minima: 5,
    edad_maxima: 8,
    descripcion: "Historias y actividades sencillas para descubrir la fe.",
    orden: 1,
  },
  {
    id: "grupo-exploradores",
    codigo: "exploradores",
    nombre: "Exploradores",
    edad_minima: 9,
    edad_maxima: 12,
    descripcion: "Contenido para comprender y aplicar la Palabra.",
    orden: 2,
  },
  {
    id: "grupo-embajadores",
    codigo: "embajadores",
    nombre: "Embajadores",
    edad_minima: 13,
    edad_maxima: 17,
    descripcion: "Retos para profundizar la fe y vivir con propósito.",
    orden: 3,
  },
];

function PerfilStory({ invitado = false }: { invitado?: boolean }) {
  const [section, setSection] = useState<ProfileSection>("resumen");

  return (
    <div className="min-h-screen bg-slate-50 p-3 md:p-8">
      <div className="mx-auto max-w-6xl">
        <ProfileDashboard
          usuario={{
            id: "usuario-1",
            rol: invitado ? "invitado" : "usuario",
            proveedor: invitado ? "invitado" : "google",
            nombre_visible: "Andres",
            correo: invitado ? null : "andres@ejemplo.com",
          }}
          perfil={{
            id: "perfil-1",
            usuario_id: "usuario-1",
            apodo: "Andres",
            grupo_edad_id: "grupo-exploradores",
            url_avatar: "2",
            clave_avatar: null,
            prefiere_audio: true,
            tamano_texto_preferido: "mediano",
          }}
          gamificacion={{
            nivel: {
              usuario_id: "usuario-1",
              xp_total: 180,
              numero_nivel: 2,
              nombre_nivel: "Raíz",
            },
            logros: [],
          }}
          progreso={{
            progresos_tema: [],
            progresos_actividad: [],
          }}
          gruposEdad={gruposEdad}
          activeSection={section}
          isSaving={false}
          onSectionChange={setSection}
          onSaveProfile={() => setSection("resumen")}
          onVincularGoogle={() => undefined}
          onVincularCorreo={() => undefined}
          onVerLogros={() => undefined}
          onEmpezarTema={() => undefined}
          onCerrarSesion={() => undefined}
        />
      </div>
    </div>
  );
}

const meta = {
  title: "Pantallas/App/Perfil",
  component: PerfilStory,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof PerfilStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CuentaVinculada: Story = {};
export const Invitado: Story = { args: { invitado: true } };
export const MovilApp: Story = {
  args: { invitado: true },
  globals: { viewport: { value: "movilApp", isRotated: false } },
};
