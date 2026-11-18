import { useState } from "react";
import { Image as ImageIcon, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  type ConfiguracionActividad,
  crearIdFila,
  obtenerEscenas,
  type OpcionConCorrecta,
  type EscenaEditor,
} from "../activity-config-utils";
import { AreaConfiguracion, CampoConfiguracion } from "../activity-config-primitives";
import { ListaOpcionesConCorrecta } from "../activity-config-list-editors";
import { MediaGalleryDialog } from "../../medios/media-gallery-dialog";
import { subirArchivo, type RecursoMultimedia } from "../../../../media/media.api";
import { useResolvedMediaUrl } from "../../../../media/use-resolved-media-url";

function EscenaImagenPreview({
  imagenUrl,
  imagenRecursoId,
  alt,
}: {
  imagenUrl: string;
  imagenRecursoId?: string | null;
  alt: string;
}) {
  const resolved = useResolvedMediaUrl({
    resourceId: imagenRecursoId ?? null,
    rawUrl: imagenUrl || null,
    fallbackHint: alt,
    useFallbackOnError: Boolean(imagenUrl || imagenRecursoId),
  });

  if (!imagenUrl && !imagenRecursoId) {
    return <ImageIcon size={20} />;
  }

  return (
    <img
      src={resolved.src || imagenUrl}
      alt={alt}
      onError={() => void resolved.handleImageError()}
    />
  );
}

export function AventuraBuilder({
  configuracion,
  onChange,
  resources = [],
  uploading = false,
}: {
  configuracion: ConfiguracionActividad;
  onChange: (configuracion: ConfiguracionActividad) => void;
  resources?: RecursoMultimedia[];
  uploading?: boolean;
}) {
  const escenas = obtenerEscenas(configuracion.escenas);
  const [galeriaIndice, setGaleriaIndice] = useState<number | null>(null);
  const [subiendoIndice, setSubiendoIndice] = useState<number | null>(null);

  const actualizarEscena = (indice: number, cambios: Partial<EscenaEditor>) => {
    onChange({
      ...configuracion,
      escenas: escenas.map((escena, posicion) =>
        posicion === indice ? { ...escena, ...cambios } : escena,
      ),
    });
  };

  const actualizarOpciones = (indiceEscena: number, opciones: OpcionConCorrecta[]) => {
    actualizarEscena(indiceEscena, { opciones });
  };

  const agregarEscena = () => {
    onChange({
      ...configuracion,
      escenas: [
        ...escenas,
        {
          id: crearIdFila("escena"),
          texto: "",
          imagen_url: "",
          imagen_recurso_id: null,
          opciones: [
            { id: crearIdFila("opcion"), texto: "", correcta: true },
            { id: crearIdFila("opcion"), texto: "", correcta: false },
          ],
        },
      ],
    });
  };

  const quitarEscena = (indice: number) => {
    if (escenas.length <= 1) return;
    onChange({
      ...configuracion,
      escenas: escenas.filter((_, posicion) => posicion !== indice),
    });
  };

  const subirImagenEscena = async (indice: number, file: File, tituloCustom?: string) => {
    try {
      setSubiendoIndice(indice);
      const resource = await subirArchivo(
        file,
        "imagen",
        tituloCustom?.trim() || `Escena ${indice + 1}`,
      );
      actualizarEscena(indice, {
        imagen_url: resource.url_publica,
        imagen_recurso_id: resource.id,
      });
      toast.success("Imagen subida para la escena");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo subir la imagen");
    } finally {
      setSubiendoIndice(null);
    }
  };

  const escenaActivaGaleria = galeriaIndice !== null ? escenas[galeriaIndice] ?? null : null;

  return (
    <div className="admin-config-builder__columns">
      {escenas.map((escena, indice) => {
        const recursoActual = resources.find(
          (r) => r.id === escena.imagen_recurso_id || (escena.imagen_url && r.url_publica === escena.imagen_url),
        );
        const estaSubiendo = uploading || subiendoIndice === indice;

        return (
          <fieldset key={escena.id} className="admin-config-builder__group admin-field--wide">
            <div className="flex items-center justify-between gap-2">
              <legend>Escena {indice + 1}</legend>
              {escenas.length > 1 ? (
                <button
                  type="button"
                  className="admin-secondary-button !py-1 !px-2.5 text-xs text-rose-600"
                  onClick={() => quitarEscena(indice)}
                >
                  <Trash2 size={13} /> Quitar escena
                </button>
              ) : null}
            </div>

            <AreaConfiguracion
              label="Texto"
              value={escena.texto}
              onChange={(valor) => actualizarEscena(indice, { texto: valor })}
            />

            <div className="admin-media-picker">
              <div className="admin-media-slot w-full">
                <div className="admin-media-slot__preview">
                  <EscenaImagenPreview
                    imagenUrl={escena.imagen_url}
                    imagenRecursoId={escena.imagen_recurso_id}
                    alt={`Escena ${indice + 1}`}
                  />
                </div>
                <div className="admin-media-slot__content flex-1">
                  <strong>{recursoActual?.titulo || (escena.imagen_url ? "Imagen configurada" : "Imagen de la escena (opcional)")}</strong>
                  <small>Elige una imagen de la biblioteca o sube un archivo desde tu dispositivo.</small>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      className="admin-secondary-button !py-1.5 !px-3 text-xs"
                      onClick={() => setGaleriaIndice(indice)}
                    >
                      <ImageIcon size={14} /> Abrir biblioteca
                    </button>
                    <label className="admin-secondary-button !py-1.5 !px-3 text-xs cursor-pointer">
                      <Upload size={14} /> {estaSubiendo ? "Subiendo..." : "Subir archivo"}
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        disabled={estaSubiendo}
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) void subirImagenEscena(indice, file);
                          event.currentTarget.value = "";
                        }}
                      />
                    </label>
                    {escena.imagen_url || escena.imagen_recurso_id ? (
                      <button
                        type="button"
                        className="admin-secondary-button !py-1.5 !px-3 text-xs text-rose-600"
                        onClick={() => actualizarEscena(indice, { imagen_url: "", imagen_recurso_id: null })}
                      >
                        <Trash2 size={13} /> Quitar
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
              <CampoConfiguracion
                label="Imagen URL (o enlace externo opcional)"
                value={escena.imagen_url}
                onChange={(valor) => actualizarEscena(indice, { imagen_url: valor, imagen_recurso_id: null })}
              />
            </div>

            <ListaOpcionesConCorrecta
              titulo="Opciones"
              opciones={escena.opciones}
              etiquetaAgregar="Agregar opción"
              onChange={(opciones) => actualizarOpciones(indice, opciones)}
            />
          </fieldset>
        );
      })}
      <button
        type="button"
        className="admin-secondary-button w-fit"
        onClick={agregarEscena}
      >
        <Plus size={14} /> Agregar escena
      </button>

      {galeriaIndice !== null && escenaActivaGaleria ? (
        <MediaGalleryDialog
          open
          title={`Imagen para escena ${galeriaIndice + 1}`}
          acceptedTypes={["imagen"]}
          resources={resources}
          selectedResourceId={escenaActivaGaleria.imagen_recurso_id ?? null}
          isUploading={subiendoIndice === galeriaIndice}
          onClose={() => setGaleriaIndice(null)}
          onRemove={() => {
            actualizarEscena(galeriaIndice, { imagen_url: "", imagen_recurso_id: null });
            setGaleriaIndice(null);
          }}
          onSelect={(resourceId) => {
            const recurso = resources.find((item) => item.id === resourceId);
            if (recurso) {
              actualizarEscena(galeriaIndice, {
                imagen_url: recurso.url_publica,
                imagen_recurso_id: recurso.id,
              });
            }
            setGaleriaIndice(null);
          }}
          onUpload={async (file, metadata) => {
            await subirImagenEscena(galeriaIndice, file, metadata.titulo);
            setGaleriaIndice(null);
          }}
        />
      ) : null}
    </div>
  );
}
