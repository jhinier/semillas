export function responderExito<T>(datos: T, status = 200) {
  return Response.json(
    {
      exito: true as const,
      datos
    },
    { status }
  );
}

export function responderError<TDetalle = unknown>(
  error: string,
  codigo?: string,
  status = 400,
  detalle?: TDetalle
) {
  return Response.json(
    {
      exito: false as const,
      error,
      ...(codigo ? { codigo } : {}),
      ...(detalle === undefined ? {} : { detalle })
    },
    { status }
  );
}
