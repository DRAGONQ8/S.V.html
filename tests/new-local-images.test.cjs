const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const engine = require('../src/engine.js');
const code = fs.readFileSync(require('node:path').join(__dirname, '../src/media-resolver.js'), 'utf8');

test('new local image paths are usable directly and through question media registry entries', () => {
  const uri = 'assets/images/questions/new-collection/new-photo.webp';
  const window = { SEEN_JEEM_DATA: { mediaRegistry: {} } };
  vm.runInNewContext(code, { window });
  window.SEEN_JEEM_DATA.mediaRegistry['asset:new'] = { kind: 'question_media', dataUri: uri };
  assert.equal(engine.resolveMediaUri(uri, window.SEEN_JEEM_DATA.mediaRegistry), uri);
  assert.equal(window.SeenJeemMedia.shouldDisplayQuestionImage({ image: uri }), true);
  assert.equal(window.SeenJeemMedia.shouldDisplayQuestionImage({ assetId: 'asset:new' }), true);
  assert.equal(window.SeenJeemMedia.isRealQuestionPhoto({ assetId: 'asset:new' }), false);
  window.SEEN_JEEM_DATA.mediaRegistry['asset:unmarked'] = { dataUri: uri };
  assert.equal(window.SeenJeemMedia.shouldDisplayQuestionImage({ assetId: 'asset:unmarked' }), false);
  window.SEEN_JEEM_DATA.mediaRegistry['asset:other'] = { kind: 'category_cover', dataUri: uri };
  assert.equal(window.SeenJeemMedia.shouldDisplayQuestionImage({ assetId: 'asset:other' }), false);
  const arabic = 'assets/images/questions/صور جديدة/صورة سؤال.jpg';
  assert.equal(engine.resolveMediaUri(arabic, {}), arabic);
  assert.equal(window.SeenJeemMedia.shouldDisplayQuestionImage({ image: arabic }), true);
});

test('local image paths cannot escape the images directory or use device-only URLs', () => {
  for (const uri of ['assets/images/../../secret.webp', 'assets/images/questions/%2e%2e/secret.webp', 'content://media/external/file/1']) {
    assert.equal(engine.resolveMediaUri(uri, {}), '');
  }
});

test('embedded GIF images survive match image sanitization', () => {
  const gif = 'data:image/gif;base64,R0lGODlh';
  assert.equal(engine.resolveMediaUri(gif, {}), gif);
});
