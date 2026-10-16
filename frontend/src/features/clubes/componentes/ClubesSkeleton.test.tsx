import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { ClubesSkeleton } from "./ClubesSkeleton";

describe("ClubesSkeleton", () => {
  it("renderiza un contenedor div con clase clubes-skeleton", () => {
    const html = renderToStaticMarkup(<ClubesSkeleton />);
    expect(html).toContain("clubes-skeleton");
    expect(html).toContain("<div");
  });

  it("renderiza 4 placeholders span", () => {
    const html = renderToStaticMarkup(<ClubesSkeleton />);
    expect(html.match(/<span/g)?.length ?? 0).toBe(4);
  });

  it("no renderiza botones", () => {
    const html = renderToStaticMarkup(<ClubesSkeleton />);
    expect(html).not.toContain("<button");
  });
});
