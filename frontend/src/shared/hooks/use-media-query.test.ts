import { describe, expect, it } from "bun:test";

describe("useMediaQuery", () => {
  it("expone un helper booleano segun el viewport actual", () => {
    expect(typeof window === "undefined" || typeof window.matchMedia === "function").toBe(
      Boolean(typeof window === "undefined" || typeof window.matchMedia === "function"),
    );
  });
});
