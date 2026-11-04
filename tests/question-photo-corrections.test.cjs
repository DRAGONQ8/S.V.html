const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
function loadQuestions() {
  const ctx = { window: {} };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(root, 'data/catalog.js'), 'utf8'), ctx);
  for (let i = 1; i <= 23; i++) vm.runInContext(fs.readFileSync(path.join(root, `data/questions/${String(i).padStart(2, '0')}.js`), 'utf8'), ctx);
  return ctx;
}
test('wrong photo links are corrected without changing unrelated questions', () => {
  const ctx = loadQuestions();
  const questions = ctx.window.SEEN_JEEM_DATA.questions;
  const get = id => questions.find(q => q.id === id);
  const untouched = get('kw_culture_q10').assetId;
  vm.runInContext(fs.readFileSync(path.join(root, 'data/question-photo-corrections.js'), 'utf8'), ctx);
  assert.equal(get('food_cultures_q01').assetId, 'asset:photo_fd_sushi');
  assert.equal(get('food_cultures_q05').assetId, '');
  assert.equal(get('rakkiz_shway_q09').assetId, 'asset:memory_mint_tea');
  const teaPath = ctx.window.SEEN_JEEM_DATA.mediaRegistry[get('rakkiz_shway_q09').assetId].dataUri;
  assert.ok(fs.existsSync(path.join(root, teaPath)));
  assert.equal(get('other_sports_q04').image, '');
  assert.equal(get('kw_culture_q10').assetId, untouched);
});
test('an improved image supplied by another mapping is preserved', () => {
  const ctx = loadQuestions();
  const q = ctx.window.SEEN_JEEM_DATA.questions.find(q => q.id === 'food_cultures_q01');
  q.assetId = 'asset:better_sushi';
  vm.runInContext(fs.readFileSync(path.join(root, 'data/question-photo-corrections.js'), 'utf8'), ctx);
  assert.equal(q.assetId, 'asset:better_sushi');
});
