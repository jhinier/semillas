export type MigracionInvitadoDependencias = {
  guestUserId: string | null;
  accessToken: string | null;
  vincularCuenta: () => Promise<unknown>;
  limpiarSesionInvitado: () => void;
};

export async function migrarInvitadoSiCorresponde({
  guestUserId,
  accessToken,
  vincularCuenta,
  limpiarSesionInvitado,
}: MigracionInvitadoDependencias): Promise<"sin-pendiente" | "vinculada"> {
  if (!guestUserId || !accessToken) return "sin-pendiente";
  await vincularCuenta();
  limpiarSesionInvitado();
  return "vinculada";
}
