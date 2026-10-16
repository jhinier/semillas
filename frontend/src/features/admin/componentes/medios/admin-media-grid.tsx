import { useState } from "react";
import {
  AlertTriangle,
  Check,
  FileAudio,
  FileText,
  FileVideo,
  Image as ImageIcon,
  ImageOff,
} from "lucide-react";

import { Paginacion } from "@/componentes/ui/paginacion";
import type { MediaCardItem, MediaViewMode } from "../../admin-media.types";
import { MediaTypeBadge } from "./media-type-badge";

type Props = {
  items: MediaCardItem[];
  totalItems: number;
  selectedId: string;
  viewMode: MediaViewMode;
  onSelect: (id: string) => void;
  paginaActual: number;
  porPagina: number;
  onCambiarPagina: (pagina: number) => void;
  onCambiarPorPagina: (n: number) => void;
};

export function AdminMediaGrid({
  items,
  totalItems,
  selectedId,
  viewMode,
  onSelect,
  paginaActual,
  porPagina,
  onCambiarPagina,
  onCambiarPorPagina,
}: Props) {
  return (
    <section className="min-w-0">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs font-extrabold text-slate-500" aria-live="polite">
          {totalItems === 1
            ? "1 recurso encontrado"
            : `${totalItems} recursos encontrados`}
        </p>
        {selectedId ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-extrabold text-emerald-700">
            <Check size={13} /> Recurso seleccionado
          </span>
        ) : null}
      </div>

      {items.length === 0 ? (
        <div className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white px-6 text-center shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <ImageIcon size={27} aria-hidden="true" />
          </div>
          <h2 className="mt-4 text-base font-black text-slate-800">
            No encontramos recursos
          </h2>
          <p className="mt-1 max-w-sm text-sm font-medium leading-relaxed text-slate-500">
            Cambia el tipo, limpia la búsqueda o sube un archivo nuevo.
          </p>
        </div>
      ) : viewMode === "list" ? (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="hidden grid-cols-[72px_minmax(0,1fr)_120px_130px_110px] gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-[11px] font-black uppercase tracking-[0.12em] text-slate-500 md:grid">
            <span>Vista</span>
            <span>Recurso</span>
            <span>Tipo</span>
            <span>Tamaño</span>
            <span>Fecha</span>
          </div>
          <div className="divide-y divide-slate-100">
            {items.map((item) => (
              <MediaListRow
                key={item.id}
                item={item}
                selected={item.id === selectedId}
                onSelect={() => onSelect(item.id)}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
          {items.map((item) => (
            <MediaGridCard
              key={item.id}
              item={item}
              selected={item.id === selectedId}
              onSelect={() => onSelect(item.id)}
            />
          ))}
        </div>
      )}

      <div className="mt-5">
        <Paginacion
          total={totalItems}
          paginaActual={paginaActual}
          porPagina={porPagina}
          onCambiarPagina={onCambiarPagina}
          onCambiarPorPagina={onCambiarPorPagina}
        />
      </div>
    </section>
  );
}

function MediaGridCard({
  item,
  selected,
  onSelect,
}: {
  item: MediaCardItem;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`group min-w-0 overflow-hidden rounded-3xl border bg-white text-left shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 ${
        selected
          ? "border-violet-500 ring-2 ring-violet-100"
          : "border-slate-200 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md"
      }`}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <MediaPreview item={item} />
        <span className="absolute bottom-3 left-3">
          <MediaTypeBadge tipo={item.tipo} />
        </span>
        {selected ? (
          <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg">
            <Check size={17} strokeWidth={3} />
          </span>
        ) : null}
      </div>

      <div className="p-4">
        <h3
          className="line-clamp-2 min-h-10 !m-0 !text-sm !font-black !leading-5 !tracking-normal text-slate-900 transition group-hover:text-violet-700"
          title={item.nombre}
        >
          {item.nombre}
        </h3>
        <div className="mt-3 flex items-center justify-between gap-2 text-xs font-bold text-slate-500">
          <span>{item.tamano}</span>
          <span>{item.formato}</span>
        </div>
        <div className="mt-3 flex min-h-6 items-center border-t border-slate-100 pt-3 text-[11px] font-bold text-slate-400">
          {item.tipo === "imagen" && !item.altText ? (
            <span className="inline-flex items-center gap-1.5 text-amber-700">
              <AlertTriangle size={13} /> Falta texto alternativo
            </span>
          ) : item.usadoEnCount !== null ? (
            <span>
              {item.usadoEnCount === 0
                ? "Sin referencias"
                : `Usado en ${item.usadoEnCount} contenidos`}
            </span>
          ) : (
            <span>{item.fechaSubido}</span>
          )}
        </div>
      </div>
    </button>
  );
}

function MediaListRow({
  item,
  selected,
  onSelect,
}: {
  item: MediaCardItem;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`grid w-full grid-cols-[64px_minmax(0,1fr)] items-center gap-3 px-3 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-500 md:grid-cols-[72px_minmax(0,1fr)_120px_130px_110px] md:gap-4 md:px-4 ${
        selected ? "bg-violet-50" : "bg-white hover:bg-slate-50"
      }`}
    >
      <span className="relative h-14 overflow-hidden rounded-xl bg-slate-100">
        <MediaPreview item={item} compact />
        {selected ? (
          <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-white">
            <Check size={11} strokeWidth={3} />
          </span>
        ) : null}
      </span>

      <span className="min-w-0">
        <strong className="block truncate !text-sm !font-black !leading-5 text-slate-900">
          {item.nombre}
        </strong>
        <span className="mt-1 block truncate text-xs font-semibold text-slate-500 md:hidden">
          {item.tipoLabel} · {item.tamano} · {item.fechaSubido}
        </span>
        {item.tipo === "imagen" && !item.altText ? (
          <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-amber-700">
            <AlertTriangle size={12} /> Falta texto alternativo
          </span>
        ) : null}
      </span>

      <span className="hidden md:block">
        <MediaTypeBadge tipo={item.tipo} />
      </span>
      <span className="hidden text-xs font-bold text-slate-600 md:block">
        {item.tamano}
      </span>
      <span className="hidden truncate text-xs font-semibold text-slate-500 md:block">
        {item.fechaSubido}
      </span>
    </button>
  );
}

function MediaPreview({
  item,
  compact = false,
}: {
  item: MediaCardItem;
  compact?: boolean;
}) {
  if (item.tipo === "imagen") {
    return <ImageResourcePreview item={item} />;
  }

  const Icon =
    item.tipo === "audio"
      ? FileAudio
      : item.tipo === "video"
        ? FileVideo
        : FileText;

  return (
    <span
      className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 text-slate-400 ${
        compact ? "" : "group-hover:text-violet-500"
      }`}
    >
      <Icon size={compact ? 24 : 38} aria-hidden="true" />
    </span>
  );
}

function ImageResourcePreview({ item }: { item: MediaCardItem }) {
  const [failed, setFailed] = useState(false);

  if (failed || !item.imgUrl) {
    return (
      <span className="flex h-full w-full flex-col items-center justify-center gap-2 bg-slate-100 text-slate-400">
        <ImageOff size={28} aria-hidden="true" />
        <small className="text-[10px] font-bold">Vista previa no disponible</small>
      </span>
    );
  }

  return (
    <img
      src={item.imgUrl}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
    />
  );
}
