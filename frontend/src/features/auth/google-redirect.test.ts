import { describe, expect, it } from "bun:test";

import { obtenerRedirectGoogle } from "./google-redirect";

describe("obtenerRedirectGoogle", () => {
  it("apunta al callback de auth", () => {
    expect(obtenerRedirectGoogle("http://localhost:5173")).toBe("http://localhost:5173/auth/callback");
  });
});
