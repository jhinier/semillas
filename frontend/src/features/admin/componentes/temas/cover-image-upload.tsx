import { useMemo, useState } from "react";

import type { RecursoMultimedia } from "../../../media/media.api";
import { MediaGalleryDialog } from "../medios/media-gallery-dialog";

type CoverImageUploadProps = {
  themeTitle?: string;
  cover?: RecursoMultimedia | null;
  resources?: RecursoMultimedia[];
  isUploading?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSelect?: (resource: RecursoMultimedia) => void;
  onRemove?: () => void;
  onUpload?: (
    file: File,
    metadata: { titulo: string; textoAlternativo: string },
  ) => Promise<RecursoMultimedia>;
};

export function CoverImageUpload(props: CoverImageUploadProps = {}) {
  const [openInterno, setOpenInterno] = useState(false);
  const modoInteractivo =
    typeof props.onOpenChange === "function" ||
    typeof props.onSelect === "function" ||
    typeof props.onUpload === "function" ||
    Array.isArray(props.resources);

  const open = props.open ?? openInterno;
  const setOpen = props.onOpenChange ?? setOpenInterno;
  const recursos = props.resources ?? [];
  const cover = props.cover ?? null;

  const selectedResourceId = useMemo(() => cover?.id ?? null, [cover]);

  if (!modoInteractivo) {
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-700">
          Portada del tema <span className="text-red-500">*</span>
        </label>
        <span className="mb-1 text-[11px] font-semibold text-slate-400">
          Imagen que representara el tema en la plataforma.
        </span>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 text-center transition-colors hover:border-green-600/40 hover:bg-slate-50 md:col-span-2">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-400 shadow-xs">
              <i className="fa-regular fa-image text-lg" />
            </div>
            <span className="text-xs font-extrabold text-slate-700">
              Arrastra y suelta una imagen aqui
            </span>
            <span className="mt-1 text-[10px] font-bold text-slate-400">
              o haz clic para seleccionar
            </span>
            <span className="mt-3 select-none text-[9.5px] font-semibold text-slate-400">
              Recomendado: 16:9 (1920x1080px) - JPG o PNG - Max. 2MB
            </span>
          </div>

          <div className="flex flex-col rounded-2xl border border-violet-200 bg-violet-50 p-5 text-left">
            <div className="mb-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
              <i className="fa-solid fa-lightbulb text-xs" />
            </div>
            <span className="text-[11.5px] font-bold leading-relaxed text-violet-600">
              Consejo
            </span>
            <p className="mt-1 text-[11.5px] font-semibold leading-relaxed text-violet-600/70">
              Usa imagenes coloridas y significativas que conecten con el mensaje del tema.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const tituloDialogo = props.themeTitle ? `Portada de ${props.themeTitle}` : "Portada del tema";

  return (
    <div className="flex flex-col gap-3">
      <div className="admin-media-slot">
        <div className="admin-media-slot__preview">
          {cover?.url_publica ? (
            <img src={cover.url_publica} alt={`Portada de ${props.themeTitle ?? "tema"}`} />
          ) : (
            <i className="fa-regular fa-image text-3xl text-slate-300" />
          )}
        </div>
        <div className="admin-media-slot__content">
          <strong title={cover?.titulo ?? undefined}>
            {cover?.titulo ?? "Añade una portada"}
          </strong>
          <small>
            {cover
              ? "La portada actual se puede reemplazar desde la misma biblioteca multimedia."
              : "Usa la biblioteca para elegir una portada existente o subir una nueva."}
          </small>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="rounded-xl bg-green-600 px-4 py-2 text-xs font-bold text-white hover:opacity-95"
            >
              {cover ? "Cambiar portada" : "Elegir portada"}
            </button>
            {cover ? (
              <button
                type="button"
                onClick={props.onRemove}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Quitar portada
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <MediaGalleryDialog
        open={open}
        title={tituloDialogo}
        acceptedTypes={["imagen"]}
        resources={recursos}
        selectedResourceId={selectedResourceId}
        isUploading={props.isUploading}
        onClose={() => setOpen(false)}
        onRemove={() => {
          props.onRemove?.();
          setOpen(false);
        }}
        onSelect={(resourceId) => {
          const resource = recursos.find((item) => item.id === resourceId);
          if (resource) props.onSelect?.(resource);
          setOpen(false);
        }}
        onUpload={async (file, metadata) => {
          if (!props.onUpload) return;
          const resource = await props.onUpload(file, metadata);
          props.onSelect?.(resource);
        }}
      />
    </div>
  );
}
