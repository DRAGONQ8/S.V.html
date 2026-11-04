const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

test('downloaded category photos replace covers and thumbnails while other covers remain available', () => {
  const cover = { dataUri: 'original-cover' };
  const thumb = { dataUri: 'original-thumb' };
  const fallback = { dataUri: 'original-fallback' };
  const data = { mediaRegistry: {
    'asset:cat_cover_kw_landmarks': cover,
    'asset:cat_thumb_kw_landmarks': thumb,
    'asset:cat_cover_unmapped': fallback
  } };
  const script = fs.readFileSync(path.join(root, 'data/category-photos.js'), 'utf8');
  vm.runInNewContext(script, { window: { SEEN_JEEM_DATA: data } });
  assert.equal(cover.dataUri, 'assets/images/categories/kw_landmarks.webp');
  assert.equal(thumb.dataUri, cover.dataUri);
  assert.equal(fallback.dataUri, 'original-fallback');
  assert.ok(fs.existsSync(path.join(root, cover.dataUri)));
});

test('the photo mappings load after the media resolver and before the game', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const resolver = html.indexOf('src/media-resolver.js');
  const photos = html.indexOf('data/category-photos.js');
  const app = html.indexOf('src/app.js');
  assert.ok(resolver !== -1 && resolver < photos && photos < app);
});

test('every mapped photo is bundled with a WebP header and source and license information', () => {
  const catalogContext = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'data/catalog.js'), 'utf8'), catalogContext);
  const categories = catalogContext.window.SEEN_JEEM_DATA.categories;
  const registry = {};
  for (const cat of categories) {
    registry[cat.coverAssetId] = { dataUri: 'original-cover' };
    registry[cat.thumbAssetId] = { dataUri: 'original-thumb' };
  }
  vm.runInNewContext(fs.readFileSync(path.join(root, 'data/category-photos.js'), 'utf8'), {
    window: { SEEN_JEEM_DATA: { mediaRegistry: registry } }
  });
  let mapped = 0;
  for (const cat of categories) {
    const cover = registry[cat.coverAssetId];
    const thumb = registry[cat.thumbAssetId];
    if (cover.dataUri === 'original-cover') {
      assert.equal(thumb.dataUri, 'original-thumb');
      continue;
    }
    mapped++;
    assert.equal(cover.dataUri, thumb.dataUri, cat.id);
    assert.match(cover.dataUri, /^assets\/images\/categories\/[a-z0-9_]+\.webp$/);
    const bytes = fs.readFileSync(path.join(root, cover.dataUri));
    assert.equal(bytes.toString('ascii', 0, 4), 'RIFF', cat.id);
    assert.equal(bytes.toString('ascii', 8, 12), 'WEBP', cat.id);
    assert.match(cover.sourcePageUrl, /^https:\/\/commons\.wikimedia\.org\//);
    assert.ok(cover.author && cover.license && cover.licenseUrl, cat.id);
  }
  assert.ok(mapped >= 300, `Only ${mapped} categories have downloaded photos`);
});
