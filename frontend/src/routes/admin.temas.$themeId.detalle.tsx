import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  ArrowLeft,
  BookOpenCheck,
  Check,
  CheckCircle2,
  Circle,
  Clock3,
  Eye,
  FilePenLine,
  Gamepad2,
  Layers3,
  Loader2,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import {
  enviarTemaRevision,
  obtenerEstudioTemaAdmin,
  publicarTema,
} from "../features/admin/admin.api";
import { resolverPortadaTemaAdmin, usePortadasFirmadasAdmin } from "../features/admin/admin-theme-cover";

export const Route = createFileRoute("/admin/temas/$themeId/detalle")({ component: AdminThemeStudioPage });

const stepsOrder = ["conectar", "relatar", "ensenar", "comprobar", "experimentar", "recompensar"];
const stepLabels: Record<string, string> = {
  conectar: "Conectar",
  relatar: "Relatar",
  ensenar: "Enseñar",
  comprobar: "Comprobar",
  experimentar: "Experimentar",
  recompensar: "Recompensar",
};

function AdminThemeStudioPage() {
  const { themeId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const estudioQuery = useQuery({ queryKey: ["admin", "theme", themeId, "studio"], queryFn: () => obtenerEstudioTemaAdmin(themeId) });
  const portadasFirmadas = usePortadasFirmadasAdmin(estudioQuery.data ? [estudioQuery.data.tema] : []);

  const reviewMutation = useMutation({
    mutationFn: () => enviarTemaRevision(themeId),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin", "theme", themeId] }); toast.success("Tema enviado a revisión"); },
    onError: (error) => toast.error(error instanceof Error ? error.message : "No se pudo enviar a revisión"),
  });
  const publishMutation = useMutation({
    mutationFn: () => publicarTema(themeId),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin", "theme", themeId] }); toast.success("Tema publicado"); },
    onError: (error) => toast.error(error instanceof Error ? error.message : "No se pudo publicar"),
  });

  if (estudioQuery.isLoading) return <StudioState icon={<Loader2 className="animate-spin" />} title="Preparando el estudio" description="Cargando tema, CRECER, actividades y revisión." />;
  if (estudioQuery.isError || !estudioQuery.data) return <StudioState icon={<BookOpenCheck />} title="No se pudo abrir el tema" description={estudioQuery.error instanceof Error ? estudioQuery.error.message : "Vuelve a intentarlo."} />;

  const { tema, pasos, actividades, completitud, revisiones } = estudioQuery.data;
  const portada = resolverPortadaTemaAdmin({
    titulo: tema.titulo,
    urlFirmada: portadasFirmadas.get(tema.id) ?? null,
  });
  const grupos = tema.grupos_edad ?? [];
  const ultimaRevision = revisiones[0];

  const navCards = [
    { to: "/admin/temas/$themeId/edit", icon: FilePenLine, title: "Información y portada", text: "Edita senda, objetivo, público, duración, XP y recurso de portada." },
    { to: "/admin/temas/$themeId/crecer", icon: Layers3, title: "Editor CRECER", text: "Construye los seis momentos por cada franja, con medios y reflexiones." },
    { to: "/admin/temas/$themeId/activities", icon: Gamepad2, title: "Actividades", text: "Asigna juegos, preguntas, videos y recursos a cada paso." },
  ] as const;

  return (
    <div className="admin-theme-studio">
      <button type="button" className="admin-secondary-button w-fit" onClick={() => navigate({ to: "/admin/temas" })}><ArrowLeft size={17} /> Volver a temas</button>

      <section className="admin-theme-studio__hero">
        <div className="admin-theme-studio__copy">
          <div className="admin-theme-studio__badges">
            <span className="admin-theme-studio__badge"><Circle size={8} fill="currentColor" /> {tema.estado}</span>
            <span className="admin-theme-studio__badge">{tema.senda?.nombre ?? "Sin senda"}</span>
            <span className="admin-theme-studio__badge">v{tema.version_contenido}</span>
          </div>
          <h2>{tema.titulo}</h2>
          <p>{tema.resumen || tema.objetivo}</p>
          <div className="admin-theme-studio__hero-actions">
            <Link to="/admin/temas/$themeId/edit" params={{ themeId }}><FilePenLine size={16} /> Editar tema</Link>
            <Link to="/admin/temas/$themeId/preview" params={{ themeId }}><Eye size={16} /> Vista previa</Link>
            {tema.estado === "aprobado" ? <button type="button" disabled={publishMutation.isPending} onClick={() => publishMutation.mutate()}><Send size={16} /> Publicar</button> : <button type="button" disabled={!completitud.listo_para_revision || reviewMutation.isPending || tema.estado === "revision"} onClick={() => reviewMutation.mutate()}><ShieldCheck size={16} /> {tema.estado === "revision" ? "En revisión" : "Enviar a revisión"}</button>}
          </div>
        </div>
        <div className="admin-theme-studio__cover"><img src={portada} alt="" /></div>
      </section>

      <div className="admin-theme-studio__grid">
        <div className="flex min-w-0 flex-col gap-4">
          <section className="admin-studio-card">
            <h3>Estudio de contenido</h3><p>Cada módulo abre un editor especializado; no necesitas salir del tema para completar la lección.</p>
            <div className="admin-studio-nav-grid">
              {navCards.map((card) => { const Icon = card.icon; return <Link key={card.title} to={card.to} params={{ themeId }} className="admin-studio-nav-card"><span><Icon size={19} /></span><div><strong>{card.title}</strong><small>{card.text}</small></div></Link>; })}
            </div>
          </section>

          <section className="admin-studio-card">
            <h3>Cobertura CRECER por franja</h3><p>Comprueba rápidamente qué versiones de cada paso ya están listas.</p>
            <div className="admin-age-matrix">
              <table>
                <thead><tr><th>Franja</th>{stepsOrder.map((code) => <th key={code}>{stepLabels[code]}</th>)}</tr></thead>
                <tbody>{grupos.map((grupo) => <tr key={grupo.id}><td>{grupo.nombre}</td>{stepsOrder.map((code) => { const ready = pasos.some((paso) => paso.tipo_paso?.codigo === code && paso.contenidos.some((contenido) => contenido.grupo_edad_id === grupo.id && contenido.titulo.trim() && contenido.cuerpo.trim())); return <td key={code}><span title={ready ? "Contenido listo" : "Contenido pendiente"} className={`admin-matrix-dot ${ready ? "admin-matrix-dot--ready" : ""}`}>{ready ? <Check size={13} /> : <Circle size={10} />}</span></td>; })}</tr>)}</tbody>
              </table>
            </div>
          </section>

          <section className="admin-studio-card">
            <h3>Actividades de la lección</h3><p>{actividades.length} actividades distribuidas entre pasos y grupos de edad.</p>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {stepsOrder.map((code) => {
                const step = pasos.find((item) => item.tipo_paso?.codigo === code);
                const count = actividades.filter((actividad) => actividad.paso_id === step?.id).length;
                return <div key={code} className="rounded-2xl bg-slate-50 p-4"><strong className="block text-sm text-slate-800">{stepLabels[code]}</strong><span className="mt-2 block text-2xl font-black text-violet-600">{count}</span><small className="text-xs text-slate-400">actividades</small></div>;
              })}
            </div>
            <Link to="/admin/temas/$themeId/activities" params={{ themeId }} className="admin-primary-button mt-4"><Gamepad2 size={17} /> Administrar actividades</Link>
          </section>
        </div>

        <aside className="admin-studio-aside">
          <section className="admin-studio-card">
            <h3>Completitud editorial</h3><div className="admin-completeness-ring" style={{ "--progress": completitud.porcentaje } as React.CSSProperties}><strong>{completitud.porcentaje}%</strong></div>
            <div className="admin-completeness-list">{completitud.criterios.map((criterio) => <div key={criterio.codigo} className={`admin-completeness-item ${criterio.completo ? "admin-completeness-item--complete" : ""}`}><span>{criterio.etiqueta}{criterio.detalle ? <small className="ml-1 opacity-70">· {criterio.detalle}</small> : null}</span>{criterio.completo ? <CheckCircle2 size={16} /> : <Circle size={15} />}</div>)}</div>
          </section>

          <section className="admin-studio-card">
            <h3>Resumen</h3>
            <div className="mt-4 grid gap-3 text-sm">
              <SummaryLine icon={<Clock3 size={16} />} label="Duración" value={`${tema.minutos_estimados} min`} />
              <SummaryLine icon={<Sparkles size={16} />} label="Recompensa" value={`${tema.xp_recompensa} XP`} />
              <SummaryLine icon={<Layers3 size={16} />} label="Contenidos" value={`${completitud.estadisticas.contenidos_creados}/${completitud.estadisticas.contenidos_esperados}`} />
              <SummaryLine icon={<Activity size={16} />} label="Actividades" value={String(actividades.length)} />
            </div>
          </section>

          <section className="admin-studio-card">
            <h3>Flujo editorial</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">{ultimaRevision ? `Último estado: ${ultimaRevision.estado}. ${ultimaRevision.notas ?? "Sin notas."}` : "Este tema todavía no se ha enviado a revisión."}</p>
            <Link to="/admin/revision" className="admin-secondary-button mt-4 w-full"><Settings2 size={16} /> Abrir cola de revisión</Link>
          </section>
        </aside>
      </div>
    </div>
  );
}

function SummaryLine({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) { return <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3"><span className="flex items-center gap-2 text-slate-500">{icon}{label}</span><strong className="text-slate-800">{value}</strong></div>; }
function StudioState({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) { return <div className="admin-dashboard-state"><span>{icon}</span><h2>{title}</h2><p>{description}</p></div>; }
