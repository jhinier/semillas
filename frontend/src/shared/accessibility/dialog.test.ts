import { expect, test } from "bun:test";
import { useDialogAccessibility } from "./dialog";

test("expone el adaptador de accesibilidad de diálogos", () => {
  expect(typeof useDialogAccessibility).toBe("function");
});
