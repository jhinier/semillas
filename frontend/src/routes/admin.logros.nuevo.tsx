import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { crearLogroAdmin } from "@/features/admin/admin-logros.api";
import { FormularioLogro } from "@/features/admin/componentes/logros-admin";

export const Route = createFileRoute("/admin/logros/nuevo")({ component: AdminLogrosNuevoPage });

function AdminLogrosNuevoPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const crear = useMutation({
    mutationFn: crearLogroAdmin,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "logros"] });
      toast.success("Logro creado");
      navigate({ to: "/admin/logros" });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "No se pudo crear el logro"),
  });

  return (
    <section className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <button
            type="button"
            onClick={() => navigate({ to: "/admin/logros" })}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
            aria-label="Volver a logros"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
          </button>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">Gamificación</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">Nuevo logro</h1>
            <p className="mt-1 text-sm text-slate-500">
              Crea un reconocimiento desde una página dedicada y vuelve al listado al guardar.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate({ to: "/admin/logros" })}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <Sparkles className="size-4" aria-hidden="true" /> Volver al listado
        </button>
      </header>

      <FormularioLogro
        abierto
        modo="crear"
        presentacion="pagina"
        guardando={crear.isPending}
        onCerrar={() => navigate({ to: "/admin/logros" })}
        onGuardar={(valores) => {
          crear.mutate({
            codigo: valores.codigo,
            nombre: valores.nombre,
            descripcion: valores.descripcion || undefined,
            url_icono: valores.url_icono || undefined,
            bono_xp: valores.bono_xp,
            codigo_criterio: valores.codigo_criterio,
            valor_criterio: valores.valor_criterio,
          });
        }}
      />
    </section>
  );
}
