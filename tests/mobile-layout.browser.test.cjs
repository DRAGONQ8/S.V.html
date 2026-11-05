// Optional browser regression for the compact mobile controls.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
let chromium;
try { ({ chromium } = require('playwright')); } catch (_) {}
const executablePath = process.env.CHROMIUM_PATH || '/usr/bin/chromium';
const root = path.resolve(__dirname, '..');

test('mobile navigation and question controls remain inside the viewport', {
  skip: !chromium || !fs.existsSync(executablePath) ? 'Playwright and Chromium are required' : false,
  timeout: 60000
}, async () => {
  const server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = path.resolve(root, '.' + pathname);
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.css':'text/css' };
    res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
    const stream = fs.createReadStream(file);
    stream.on('error', () => { if (!res.headersSent) res.writeHead(404); res.end(); });
    stream.pipe(res);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({ executablePath, args: ['--no-sandbox'] });
    for (const width of [320, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 844 } });
      await page.goto(`http://127.0.0.1:${server.address().port}/index.html`);
      assert.equal(await page.locator('#btn-open-settings .btn-lbl').isVisible(), false, 'mobile navigation labels should not overflow icon buttons');
      await page.locator('#modal-question').evaluate(el => el.classList.add('open'));
      const controlsFit = await page.evaluate(() => {
        const panel = document.querySelector('#modal-question .modal-panel').getBoundingClientRect();
        return [...document.querySelectorAll('#modal-question .q-modal-header button')].every(button => {
          const r = button.getBoundingClientRect();
          return r.left >= panel.left - 1 && r.right <= panel.right + 1;
        });
      });
      assert.equal(controlsFit, true, `question controls should fit at ${width}px`);
      await page.close();
    }
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
});
