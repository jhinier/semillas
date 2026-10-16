import type { Meta, StoryObj } from "@storybook/react-vite";
import { StoryRouter } from "@/storybook/story-router";
import { CrecerLayout, ActividadWrapper } from "@/features/crecer/componentes";

const imgSrc = "https://picsum.photos/seed/comprobar/800/400";

const actividadComprobar = {
  id: "act-comp",
  tema_id: "tema-amor",
  paso_id: null,
  grupo_edad_id: "exploradores",
  tipo_actividad_id: "cuestionario",
  titulo: "Evaluación final",
  consigna: "Responde correctamente las preguntas.",
  orden: 1,
  xp_recompensa: 30,
  dificultad: "media",
  limite_tiempo_seg: null,
  obligatorio: true,
  retroalimentacion: null,
  configuracion: {},
  tipo_actividad: { id: "cuestionario", codigo: "cuestionario", nombre: "Cuestionario", descripcion: "", es_juego: false, activo: true, creado_en: "2026-07-10T00:00:00.000Z" },
  opciones: [
    { id: "c1", actividad_id: "act-comp", etiqueta: "A", texto: "El amor de Dios es perfecto", orden: 1, correcta: true, retroalimentacion: "¡Correcto!" },
    { id: "c2", actividad_id: "act-comp", etiqueta: "B", texto: "El amor de Dios cambia", orden: 2, correcta: false },
  ],
};

function CComprobarStory() {
  return (
    <StoryRouter initialPath="/app/C_comprobar/tema-amor">
      <CrecerLayout
        fase={{ numero: 4, nombre: "Comprobar", imagenSrc: imgSrc, colorAccent: "#7c3aed", colorLoader: "#7c3aed" }}
        paso={{ titulo: "Demuestra lo aprendido", cuerpo: "Responde las siguientes preguntas." }}
        isLoading={false}
        isError={false}
        botonesAccion={{
          siguiente: { to: "/app/E_experimentar/$themeId", themeId: "tema-amor", label: "Continuar" },
          regresar: { to: "/app/E_ensenar/$themeId", themeId: "tema-amor" },
        }}
      >
        <div className="w-full flex flex-col gap-12 mt-8">
          <ActividadWrapper actividad={actividadComprobar} onComplete={() => {}} />
        </div>
      </CrecerLayout>
    </StoryRouter>
  );
}

const meta = {
  title: "Pantallas/CRECER/C_comprobar",
  component: CComprobarStory,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof CComprobarStory>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Escritorio: Story = {};
export const MovilApp: Story = { globals: { viewport: { value: "movilApp", isRotated: false } } };
