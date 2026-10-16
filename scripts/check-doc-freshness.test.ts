import { expect, test } from "bun:test";
import { validarVigencia } from "./check-doc-freshness";

test("los documentos canónicos tienen owner y fecha", () => {
  expect(validarVigencia(process.cwd())).toEqual([]);
});
