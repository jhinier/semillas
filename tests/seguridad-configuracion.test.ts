import { expect, test } from "bun:test";

test("wrangler no contiene credenciales PostgreSQL", async () => {
  const contenido = await Bun.file("backend/wrangler.toml").text();
  expect(contenido).not.toMatch(/postgres(?:ql)?:\/\/[^\s:]+:[^\s@]+@/i);
});

test("los ejemplos de entorno no contienen secretos ni conexiones reales", async () => {
  const contenido = await Bun.file("backend/.env.example").text();
  expect(contenido).not.toMatch(/postgres(?:ql)?:\/\/[^\s:]+:[^\s@]+@/i);
  expect(contenido).not.toMatch(/SUPABASE_SERVICE_ROLE_KEY=(?!$|tu-).+/);
});

test("los scripts operativos exigen la conexión por entorno", async () => {
  const contenido = await Bun.file("scripts/migrar-reclamado-en.ts").text();
  expect(contenido).not.toMatch(/postgres(?:ql)?:\/\/[^\s:]+:[^\s@]+@/i);
  expect(contenido).toContain("process.env.SUPABASE_DATABASE_URL");
});

test("producción promueve el artifact PWA de staging sin recompilarlo", async () => {
  const workflow = await Bun.file(".github/workflows/deploy.yml").text();
  expect(workflow).toContain("actions/download-artifact@v4");
  expect(workflow).toContain("actions: read");
  expect(workflow).toContain("STAGING_ARTIFACT_RUN_ID");
  expect(workflow).toContain("STAGING_COMMIT_SHA");
  expect(workflow).toContain("run: bun run deploy:frontend:artifact");
  expect(workflow).toContain('BACKUP_DIR="backups/staging-${GITHUB_SHA}" bun run backup:storage');
  expect(workflow).toContain('BACKUP_DIR="backups/production-${GITHUB_SHA}" bun run backup:storage');
  expect(workflow).not.toContain("run: bun run deploy:frontend:production");
});

test("el rollback automatizado está limitado a staging", async () => {
  const workflow = await Bun.file(".github/workflows/rollback.yml").text();
  expect(workflow).toContain("environment: staging");
  expect(workflow).toContain("--env staging");
  expect(workflow).toContain("smoke:staging");
  expect(workflow).not.toContain("--env production");
});
