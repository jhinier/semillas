import { describe, expect, it } from "bun:test";
import { OFFLINE_MEDIA_CACHE, obtenerUrlMediaLocal } from "./media-cache";

describe("media cache offline", () => {
  it("usa una ruta local estable y un nombre de cache dedicado", () => {
    expect(obtenerUrlMediaLocal("media-1")).toBe("/__offline_media/media-1");
    expect(OFFLINE_MEDIA_CACHE).toBe("semillas-offline-media-v1");
  });
});
