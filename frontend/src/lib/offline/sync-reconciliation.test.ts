import { expect, test } from "bun:test";
import { reconciliarConfirmacionesSync } from "./sync-reconciliation";

test("considera omitido como confirmado después de un ACK perdido", () => {
  expect(reconciliarConfirmacionesSync(["evento-1"], {
    procesados_ids: [],
    omitidos_ids: ["evento-1"],
    errores: [],
  })).toEqual({ confirmados: ["evento-1"], fallidos: [] });
});

test("conserva errores específicos y marca respuestas sin confirmación", () => {
  expect(reconciliarConfirmacionesSync(["evento-1", "evento-2"], {
    procesados_ids: [],
    omitidos_ids: [],
    errores: [{ evento_id_cliente: "evento-1", error: "Actividad no disponible" }],
  })).toEqual({
    confirmados: [],
    fallidos: [
      { localId: "evento-1", error: "Actividad no disponible" },
      { localId: "evento-2", error: "El servidor no confirmó el evento" },
    ],
  });
});
