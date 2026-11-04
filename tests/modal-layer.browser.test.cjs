// Optional end-to-end regression: install Playwright and provide Chromium to run.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');

let chromium;
try { ({ chromium } = require('playwright')); } catch (_) { /* Browser tests are optional. */ }
const executablePath = process.env.CHROMIUM_PATH || '/usr/bin/chromium';
const root = path.resolve(__dirname, '..');

test('category preview lightbox stays interactive above its parent dialog', {
  skip: !chromium || !fs.existsSync(executablePath) ? 'Playwright and Chromium are required' : false,
  timeout: 60000
}, async () => {
  const server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = path.resolve(root, '.' + pathname);
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };
    res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
    const stream = fs.createReadStream(file);
    stream.on('error', () => { if (!res.headersSent) res.writeHead(404); res.end(); });
    stream.pipe(res);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({ executablePath, args: ['--no-sandbox'] });
    for (const width of [390, 1366]) {
      const page = await browser.newPage({ viewport: { width, height: 844 } });
      await page.goto(`http://127.0.0.1:${server.address().port}/index.html`);
      await page.locator('#btn-home-start').click();
      // Select a category with a verified photo; some categories deliberately
      // contain no photo previews and must not be used for this scenario.
      const photoCategoryId = await page.evaluate(() => {
        const question = window.SEEN_JEEM_DATA.questions.find(window.SeenJeemMedia.isRealQuestionPhoto);
        return question && question.categoryId;
      });
      assert.ok(photoCategoryId, 'a category with a verified photograph is required');
      await page.locator(`[data-cat-id="${photoCategoryId}"] .cat-card-info-btn`).click();
      await page.locator('.cat-preview-thumb').first().click();
      assert.equal(await page.locator('#modal-image-lightbox').isVisible(), true);
      await page.locator('#btn-lightbox-zoom-in').click({ timeout: 5000 });
      assert.notEqual(await page.locator('#lightbox-zoom-badge').innerText(), '100%');
      await page.locator('#btn-close-lightbox').click();
      assert.equal(await page.locator('#modal-cat-details').isVisible(), true);
      await page.close();
    }
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
});
