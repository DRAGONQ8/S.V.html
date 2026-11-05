// Optional browser regression for a question photo that is still loading.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { execFileSync } = require('node:child_process');
let chromium;
try { ({ chromium } = require('playwright')); } catch (_) {}
const executablePath = process.env.CHROMIUM_PATH || '/usr/bin/chromium';
const root = path.resolve(__dirname, '..');

for (const failAll of [false, true]) test(failAll ? 'automatic retries stop after three attempts' : 'question photo retries after an old launcher silently times out', {
  skip: !chromium || !fs.existsSync(executablePath) ? 'Playwright and Chromium are required' : false,
  timeout: 60000
}, async () => {
  let pendingResponse;
  const server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (pathname === '/src/app.js' && process.env.TEST_BASELINE) {
      res.setHeader('Content-Type', 'text/javascript');
      res.end(execFileSync('git', ['show', 'HEAD:src/app.js'], { cwd: root }));
      return;
    }
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
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.addInitScript((failEveryAttempt) => {
      const descriptor = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
      Object.defineProperty(HTMLImageElement.prototype, 'src', {
        configurable: descriptor.configurable,
        enumerable: descriptor.enumerable,
        get: descriptor.get,
        set(value) {
          if (this.id === 'q-modal-visual-img' && String(value).includes('/food/sushi.webp')) {
            window.__questionImageAttempts = (window.__questionImageAttempts || 0) + 1;
            if (failEveryAttempt || window.__questionImageAttempts === 1) {
              this.setAttribute('data-vfs-loading', 'src');
              setTimeout(() => this.removeAttribute('data-vfs-loading'), 50);
              return;
            }
          }
          return descriptor.set.call(this, value);
        }
      });
    }, failAll);
    await page.goto(`http://127.0.0.1:${server.address().port}/index.html`);
    await page.locator('#btn-home-start').click();
    await page.locator('[data-cat-id="food_cultures"]').waitFor();
    await page.evaluate(() => {
      const engine = window.SeenJeemEngine, original = engine.createMatch;
      engine.createMatch = function (cfg) {
        const target = cfg.questions.find(q => q.id === 'food_cultures_q01');
        cfg.exposedHistory = Object.assign({}, cfg.exposedHistory);
        cfg.questions.filter(q => q.categoryId === target.categoryId && q.points === target.points && q.id !== target.id)
          .forEach(q => { cfg.exposedHistory[q.id] = true; });
        delete cfg.exposedHistory[target.id];
        const match = original(cfg); window.__testMatch = match; return match;
      };
    });
    const ids = await page.locator('.cat-card').evaluateAll(els => els.map(el => el.dataset.catId));
    for (const id of ['food_cultures', ...ids.filter(id => id !== 'food_cultures').slice(0, 5)]) {
      const card = page.locator(`[data-cat-id="${id}"]`);
      await card.evaluate(el => el.scrollIntoView({ block: 'center' }));
      await card.click();
    }
    await page.locator('#btn-proceed-setup').click();
    await page.locator('#btn-launch-match').click();
    const cell = await page.evaluate(() => Object.entries(window.__testMatch.questionsByCell).find(([, q]) => q.id === 'food_cultures_q01')[0]);
    const cellButton = page.locator(`[data-cell-id="${cell}"]`);
    await cellButton.evaluate(el => el.scrollIntoView({ block: 'start' }));
    const clearOfHeader = await cellButton.evaluate(el => el.getBoundingClientRect().top >= document.querySelector('#top-navbar').getBoundingClientRect().bottom);
    assert.equal(clearOfHeader, true, 'the sticky navigation must not cover a scrolled-to board cell');
    await cellButton.click();
    await page.waitForFunction(() => window.__questionImageAttempts === 1 && !document.querySelector('#q-modal-visual-img').hasAttribute('data-vfs-loading'));
    if (failAll) {
      await page.waitForFunction(() => window.__questionImageAttempts >= 3, null, { timeout: 15000 });
      await page.waitForTimeout(2000);
      assert.equal(await page.evaluate(() => window.__questionImageAttempts), 3, 'only two retries are allowed');
    } else {
      await page.waitForFunction(() => window.__questionImageAttempts >= 2, null, { timeout: 15000 });
      await page.waitForFunction(() => document.querySelector('#q-modal-visual-img').complete && document.querySelector('#q-modal-visual-img').naturalWidth > 0, null, { timeout: 5000 });
    }
    await page.close();
  } finally {
    if (pendingResponse && !pendingResponse.writableEnded) pendingResponse.end();
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
});
