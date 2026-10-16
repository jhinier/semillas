import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState, type KeyboardEvent } from "react";
import { Info, Layers3 } from "lucide-react";
import { useForm } from "react-hook-form";
import type { CrearTemaSolicitud } from "@/features/admin/admin.api";
import type { GrupoEdad, Senda } from "@/shared/api/api";
import { Field, TagInput, ThemePreviewCard, ActivityFormPanel, ActivityEmptyState, ActivityHeader, ActivityLoadingState, AdminTemaDetalleHeader, AdminTemasEditHeader, AdminTemasEditTabs, AdminTemasNewHeader, AgeGroupSelector, CoverImageUpload, CrecerContentEditor, CrecerStepSelector, CrecerStepsCard, CrecerStepsList, EditThemeActionsPanel, EditThemeCompletenessPanel, EditThemeLastEditPanel, EditThemeLoading, ThemeStatusPanel, FormNavigation, PasoActividades, PasoCrecer, PasoEscritura, PasoInformacionGeneral, PasoMedia, PasoPreview, PreviewSidebar, EmptyState, SectionCard, StepIndicator, TabConfig, TabGeneral, TabPortada, TabPublicacion, ThemeActionsCard, ThemeCrecerHeader, ThemeCrecerSidebar, ThemeMetadataCard, ThemeObjetivoCard, ThemePreviewHeader, ThemeStatsGrid } from "@/features/admin/componentes/temas";
import { AdminListLayout, AdminTipsWidget, AdminXpWidget } from "@/features/admin/componentes/dashboard";
import { BackButton, ClubVisibilitySelector } from "@/features/admin/componentes/clubes-admin";
import type { ClubVisibilidades } from "@/features/admin/componentes/clubes-admin";
import { PortadaFileInput } from "@/features/admin/componentes/medios";
import { StoryRouter } from "./story-router";
import portadaImg from "@/assets/images/Ilustraciones/Tema1.webp";

const sendas: Senda[] = [
  { id: "padre", codigo: "padre", nombre: "Senda del Padre", descripcion: null, color_hex: "#E9A23B", nombre_icono: "sun", orden: 1 },
  { id: "hijo", codigo: "hijo", nombre: "Senda del Hijo", descripcion: null, color_hex: "#1565C0", nombre_icono: "heart", orden: 2 },
];
const grupos: GrupoEdad[] = [
  { id: "semillas", codigo: "semillas", nombre: "Semillas", edad_minima: 5, edad_maxima: 7, descripcion: "Contenido breve y visual", orden: 1 },
  { id: "exploradores", codigo: "exploradores", nombre: "Exploradores", edad_minima: 8, edad_maxima: 11, descripcion: "Retos para descubrir", orden: 2 },
  { id: "embajadores", codigo: "embajadores", nombre: "Embajadores", edad_minima: 12, edad_maxima: 15, descripcion: "Reflexión y liderazgo", orden: 3 },
];
const pasos = [
  { id: "conectar", codigo: "C_conectar", nombre: "Conectar", color_hex: "#2E9E5B" },
  { id: "relatar", codigo: "R_relatar", nombre: "Relatar", color_hex: "#E9A23B" },
  { id: "experimentar", codigo: "E_experimentar", nombre: "Experimentar", color_hex: "#EE6C4D" },
  { id: "comprobar", codigo: "C_comprobar", nombre: "Comprobar", color_hex: "#1565C0" },
  { id: "ensenar", codigo: "E_ensenar", nombre: "Enseñar", color_hex: "#8E44AD" },
  { id: "recompensar", codigo: "R_recompensar", nombre: "Recompensar", color_hex: "#17A398" },
];
const tema = {
  titulo: "El amor de Dios",
  resumen: "Un recorrido para reconocer y compartir el amor que recibimos de Dios.",
  objetivo: "Que los niños identifiquen acciones concretas de amor y servicio.",
  version_contenido: 3,
  minutos_estimados: 25,
  xp_recompensa: 120,
  version_biblica_id: "NVI",
  actualizado_en: "2026-07-10T14:30:00.000Z",
  publicado_en: "2026-07-01T10:00:00.000Z",
  slug: "el-amor-de-dios",
  portada_recurso: { url_publica: portadaImg },
  grupos_edad: grupos.map(({ id, nombre }) => ({ id, nombre })),
  senda: { nombre: "Senda del Hijo" },
  creado_por: { nombre_visible: "Andres Gaibor" },
  versiculo_clave: { texto: "Nosotros amamos porque él nos amó primero.", libro_id: "1 Juan", capitulo: 4, versiculo: 19 },
};
const estado = { clase: "bg-emerald-100 text-emerald-700", punto: "bg-emerald-500", etiqueta: "Publicado" };
const estadoCrecer = { ...estado, fondoHero: "from-emerald-50 to-white", brillo: "bg-emerald-300/30" };
const contenidoPasos = pasos.map((paso, index) => ({
  id: paso.id,
  orden: index + 1,
  tipo_paso: paso,
  contenidos: index < 2 ? [{ id: `${paso.id}-contenido`, grupo_edad_id: "exploradores", titulo: paso.nombre, cuerpo: "Contenido adaptado para explorar el amor de Dios.", instruccion_corta: "Conversa y participa." }] : [],
}));

function EditorTemaCompleto() {
  const { register } = useForm<CrearTemaSolicitud>({
    defaultValues: { senda_id: "hijo", titulo: tema.titulo, slug: tema.slug, objetivo: tema.objetivo, resumen: tema.resumen, version_biblica_id: "nvi", minutos_estimados: 25, xp_recompensa: 120, grupo_edad_ids: ["exploradores"] },
  });
  const [tab, setTab] = useState<"general" | "portada" | "config" | "publicacion">("general");
  const [tags, setTags] = useState(["amor", "servicio", "familia"]);
  const [tagInput, setTagInput] = useState("");
  const [visibilidad, setVisibilidad] = useState<ClubVisibilidades>({ todos: false, semillitas: true, guardianes: true, corazones: false, jovenes: false });
  const [grupo, setGrupo] = useState("exploradores");
  const [paso, setPaso] = useState("C_conectar");
  const [titulo, setTitulo] = useState("El amor se demuestra");
  const [cuerpo, setCuerpo] = useState("Jesús nos enseña que amar también significa escuchar, ayudar y compartir.");
  const [instruccion, setInstruccion] = useState("Piensa en una acción de amor para hoy.");
  const [tituloGeneral, setTituloGeneral] = useState(tema.titulo);
  const [resumen, setResumen] = useState(tema.resumen);
  const [objetivo, setObjetivo] = useState(tema.objetivo);
  const [audiencia, setAudiencia] = useState("Exploradores · 8 a 11 años");
  const [categoria, setCategoria] = useState("amor");
  const [versiculo, setVersiculo] = useState("1 Juan 4:19");
  const [duracion, setDuracion] = useState(25);
  const fileRef = useRef<HTMLInputElement>(null);
  const addTag = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && tagInput.trim()) { event.preventDefault(); setTags((prev) => [...prev, tagInput.trim()]); setTagInput(""); }
  };

  const editorTab = tab === "general" ? (
    <TabGeneral title={tituloGeneral} onTitleChange={setTituloGeneral} targetAudience={audiencia} onTargetAudienceChange={setAudiencia} shortDesc={resumen} onShortDescChange={setResumen} category={categoria} onCategoryChange={setCategoria} keyVerse={versiculo} onKeyVerseChange={setVersiculo} duration={duracion} onDurationChange={setDuracion} mainMessage={objetivo} onMainMessageChange={setObjetivo} tagsList={tags} onTagsChange={setTags} previewImageUrl={portadaImg} />
  ) : tab === "portada" ? (
    <TabPortada themeTitle={tituloGeneral} portadaUrl={portadaImg} onChangePortada={() => undefined} onRemovePortada={() => undefined} />
  ) : tab === "config" ? (
    <TabConfig estado="publicado" versionContenido={3} publicadoEn={tema.publicado_en} minutosEstimados={duracion} xpRecompensa={120} />
  ) : (
    <TabPublicacion estado="publicado" publicadoEn={tema.publicado_en} isPublishing={false} isDrafting={false} onPublicar={() => undefined} onBorrador={() => undefined} />
  );

  return (
    <StoryRouter initialPath="/admin/temas/tema-amor/edit">
      <div className="min-h-screen bg-slate-50 p-3 sm:p-8">
        <div className="mx-auto grid max-w-[1500px] gap-6">
          <AdminTemasEditHeader title={tituloGeneral} onNavigate={() => undefined} />
          <AdminTemasEditTabs activeTab={tab} onTabChange={setTab} />
          <AdminListLayout
            content={<>{editorTab}<ThemePreviewCard title={tituloGeneral} category={categoria} targetAudience={audiencia} shortDesc={resumen} mainMessage={objetivo} keyVerse={versiculo} duration={duracion} previewImageUrl={portadaImg} /></>}
            sidebar={<><ThemeStatusPanel estado="publicado" /><EditThemeCompletenessPanel percentage={86} items={[{ label: "Información general", done: true }, { label: "Portada", done: true }, { label: "Contenido CRECER", done: true }, { label: "Actividades", done: false }]} /><EditThemeActionsPanel onSave={() => undefined} onDuplicate={() => undefined} onArchive={() => undefined} isSavePending={false} isDuplicatePending={false} isArchivePending={false} /><EditThemeLastEditPanel nombreVisible="Andres Gaibor" actualizadoEn={tema.actualizado_en} /></>}
          />

          <div className="border-t border-slate-200 pt-8">
            <StepIndicator currentStep={2} />
            <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
              <div className="grid gap-5">
                <AdminTemasNewHeader onBack={() => undefined} />
                <PasoInformacionGeneral register={register} sendas={sendas} gruposEdad={grupos} bibleVersions={[{ id: "nvi", codigo: "NVI", nombre: "Nueva Versión Internacional", dominio_publico: false }]} liveTitle={tituloGeneral} tagsInput={tagInput} onTagsInputChange={setTagInput} tagsList={tags} onAddTag={addTag} onRemoveTag={(index) => setTags((prev) => prev.filter((_, i) => i !== index))} clubVisibilities={visibilidad} onClubVisibilitiesChange={setVisibilidad} />
                <AgeGroupSelector ageGroups={grupos} selectedAgeGroupId={grupo} onSelect={setGrupo} />
                <CrecerStepSelector pasos={pasos} activeStepCode={paso} selectedAgeGroupId={grupo} stepsData={contenidoPasos} onSelect={setPaso} />
                <CrecerContentEditor activeStep={pasos.find((item) => item.codigo === paso)} selectedAgeGroup={grupos.find((item) => item.id === grupo) ?? null} title={titulo} body={cuerpo} shortInstruction={instruccion} resourceId={null} audioResourceId={null} resources={[]} questions={[]} onTitleChange={setTitulo} onBodyChange={setCuerpo} onShortInstructionChange={setInstruccion} onResourceChange={() => undefined} onAudioResourceChange={() => undefined} onQuestionsChange={() => undefined} onUpload={() => undefined} onSave={() => undefined} isPending={false} isUploading={false} isSuccess />
                <CrecerStepsList pasos={contenidoPasos} />
                <ActivityHeader selectedAgeGroupId={grupo} ageGroupsData={grupos} isEditMode={false} isLoading={false} onAgeGroupChange={setGrupo} onNew={() => undefined} />
                <ActivityFormPanel isEditMode={false} selectedStepId="conectar" selectedActivityTypeId="quiz" title="Quiz del amor" prompt="¿Qué acción demuestra amor?" feedback="¡Excelente!" xpReward={25} options={[{ etiqueta: "A", texto: "Ayudar", correcta: true, orden: 1 }, { etiqueta: "B", texto: "Ignorar", correcta: false, orden: 2 }]} stepsData={contenidoPasos} activityTypesData={[{ id: "quiz", nombre: "Cuestionario" }]} isSubmitting={false} onStepChange={() => undefined} onTypeChange={() => undefined} onTitleChange={() => undefined} onPromptChange={() => undefined} onFeedbackChange={() => undefined} onXpChange={() => undefined} onOptionChange={() => undefined} onCorrectChange={() => undefined} onSubmit={() => undefined} onClose={() => undefined} />
                <SectionCard icon={Layers3} title="Componentes auxiliares" description="Estados disponibles para el editor."><div className="grid gap-4 sm:grid-cols-2"><ActivityEmptyState /><ActivityLoadingState /><EmptyState icon={Info} title="Sin bloques" description="Agrega contenido para comenzar." /></div></SectionCard>
              </div>
              <div className="grid content-start gap-5">
                <PasoPreview liveTitle={tituloGeneral} liveResumen={resumen} liveDuration={duracion} liveXp={120} activeVersion="NVI" clubVisibilities={visibilidad} checkedClubsCount={Object.values(visibilidad).filter(Boolean).length} />
                <FormNavigation isPending={false} onSaveDraft={() => undefined} />
                <AdminTipsWidget />
                <AdminXpWidget />
                <CrecerStepsCard pasos={contenidoPasos} isLoading={false} />
                <ClubVisibilitySelector clubVisibilities={visibilidad} onClubVisibilitiesChange={setVisibilidad} />
                <CoverImageUpload />
                <Field label="Campo reutilizable" help="Ejemplo del contenedor de formularios"><input className="w-full rounded-xl border border-slate-200 px-3 py-2" defaultValue="Contenido" /></Field>
                <TagInput tags={tags} onChange={setTags} helperText="Presiona Enter para agregar." />
                <PortadaFileInput inputRef={fileRef} onFileChange={() => undefined} />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-8">
            <ThemeCrecerHeader theme={tema} portadaUrl={portadaImg} estado={estadoCrecer} pasosCompletos={2} totalPasos={6} progreso={33} selectedAgeGroup={grupos[1]} onBack={() => undefined} />
            <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
              <div className="grid gap-5">
                <ThemePreviewHeader theme={tema} portadaUrl={portadaImg} estado={estado} formatDate={() => "1 de julio de 2026"} formatDateTime={() => "10 de julio de 2026, 14:30"} onEdit={() => undefined} onViewDetail={() => undefined} />
                <ThemeStatsGrid xpRecompensa={120} minutosEstimados={25} endaNombre="Senda del Hijo" versionContenido={3} />
                <ThemeObjetivoCard objetivo={tema.objetivo} />
                <ThemeMetadataCard creadoPor={tema.creado_por} publicadoEn={tema.publicado_en} actualizadoEn={tema.actualizado_en} gruposEdad={grupos.map(({ id, nombre }) => ({ id, nombre }))} />
              </div>
              <div className="grid content-start gap-5">
                <ThemeCrecerSidebar theme={tema} portadaUrl={portadaImg} estado={estado} activeStepContent={{ titulo, cuerpo, instruccion_corta: instruccion }} formatElapsed={() => "Editado hace 20 minutos"} />
                <PreviewSidebar theme={tema} estado={estado} onEdit={() => undefined} onViewDetail={() => undefined} formatDate={() => "1 jul 2026"} formatDateTime={() => "10 jul 2026, 14:30"} />
                <ThemeActionsCard themeId="tema-amor" />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-8">
            <BackButton onClick={() => undefined} />
            <AdminTemaDetalleHeader onBack={() => undefined} />
          </div>
          <PasoEscritura /><PasoCrecer /><PasoActividades /><PasoMedia />
        </div>
      </div>
    </StoryRouter>
  );
}

const meta = { title: "Pantallas/Administración/Editor de temas completo", component: EditorTemaCompleto, parameters: { layout: "fullscreen" } } satisfies Meta<typeof EditorTemaCompleto>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Escritorio: Story = {};
export const MovilApp: Story = { globals: { viewport: { value: "movilApp", isRotated: false } } };
export const Cargando: Story = { render: () => <div className="min-h-screen bg-slate-50 p-6"><EditThemeLoading /></div> };
