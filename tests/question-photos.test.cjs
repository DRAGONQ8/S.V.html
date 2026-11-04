const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const scripts = ['geography', 'sports', 'science', 'details'].map(name => `data/question-photos-${name}.js`);

function loadData() {
  const packs = {};
  const document = {
    createElement() { return {}; },
    body: { appendChild(element) { packs[element.id] = element; } },
    getElementById(id) { return packs[id] || null; }
  };
  const context = { window: {}, document };
  const run = file => vm.runInNewContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file });
  for (const file of fs.readdirSync(path.join(root, 'assets/media'))) run('assets/media/' + file);
  run('data/catalog.js');
  for (const file of fs.readdirSync(path.join(root, 'data/questions')).sort()) run('data/questions/' + file);
  for (const file of fs.readdirSync(path.join(root, 'data/registry')).sort()) run('data/registry/' + file);
  run('src/media-resolver.js');
  run('data/category-photos.js');
  return { context, run, data: context.window.SEEN_JEEM_DATA };
}

test('question photo mappings load in order, target unique existing questions, and use bundled credited images', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const resolver = html.indexOf('src/media-resolver.js');
  const engine = html.indexOf('src/engine.js');
  const { context, data } = loadData();
  const questionIds = new Set(data.questions.map(q => q.id));
  const usedQuestions = new Set();
  const creditedCategoryPaths = new Set(Object.values(data.mediaRegistry)
    .filter(item => item.sourcePageUrl && item.author && item.license && item.licenseUrl)
    .map(item => item.dataUri));
  for (const script of scripts) {
    const pos = html.indexOf(script);
    assert.ok(resolver < pos && pos < engine, `${script} must load after the resolver and before the engine`);
    let source = fs.readFileSync(path.join(root, script), 'utf8');
    // Expose the declared table in the test context so silent typos cannot be skipped.
    if (script.includes('sports')) source = source.replace('  var byId = {};', '  window.__declared = groups.flatMap(function (g) { return g.questions; });\n  var byId = {};');
    else source = source.replace('  data.questions.forEach(function (question) {', '  window.__declared = Object.keys(photos);\n  data.questions.forEach(function (question) {');
    context.window.__declared = null;
    vm.runInNewContext(source, context, { filename: script });
    const ids = context.window.__declared;
    assert.ok(ids && ids.length, `${script} must declare questions`);
    const unique = new Set(ids);
    assert.equal(unique.size, ids.length, `${script} has duplicate question IDs`);
    for (const id of ids) {
      assert.ok(questionIds.has(id), `${script}: unknown question ${id}`);
      assert.ok(!usedQuestions.has(id), `${id} mapped by more than one file`);
      usedQuestions.add(id);
      const question = data.questions.find(q => q.id === id);
      const item = data.mediaRegistry[question.assetId];
      assert.ok(item && item.dataUri, `${id} has a resolved photo`);
      assert.ok(question.imageAlt, `${id} has an image description`);
      if (item.dataUri.startsWith('data:image/')) continue; // Existing, bundled media pack.
      assert.match(item.dataUri, /^assets\/images\/(?:questions\/(?:geography|science|details)|categories)\/[a-z0-9_/-]+\.webp$/, id);
      const bytes = fs.readFileSync(path.join(root, item.dataUri));
      assert.equal(bytes.toString('ascii', 0, 4), 'RIFF', id);
      assert.equal(bytes.toString('ascii', 8, 12), 'WEBP', id);
      if (item.dataUri.startsWith('assets/images/categories/')) {
        assert.ok(creditedCategoryPaths.has(item.dataUri), `${item.dataUri} has source and license metadata`);
      } else {
        const creditFile = script.includes('geography') ? 'data/question-photos-geography-sources.md' : script.includes('details') ? 'assets/images/questions/details/ATTRIBUTION.md' : 'assets/images/QUESTION-PHOTOS-SCIENCE.md';
        const credit = fs.readFileSync(path.join(root, creditFile), 'utf8');
        const row = credit.split('\n').find(line => line.includes(path.basename(item.dataUri)));
        assert.ok(row && /https:\/\/commons\.wikimedia\.org\//.test(row) && /creativecommons\.org|public domain|ملكية عامة/i.test(row), `${item.dataUri} has a source and license`);
      }
    }
  }
});

test('corrected existing assets resolve from bundled media packs', () => {
  const { data, run } = loadData();
  const before = new Map(data.questions.map(q => [q.id, q.assetId]));
  run('data/question-photo-corrections.js');
  const changed = data.questions.filter(q => q.assetId && q.assetId !== before.get(q.id));
  assert.ok(changed.length > 0);
  for (const q of changed) {
    assert.ok(data.mediaRegistry[q.assetId], q.id + ' has a registered replacement');
    const uri = data.mediaRegistry[q.assetId].dataUri;
    if (uri.startsWith('assets/images/questions/')) {
      assert.ok(fs.existsSync(path.join(root, uri)), q.id + ' resolves to a local image');
    } else {
      assert.match(uri, /^data:image\/(?:webp|png|jpeg|svg\+xml)[;,]/, q.id + ' resolves to bundled image data');
    }
  }
});
