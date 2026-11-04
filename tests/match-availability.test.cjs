const test = require('node:test');
const assert = require('node:assert/strict');
const engine = require('../src/engine.js');

function fixture() {
  const categories = Array.from({ length: 6 }, (_, i) => ({ id: i === 5 ? 'custom_local' : 'category_' + i, title: 'فئة ' + i }));
  const questions = categories.flatMap(cat => [200, 400, 600].flatMap(points => [0, 1].map(n => ({
    id: `${cat.id}_${points}_${n}`, categoryId: cat.id, points,
    question: 'سؤال', options: ['أ', 'ب', 'ج'], correctAnswerIndex: 0,
    answer: 'أ', explanation: 'شرح'
  }))));
  return { categories, match: engine.createMatch({ selectedCategoryIds: categories.map(c => c.id), categories, questions }) };
}

test('restores matches with available categories including custom categories', () => {
  const { categories, match } = fixture();
  const available = Object.fromEntries(categories.map(c => [c.id, c]));
  assert.equal(engine.validateImportedMatchState(match, available).valid, true);
  assert.equal(engine.validateImportedMatchState({ matchState: match }, available).valid, true);
});

test('rejects stored or imported matches whose category no longer exists', () => {
  const { categories, match } = fixture();
  const available = Object.fromEntries(categories.slice(1).map(c => [c.id, c]));
  for (const payload of [match, { matchState: match }]) {
    const result = engine.validateImportedMatchState(payload, available);
    assert.equal(result.valid, false);
    assert.match(result.error, /فئة لم تعد متاحة/);
  }
});
