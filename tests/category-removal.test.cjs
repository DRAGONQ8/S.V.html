const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const removed = new Set([
  'arabic_grammar', 'world_languages', 'cars_brands', 'devices_tools',
  'complete_poem_verse', 'vintage_tools', 'kw_old_ads_tv',
  'who_scored_the_goal', 'pro_wrestling', 'uae_knowledge',
  'saudi_arabia_knowledge', 'qatar_oman_bahrain', 'saudi_pro_league',
  'gcc_countries'
]);

function loadData() {
  const context = { window: {} };
  const run = file => vm.runInNewContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file });
  run('data/catalog.js');
  for (const dir of ['questions', 'registry']) {
    for (const file of fs.readdirSync(path.join(root, 'data', dir)).filter(f => f.endsWith('.js')).sort()) {
      run(`data/${dir}/${file}`);
    }
  }
  return context.window.SEEN_JEEM_DATA;
}

test('requested categories, their questions and exclusive metadata are removed', () => {
  const data = loadData();
  for (const id of removed) {
    assert.ok(!data.categories.some(cat => cat.id === id), `category remains: ${id}`);
    assert.ok(!data.questions.some(q => q.categoryId === id), `questions remain: ${id}`);
    assert.ok(!data.groups.some(group => group.categoryIds.includes(id)), `group reference remains: ${id}`);
    assert.ok(!Object.values(data.mediaRegistry).some(asset => asset.category === id), `media metadata remains: ${id}`);
    assert.ok(!fs.existsSync(path.join(root, 'assets/images/categories', `${id}.webp`)), `photo remains: ${id}`);
  }
});

test('remaining categories, questions and media stay linked, including shared assets', () => {
  const data = loadData();
  const categories = new Set(data.categories.map(cat => cat.id));
  assert.equal(categories.size, data.categories.length, 'duplicate category id');
  for (const id of ['kw_history', 'kw_culture', 'kw_sports_clubs', 'kw_landmarks', 'kw_old_markets', 'arabic_poetry', 'waddih_shway', 'spot_the_difference', 'macro_object_closeup']) {
    assert.ok(categories.has(id), `unrelated category missing: ${id}`);
  }
  for (const group of data.groups) {
    for (const id of group.categoryIds) assert.ok(categories.has(id), `unknown category ${id} in ${group.id}`);
  }
  for (const cat of data.categories) {
    assert.ok(data.mediaRegistry[cat.coverAssetId], `missing cover for ${cat.id}`);
    assert.ok(data.mediaRegistry[cat.thumbAssetId], `missing thumbnail for ${cat.id}`);
    const questions = data.questions.filter(q => q.categoryId === cat.id);
    for (const points of [200, 400, 600]) {
      assert.ok(questions.filter(q => q.points === points).length >= 2, `insufficient ${points}-point questions for ${cat.id}`);
    }
  }
  const questionIds = new Set();
  for (const q of data.questions) {
    assert.ok(categories.has(q.categoryId), `unknown category on ${q.id}`);
    assert.ok(!questionIds.has(q.id), `duplicate question ${q.id}`);
    questionIds.add(q.id);
    if (q.assetId) assert.ok(data.mediaRegistry[q.assetId], `missing asset ${q.assetId} for ${q.id}`);
  }
  for (const id of ['asset:photo_tool_polaroid', 'asset:photo_inv_gramophone']) {
    assert.ok(data.mediaRegistry[id], `shared asset removed: ${id}`);
    assert.ok(data.questions.some(q => q.assetId === id), `shared asset is no longer linked: ${id}`);
  }
  assert.equal(data.stats.totalCategories, data.categories.length);
  assert.equal(data.stats.totalQuestions, data.questions.length);
  assert.equal(data.stats.totalMediaAssets, Object.keys(data.mediaRegistry).length);
});
