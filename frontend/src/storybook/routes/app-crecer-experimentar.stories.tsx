import type { Meta, StoryObj } from "@storybook/react-vite";
import { StoryRouter } from "@/storybook/story-router";
import { CrecerLayout, PreguntaItem, OpcionesRespuesta, PreguntasReflexion } from "@/features/crecer/componentes";

const imgSrc = "https://picsum.photos/seed/experimentar/800/400";

const opcionesExp = [
  { id: "x1", actividad_id: "act-exp", etiqueta: "A", texto: "Orar cada día", orden: 1, correcta: true, retroalimentacion: "¡Muy bien!" },
  { id: "x2", actividad_id: "act-exp", etiqueta: "B", texto: "Ignorar la lectura bíblica", orden: 2, correcta: false },
];

const actividadExp = {
  id: "act-exp",
  tema_id: "tema-amor",
  paso_id: null,
  grupo_edad_id: "exploradores",
  tipo_actividad_id: "cuestionario",
  titulo: "Aplica lo aprendido",
  consigna: "¿Qué harás esta semana?",
  orden: 1,
  xp_recompensa: 25,
  dificultad: "facil",
  limite_tiempo_seg: null,
  obligatorio: true,
  retroalimentacion: null,
  configuracion: {},
  tipo_actividad: { id: "cuestionario", codigo: "cuestionario", nombre: "Cuestionario", descripcion: "", es_juego: false, activo: true, creado_en: "2026-07-10T00:00:00.000Z" },
  opciones: opcionesExp,
};

function EExperimentarStory() {
  return (
    <StoryRouter initialPath="/app/E_experimentar/tema-amor">
      <CrecerLayout
        fase={{ numero: 5, nombre: "Experimentar", imagenSrc: imgSrc, colorAccent: "#f43f5e", colorLoader: "#f43f5e" }}
        paso={{ titulo: "Ponlo en práctica", cuerpo: "Esta semana aplica lo que aprendiste." }}
        isLoading={false}
        isError={false}
        botonesAccion={{
          siguiente: { to: "/app/R_recompensar/$themeId", themeId: "tema-amor", label: "Continuar" },
          regresar: { to: "/app/C_comprobar/$themeId", themeId: "tema-amor" },
        }}
        emptyMessage="No hay contenido disponible."
      >
        <PreguntasReflexion
          preguntas={[
            { id: "p1", pregunta: "¿Quién necesita que le dediques tiempo esta semana?" },
            { id: "p2", pregunta: "¿Qué acción concreta puedes realizar?" },
          ]}
        />
        <PreguntaItem actividad={actividadExp}>
          <OpcionesRespuesta opciones={opcionesExp} colorHover="#f43f5e" />
        </PreguntaItem>
      </CrecerLayout>
    </StoryRouter>
  );
}

const meta = {
  title: "Pantallas/CRECER/E_experimentar",
  component: EExperimentarStory,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof EExperimentarStory>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Escritorio: Story = {};
export const MovilApp: Story = { globals: { viewport: { value: "movilApp", isRotated: false } } };
