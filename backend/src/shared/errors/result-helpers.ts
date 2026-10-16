export type ResultadoFallo = {
  readonly error: { readonly mensaje: string; readonly codigo: string; readonly estado: number };
};

export type Resultado<T> = T | ResultadoFallo;

export function esResultadoConError<T>(resultado: Resultado<T>): resultado is ResultadoFallo {
  return typeof resultado === "object" && resultado !== null && "error" in resultado;
}