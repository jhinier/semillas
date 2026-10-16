import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { crearSendaAdmin } from "@/features/admin/admin.api";
import { Boton } from "@/componentes/ui/boton";
import { Input } from "@/componentes/ui/input";
import { Textarea } from "@/componentes/ui/textarea";
import { Switch } from "@/componentes/ui/switch";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";

export const Route = createFileRoute("/admin/sendas/new")({
  component: AdminSendasNewPage,
});

function AdminSendasNewPage() {
  const navigate = useNavigate({ from: "/admin/sendas/new" });
  const queryClient = useQueryClient();

  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [colorHex, setColorHex] = useState("#3D8BD4");
  const [nombreIcono, setNombreIcono] = useState("");
  const [orden, setOrden] = useState<number>(1);
  const [activo, setActivo] = useState(false); // Default inactive as requested
  const [errores, setErrores] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: crearSendaAdmin,
    onSuccess: () => {
      toast.success("Senda creada exitosamente");
      queryClient.invalidateQueries({ queryKey: ["admin", "sendas"] });
      navigate({ to: "/admin/sendas" });
    },
    onError: (error: any) => {
      console.error(error);
      toast.error(error.message || "Error al crear la senda");
      if (error.codigo) setErrores({ codigo: "Posiblemente este código ya existe" });
      if (error.orden) setErrores({ orden: "Este orden ya podría estar en uso" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrores({});
    
    // Validaciones basicas
    const nuevosErrores: Record<string, string> = {};
    if (!codigo.trim()) nuevosErrores.codigo = "El código es requerido";
    if (!nombre.trim()) nuevosErrores.nombre = "El nombre es requerido";
    if (!/^#[0-9A-Fa-f]{6}$/i.test(colorHex)) nuevosErrores.colorHex = "Debe ser un HEX válido (ej. #FF5500)";
    if (orden < 1) nuevosErrores.orden = "El orden debe ser mayor a 0";

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    mutation.mutate({
      codigo,
      nombre,
      descripcion: descripcion || undefined,
      color_hex: colorHex,
      nombre_icono: nombreIcono || undefined,
      imagen_recurso_id: null,
      orden,
      activo,
    });
  };

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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Crear Senda</h1>
          <p className="text-sm text-slate-500">
            Añade un nuevo camino principal para agrupar temas.
          </p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
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
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                    className={errores.codigo ? "border-red-300" : ""}
                  />
                  {errores.codigo && <p className="text-xs text-red-500">{errores.codigo}</p>}
                  <p className="text-xs text-slate-500">Identificador único (sin espacios).</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="nombre" className="text-sm font-medium text-slate-700">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="nombre"
                    placeholder="ej. Senda del Padre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className={errores.nombre ? "border-red-300" : ""}
                  />
                  {errores.nombre && <p className="text-xs text-red-500">{errores.nombre}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="descripcion" className="text-sm font-medium text-slate-700">
                  Descripción
                </label>
                <Textarea
                  id="descripcion"
                  placeholder="Describe brevemente el propósito de esta senda..."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
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
                  <label htmlFor="colorHex" className="text-sm font-medium text-slate-700">
                    Color Principal (Hex) <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="colorHex"
                      type="color"
                      value={colorHex}
                      onChange={(e) => setColorHex(e.target.value.toUpperCase())}
                      className="h-10 w-16 p-1 cursor-pointer"
                    />
                    <Input
                      value={colorHex}
                      onChange={(e) => setColorHex(e.target.value.toUpperCase())}
                      placeholder="#FFFFFF"
                      className={`flex-1 uppercase font-mono ${errores.colorHex ? "border-red-300" : ""}`}
                    />
                  </div>
                  {errores.colorHex && <p className="text-xs text-red-500">{errores.colorHex}</p>}
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
                    value={orden}
                    onChange={(e) => setOrden(parseInt(e.target.value) || 1)}
                    className={errores.orden ? "border-red-300" : ""}
                  />
                  {errores.orden && <p className="text-xs text-red-500">{errores.orden}</p>}
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
          <Boton type="submit" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar Senda
          </Boton>
        </div>
      </form>
    </div>
  );
}
