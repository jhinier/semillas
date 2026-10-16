import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays, ShieldAlert, X } from "lucide-react";
import { toast } from "sonner";
import type {
  ClubAdminResumen,
  CrearRetoClubAdminSolicitud,
  MiembroClubAdmin,
  RetoClubAdmin,
} from "../../admin-clubes.api";
import { useAdminClubDetail } from "../../hooks/use-admin-club-detail";
import { AgregarMiembroDialog } from "./AgregarMiembroDialog";
import { ConfiguracionClubAdmin } from "./ConfiguracionClubAdmin";
import { DialogoConfirmacion, type Confirmacion } from "./DialogoConfirmacion";
import { FormularioCrearReto } from "./FormularioCrearReto";
import { MiembrosClubAdmin } from "./MiembrosClubAdmin";
import { ResumenClubAdmin } from "./ResumenClubAdmin";
import { RetosClubAdmin } from "./RetosClubAdmin";
import { formatoFechaClub, retoClubEstaAbierto } from "./club-admin-utils";

type SeccionClub = "resumen" | "miembros" | "retos" | "configuracion";

function textoError(error: unknown) {
  return error instanceof Error ? error.message : "No fue posible completar la acción.";
}

function crearConfirmacionMiembro(
  tipo: "transferir" | "expulsar",
  club: ClubAdminResumen,
  miembro: MiembroClubAdmin,
): Confirmacion {
  return {
    tipo,
    club,
    usuarioId: miembro.usuario_id,
    nombreObjetivo: miembro.apodo,
  };
}

function crearConfirmacionReto(club: ClubAdminResumen, reto: RetoClubAdmin): Confirmacion {
  return {
    tipo: "cerrar-reto",
    club,
    retoId: reto.id,
    nombreObjetivo: reto.nombre,
  };
}

export function AdminClubDetailPage({ clubId }: { clubId: string }) {
  const navigate = useNavigate();
  const club = useAdminClubDetail(clubId);
  const detalle = club.detalle.data;
  const [seccion, setSeccion] = useState<SeccionClub>("resumen");
  const [confirmacion, setConfirmacion] = useState<Confirmacion>();
  const [agregarAbierto, setAgregarAbierto] = useState(false);
  const [retoAbierto, setRetoAbierto] = useState(false);

  const tabs = useMemo(
    () => [
      { id: "resumen" as const, etiqueta: "Resumen" },
      { id: "miembros" as const, etiqueta: "Miembros", contador: detalle?.miembros.length },
      { id: "retos" as const, etiqueta: "Retos", contador: detalle?.retos.length },
      { id: "configuracion" as const, etiqueta: "Configuración" },
    ],
    [detalle?.miembros.length, detalle?.retos.length],
  );

  if (club.detalle.isLoading) {
    return (
      <div aria-label="Cargando detalle del club" className="space-y-4">
        {Array.from({ length: 4 }, (_, indice) => (
          <div key={indice} className="h-20 animate-pulse rounded-xl bg-slate-200" />
        ))}
      </div>
    );
  }

  if (club.detalle.isError || !detalle) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
        <ShieldAlert className="mx-auto size-9 text-red-600" aria-hidden="true" />
        <h1 className="mt-3 text-xl font-black text-red-900">No se pudo abrir el club</h1>
        <p className="mt-1 text-sm text-red-700">{textoError(club.detalle.error)}</p>
        <div className="mt-5 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => void club.detalle.refetch()}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white"
          >
            Reintentar
          </button>
          <button
            type="button"
            onClick={() => void navigate({ to: "/admin/clubes" })}
            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-bold text-red-800"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  const resumenClub: ClubAdminResumen = {
    id: detalle.club.id,
    nombre: detalle.club.nombre,
    descripcion: detalle.club.descripcion,
    activo: detalle.club.activo,
    creado_en: detalle.club.creado_en,
    miembros: detalle.miembros.length,
    retos_abiertos: detalle.retos.filter(retoClubEstaAbierto).length,
    lider: null,
  };

  const confirmar = async () => {
    if (!confirmacion) return;

    try {
      if (confirmacion.tipo === "archivar") await club.archivar.mutateAsync();
      if (confirmacion.tipo === "reactivar") await club.reactivar.mutateAsync();
      if (confirmacion.tipo === "expulsar" && confirmacion.usuarioId) {
        await club.expulsarMiembro.mutateAsync(confirmacion.usuarioId);
      }
      if (confirmacion.tipo === "transferir" && confirmacion.usuarioId) {
        await club.transferirLiderazgo.mutateAsync(confirmacion.usuarioId);
      }
      if (confirmacion.tipo === "cerrar-reto" && confirmacion.retoId) {
        await club.cerrarReto.mutateAsync({
          retoId: confirmacion.retoId,
          motivo: "Cierre administrativo desde el panel.",
        });
      }

      toast.success("Acción completada.");
      setConfirmacion(undefined);
    } catch (error) {
      toast.error(textoError(error));
    }
  };

  const crearReto = async (_idClub: string, datos: CrearRetoClubAdminSolicitud) => {
    try {
      await club.crearReto.mutateAsync(datos);
      setRetoAbierto(false);
      toast.success("Reto creado.");
    } catch (error) {
      toast.error(textoError(error));
    }
  };

  return (
    <section className="space-y-5">
      <header className="flex items-start justify-between gap-6">
        <div className="flex min-w-0 items-start gap-3">
          <button
            type="button"
            onClick={() => void navigate({ to: "/admin/clubes" })}
            className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            aria-label="Volver a clubes"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-3xl font-black tracking-tight text-slate-950">
                {detalle.club.nombre}
              </h1>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
                  detalle.club.activo
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {detalle.club.activo ? "Activo" : "Archivado"}
              </span>
            </div>
            <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
              <CalendarDays className="size-4" aria-hidden="true" /> Creado el{" "}
              {formatoFechaClub(detalle.club.creado_en)}
            </p>
          </div>
        </div>
      </header>

      <nav className="flex gap-1 border-b border-slate-200" aria-label="Secciones del club">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSeccion(tab.id)}
            aria-current={seccion === tab.id ? "page" : undefined}
            className={`border-b-2 px-4 py-3 text-sm font-bold transition ${
              seccion === tab.id
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab.etiqueta}
            {tab.contador !== undefined ? (
              <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                {tab.contador}
              </span>
            ) : null}
          </button>
        ))}
      </nav>

      {seccion === "resumen" ? <ResumenClubAdmin detalle={detalle} /> : null}

      {seccion === "miembros" ? (
        <MiembrosClubAdmin
          miembros={detalle.miembros}
          deshabilitado={club.mutando || !detalle.club.activo}
          onAgregar={() => setAgregarAbierto(true)}
          onTransferir={(miembro) =>
            setConfirmacion(crearConfirmacionMiembro("transferir", resumenClub, miembro))
          }
          onExpulsar={(miembro) =>
            setConfirmacion(crearConfirmacionMiembro("expulsar", resumenClub, miembro))
          }
        />
      ) : null}

      {seccion === "retos" ? (
        <RetosClubAdmin
          retos={detalle.retos}
          deshabilitado={club.mutando || !detalle.club.activo}
          onNuevo={() => setRetoAbierto(true)}
          onCerrar={(reto) => setConfirmacion(crearConfirmacionReto(resumenClub, reto))}
        />
      ) : null}

      {seccion === "configuracion" ? (
        <ConfiguracionClubAdmin
          detalle={detalle}
          guardando={club.mutando}
          onGuardar={async (datos) => {
            try {
              await club.actualizar.mutateAsync(datos);
              toast.success("Club actualizado.");
            } catch (error) {
              toast.error(textoError(error));
            }
          }}
          onRegenerar={async () => {
            try {
              await club.regenerarCodigo.mutateAsync();
              toast.success("Código renovado.");
            } catch (error) {
              toast.error(textoError(error));
            }
          }}
          onEstado={() =>
            setConfirmacion({
              tipo: detalle.club.activo ? "archivar" : "reactivar",
              club: resumenClub,
            })
          }
        />
      ) : null}

      <AgregarMiembroDialog
        abierto={agregarAbierto}
        excluidos={detalle.miembros.map((miembro) => miembro.usuario_id)}
        guardando={club.agregarMiembro.isPending}
        onCerrar={() => setAgregarAbierto(false)}
        onAgregar={async (usuarioId) => {
          try {
            await club.agregarMiembro.mutateAsync(usuarioId);
            setAgregarAbierto(false);
            toast.success("Miembro agregado.");
          } catch (error) {
            toast.error(textoError(error));
            throw error;
          }
        }}
      />

      {retoAbierto ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="nuevo-reto-title"
          className="fixed inset-0 z-50 grid place-items-center p-6"
        >
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/45"
            aria-label="Cerrar creación de reto"
            onClick={() => setRetoAbierto(false)}
          />
          <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <header className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 id="nuevo-reto-title" className="text-xl font-black text-slate-950">
                  Nuevo reto cooperativo
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Configura una meta medible para todos los miembros.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRetoAbierto(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Cerrar"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </header>
            <div className="p-6">
              <FormularioCrearReto
                clubId={clubId}
                deshabilitado={club.crearReto.isPending}
                onCrear={(id, datos) => void crearReto(id, datos)}
              />
            </div>
          </div>
        </div>
      ) : null}

      {confirmacion ? (
        <DialogoConfirmacion
          confirmacion={confirmacion}
          mutando={club.mutando}
          onConfirmar={() => void confirmar()}
          onCancelar={() => setConfirmacion(undefined)}
        />
      ) : null}
    </section>
  );
}
