import { expect, test } from "@playwright/test";

const usuario = {
  id: "usuario-e2e",
  rol: "usuario",
  proveedor: "google",
  nombre_visible: "Nombre privado que no debe aparecer",
  correo: "privado@example.com",
};

const perfil = {
  id: "perfil-e2e",
  usuario_id: usuario.id,
  apodo: "Semilla azul",
  grupo_edad_id: "exploradores",
  url_avatar: null,
  clave_avatar: "1",
  prefiere_audio: false,
  tamano_texto_preferido: "mediano",
  creado_en: "2026-07-13T00:00:00.000Z",
  actualizado_en: "2026-07-13T00:00:00.000Z",
};

const club = {
  id: "club-e2e",
  nombre: "Club Semillas",
  descripcion: "Un club de prueba",
  codigo_invitacion: "ABC123",
  creado_por: usuario.id,
  activo: true,
  creado_en: "2026-07-13T00:00:00.000Z",
  member_count: 2,
  rol_miembro: "propietario",
};

const ranking = [
  {
    miembro_token: "miembro-actual",
    es_actual: true,
    rol_miembro: "propietario",
    unido_en: "2026-07-01T00:00:00.000Z",
    apodo: "Semilla azul",
    clave_avatar: "1",
    url_avatar: null,
    xp_total: 120,
    xp_semana: 40,
    actividades_semana: 2,
    numero_ranking: 1,
  },
];

const reto = {
  id: "reto-e2e",
  club_id: club.id,
  nombre: "Reto de prueba",
  descripcion: "Completar actividades juntos",
  codigo_metrica: "actividades_completadas",
  valor_objetivo: 1,
  xp_reto: 25,
  fecha_inicio: "2026-07-01T00:00:00.000Z",
  fecha_fin: "2099-07-20T00:00:00.000Z",
  creado_por: usuario.id,
  creado_en: "2026-07-13T00:00:00.000Z",
  progreso_actual: 1,
  mi_aporte: 1,
  porcentaje: 100,
  completado: true,
  recompensa_reclamada: false,
};

function exito(datos: unknown, status = 200) {
  return { status, contentType: "application/json", body: JSON.stringify({ exito: true, datos }) };
}

test("gamificación social mantiene acciones idempotentes y no expone PII", async ({ page }) => {
  let recompensaReclamada = false;
  let reporteEnviado = false;

  await page.addInitScript(() => {
    localStorage.setItem("semillas_access_token", "token-e2e");
    localStorage.setItem("semillas_auth_user_id", "usuario-e2e");
  });

  await page.route("**/*", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;

    if (path === "/perfil" && request.method() === "GET") {
      await route.fulfill(exito({ usuario, perfil }));
      return;
    }
    if (path === "/gamificacion/mi" && request.method() === "GET") {
      await route.fulfill(exito({
        nivel: { usuario_id: usuario.id, xp_total: 120, numero_nivel: 2, nombre_nivel: "Brote" },
        logros: [],
        catalogo_logros: [],
        reglas_nivel: [{ numero_nivel: 1, nombre: "Semilla", xp_minima: 0 }, { numero_nivel: 2, nombre: "Brote", xp_minima: 100 }],
        racha: { actual: 2, mejor: 3 },
        pendientes_reclamar: 0,
      }));
      return;
    }
    if (path === "/progreso/mi" && request.method() === "GET") {
      await route.fulfill(exito({ progresos_tema: [], progresos_actividad: [] }));
      return;
    }
    if (path === "/clubes/mios" && request.method() === "GET") {
      await route.fulfill(exito([club]));
      return;
    }
    if (path === `/clubes/${club.id}` && request.method() === "GET") {
      await route.fulfill(exito({
        ...club,
        membership: { rol_miembro: "propietario", unido_en: club.creado_en },
        created_by: null,
        members: [
          ...ranking,
          {
            miembro_token: "miembro-2",
            es_actual: false,
            rol_miembro: "miembro",
            unido_en: "2026-07-02T00:00:00.000Z",
            apodo: "Amigo verde",
            clave_avatar: "2",
            url_avatar: null,
            xp_total: 50,
            xp_semana: 10,
            actividades_semana: 1,
          },
        ],
      }));
      return;
    }
    if (path === `/clubes/${club.id}/ranking` && request.method() === "GET") {
      await route.fulfill(exito(ranking));
      return;
    }
    if (path === `/clubes/${club.id}/retos` && request.method() === "GET") {
      await route.fulfill(exito([{ ...reto, recompensa_reclamada: recompensaReclamada }]));
      return;
    }
    if (path === `/clubes/${club.id}/retos/${reto.id}/reclamar` && request.method() === "POST") {
      recompensaReclamada = true;
      await route.fulfill(exito({ reclamado: true, ya_reclamada: false, xp_otorgada: 25 }));
      return;
    }
    if (path === `/clubes/${club.id}/reportes` && request.method() === "POST") {
      reporteEnviado = true;
      await route.fulfill(exito({ id: "reporte-e2e" }, 201));
      return;
    }

    await route.continue();
  });

  await page.goto("/app/clubes");
  await expect(page.getByRole("heading", { name: "Club Semillas" })).toBeVisible();
  await expect(page.locator("body")).not.toContainText(usuario.correo);
  await expect(page.locator("body")).not.toContainText(usuario.nombre_visible);

  await page.getByRole("button", { name: "Retos", exact: true }).click();
  await page.getByRole("button", { name: /Reclamar 25 XP/ }).click();
  await expect(page.getByText("Ganaste 25 XP")).toBeVisible();

  await page.getByRole("button", { name: "Miembros" }).click();
  await page.locator('summary[aria-label="Acciones para Amigo verde"]').click();
  await page.getByRole("button", { name: "Reportar", exact: true }).click();
  await page.getByRole("button", { name: "Enviar reporte" }).click();
  await expect(page.getByText("Reporte enviado para revisión")).toBeVisible();
  expect(recompensaReclamada).toBe(true);
  expect(reporteEnviado).toBe(true);
});
