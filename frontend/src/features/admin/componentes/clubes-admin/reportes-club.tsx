import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Flag, LoaderCircle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { listarReportesClubAdmin, resolverReporteClubAdmin, type ReporteClubAdmin } from "../../admin-clubes.api";

const CATEGORIA: Record<ReporteClubAdmin["categoria"], string> = {
  contenido_inapropiado: "Contenido inapropiado",
  acoso: "Acoso",
  datos_personales: "Datos personales",
  otro: "Otro",
};

export function ReportesClubAdmin() {
  const queryClient = useQueryClient();
  const reportes = useQuery({ queryKey: ["admin", "reportes-clubes"], queryFn: () => listarReportesClubAdmin() });
  const resolver = useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: "en_revision" | "resuelto" | "descartado" }) => resolverReporteClubAdmin(id, { estado }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "reportes-clubes"] });
      toast.success("Reporte actualizado");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "No se pudo actualizar el reporte"),
  });

  return (
    <section aria-labelledby="admin-reportes-clubes-title" className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <header className="flex items-center gap-3">
        <Flag className="size-5 text-amber-600" aria-hidden="true" />
        <div>
          <h2 id="admin-reportes-clubes-title" className="font-black text-slate-900">Reportes de clubes</h2>
          <p className="text-xs text-slate-500">Revisa reportes sin exponer información del denunciante en la interfaz pública.</p>
        </div>
      </header>
      {reportes.isLoading ? <LoaderCircle className="size-5 animate-spin text-slate-400" aria-label="Cargando reportes" /> : null}
      {reportes.isError ? <p role="alert" className="text-sm text-red-700">No se pudieron cargar los reportes.</p> : null}
      {reportes.data?.length === 0 ? <p className="text-sm text-slate-500">No hay reportes pendientes.</p> : null}
      <div className="space-y-2">
        {reportes.data?.map((reporte) => (
          <article key={reporte.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <strong className="text-sm text-slate-800">{CATEGORIA[reporte.categoria]} · {reporte.estado}</strong>
              <span className="text-xs text-slate-500">Club {reporte.club_id}</span>
            </div>
            {reporte.detalle ? <p className="mt-1 text-sm text-slate-600">{reporte.detalle}</p> : null}
            <div className="mt-2 flex flex-wrap gap-2">
              {reporte.estado === "abierto" ? <button type="button" className="rounded-md bg-amber-100 px-2.5 py-1.5 text-xs font-bold text-amber-800" disabled={resolver.isPending} onClick={() => resolver.mutate({ id: reporte.id, estado: "en_revision" })}>Tomar en revisión</button> : null}
              {reporte.estado !== "resuelto" ? <button type="button" className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2.5 py-1.5 text-xs font-bold text-emerald-800" disabled={resolver.isPending} onClick={() => resolver.mutate({ id: reporte.id, estado: "resuelto" })}><ShieldCheck className="size-3.5" /> Resolver</button> : null}
              {reporte.estado !== "descartado" ? <button type="button" className="rounded-md bg-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-700" disabled={resolver.isPending} onClick={() => resolver.mutate({ id: reporte.id, estado: "descartado" })}>Descartar</button> : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
