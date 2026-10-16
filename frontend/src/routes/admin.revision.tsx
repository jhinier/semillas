import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Clock3,
  Eye,
  Loader2,
  MessageSquareWarning,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import {
  obtenerResumenAdminDetallado,
  obtenerEstudioTemaAdmin,
  obtenerRevisionAdmin,
  obtenerRevisionesAdmin,
  resolverRevisionAdmin,
  type ResumenAdminDetallado,
  type EstudioTemaAdmin,
  type RevisionAdmin,
  type DetalleRevisionAdmin,
} from "@/features/admin/admin.api";

export const Route = createFileRoute("/admin/revision")({ component: AdminRevisionPage });

function AdminRevisionPage() {
  const queryClient = useQueryClient();
  const [revisionSeleccionadaId, setRevisionSeleccionadaId] = useState<string | null>(null);
  const [notesPorRevision, setNotesPorRevision] = useState<Record<string, string>>({});

  const cola = useQuery({
    queryKey: ["admin", "revisiones"],
    queryFn: () => obtenerRevisionesAdmin({ estado: "enviado", limit: 50, offset: 0 }),
  });

  const revisiones = cola.data?.revisiones ?? [];

  const revisionSeleccionada = useMemo(() => {
    if (!revisiones.length) return null;
    return revisiones.find((revision) => revision.id === revisionSeleccionadaId) ?? revisiones[0] ?? null;
  }, [revisiones, revisionSeleccionadaId]);

  const detalleQuery = useQuery({
    queryKey: ["admin", "revision", "detalle", revisionSeleccionada?.id ?? ""],
    queryFn: async () => {
      if (!revisionSeleccionada?.id) return null;
      return obtenerRevisionAdmin(revisionSeleccionada.id);
    },
    enabled: Boolean(revisionSeleccionada?.id),
  });

  const estudioQuery = useQuery({
    queryKey: ["admin", "revision", "estudio", revisionSeleccionada?.tema_id ?? ""],
    queryFn: async () => {
      if (!revisionSeleccionada?.tema_id) return null;
      return obtenerEstudioTemaAdmin(revisionSeleccionada.tema_id);
    },
    enabled: Boolean(revisionSeleccionada?.tema_id),
  });

  const mutation = useMutation({
    mutationFn: ({ id, estado, notas }: { id: string; estado: "aprobado" | "cambios_solicitados" | "rechazado"; notas?: string }) =>
      resolverRevisionAdmin(id, { estado, notas }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin"] });
      toast.success("Revisión actualizada");
    },
    onError: (error) => {
      const mensaje = error instanceof Error ? error.message : "No se pudo resolver la revisión";
      toast.error(mensaje);
      void queryClient.invalidateQueries({ queryKey: ["admin", "revisiones"] });
    },
  });

  return (
    <div className="admin-theme-studio">
      <section className="admin-theme-library__hero">
        <div>
          <span className="admin-eyebrow">Control editorial</span>
          <h2>Revisión de contenido</h2>
          <p>Aprueba, solicita cambios o rechaza temas completos antes de publicarlos.</p>
        </div>
        <button type="button" className="admin-secondary-button" onClick={() => cola.refetch()}>
          <RefreshCw size={17} /> Actualizar
        </button>
      </section>

      {cola.isLoading ? (
        <div className="admin-dashboard-state">
          <span><Loader2 className="animate-spin" /></span>
          <h2>Cargando revisiones</h2>
          <p>Consultando la cola editorial.</p>
        </div>
      ) : cola.isError ? (
        <div className="admin-dashboard-state">
          <span><ShieldCheck /></span>
          <h2>No se pudo cargar la cola</h2>
          <p>{cola.error instanceof Error ? cola.error.message : "Vuelve a intentarlo."}</p>
        </div>
      ) : revisiones.length === 0 ? (
        <div className="admin-dashboard-state">
          <span><CheckCircle2 /></span>
          <h2>Todo está al día</h2>
          <p>No hay temas pendientes de revisión.</p>
        </div>
      ) : (
        <div className="admin-theme-studio__grid">
          <section className="admin-studio-card">
            <h3>Cola editorial</h3>
            <p>Selecciona una revisión para revisar su detalle, notas y accesos directos.</p>

            <div className="admin-review-list mt-4">
              {revisiones.map((revision) => (
                <button
                  key={revision.id}
                  type="button"
                  onClick={() => setRevisionSeleccionadaId(revision.id)}
                  className={`admin-review-item text-left ${revisionSeleccionada?.id === revision.id ? "bg-violet-50" : ""}`}
                >
                  <span><Clock3 size={17} /></span>
                  <div>
                    <strong>{revision.titulo ?? "Tema sin título"}</strong>
                    <small>{revision.senda ?? "Sin senda"} · {revision.enviado_por ?? "Anónimo"}</small>
                  </div>
                  <time>{new Date(revision.creado_en).toLocaleString("es-EC")}</time>
                </button>
              ))}
            </div>
          </section>

          <section className="admin-studio-card">
            {revisionSeleccionada ? (
              <RevisionDetalle
                revision={revisionSeleccionada}
                detalle={detalleQuery.data ?? null}
                estudio={estudioQuery.data ?? null}
                notas={notesPorRevision[revisionSeleccionada.id] ?? revisionSeleccionada.notas_envio ?? ""}
                onNotasChange={(value) =>
                  setNotesPorRevision((actuales) => ({ ...actuales, [revisionSeleccionada.id]: value }))
                }
                onAction={(estado) =>
                  mutation.mutate({ id: revisionSeleccionada.id, estado, notas: notesPorRevision[revisionSeleccionada.id] })
                }
                pending={mutation.isPending}
              />
            ) : (
              <div className="admin-library-empty">
                <CheckCircle2 className="mx-auto text-slate-300" />
                <h3>Sin selección</h3>
                <p>Selecciona un elemento de la cola para revisar su detalle.</p>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function RevisionDetalle({
  revision,
  detalle,
  estudio,
  notas,
  onNotasChange,
  onAction,
  pending,
}: {
  revision: RevisionAdmin;
  detalle: DetalleRevisionAdmin | null;
  estudio: EstudioTemaAdmin | null;
  notas: string;
  onNotasChange: (value: string) => void;
  onAction: (estado: "aprobado" | "cambios_solicitados" | "rechazado") => void;
  pending: boolean;
}) {
  const resumen = detalle?.resumen_contenido;
  return (
    <div className="space-y-4">
      <header>
        <span className="admin-eyebrow">Detalle de revisión</span>
        <h3 className="mt-2 text-2xl font-black text-slate-900">{revision.titulo ?? "Tema sin título"}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {revision.senda ?? "Sin senda"} · enviado por {revision.enviado_por ?? "Anónimo"}
        </p>
      </header>

      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm leading-6 text-slate-700">
          {revision.notas_envio || "El autor no agregó notas."}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          to="/admin/temas/$themeId/preview"
          params={{ themeId: revision.tema_id }}
          className="admin-secondary-button"
        >
          <Eye size={16} /> Vista del estudiante
        </Link>
        <Link
          to="/admin/temas/$themeId/detalle"
          params={{ themeId: revision.tema_id }}
          className="admin-secondary-button"
        >
          <ShieldCheck size={16} /> Abrir estudio
        </Link>
      </div>

      {estudio ? (
        <div className="rounded-3xl border border-slate-200 p-4">
          <h4 className="text-sm font-black text-slate-900">Resumen editorial</h4>
          <p className="mt-2 text-sm text-slate-600">
            {estudio.completitud.porcentaje}% completo · {estudio.completitud.estadisticas.grupos_edad} franjas · {estudio.completitud.estadisticas.actividades} actividades
          </p>
        </div>
      ) : null}

      {resumen ? (
        <div className="rounded-3xl border border-slate-200 p-4">
          <h4 className="text-sm font-black text-slate-900">Contenido</h4>
          <p className="mt-2 text-sm text-slate-600">
            {resumen.pasos} pasos · {resumen.actividades} actividades · {resumen.grupos_edad} franjas
          </p>
        </div>
      ) : null}

      <label className="block">
        <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
          Notas de revisión
        </span>
        <textarea
          value={notas}
          onChange={(event) => onNotasChange(event.target.value)}
          rows={5}
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
          placeholder="Explica los cambios solicitados o la razón de la decisión..."
        />
      </label>

      <div className="grid gap-2 sm:grid-cols-3">
        <button type="button" disabled={pending} className="admin-primary-button bg-emerald-600" onClick={() => onAction("aprobado")}>
          <CheckCircle2 size={15} /> Aprobar
        </button>
        <button type="button" disabled={pending} className="admin-primary-button bg-amber-500" onClick={() => onAction("cambios_solicitados")}>
          <MessageSquareWarning size={15} /> Cambios
        </button>
        <button type="button" disabled={pending} className="admin-primary-button bg-red-600" onClick={() => onAction("rechazado")}>
          <XCircle size={15} /> Rechazar
        </button>
      </div>
    </div>
  );
}
