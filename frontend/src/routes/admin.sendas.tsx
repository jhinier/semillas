import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { obtenerSendasAdmin } from "@/features/admin/admin.api";
import { Boton } from "@/componentes/ui/boton";
import { Plus, Edit2, Archive, Loader2, Sparkles, Map } from "lucide-react";

export const Route = createFileRoute("/admin/sendas")({
  component: AdminSendasLayout,
});

function AdminSendasLayout() {
  const location = useLocation();
  const isExact = location.pathname === "/admin/sendas" || location.pathname === "/admin/sendas/";
  return isExact ? <AdminSendasList /> : <Outlet />;
}

function AdminSendasList() {
  const { data: sendas, isLoading, isError } = useQuery({
    queryKey: ["admin", "sendas"],
    queryFn: obtenerSendasAdmin,
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sendas</h1>
          <p className="text-sm text-slate-500">
            Administra los caminos principales de aprendizaje.
          </p>
        </div>
        <Boton asChild>
          <Link to="/admin/sendas/new">
            <Plus className="mr-2 h-4 w-4" />
            Crear Senda
          </Link>
        </Boton>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-center text-red-600">
          <p>Ocurrió un error al cargar las sendas.</p>
        </div>
      ) : sendas?.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-12 text-center">
          <Map className="mx-auto mb-4 h-12 w-12 text-slate-300" />
          <h3 className="text-lg font-medium text-slate-900">No hay sendas</h3>
          <p className="mt-1 text-slate-500">Comienza creando la primera senda.</p>
          <Boton asChild className="mt-4" variante="contorno">
            <Link to="/admin/sendas/new">
              <Plus className="mr-2 h-4 w-4" />
              Crear Senda
            </Link>
          </Boton>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sendas?.map((senda) => (
            <div
              key={senda.id}
              className="relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div
                className="absolute top-0 left-0 h-1 w-full"
                style={{ backgroundColor: senda.color_hex }}
              />
              <div className="mb-4 flex items-start justify-between">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${senda.color_hex}15`, color: senda.color_hex }}
                >
                  <Sparkles size={20} />
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                    Orden {senda.orden}
                  </span>
                  {!senda.activo && (
                    <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                      Inactiva
                    </span>
                  )}
                </div>
              </div>
              <h3 className="mb-1 text-lg font-bold text-slate-900">{senda.nombre}</h3>
              <p className="mb-4 flex-1 text-sm text-slate-500">
                {senda.descripcion || "Sin descripción"}
              </p>
              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">
                  {senda.codigo}
                </code>
                <div className="flex gap-2">
                  <Boton variante="texto" tamano="pequeno" asChild className="h-8 px-2 text-slate-400 hover:text-slate-900">
                    <Link to="/admin/sendas/$sendaId/edit" params={{sendaId:senda.id }}>
                      <Edit2 className="h-4 w-4" />
                      <span className="sr-only">Editar</span>
                    </Link>
                  </Boton>
                  <Boton variante="texto" tamano="pequeno" className="h-8 px-2 text-slate-400 hover:text-red-600">
                    <Archive className="h-4 w-4" />
                    <span className="sr-only">Archivar</span>
                  </Boton>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
