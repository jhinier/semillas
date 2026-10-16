import type { Meta, StoryObj } from "@storybook/react-vite";
import { StoryRouter } from "@/storybook/story-router";
import { CrecerLayout, PreguntaItem, OpcionesRespuesta } from "@/features/crecer/componentes";

const opciones = [
  { id: "a1", etiqueta: "A", texto: "Orar por ellos", correcta: true },
  { id: "a2", etiqueta: "B", texto: "Ignorar su necesidad", correcta: false },
  { id: "a3", etiqueta: "C", texto: "Criticarlos", correcta: false },
];

const actividadMock = {
  id: "act-1",
  tema_id: "tema-amor",
  paso_id: null,
  grupo_edad_id: "exploradores",
  tipo_actividad_id: "cuestionario",
  titulo: "¿Cómo mostrar amor?",
  consigna: "Elige la mejor acción.",
  orden: 1,
  xp_recompensa: 20,
  dificultad: "facil",
  limite_tiempo_seg: null,
  obligatorio: true,
  retroalimentacion: null,
  configuracion: {},
  tipo_actividad: { id: "cuestionario", codigo: "cuestionario", nombre: "Cuestionario", descripcion: "", es_juego: false, activo: true, creado_en: "2026-07-10T00:00:00.000Z" },
  opciones: opciones.map((o, index) => ({ ...o, actividad_id: "act-1", orden: index + 1 })),
};

const imgSrc = "https://picsum.photos/seed/conectar/800/400";

function CConectarStory() {
  return (
    <StoryRouter initialPath="/app/C_conectar/tema-amor">
      <CrecerLayout
        fase={{ numero: 1, nombre: "Conectar", imagenSrc: imgSrc, colorAccent: "#16a34a", colorLoader: "#16a34a" }}
        paso={{ titulo: "El amor se demuestra", cuerpo: "Piensa en una persona que necesite tu ayuda esta semana." }}
        isLoading={false}
        isError={false}
        botonesAccion={{
          siguiente: { to: "/app/R_relatar/$themeId", themeId: "tema-amor", label: "Continuar" },
          regresar: { to: "/app/temas/$themeId", themeId: "tema-amor" },
        }}
      >
        <PreguntaItem actividad={actividadMock}>
          <OpcionesRespuesta opciones={opciones} colorHover="#16a34a" />
        </PreguntaItem>
      </CrecerLayout>
    </StoryRouter>
  );
}

function CConectarLoading() {
  return (
    <StoryRouter initialPath="/app/C_conectar/tema-amor">
      <CrecerLayout
        fase={{ numero: 1, nombre: "Conectar", imagenSrc: imgSrc, colorAccent: "#16a34a", colorLoader: "#16a34a" }}
        paso={null}
        isLoading
        isError={false}
        botonesAccion={{ siguiente: { to: "/", themeId: "tema", label: "Continuar" }, regresar: { to: "/", themeId: "tema" } }}
      />
    </StoryRouter>
  );
}

function CConectarError() {
  return (
    <StoryRouter initialPath="/app/C_conectar/tema-amor">
      <CrecerLayout
        fase={{ numero: 1, nombre: "Conectar", imagenSrc: imgSrc, colorAccent: "#16a34a", colorLoader: "#16a34a" }}
        paso={null}
        isLoading={false}
        isError
        botonesAccion={{ siguiente: { to: "/", themeId: "tema", label: "Continuar" }, regresar: { to: "/", themeId: "tema" } }}
      />
    </StoryRouter>
  );
}

const meta = {
  title: "Pantallas/CRECER/C_conectar",
  component: CConectarStory,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof CConectarStory>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Escritorio: Story = {};
export const MovilApp: Story = { globals: { viewport: { value: "movilApp", isRotated: false } } };
export const Cargando: Story = { render: () => <CConectarLoading /> };
export const Error: Story = { render: () => <CConectarError /> };
