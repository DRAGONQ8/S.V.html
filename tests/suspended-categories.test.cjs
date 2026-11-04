const test = require('node:test');
const assert = require('node:assert/strict');
const Engine = require('../src/engine.js');

test('unplayable image rounds are excluded from the playable catalog without deleting their source data', () => {
  const catalog = {
    categories: [{id:'waddih_shway'}, {id:'rakkiz_shway'}, {id:'spot_the_difference'}, {id:'history'}],
    questions: [{id:'a',categoryId:'waddih_shway'}, {id:'b',categoryId:'rakkiz_shway'}, {id:'c',categoryId:'spot_the_difference'}, {id:'d',categoryId:'history'}],
    groups: []
  };
  const playable = Engine.getPlayableCatalog(catalog);
  assert.deepEqual(playable.categories.map(c => c.id), ['history']);
  assert.deepEqual(playable.questions.map(q => q.id), ['d']);
  assert.equal(catalog.categories.length, 4);
  assert.equal(catalog.questions.length, 4);
});
