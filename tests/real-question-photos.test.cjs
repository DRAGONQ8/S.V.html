const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const code = fs.readFileSync(path.join(root, 'src/media-resolver.js'), 'utf8');
function load(registry) {
  const window = { SEEN_JEEM_DATA: { mediaRegistry: registry } };
  vm.runInNewContext(code, { window });
  return window;
}
test('verified locally sourced photographs count, while decorative and unverified media do not', () => {
  const w = load({});
  Object.assign(w.SEEN_JEEM_DATA.mediaRegistry, {
    'asset:real': { dataUri: 'assets/images/questions/geography/eiffel.webp' },
    'asset:placeholder': { origin: 'bespoke_question_svg_v10', dataUri: 'data:image/svg+xml;base64,AAA' },
    'asset:unknown': { originType: 'photograph', dataUri: 'data:image/webp;base64,AAA' },
    'asset:diagram': { dataUri: 'assets/images/questions/science/dna.webp' },
    'asset:logo': { dataUri: 'assets/images/questions/details/olympic-rings.webp' }
  });
  assert.equal(w.SeenJeemMedia.isRealQuestionPhoto({ assetId: 'asset:real' }), true);
  for (const id of ['asset:placeholder', 'asset:unknown', 'asset:diagram', 'asset:logo', 'asset:missing']) {
    assert.equal(w.SeenJeemMedia.isRealQuestionPhoto({ assetId: id }), false, id);
  }
});

test('interactive image rounds and user-uploaded images stay usable without inflating verified counts', () => {
  const w = load({});
  w.SEEN_JEEM_DATA.mediaRegistry['asset:placeholder'] = { origin: 'bespoke_question_svg_v10', dataUri: 'data:image/svg+xml;base64,AAA' };
  const memory = { assetId: 'asset:placeholder', format: 'memory_observation' };
  const clarity = { assetId: 'asset:placeholder', format: 'progressive_clarity' };
  const custom = { imageDataUri: 'data:image/png;base64,AAAA' };
  const customUrl = { imageDataUri: 'https://example.com/custom.jpg' };
  for (const question of [memory, clarity, custom, customUrl]) {
    assert.equal(w.SeenJeemMedia.shouldDisplayQuestionImage(question), true);
    assert.equal(w.SeenJeemMedia.isRealQuestionPhoto(question), false);
  }
  assert.equal(w.SeenJeemMedia.shouldDisplayQuestionImage({ assetId: 'asset:placeholder', format: 'visual_clue' }), false);
  for (const name of ['olympic-rings', 'rubin-vase']) {
    const id = 'asset:' + name;
    w.SEEN_JEEM_DATA.mediaRegistry[id] = { dataUri: 'assets/images/questions/details/' + name + '.webp' };
    assert.equal(w.SeenJeemMedia.shouldDisplayQuestionImage({ assetId: id, format: 'visual_clue' }), true);
    assert.equal(w.SeenJeemMedia.isRealQuestionPhoto({ assetId: id }), false);
  }
});
