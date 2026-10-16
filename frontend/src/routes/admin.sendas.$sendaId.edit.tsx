import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSendaEdit } from "@/features/admin/hooks/use-senda-edit";
import { Boton } from "@/componentes/ui/boton";
import { Input } from "@/componentes/ui/input";
import { Textarea } from "@/componentes/ui/textarea";
import { Switch } from "@/componentes/ui/switch";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";

export const Route = createFileRoute("/admin/sendas/$sendaId/edit")({
  component: AdminSendasEditPage,
});

function AdminSendasEditPage() {
  const {sendaId} = Route.useParams();
  const navigate = useNavigate({ from: "/admin/sendas/$sendaId/edit" });

  const {
    form,
    onSubmit,
    isLoading,
    isError,
    isPending,
    activo,
    setActivo,
    nombreIcono,
    setNombreIcono,
  } = useSendaEdit(sendaId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-red-500">Ocurrió un error al cargar la senda.</p>
        <Boton variante="contorno" className="mt-4" onClick={() => navigate({ to: "/admin/sendas" })}>
          Volver
        </Boton>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-12">
      <header className="flex items-center gap-4">
        <Boton variante="texto" tamano="icono" asChild className="rounded-full">
          <Link to="/admin/sendas">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Volver</span>
          </Link>
        </Boton>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Editar Senda</h1>
          <p className="text-sm text-slate-500">
            Estás editando esta senda.
          </p>
        </div>
      </header>

      <form onSubmit={onSubmit} className="space-y-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="space-y-6">
            
            {/* Información Básica */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-slate-900">Información básica</h3>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="codigo" className="text-sm font-medium text-slate-700">
                    Código <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="codigo"
                    placeholder="ej. padre"
                    {...form.register("codigo")}
                    onChange={(e) => {
                      form.setValue("codigo", e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''), { shouldValidate: true });
                    }}
                    className={form.formState.errors.codigo ? "border-red-300" : ""}
                  />
                  {form.formState.errors.codigo && <p className="text-xs text-red-500">{form.formState.errors.codigo.message}</p>}
                  <p className="text-xs text-slate-500">Identificador único (sin espacios).</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="nombre" className="text-sm font-medium text-slate-700">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="nombre"
                    placeholder="ej. Senda del Padre"
                    {...form.register("nombre")}
                    className={form.formState.errors.nombre ? "border-red-300" : ""}
                  />
                  {form.formState.errors.nombre && <p className="text-xs text-red-500">{form.formState.errors.nombre.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="descripcion" className="text-sm font-medium text-slate-700">
                  Descripción
                </label>
                <Textarea
                  id="descripcion"
                  placeholder="Describe brevemente el propósito de esta senda..."
                  {...form.register("descripcion")}
                  rows={3}
                />
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Apariencia */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-slate-900">Apariencia</h3>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="color" className="text-sm font-medium text-slate-700">
                    Color Principal (Hex) <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="color"
                      type="color"
                      {...form.register("color")}
                      onChange={(e) => {
                        form.setValue("color", e.target.value.toUpperCase(), { shouldValidate: true });
                      }}
                      className="h-10 w-16 p-1 cursor-pointer"
                    />
                    <Input
                      {...form.register("color")}
                      onChange={(e) => {
                        form.setValue("color", e.target.value.toUpperCase(), { shouldValidate: true });
                      }}
                      placeholder="#FFFFFF"
                      className={`flex-1 uppercase font-mono ${form.formState.errors.color ? "border-red-300" : ""}`}
                    />
                  </div>
                  {form.formState.errors.color && <p className="text-xs text-red-500">{form.formState.errors.color.message}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="nombreIcono" className="text-sm font-medium text-slate-700">
                    Nombre de Ícono
                  </label>
                  <div className="flex relative items-center">
                    <div className="absolute left-3 text-slate-400">
                      <Sparkles size={16} />
                    </div>
                    <Input
                      id="nombreIcono"
                      placeholder="ej. crown, heart, flame"
                      value={nombreIcono}
                      onChange={(e) => setNombreIcono(e.target.value.toLowerCase())}
                      className="pl-9"
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    Nombre del ícono de Lucide.
                  </p>
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Configuración */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-slate-900">Configuración</h3>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="orden" className="text-sm font-medium text-slate-700">
                    Orden de aparición <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="orden"
                    type="number"
                    min={1}
                    {...form.register("orden", { valueAsNumber: true })}
                    className={form.formState.errors.orden ? "border-red-300" : ""}
                  />
                  {form.formState.errors.orden && <p className="text-xs text-red-500">{form.formState.errors.orden.message}</p>}
                  <p className="text-xs text-slate-500">Número único que define la posición.</p>
                </div>

                <div className="flex flex-row items-center justify-between rounded-xl border border-slate-200 p-4">
                  <div className="space-y-0.5">
                    <label className="text-base font-medium text-slate-900">
                      Senda Activa
                    </label>
                    <p className="text-sm text-slate-500">
                      ¿La senda será visible para los usuarios?
                    </p>
                  </div>
                  <Switch
                    checked={activo}
                    onCheckedChange={setActivo}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4">
          <Boton type="button" variante="texto" asChild>
            <Link to="/admin/sendas">Cancelar</Link>
          </Boton>
          <Boton type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar Cambios
          </Boton>
        </div>
      </form>
    </div>
  );
}
