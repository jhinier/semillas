export class ErrorApi extends Error {
  public readonly estado: number;
  public readonly status: number;
  public readonly codigo: string | undefined;

  constructor(mensaje: string, estado: number, codigo?: string) {
    super(mensaje);
    this.name = "ErrorApi";
    this.estado = estado;
    this.status = estado;
    this.codigo = codigo;
  }
}
