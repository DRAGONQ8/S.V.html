const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const batchName = /^question-photos-batch-[a-z0-9-]+\.js$/;
const files = fs.readdirSync(path.join(root, 'data')).filter(name => batchName.test(name)).sort().map(name => `data/${name}`);

// Check the container structure as well as the magic bytes; a truncated RIFF is not an image.
function checkWebP(bytes, uri) {
  assert.ok(bytes.length >= 20, `${uri}: WebP is too short`);
  assert.equal(bytes.toString('ascii', 0, 4), 'RIFF', uri);
  assert.equal(bytes.toString('ascii', 8, 12), 'WEBP', uri);
  assert.equal(bytes.readUInt32LE(4) + 8, bytes.length, `${uri}: RIFF length is inconsistent`);
  let offset = 12;
  let imageChunk = false;
  while (offset < bytes.length) {
    assert.ok(offset + 8 <= bytes.length, `${uri}: truncated chunk header`);
    const type = bytes.toString('ascii', offset, offset + 4);
    const size = bytes.readUInt32LE(offset + 4);
    assert.ok(offset + 8 + size <= bytes.length, `${uri}: truncated chunk`);
    if (type === 'VP8 ' || type === 'VP8L' || type === 'ANMF') imageChunk = true;
    offset += 8 + size + (size & 1);
  }
  assert.equal(offset, bytes.length, `${uri}: invalid chunk padding`);
  assert.ok(imageChunk, `${uri}: missing image chunk`);
}

test('new photo batches load, preserve existing questions and displayed images, and resolve to credited local WebP files', () => {
  assert.ok(files.length, 'at least one photo batch is expected');
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const scripts = [...html.matchAll(/<script\s+src="([^"]+)"\s*><\/script>/g)].map(m => m[1]);
  const resolver = scripts.indexOf('src/media-resolver.js');
  const engine = scripts.indexOf('src/engine.js');
  for (const file of files) {
    const i = scripts.indexOf(file);
    assert.ok(i > resolver && i < engine, `${file} must load after the resolver and before the engine`);
    assert.equal(scripts.lastIndexOf(file), i, `${file} must load exactly once`);
  }

  const packs = {};
  const document = {
    createElement() { return {}; },
    body: { appendChild(el) { packs[el.id] = el; } },
    getElementById(id) { return packs[id] || null; }
  };
  const context = vm.createContext({ window: {}, document });
  const changedIds = new Set();
  const inspectedUris = new Set();
  const facts = q => JSON.stringify([q.id, q.categoryId, q.question, q.answer, q.options, q.correctAnswerIndex, q.points, q.difficulty, q.format]);
  for (const file of scripts.slice(0, engine)) {
    const data = context.window.SEEN_JEEM_DATA;
    const before = files.includes(file) ? data.questions.map(q => ({
      facts: facts(q), assetId: q.assetId,
      displayed: context.window.SeenJeemMedia.shouldDisplayQuestionImage(q)
    })) : null;
    vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file });
    if (!before) continue;
    assert.equal(data.questions.length, before.length, `${file}: question count changed`);
    let changed = 0;
    data.questions.forEach((q, i) => {
      assert.equal(facts(q), before[i].facts, `${file}: question content or order changed`);
      if (q.assetId === before[i].assetId) return;
      changed++;
      assert.ok(!before[i].displayed, `${q.id}: an existing displayed image was replaced`);
      assert.ok(!changedIds.has(q.id), `${q.id}: mapped more than once`);
      changedIds.add(q.id);
      assert.equal(q.image, q.assetId, q.id);
      assert.equal(q.imageDataUri, q.assetId, q.id);
      assert.ok(context.window.SeenJeemMedia.isRealQuestionPhoto(q), `${q.id}: photo must count as verified`);
      assert.ok(context.window.SeenJeemMedia.shouldDisplayQuestionImage(q), `${q.id}: photo must display`);
      assert.ok(typeof q.imageAlt === 'string' && q.imageAlt.trim(), `${q.id}: missing alternative text`);
      const uri = data.mediaRegistry[q.assetId] && data.mediaRegistry[q.assetId].dataUri;
      assert.match(uri || '', /^assets\/images\/questions\/[a-z0-9-]+\/[a-z0-9_-]+\.webp$/, `${q.id}: expected local WebP`);
      if (!inspectedUris.has(uri)) {
        checkWebP(fs.readFileSync(path.join(root, uri)), uri);
        inspectedUris.add(uri);
        if (/^assets\/images\/questions\/batch-/.test(uri)) {
          const credit = fs.readFileSync(path.join(root, path.dirname(uri), 'ATTRIBUTION.md'), 'utf8');
          const line = credit.split('\n').find(row => row.includes(path.basename(uri)));
          assert.ok(line && /https?:\/\//.test(line) && /creativecommons\.org|public domain|copyrighted free use|ملكية عامة|CC0|nasa\.gov\/nasa-brand-center\/images-and-media|pexels\.com\/license|artlibre\.org\/licence/i.test(line), `${uri}: source and license are required`);
        }
      }
    });
    assert.ok(changed, `${file}: no questions received images`);
  }
});
