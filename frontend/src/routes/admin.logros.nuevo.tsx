import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Medal } from "lucide-react";
import { toast } from "sonner";

import { crearLogroAdmin } from "@/features/admin/admin-logros.api";
import { FormularioLogro } from "@/features/admin/componentes/logros-admin";
import { subirArchivo } from "@/features/media/media.api";

export const Route = createFileRoute("/admin/logros/nuevo")({ component: AdminLogrosNuevoPage });

function AdminLogrosNuevoPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const crear = useMutation({
    mutationFn: crearLogroAdmin,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "logros"] });
      toast.success("Logro creado y listo para usarse");
      navigate({ to: "/admin/logros" });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "No se pudo crear el logro"),
  });

  return (
    <section className="admin-logros-page" aria-labelledby="nuevo-logro-pagina-titulo">
      <header className="admin-logros-hero">
        <div className="admin-logros-hero__left">
          <div className="admin-logros-hero__icon" aria-hidden="true">
            <Medal className="size-6" />
          </div>
          <div>
            <p className="admin-logros-eyebrow">Gamificación</p>
            <h1 id="nuevo-logro-pagina-titulo" className="admin-logros-title">
              Nuevo logro
            </h1>
            <p className="admin-logros-subtitle">
              Crea una insignia en 3 pasos simples y comprueba al instante cómo la verá el niño.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate({ to: "/admin/logros" })}
          className="admin-logros-back-btn"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Volver a logros
        </button>
      </header>

      <FormularioLogro
        abierto
        modo="crear"
        presentacion="pagina"
        guardando={crear.isPending}
        onCerrar={() => navigate({ to: "/admin/logros" })}
        onSubirImagen={async (archivo, metadata) => {
          const recurso = await subirArchivo(
            archivo,
            "imagen",
            metadata?.textoAlternativo,
            metadata?.titulo,
          );
          await queryClient.invalidateQueries({ queryKey: ["admin", "media"] });
          toast.success("Imagen de medalla subida correctamente");
          return recurso;
        }}
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
