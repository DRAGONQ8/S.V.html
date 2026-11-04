const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');

const collections = ['stadiums', 'gulf-cities', 'arab-capitals', 'kuwait-heritage', 'general-knowledge', 'medical-history'];

test('new collections add credited local photos to existing questions without replacing verified photos', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const scripts = [...html.matchAll(/<script\s+src="([^"]+)"\s*><\/script>/g)].map(match => match[1]);
  const engine = scripts.indexOf('src/engine.js');
  const resolver = scripts.indexOf('src/media-resolver.js');
  const expected = collections.map(name => `data/question-photos-${name}.js`);
  for (const file of expected) {
    const i = scripts.indexOf(file);
    assert.ok(i > resolver && i < engine, `${file} must load after the resolver and before the engine`);
    assert.equal(scripts.lastIndexOf(file), i, `${file} loads once`);
  }
  const packs = {};
  const document = {
    createElement() { return {}; },
    body: { appendChild(element) { packs[element.id] = element; } },
    getElementById(id) { return packs[id] || null; }
  };
  const context = vm.createContext({ window: {}, document });
  const changedIds = new Set();
  for (const file of scripts.slice(0, engine)) {
    const data = context.window.SEEN_JEEM_DATA;
    const before = expected.includes(file) ? new Map(data.questions.map(q => [q.id, {
      assetId: q.assetId,
      real: context.window.SeenJeemMedia.isRealQuestionPhoto(q)
    }])) : null;
    vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file });
    if (!before) continue;
    const changed = data.questions.filter(q => q.assetId && q.assetId !== before.get(q.id).assetId);
    assert.ok(changed.length > 0, `${file} must attach photos to questions`);
    for (const q of changed) {
      assert.ok(!before.get(q.id).real, `${q.id} already had a verified photo`);
      assert.ok(!changedIds.has(q.id), `${q.id} is mapped in multiple new collections`);
      changedIds.add(q.id);
      assert.equal(q.image, q.assetId, q.id);
      assert.equal(q.imageDataUri, q.assetId, q.id);
      assert.ok(context.window.SeenJeemMedia.isRealQuestionPhoto(q), `${q.id} must count as a verified photo`);
      assert.ok(context.window.SeenJeemMedia.shouldDisplayQuestionImage(q), `${q.id} must display its photo`);
      const uri = data.mediaRegistry[q.assetId].dataUri;
      assert.match(uri, /^assets\/images\/questions\/[a-z0-9-]+\/[a-z0-9_-]+\.webp$/);
      const bytes = fs.readFileSync(path.join(root, uri));
      assert.equal(bytes.toString('ascii', 0, 4), 'RIFF');
      assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
      const attribution = fs.readFileSync(path.join(root, path.dirname(uri), 'ATTRIBUTION.md'), 'utf8');
      const row = attribution.split('\n').find(line => line.includes(path.basename(uri)));
      assert.ok(row && /https:\/\/commons\.wikimedia\.org\//.test(row) && /creativecommons\.org|public domain|copyrighted free use|ملكية عامة/i.test(row), `${uri} needs source and license`);
      assert.ok(typeof q.imageAlt === 'string' && q.imageAlt.trim(), `${q.id} needs alt text`);
      for (const candidate of [q.answer, ...(q.acceptedAnswers || [])]) {
        const answer = String(candidate || '').trim();
        if (answer.length >= 3 && !String(q.question || '').includes(answer)) {
          assert.ok(!q.imageAlt.includes(answer), `${q.id} exposes its answer in alt text`);
        }
      }
    }
  }
});
