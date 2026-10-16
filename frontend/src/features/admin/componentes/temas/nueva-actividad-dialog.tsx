import { useDeferredValue, useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader, X } from "lucide-react";

import type { Tema } from "@/shared/api/api";
import { obtenerTemasAdminPaginados } from "../../admin.api";

const temasPorPagina = 20;

type NuevaActividadDialogProps = {
  onClose: () => void;
};

type NuevaActividadDialogContenidoProps = {
  busqueda: string;
  temas: Tema[];
  isLoading: boolean;
  selectedThemeId: string;
  temaSeleccionado?: Tema;
  offset?: number;
  total?: number;
  onBusquedaChange?: (busqueda: string) => void;
  onThemeChange: (themeId: string) => void;
  onThemeSelect?: (tema: Tema) => void;
  onPaginaAnterior?: () => void;
  onPaginaSiguiente?: () => void;
  onClose: () => void;
  onContinue: () => void;
};

export function debeBuscarTemasParaNuevaActividad(busqueda: string) {
  return busqueda.trim().length >= 2;
}

export function NuevaActividadDialog({ onClose }: NuevaActividadDialogProps) {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState("");
  const busquedaDiferida = useDeferredValue(busqueda.trim());
  const [offset, setOffset] = useState(0);
  const [selectedThemeId, setSelectedThemeId] = useState("");
  const [temaSeleccionado, setTemaSeleccionado] = useState<Tema>();
  const puedeBuscar = debeBuscarTemasParaNuevaActividad(busqueda) && debeBuscarTemasParaNuevaActividad(busquedaDiferida);
  const temasQuery = useQuery({
    queryKey: ["admin", "themes", "paginated", "new-activity", busquedaDiferida, offset],
    queryFn: () => obtenerTemasAdminPaginados({ q: busquedaDiferida, limit: temasPorPagina, offset }),
    enabled: puedeBuscar,
  });

  useEffect(() => {
    setOffset(0);
  }, [busquedaDiferida]);

  const seleccionarTema = (tema: Tema) => {
    setSelectedThemeId(tema.id);
    setTemaSeleccionado(tema);
  };

  const handleContinue = () => {
    if (!selectedThemeId) return;

    navigate({
      to: "/admin/temas/$themeId/activities",
      params: { themeId: selectedThemeId },
      search: { form: "nueva" },
    });
    onClose();
  };

  return <NuevaActividadDialogContenido busqueda={busqueda} temas={temasQuery.data?.temas ?? []} isLoading={puedeBuscar && temasQuery.isFetching} selectedThemeId={selectedThemeId} temaSeleccionado={temaSeleccionado} offset={offset} total={temasQuery.data?.total ?? 0} onBusquedaChange={setBusqueda} onThemeChange={setSelectedThemeId} onThemeSelect={seleccionarTema} onPaginaAnterior={() => setOffset((actual) => Math.max(0, actual - temasPorPagina))} onPaginaSiguiente={() => setOffset((actual) => actual + temasPorPagina)} onClose={onClose} onContinue={handleContinue} />;
}

export function NuevaActividadDialogContenido({ busqueda, temas, isLoading, selectedThemeId, temaSeleccionado, offset = 0, total = 0, onBusquedaChange, onThemeChange, onThemeSelect, onPaginaAnterior, onPaginaSiguiente, onClose, onContinue }: NuevaActividadDialogContenidoProps) {
  const dialogoRef = useRef<HTMLDivElement>(null);
  const focoAnteriorRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    focoAnteriorRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialogoRef.current?.focus();

    const cerrarConEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", cerrarConEscape);
    return () => {
      document.removeEventListener("keydown", cerrarConEscape);
      focoAnteriorRef.current?.focus();
    };
  }, [onClose]);

  const contenerFoco = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") return;
    const elementos = Array.from(dialogoRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])') ?? []).filter((elemento) => !elemento.hasAttribute("hidden"));
    const primero = elementos[0];
    const ultimo = elementos.at(-1);
    if (!primero || !ultimo) return;
    if (event.shiftKey && document.activeElement === primero) {
      event.preventDefault();
      ultimo.focus();
    } else if (!event.shiftKey && document.activeElement === ultimo) {
      event.preventDefault();
      primero.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center" role="presentation">
      <button type="button" className="absolute inset-0 bg-slate-950/55" aria-label="Cerrar diálogo" onClick={onClose} />
      <div ref={dialogoRef} role="dialog" aria-modal="true" aria-labelledby="nueva-actividad-titulo" aria-describedby="nueva-actividad-descripcion" tabIndex={-1} onKeyDown={contenerFoco} className="relative max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl outline-none sm:max-h-[calc(100dvh-4rem)] sm:p-7">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <span className="admin-eyebrow">Biblioteca editorial</span>
            <h2 id="nueva-actividad-titulo" className="mt-1 text-xl font-black text-slate-900">Nueva actividad</h2>
            <p id="nueva-actividad-descripcion" className="mt-2 text-sm leading-6 text-slate-500">Elige el tema donde prepararás la experiencia de aprendizaje.</p>
          </div>
          <button type="button" className="admin-icon-button" aria-label="Cerrar diálogo" onClick={onClose}><X size={18} /></button>
        </div>

        <label className="admin-field admin-field--wide" htmlFor="tema-nueva-actividad-busqueda"><span>Buscar tema</span><input id="tema-nueva-actividad-busqueda" type="search" value={busqueda} onChange={(event) => onBusquedaChange?.(event.target.value)} placeholder="Escribe al menos 2 caracteres" aria-describedby="tema-nueva-actividad-ayuda" /></label>
        <p id="tema-nueva-actividad-ayuda" className="admin-theme-search__hint">Busca por título para elegir un tema sin cargar toda la biblioteca.</p>

        {!debeBuscarTemasParaNuevaActividad(busqueda) ? (
          <div className="admin-theme-search__prompt">Escribe al menos 2 caracteres para buscar un tema.</div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-10" aria-live="polite"><Loader className="animate-spin text-primario" size={24} /><span className="sr-only">Cargando temas</span></div>
        ) : (
          <>
            {temas.length === 0 ? <div className="admin-theme-search__empty">No encontramos temas con esta búsqueda.</div> : <section className="admin-theme-search__results" aria-labelledby="resultados-temas-titulo"><p id="resultados-temas-titulo">Resultados</p><ul>{temas.map((tema) => <li key={tema.id}><button type="button" aria-pressed={selectedThemeId === tema.id} aria-label={`Seleccionar ${tema.titulo}`} className={selectedThemeId === tema.id ? "admin-theme-search__result admin-theme-search__result--selected" : "admin-theme-search__result"} onClick={() => { onThemeChange(tema.id); onThemeSelect?.(tema); }}><strong>{tema.titulo}</strong><span>{tema.estado}{tema.senda?.nombre ? ` · ${tema.senda.nombre}` : ""}</span></button></li>)}</ul></section>}
            {total > temasPorPagina ? <div className="admin-theme-search__pagination"><span>{offset + 1}-{Math.min(offset + temas.length, total)} de {total}</span><div><button type="button" className="admin-secondary-button" disabled={offset === 0} onClick={onPaginaAnterior}>Anterior</button><button type="button" className="admin-secondary-button" disabled={offset + temasPorPagina >= total} onClick={onPaginaSiguiente}>Siguiente</button></div></div> : null}
            <div className="admin-theme-search__actions"><button type="button" className="admin-secondary-button" onClick={onClose}>Cancelar</button><button type="button" className="admin-primary-button" disabled={!selectedThemeId} onClick={onContinue}>Continuar al editor</button></div>
          </>
        )}
        {temaSeleccionado ? <p className="admin-theme-search__selection">Tema seleccionado: <strong>{temaSeleccionado.titulo}</strong></p> : null}
      </div>
    </div>
  );
}
