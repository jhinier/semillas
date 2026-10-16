import {
  type ActivityTypeConfigBuilderProps,
  campoActualizar,
  obtenerAfirmaciones,
  obtenerPares,
  obtenerTarjetas,
} from "./activity-config-utils";
import { CuestionarioBuilder } from "./builders/cuestionario.builder";
import { AudioBuilder } from "./builders/audio.builder";
import { VideoBuilder } from "./builders/video.builder";
import { CompletarVersiculoBuilder } from "./builders/completar-versiculo.builder";
import { AventuraBuilder } from "./builders/aventura.builder";
import { CancionBuilder } from "./builders/cancion.builder";
import { VerdaderoFalsoBuilder } from "./builders/verdadero-falso.builder";
import { ParesBuilder } from "./builders/pares.builder";
import { TarjetasBuilder } from "./builders/tarjetas.builder";
import { ArrastrarSoltarBuilder } from "./builders/arrastrar-soltar.builder";
import { ManualidadBuilder } from "./builders/manualidad.builder";
import { SopaLetrasBuilder } from "./builders/sopa-letras.builder";
import { RompecabezasBuilder } from "./builders/rompecabezas.builder";

export function ActivityTypeConfigBuilder({
  codigo,
  configuracion,
  onChange,
  onUpload,
  resources,
  uploading,
}: ActivityTypeConfigBuilderProps) {
  const actualizar = campoActualizar(configuracion, onChange);

  if (!codigo) {
    return (
      <p className="text-xs text-slate-500">
        Selecciona un tipo para ver sus campos especializados.
      </p>
    );
  }

  if (codigo.includes("video")) {
    return (
      <VideoBuilder
        configuracion={configuracion}
        onChange={onChange}
        recursos={resources}
        onUpload={onUpload}
        uploading={uploading}
      />
    );
  }

  if (codigo === "cancion") {
    return (
      <CancionBuilder
        configuracion={configuracion}
        onChange={onChange}
        recursos={resources}
        onUpload={onUpload}
        uploading={uploading}
      />
    );
  }

  if (codigo.includes("audio")) {
    return (
      <AudioBuilder
        configuracion={configuracion}
        onChange={onChange}
        recursos={resources}
        onUpload={onUpload}
        uploading={uploading}
      />
    );
  }

  if (codigo.includes("completar")) {
    return (
      <CompletarVersiculoBuilder
        configuracion={configuracion}
        onChange={onChange}
      />
    );
  }

  if (codigo === "verdadero_falso") {
    return (
      <VerdaderoFalsoBuilder
        afirmaciones={obtenerAfirmaciones(configuracion.afirmaciones)}
        onChange={(afirmaciones) => actualizar("afirmaciones", afirmaciones)}
      />
    );
  }

  if (codigo === "relacionar_pares") {
    return (
      <ParesBuilder
        pares={obtenerPares(configuracion.pares)}
        onChange={(pares) => actualizar("pares", pares)}
      />
    );
  }

  if (codigo === "tarjetas_memoria") {
    return (
      <TarjetasBuilder
        tarjetas={obtenerTarjetas(configuracion.pares)}
        onChange={(pares) => actualizar("pares", pares)}
      />
    );
  }

  if (codigo === "cuestionario") {
    return <CuestionarioBuilder configuracion={configuracion} onChange={onChange} />;
  }

  if (codigo === "arrastrar_soltar" || codigo.includes("secuencia")) {
    return <ArrastrarSoltarBuilder configuracion={configuracion} onChange={onChange} />;
  }

  if (codigo === "manualidad") {
    return <ManualidadBuilder configuracion={configuracion} onChange={onChange} />;
  }

  if (codigo === "sopa_letras") {
    return <SopaLetrasBuilder configuracion={configuracion} onChange={onChange} />;
  }

  if (codigo === "rompecabezas") {
    return (
      <RompecabezasBuilder
        configuracion={configuracion}
        onChange={onChange}
        onUpload={onUpload}
        resources={resources}
        uploading={uploading}
      />
    );
  }

  if (codigo === "aventura_decisiones") {
    return <AventuraBuilder configuracion={configuracion} onChange={onChange} />;
  }

  return (
    <p className="text-xs leading-6 text-slate-500">
      Este tipo no requiere campos adicionales. Configura sus opciones de respuesta, si
      aplica.
    </p>
  );
}
