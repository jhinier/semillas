import { chromium } from 'playwright';
import { join } from 'path';

const PORT = 6161;
const BASE_URL = `http://localhost:${PORT}`;
const OUT_DIR = join(process.cwd(), 'imagenes-storybook');

const STORIES = [
  // App
  { id: 'pantallas-app-home', story: 'Escritorio', mobile: false },
  { id: 'pantallas-app-home', story: 'MovilApp', mobile: true },
  { id: 'pantallas-app-temas', story: 'Escritorio', mobile: false },
  { id: 'pantallas-app-temas', story: 'MovilApp', mobile: true },
  { id: 'pantallas-app-temadetalle', story: 'Escritorio', mobile: false },
  { id: 'pantallas-app-temadetalle', story: 'MovilApp', mobile: true },
  { id: 'pantallas-app-actividad', story: 'Escritorio', mobile: false },
  { id: 'pantallas-app-actividad', story: 'MovilApp', mobile: true },
  { id: 'pantallas-app-descargas', story: 'Escritorio', mobile: false },
  { id: 'pantallas-app-descargas', story: 'MovilApp', mobile: true },
  { id: 'pantallas-app-logros', story: 'Escritorio', mobile: false },
  { id: 'pantallas-app-logros', story: 'MovilApp', mobile: true },
  // CRECER
  { id: 'pantallas-crecer-c-conectar', story: 'Escritorio', mobile: false },
  { id: 'pantallas-crecer-c-conectar', story: 'MovilApp', mobile: true },
  { id: 'pantallas-crecer-r-relatar', story: 'Escritorio', mobile: false },
  { id: 'pantallas-crecer-r-relatar', story: 'MovilApp', mobile: true },
  { id: 'pantallas-crecer-e-ensenar', story: 'Escritorio', mobile: false },
  { id: 'pantallas-crecer-e-ensenar', story: 'MovilApp', mobile: true },
  { id: 'pantallas-crecer-c-comprobar', story: 'Escritorio', mobile: false },
  { id: 'pantallas-crecer-c-comprobar', story: 'MovilApp', mobile: true },
  { id: 'pantallas-crecer-e-experimentar', story: 'Escritorio', mobile: false },
  { id: 'pantallas-crecer-e-experimentar', story: 'MovilApp', mobile: true },
  { id: 'pantallas-crecer-r-recompensar', story: 'Escritorio', mobile: false },
  { id: 'pantallas-crecer-r-recompensar', story: 'MovilApp', mobile: true },
  // Admin (solo Escritorio)
  { id: 'pantallas-admin-sendas', story: 'Escritorio', mobile: false },
  { id: 'pantallas-admin-clubes', story: 'Escritorio', mobile: false },
  { id: 'pantallas-admin-reportes', story: 'Escritorio', mobile: false },
  { id: 'pantallas-admin-revision', story: 'Escritorio', mobile: false },
  { id: 'pantallas-admin-ajustes', story: 'Escritorio', mobile: false },
  // Login
  { id: 'pantallas-login', story: 'Escritorio', mobile: false },
  { id: 'pantallas-login', story: 'MovilApp', mobile: true },
];

const browser = await chromium.launch({ headless: true });
let passed = 0;
let failed = 0;

for (const { id, story, mobile } of STORIES) {
  const storySlug = story === 'Escritorio' ? 'escritorio' : 'movil-app';
  const suffix = mobile ? '-m' : '-d';
  const filename = `${id}${suffix}.png`;
  const outPath = join(OUT_DIR, filename);
  const url = `${BASE_URL}/?path=/story/${id}--${storySlug}`;
  const viewport = mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 };

  let context;
  try {
    context = await browser.newContext({ viewport });
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);

    // Entrar al iframe donde se renderiza el story
    const frame = page.frameLocator('iframe#storybook-preview-iframe');

    // Esperar a que el contenido esté listo
    await frame.locator('#storybook-root').waitFor({ timeout: 10000 });

    // Obtener altura real del contenido
    const contentHeight = await frame.locator('#storybook-root').evaluate(el => el.scrollHeight);

    // Redimensionar viewport al contenido (para que todo quepa)
    const screenshotViewport = { width: viewport.width, height: Math.max(contentHeight + 100, viewport.height) };
    await page.setViewportSize(screenshotViewport);
    await page.waitForTimeout(500);

    // Capturar el elemento completo del story
    await frame.locator('#storybook-root').screenshot({
      path: outPath,
      animations: 'disabled',
    });

    console.log(`✅ ${filename} (${viewport.width}x${contentHeight})`);
    passed++;
  } catch (err) {
    console.log(`❌ ${filename}: ${err.message}`);
    failed++;
  } finally {
    if (context) await context.close();
  }
}

await browser.close();
console.log(`\nTotal: ${passed} passed, ${failed} failed`);
