const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const addedScripts = [
  'data/question-photos-kuwait.js',
  'data/question-photos-landmarks-extra.js',
  'data/question-photos-ancient-civs.js',
  'data/question-photos-food.js',
  'data/question-photos-desert.js',
  'data/question-photos-science-extra.js',
  'data/question-photos-sports-extra.js'
];
const credits = {
  kuwait: 'data/question-photos-kuwait-sources.md',
  'landmarks-extra': 'data/question-photos-landmarks-extra-sources.md',
  'ancient-civs': 'data/question-photos-ancient-civs-sources.md',
  food: 'assets/images/questions/food/ATTRIBUTION.md',
  desert: 'assets/images/questions/desert/ATTRIBUTION.md',
  'science-extra': 'assets/images/questions/science-extra/ATTRIBUTION.md',
  'sports-extra': 'assets/images/questions/sports-extra/ATTRIBUTION.md'
};

test('new question photos load with the page and resolve to visible local images', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const scripts = [...html.matchAll(/<script\s+src="([^"]+)"\s*><\/script>/g)].map(match => match[1]);
  const engineIndex = scripts.indexOf('src/engine.js');
  assert.ok(engineIndex > scripts.indexOf('src/media-resolver.js'));
  for (const file of addedScripts) {
    const index = scripts.indexOf(file);
    assert.ok(index > scripts.indexOf('src/media-resolver.js') && index < engineIndex, `${file} must load before the engine`);
    assert.equal(scripts.lastIndexOf(file), index, `${file} should load once`);
  }

  const packs = {};
  const document = {
    createElement() { return {}; },
    body: { appendChild(element) { packs[element.id] = element; } },
    getElementById(id) { return packs[id] || null; }
  };
  const context = vm.createContext({ window: {}, document });
  const changed = new Map();
  for (const file of scripts.slice(0, engineIndex)) {
    const data = context.window.SEEN_JEEM_DATA;
    const before = addedScripts.includes(file) && new Map(data.questions.map(q => [q.id, q.assetId]));
    let source = fs.readFileSync(path.join(root, file), 'utf8');
    if (before) {
      context.window.__photoQuestionIds = null;
      source = source.replace('  data.questions.forEach(function (question) {',
        "  window.__photoQuestionIds = typeof photos !== 'undefined' ? Object.keys(photos) : typeof ids !== 'undefined' ? ids : typeof groups !== 'undefined' ? groups.flatMap(function (group) { return group.questions; }) : null;\n  data.questions.forEach(function (question) {");
    }
    vm.runInContext(source, context, { filename: file });
    if (before) {
      const declared = context.window.__photoQuestionIds;
      assert.ok(declared && declared.length, `${file} must declare question IDs`);
      assert.equal(new Set(declared).size, declared.length, `${file} has duplicate question IDs`);
      for (const id of declared) assert.ok(before.has(id), `${file} references unknown question ${id}`);
      const mappings = data.questions.filter(q => q.assetId && q.assetId !== before.get(q.id));
      assert.equal(mappings.length, declared.length, `${file} must attach a photo to each declared question`);
      for (const q of mappings) {
        assert.ok(!changed.has(q.id), `${q.id} is mapped by multiple new photo files`);
        changed.set(q.id, { file, assetId: q.assetId });
      }
    }
  }

  const data = context.window.SEEN_JEEM_DATA;
  for (const q of data.questions.filter(item => changed.has(item.id))) {
    const mapping = changed.get(q.id);
    assert.equal(q.assetId, mapping.assetId, `${q.id} was overwritten after ${mapping.file}`);
    assert.equal(q.image, q.assetId, q.id);
    assert.equal(q.imageDataUri, q.assetId, q.id);
    const entry = data.mediaRegistry[q.assetId];
    assert.ok(entry && entry.dataUri, `${q.id} must resolve in the media registry`);
    assert.match(entry.dataUri, /^assets\/images\/(?:questions\/[a-z0-9_/-]+|categories\/[a-z0-9_-]+)\.(?:webp|jpg)$/, q.id);
    const imagePath = path.resolve(root, entry.dataUri);
    assert.ok(imagePath.startsWith(path.join(root, 'assets/images') + path.sep), q.id);
    const bytes = fs.readFileSync(imagePath);
    if (entry.dataUri.endsWith('.webp')) {
      assert.equal(bytes.toString('ascii', 0, 4), 'RIFF', q.id);
      assert.equal(bytes.toString('ascii', 8, 12), 'WEBP', q.id);
    } else {
      assert.equal(bytes[0], 0xff, q.id);
      assert.equal(bytes[1], 0xd8, q.id);
      assert.equal(bytes[2], 0xff, q.id);
    }
    if (entry.dataUri.startsWith('assets/images/categories/')) {
      assert.ok(Object.values(data.mediaRegistry).some(item => item.dataUri === entry.dataUri &&
        item.sourcePageUrl && item.author && item.license && item.licenseUrl), `${entry.dataUri} needs source and license metadata`);
    } else {
      const folder = entry.dataUri.split('/')[3];
      assert.ok(credits[folder], `${entry.dataUri} needs an attribution file`);
      const attribution = fs.readFileSync(path.join(root, credits[folder]), 'utf8');
      const row = attribution.split('\n').find(line => line.includes(path.basename(entry.dataUri)));
      assert.ok(row && /https:\/\/commons\.wikimedia\.org\//.test(row) && /creativecommons\.org|public domain|copyrighted free use|ملكية عامة/i.test(row), `${entry.dataUri} needs a source and license`);
    }
    assert.ok(context.window.SeenJeemMedia.isRealQuestionPhoto(q), `${q.id} must count as a documented photograph`);
    assert.ok(context.window.SeenJeemMedia.shouldDisplayQuestionImage(q), `${q.id} must display its photograph`);
    assert.ok(typeof q.imageAlt === 'string' && q.imageAlt.trim(), `${q.id} needs an image description`);
    const candidates = [q.answer, ...(q.acceptedAnswers || []),
      Array.isArray(q.options) && Number.isInteger(q.correctAnswerIndex) ? q.options[q.correctAnswerIndex] : ''];
    for (const candidate of candidates) {
      const answer = String(candidate || '').trim();
      if (answer.length >= 3 && !String(q.question || '').includes(answer)) {
        assert.ok(!q.imageAlt.includes(answer), `${q.id} exposes the answer in the image description before reveal: ${answer}`);
      }
    }
  }
});
