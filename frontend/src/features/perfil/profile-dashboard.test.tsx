import { describe, expect, it, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

mock.module("sonner", () => ({
  toast: {
    success: () => undefined,
    error: () => undefined,
  },
}));

const { ProfileDashboard } = await import("./profile-dashboard");

const gruposEdad = [
  {
    id: "grupo-1",
    codigo: "semillas",
    nombre: "Semillas",
    edad_minima: 5,
    edad_maxima: 8,
    descripcion: "Historias y actividades sencillas.",
    orden: 1,
  },
];

const perfilBase = {
  id: "perfil-1",
  usuario_id: "usuario-1",
  apodo: "Semillero",
  grupo_edad_id: "grupo-1",
  url_avatar: "1",
  clave_avatar: null,
  prefiere_audio: true,
  tamano_texto_preferido: "mediano",
};

const progresoBase = {
  progresos_tema: [
    {
      usuario_id: "usuario-1",
      tema_id: "tema-1",
      estado: "completado",
      porcentaje: 100,
      iniciado_en: "2026-01-01T00:00:00.000Z",
      completado_en: "2026-01-02T00:00:00.000Z",
      ultimo_paso_id: "paso-1",
      actualizado_en: "2026-01-02T00:00:00.000Z",
    },
  ],
  progresos_actividad: [
    {
      usuario_id: "usuario-1",
      actividad_id: "actividad-1",
      intentos: 2,
      mejor_puntaje: 100,
      completado: true,
      completado_en: "2026-01-02T00:00:00.000Z",
      actualizado_en: "2026-01-02T00:00:00.000Z",
    },
  ],
};

const commonActions = {
  onSectionChange: () => undefined,
  onSaveProfile: () => undefined,
  onVincularGoogle: () => undefined,
  onVincularCorreo: () => undefined,
  onVerLogros: () => undefined,
  onEmpezarTema: () => undefined,
  onCerrarSesion: () => undefined,
};

describe("ProfileDashboard", () => {
  it("muestra datos humanos, métricas reales y acciones de edición", () => {
    const html = renderToStaticMarkup(
      <ProfileDashboard
        usuario={{
          id: "usuario-1",
          rol: "usuario",
          proveedor: "google",
          nombre_visible: "Semillero",
          correo: "semillero@ejemplo.com",
        }}
        perfil={perfilBase}
        gamificacion={{
          nivel: {
            usuario_id: "usuario-1",
            xp_total: 180,
            numero_nivel: 4,
            nombre_nivel: "Explorador",
          },
          logros: [
            {
              usuario_id: "usuario-1",
              logro_id: "logro-1",
              ganado_en: "2026-01-01T00:00:00.000Z",
              logro: {
                id: "logro-1",
                codigo: "primer-paso",
                nombre: "Primer paso",
                descripcion: "Completó su primer tema",
                codigo_criterio: "temas_completados",
                valor_criterio: 1,
                bono_xp: 25,
                url_icono: null,
                activo: true,
                creado_en: "2026-01-01T00:00:00.000Z",
              },
            },
          ],
        }}
        progreso={progresoBase}
        gruposEdad={gruposEdad}
        activeSection="resumen"
        isSaving={false}
        {...commonActions}
      />,
    );

    expect(html).toContain("Semillas · 5–8 años");
    expect(html).toContain("180");
    expect(html).toContain("Primer paso");
    expect(html).toContain("Editar perfil");
    expect(html).toContain("Google vinculado");
  });

  it("muestra formulario editable y acciones de vinculación para invitado", () => {
    const html = renderToStaticMarkup(
      <ProfileDashboard
        usuario={{
          id: "usuario-guest",
          rol: "invitado",
          proveedor: "invitado",
          nombre_visible: "Visitante",
          correo: null,
        }}
        perfil={{ ...perfilBase, usuario_id: "usuario-guest", apodo: "Visitante" }}
        gamificacion={{ nivel: null, logros: [] }}
        progreso={{ progresos_tema: [], progresos_actividad: [] }}
        gruposEdad={gruposEdad}
        activeSection="editar"
        isSaving={false}
        {...commonActions}
      />,
    );

    expect(html).toContain("Edita tu perfil");
    expect(html).toContain("Elige tu avatar");
    expect(html).toContain("Franja de edad");
  });
});
