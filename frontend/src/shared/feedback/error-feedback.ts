import { toast } from "sonner";

const erroresNotificados = new Set<string>();

type NotificacionError = {
  clave: string;
  error: unknown;
  mensajeFallback: string;
  descripcion?: string;
};

export function notificarErrorVisible({
  clave,
  error,
  mensajeFallback,
  descripcion,
}: NotificacionError) {
  if (erroresNotificados.has(clave)) {
    return;
  }

  erroresNotificados.add(clave);

  const mensaje = error instanceof Error && error.message.trim() ? error.message : mensajeFallback;
  toast.error(mensaje, descripcion ? { description: descripcion } : undefined);
  setTimeout(() => {
    erroresNotificados.delete(clave);
  }, 8000);
}
