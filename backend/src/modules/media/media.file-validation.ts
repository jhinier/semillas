const REGLAS_ARCHIVO = {
  imagen: {
    maxBytes: 5 * 1024 * 1024,
    mimes: ["image/jpeg", "image/png", "image/webp"],
    extensiones: [".jpg", ".jpeg", ".png", ".webp"],
  },
  audio: {
    maxBytes: 20 * 1024 * 1024,
    mimes: ["audio/mpeg", "audio/mp3", "audio/aac", "audio/ogg", "audio/webm"],
    extensiones: [".mp3", ".aac", ".ogg", ".webm"],
  },
  video: {
    maxBytes: 50 * 1024 * 1024,
    mimes: ["video/mp4", "video/webm"],
    extensiones: [".mp4", ".webm"],
  },
  documento: {
    maxBytes: 10 * 1024 * 1024,
    mimes: ["application/pdf"],
    extensiones: [".pdf"],
  },
} as const;

export type TipoRecurso = keyof typeof REGLAS_ARCHIVO;

const EXTENSION_POR_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "audio/mpeg": ".mp3",
  "audio/mp3": ".mp3",
  "audio/aac": ".aac",
  "audio/ogg": ".ogg",
  "audio/webm": ".webm",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "application/pdf": ".pdf",
};

type ErrorValidacionArchivo = {
  mensaje: string;
  codigo: string;
  estado: number;
};

export type ResultadoValidacionArchivo =
  | { ok: true; cleanName: string }
  | { ok: false; error: ErrorValidacionArchivo };

function obtenerNombreArchivo(archivo: File) {
  const fallback = `archivo${EXTENSION_POR_MIME[archivo.type] ?? ""}`;
  const nombre =
    typeof archivo.name === "string" && archivo.name.trim()
      ? archivo.name
      : fallback;
  return nombre.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function obtenerExtension(nombreArchivo: string) {
  const match = nombreArchivo.toLowerCase().match(/\.[^.]+$/);
  return match?.[0] ?? "";
}

function empiezaCon(bytes: Uint8Array, firma: number[]) {
  return firma.every((valor, index) => bytes[index] === valor);
}

async function tieneFirmaValida(archivo: File) {
  const bytes = new Uint8Array(await archivo.slice(0, 16).arrayBuffer());
  if (archivo.type === "image/png") {
    return empiezaCon(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  }
  if (archivo.type === "image/jpeg") return empiezaCon(bytes, [0xff, 0xd8, 0xff]);
  if (archivo.type === "image/webp") {
    return (
      empiezaCon(bytes, [0x52, 0x49, 0x46, 0x46]) &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50
    );
  }
  if (archivo.type === "application/pdf") {
    return empiezaCon(bytes, [0x25, 0x50, 0x44, 0x46, 0x2d]);
  }
  return true;
}

export async function validarArchivoMultimedia(
  archivo: File,
  tipo: TipoRecurso,
): Promise<ResultadoValidacionArchivo> {
  const reglas = REGLAS_ARCHIVO[tipo] as {
    maxBytes: number;
    mimes: readonly string[];
    extensiones: readonly string[];
  };
  const cleanName = obtenerNombreArchivo(archivo);
  const extension = obtenerExtension(cleanName);

  if (archivo.size > reglas.maxBytes) {
    return {
      ok: false,
      error: {
        mensaje: `El archivo excede el tamaño máximo de ${Math.floor(reglas.maxBytes / 1024 / 1024)} MB`,
        codigo: "FILE_TOO_LARGE",
        estado: 400,
      },
    };
  }
  if (!reglas.mimes.includes(archivo.type)) {
    return {
      ok: false,
      error: {
        mensaje: `El tipo MIME '${archivo.type}' no corresponde al tipo '${tipo}'`,
        codigo: "INVALID_MIME_TYPE",
        estado: 400,
      },
    };
  }
  if (!reglas.extensiones.includes(extension)) {
    return {
      ok: false,
      error: {
        mensaje: `La extensión '${extension || "sin extensión"}' no corresponde al tipo '${tipo}'`,
        codigo: "INVALID_FILE_EXTENSION",
        estado: 400,
      },
    };
  }
  if (!(await tieneFirmaValida(archivo))) {
    return {
      ok: false,
      error: {
        mensaje: "La firma binaria del archivo no corresponde al tipo declarado",
        codigo: "INVALID_FILE_SIGNATURE",
        estado: 400,
      },
    };
  }

  return { ok: true, cleanName };
}
