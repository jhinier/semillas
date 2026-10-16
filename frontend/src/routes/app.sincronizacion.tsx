import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle2,
  CloudOff,
  Database,
  HardDrive,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Wifi,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Card } from "@/componentes/ui/card-base";
import { Boton } from "@/componentes/ui/boton";
import {
  useOnlineStatus,
  useSyncStatus,
  useOfflineStorage,
  useTemasLocales,
  useSincronizarAhora,
  useReintentarEventosFallidos,
  useEliminarEventosFallidos,
  eliminarTemaDescargado,
} from "@/lib/offline";
import { solicitarAlmacenamientoPersistente } from "@/lib/offline/media-cache";

export const Route = createFileRoute("/app/sincronizacion")({
  component: SincronizacionPage,
});

function SincronizacionPage() {
  const isOnline = useOnlineStatus();
  const { data: syncStatus, refetch: refetchSync } = useSyncStatus();
  const { data: storage, refetch: refetchStorage } = useOfflineStorage();
  const { data: temasLocales, refetch: refetchTemas } = useTemasLocales();

  const syncMutation = useSincronizarAhora();
  const retryMutation = useReintentarEventosFallidos();
  const discardMutation = useEliminarEventosFallidos();

  const [isCleaning, setIsCleaning] = useState(false);

  const pendingCount = syncStatus?.pendingCount ?? 0;
  const failedCount = syncStatus?.failedCount ?? 0;
  const lastSyncTimestamp = syncStatus?.lastSyncTimestamp ?? null;
  const lastSyncExito = syncStatus?.lastSyncExito ?? false;

  const isMutating = syncMutation.isPending || retryMutation.isPending || discardMutation.isPending;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const handleSyncNow = async () => {
    if (!isOnline) {
      toast.error("No tienes conexión a internet para sincronizar.");
      return;
    }
    try {
      const res = await syncMutation.mutateAsync();
      if (res.exito) {
        toast.success("Sincronización completada con éxito.");
      } else {
        toast.error("La sincronización falló o fue incompleta.");
      }
      refetchSync();
    } catch (err) {
      toast.error("Ocurrió un error al intentar sincronizar.");
    }
  };

  const handleRetryFailed = async () => {
    if (!isOnline) {
      toast.error("Conéctate a internet para reintentar la sincronización.");
      return;
    }
    try {
      const count = await retryMutation.mutateAsync();
      toast.success(`Se reintentaron los eventos. ${count} procesados.`);
      refetchSync();
    } catch (err) {
      toast.error("Ocurrió un error al reintentar los eventos fallidos.");
    }
  };

  const handleDiscardFailed = async () => {
    if (!window.confirm("¿Seguro que deseas descartar los eventos fallidos? Se perderá el progreso local no sincronizado.")) {
      return;
    }
    try {
      await discardMutation.mutateAsync();
      toast.success("Eventos fallidos descartados.");
      refetchSync();
    } catch (err) {
      toast.error("No se pudieron descartar los eventos.");
    }
  };

  const handleRequestPersist = async () => {
    try {
      const granted = await solicitarAlmacenamientoPersistente();
      if (granted) {
        toast.success("Protección activada. El navegador no borrará tus datos offline automáticamente.");
      } else {
        toast.info("El navegador administra el espacio automáticamente.");
      }
      refetchStorage();
    } catch (err) {
      toast.error("No se pudo solicitar la persistencia de almacenamiento.");
    }
  };

  const handleDeleteTema = async (id: string, titulo: string) => {
    if (!window.confirm(`¿Seguro que deseas eliminar el tema "${titulo}" de este dispositivo?`)) {
      return;
    }
    try {
      await eliminarTemaDescargado(id);
      toast.success(`Tema "${titulo}" eliminado del dispositivo.`);
      refetchTemas();
      refetchStorage();
    } catch (err) {
      toast.error("No se pudo eliminar el tema.");
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-4xl mx-auto">
      {/* Encabezado */}
      <header className="flex flex-col gap-1">
        <span className="text-xs font-bold tracking-wider text-verde-brote uppercase">
          Gestión Offline Real
        </span>
        <h1 className="text-2xl md:text-3xl font-black text-green-950">
          Centro de Sincronización
        </h1>
        <p className="text-sm text-green-950/60">
          Supervisa el estado de la conexión, el almacenamiento ocupado y el envío de tu progreso al servidor.
        </p>
      </header>

      {/* Grid de Estado */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tarjeta Conexión */}
        <Card className="p-4 flex items-start gap-3 bg-white border border-slate-100 shadow-sm rounded-2xl">
          <div
            className={`p-3 rounded-xl flex items-center justify-center ${
              isOnline ? "bg-emerald-50 text-emerald-600 animate-pulse" : "bg-slate-50 text-slate-400"
            }`}
          >
            {isOnline ? <Wifi size={24} /> : <CloudOff size={24} />}
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Red</span>
            <strong className="text-slate-700 text-sm mt-0.5">
              {isOnline ? "Dispositivo Conectado" : "Modo Offline Activo"}
            </strong>
            <span className="text-xs text-slate-400 mt-1 leading-relaxed">
              {isOnline
                ? "Puedes realizar descargas y sincronizar tu progreso."
                : "La plataforma cargará las lecciones guardadas localmente."}
            </span>
          </div>
        </Card>

        {/* Tarjeta Eventos Pendientes */}
        <Card className="p-4 flex items-start gap-3 bg-white border border-slate-100 shadow-sm rounded-2xl">
          <div
            className={`p-3 rounded-xl flex items-center justify-center ${
              pendingCount > 0 ? "bg-amber-50 text-amber-500" : "bg-emerald-50 text-emerald-600"
            }`}
          >
            <Zap size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Cola de Progreso
            </span>
            <strong className="text-slate-700 text-sm mt-0.5">
              {pendingCount} {pendingCount === 1 ? "evento pendiente" : "eventos pendientes"}
            </strong>
            <span className="text-xs text-slate-400 mt-1 leading-relaxed">
              {pendingCount > 0
                ? "Hay acciones locales pendientes por enviar al servidor."
                : "Todo tu progreso local está sincronizado con la nube."}
            </span>
          </div>
        </Card>

        {/* Tarjeta Última Sincronización */}
        <Card className="p-4 flex items-start gap-3 bg-white border border-slate-100 shadow-sm rounded-2xl">
          <div
            className={`p-3 rounded-xl flex items-center justify-center ${
              lastSyncExito && failedCount === 0
                ? "bg-emerald-50 text-emerald-600"
                : "bg-rose-50 text-rose-500"
            }`}
          >
            {lastSyncExito && failedCount === 0 ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Sincronización
            </span>
            <strong className="text-slate-700 text-sm mt-0.5">
              {lastSyncTimestamp
                ? `Último estado: ${lastSyncExito ? "Exitoso" : "Fallido"}`
                : "No sincronizado"}
            </strong>
            <span className="text-xs text-slate-400 mt-1 leading-relaxed">
              {lastSyncTimestamp
                ? `Fecha: ${new Intl.DateTimeFormat("es-EC", {
                    dateStyle: "short",
                    timeStyle: "short",
                  }).format(new Date(lastSyncTimestamp))}`
                : "Conéctate para respaldar tu progreso."}
            </span>
          </div>
        </Card>
      </div>

      {/* Acciones de Sincronización */}
      <div className="flex flex-col gap-4">
        {failedCount > 0 && (
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 bg-rose-50/70 border border-rose-100 rounded-2xl" role="alert">
            <div className="flex gap-2">
              <AlertTriangle className="text-rose-500 shrink-0" size={20} />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-rose-900">
                  Se detectaron {failedCount} {failedCount === 1 ? "evento con error" : "eventos con error"}
                </span>
                <span className="text-xs text-rose-800/70 mt-0.5">
                  Esto suele suceder por problemas de autorización o cambios en el contenido. Reintenta enviarlos o descártalos.
                </span>
              </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto justify-end">
              <Boton
                onClick={handleDiscardFailed}
                variante="peligroContorno"
                className="bg-white border-rose-200 text-rose-700 hover:bg-rose-100"
                disabled={isMutating}
              >
                Descartar cola
              </Boton>
              <Boton
                onClick={handleRetryFailed}
                variante="peligro"
                disabled={!isOnline || isMutating}
              >
                Reintentar
              </Boton>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Boton
            onClick={handleSyncNow}
            disabled={!isOnline || isMutating || pendingCount === 0}
            className="bg-verde-brote hover:bg-verde-brote/90 text-white font-bold inline-flex items-center gap-2 rounded-xl px-5 py-3.5 shadow-sm"
          >
            <RefreshCw size={18} className={syncMutation.isPending ? "animate-spin" : ""} />
            {syncMutation.isPending ? "Sincronizando..." : "Sincronizar ahora"}
          </Boton>
        </div>
      </div>

      {/* Widget de Almacenamiento */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-green-950 flex items-center gap-2">
          <HardDrive size={20} className="text-slate-400" />
          Almacenamiento Local
        </h2>
        <Card className="p-5 flex flex-col gap-4 bg-white border border-slate-100 shadow-sm rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-700">Espacio Usado</span>
              <span className="text-xs text-slate-400 mt-0.5">
                {formatBytes(storage?.usageBytes ?? 0)} ocupados de un estimado de{" "}
                {storage?.quotaBytes ? formatBytes(storage.quotaBytes) : "cuota del navegador"}
              </span>
            </div>
            <span className="text-lg font-black text-green-950">
              {Math.round(storage?.percentage ?? 0)}%
            </span>
          </div>

          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-verde-brote h-full transition-all duration-300"
              style={{ width: `${storage?.percentage ?? 0}%` }}
            />
          </div>

          <div className="flex items-center justify-between border-t border-slate-50 pt-3 text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              <ShieldCheck size={16} className={storage?.persisted ? "text-emerald-500" : "text-slate-300"} />
              {storage?.persisted
                ? "Almacenamiento protegido contra borrado automático."
                : "Almacenamiento susceptible a ser depurado por falta de espacio."}
            </span>
            {!storage?.persisted && (
              <button
                type="button"
                onClick={handleRequestPersist}
                className="text-verde-brote hover:underline font-bold"
              >
                Proteger descargas
              </button>
            )}
          </div>
        </Card>
      </section>

      {/* Lista de temas guardados */}
      <section className="flex flex-col gap-3 mt-2">
        <h2 className="text-lg font-bold text-green-950 flex items-center gap-2">
          <Database size={20} className="text-slate-400" />
          Temas Disponibles sin Conexión ({temasLocales?.length ?? 0})
        </h2>

        {!temasLocales?.length ? (
          <div className="p-8 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center">
            <Database className="text-slate-300 mb-2" size={32} />
            <span className="text-sm font-bold text-slate-700">No hay temas guardados</span>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Descarga temas desde el catálogo de lecciones para tener acceso a su contenido, audios y versículos sin internet.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {temasLocales.map((tema) => (
              <Card
                key={tema.localId}
                className="p-4 flex items-center justify-between gap-4 bg-white border border-slate-100 shadow-sm rounded-2xl"
              >
                <div className="flex flex-col min-w-0">
                  <span
                    className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full w-fit mb-1.5"
                    style={{
                      backgroundColor: `${tema.sendaColorHex ?? "#ece9fc"}20`,
                      color: tema.sendaColorHex ?? "#7e57c2",
                    }}
                  >
                    Senda {tema.sendaNombre ?? "General"}
                  </span>
                  <strong className="text-sm font-bold text-slate-700 truncate">
                    {tema.titulo}
                  </strong>
                  <span className="text-xs text-slate-400 mt-0.5">
                    Versión: {tema.versionContenido} · Descargado el:{" "}
                    {new Intl.DateTimeFormat("es-EC", { dateStyle: "short" }).format(
                      new Date(tema.downloadedAt ?? ""),
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-slate-400 font-bold">
                    {tema.packageSizeBytes ? formatBytes(tema.packageSizeBytes) : "Desconocido"}
                  </span>
                  <Boton
                    onClick={() => handleDeleteTema(tema.serverId ?? tema.localId, tema.titulo)}
                    variante="texto"
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-xl"
                    aria-label={`Eliminar descarga de ${tema.titulo}`}
                  >
                    <Trash2 size={17} />
                  </Boton>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
