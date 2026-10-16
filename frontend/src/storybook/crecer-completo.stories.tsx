import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import type { Actividad } from "@/shared/api/api";
import { CrecerLayout } from "@/features/crecer/componentes/crecer-layout";
import { OpcionesConFeedback } from "@/features/crecer/componentes/feedback-respuesta";
import { OpcionesRespuesta } from "@/features/crecer/componentes/opciones-respuesta";
import { PreguntaItem } from "@/features/crecer/componentes/pregunta-item";
import { PreguntasReflexion } from "@/features/crecer/componentes/preguntas-reflexion";
import { StoryRouter } from "./story-router";
import conectarImg from "@/assets/images/Ilustraciones/Conectar.webp";

const opciones = [
  { id: "amor", actividad_id: "actividad-reflexion", etiqueta: "A", texto: "Ayudar con alegría", orden: 1, correcta: true, retroalimentacion: "¡Muy bien!" },
  { id: "orgullo", actividad_id: "actividad-reflexion", etiqueta: "B", texto: "Pensar solo en mí", orden: 2, correcta: false, retroalimentacion: "Recuerda mirar al prójimo." },
  { id: "indiferencia", actividad_id: "actividad-reflexion", etiqueta: "C", texto: "Ignorar a quien necesita ayuda", orden: 3, correcta: false },
];

const actividad = {
  id: "actividad-reflexion",
  tema_id: "tema-amor",
  paso_id: null,
  grupo_edad_id: "exploradores",
  tipo_actividad_id: "cuestionario",
  titulo: "¿Cómo puedo mostrar amor?",
  consigna: "Elige la acción que refleja mejor la enseñanza de Jesús.",
  orden: 1,
  xp_recompensa: 20,
  dificultad: "facil",
  limite_tiempo_seg: null,
  obligatorio: true,
  retroalimentacion: null,
  configuracion: {},
  tipo_actividad: {
    id: "cuestionario",
    codigo: "cuestionario",
    nombre: "Cuestionario",
    descripcion: "Pregunta de opción múltiple",
    es_juego: false,
    activo: true,
    creado_en: "2026-07-10T00:00:00.000Z",
  },
  opciones,
} satisfies Omit<Actividad, "opciones"> & { opciones: typeof opciones };

function ContenidoCrecer() {
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  return (
    <StoryRouter initialPath="/app/C_conectar/tema-amor">
      <CrecerLayout
        fase={{ numero: 1, nombre: "Conectar", imagenSrc: conectarImg, colorAccent: "#2E9E5B", colorLoader: "text-emerald-600" }}
        paso={{ titulo: "El amor se demuestra", cuerpo: "Piensa en una persona que necesite tu ayuda esta semana." }}
        isLoading={false}
        isError={false}
        botonesAccion={{
          siguiente: { to: "/app/C_conectar/$themeId", themeId: "tema-amor", label: "Continuar" },
          regresar: { to: "/app/C_conectar/$themeId", themeId: "tema-amor" },
        }}
      >
        <PreguntaItem actividad={actividad}>
          <OpcionesConFeedback
            opciones={opciones}
            actividadId={actividad.id}
            selectedAnswers={respuestas}
            xpRecompensa={actividad.xp_recompensa}
            onSelectOption={(actividadId, opcionId) => setRespuestas({ [actividadId]: opcionId })}
          />
        </PreguntaItem>
        <div className="rounded-2xl border border-slate-100 bg-white p-5">
          <h3 className="text-lg font-black text-slate-800">Vista previa sin responder</h3>
          <OpcionesRespuesta opciones={opciones} colorHover="#2E9E5B" />
        </div>
        <PreguntasReflexion
          preguntas={[
            { id: "p1", pregunta: "¿Quién necesita que le dediques tiempo esta semana?" },
            { id: "p2", pregunta: "¿Qué acción concreta puedes realizar hoy?" },
          ]}
        />
      </CrecerLayout>
    </StoryRouter>
  );
}

const meta = {
  title: "Pantallas/CRECER/Fase completa",
  component: ContenidoCrecer,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof ContenidoCrecer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Escritorio: Story = {};
export const MovilApp: Story = { globals: { viewport: { value: "movilApp", isRotated: false } } };
export const Cargando: Story = {
  render: () => (
    <StoryRouter>
      <CrecerLayout
        fase={{ numero: 1, nombre: "Conectar", imagenSrc: conectarImg, colorAccent: "#2E9E5B", colorLoader: "text-emerald-600" }}
        paso={null}
        isLoading
        isError={false}
        botonesAccion={{ siguiente: { to: "/", themeId: "tema", label: "Continuar" }, regresar: { to: "/", themeId: "tema" } }}
      />
    </StoryRouter>
  ),
};
export const Error: Story = {
  render: () => (
    <StoryRouter>
      <CrecerLayout
        fase={{ numero: 1, nombre: "Conectar", imagenSrc: conectarImg, colorAccent: "#2E9E5B", colorLoader: "text-emerald-600" }}
        paso={null}
        isLoading={false}
        isError
        botonesAccion={{ siguiente: { to: "/", themeId: "tema", label: "Continuar" }, regresar: { to: "/", themeId: "tema" } }}
      />
    </StoryRouter>
  ),
};
