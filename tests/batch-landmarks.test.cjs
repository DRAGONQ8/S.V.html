const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');

test('landmark image additions preserve existing photos and question content', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const scripts = [...html.matchAll(/<script\s+src="([^"]+)"\s*><\/script>/g)].map(m => m[1]);
  const packs = {};
  const document = { createElement() { return {}; }, body: { appendChild(el) { packs[el.id] = el; } }, getElementById(id) { return packs[id] || null; } };
  const ctx = vm.createContext({ window: {}, document });
  for (const file of scripts.slice(0, scripts.indexOf('src/engine.js'))) vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), ctx);
  const data = ctx.window.SEEN_JEEM_DATA;
  const facts = q => JSON.stringify([q.id, q.question, q.answer, q.options, q.correctAnswerIndex]);
  const before = data.questions.map(facts);
  const existing = new Map(data.questions.filter(ctx.window.SeenJeemMedia.shouldDisplayQuestionImage).map(q => [q.id, q.assetId]));
  vm.runInContext(fs.readFileSync(path.join(root, 'data/question-photos-batch-landmarks.js'), 'utf8'), ctx);
  assert.deepEqual(data.questions.map(facts), before);
  for (const [id, assetId] of existing) assert.equal(data.questions.find(q => q.id === id).assetId, assetId, id);
  for (const id of ['gulf_cities_q09', 'gulf_cities_q10', 'gulf_cities_q11', 'gulf_cities_q15', 'gulf_cities_q20', 'gulf_cities_q35', 'kw_history_q39', 'kw_history_q40']) {
    const q = data.questions.find(q => q.id === id);
    const uri = data.mediaRegistry[q.assetId].dataUri;
    assert.ok(fs.existsSync(path.join(root, uri)), id);
    assert.ok(ctx.window.SeenJeemMedia.isRealQuestionPhoto(q), id);
  }
});
