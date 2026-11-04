const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');

test('nature photos add local media to eligible questions without replacing existing media', () => {
  const script = path.join(root, 'data/question-photos-batch-nature.js');
  assert.ok(fs.existsSync(script), 'nature photo mapping is available');
  const questions = [
    { id: 'ahl_albarr_q05', categoryId: 'ahl_albarr', assetId: 'asset:q_vis_ahl_albarr_q05' },
    { id: 'food_cultures_q20', categoryId: 'food_cultures', assetId: null },
    { id: 'gulf_cities_q27', categoryId: 'gulf_cities', assetId: 'asset:existing_photo', image: 'asset:existing_photo' }
  ];
  const data = { questions, mediaRegistry: {} };
  vm.runInNewContext(fs.readFileSync(script, 'utf8'), { window: { SEEN_JEEM_DATA: data } });
  assert.match(questions[0].assetId, /^asset:batch_nature_/);
  assert.match(questions[1].assetId, /^asset:batch_nature_/);
  assert.equal(questions[2].assetId, 'asset:existing_photo');
  for (const question of questions.slice(0, 2)) {
    const media = data.mediaRegistry[question.assetId];
    assert.ok(media && fs.existsSync(path.join(root, media.dataUri)), question.id);
    assert.ok(question.imageAlt, question.id);
  }
});
