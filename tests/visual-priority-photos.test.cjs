const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');

test('priority identification clues resolve to their credited local images without changing answers', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const scripts = [...html.matchAll(/<script\s+src="([^"]+)"\s*><\/script>/g)].map(m => m[1]);
  const engine = scripts.indexOf('src/engine.js');
  const packs = {};
  const document = { createElement() { return {}; }, body: { appendChild(el) { packs[el.id] = el; } }, getElementById(id) { return packs[id] || null; } };
  const context = vm.createContext({ window: {}, document });
  const facts = q => JSON.stringify([q.id, q.categoryId, q.question, q.answer, q.options, q.correctAnswerIndex, q.points, q.difficulty]);
  for (const file of scripts.slice(0, engine)) {
    const before = file === 'data/question-photos-visual-priority.js' ? context.window.SEEN_JEEM_DATA.questions.map(facts) : null;
    vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file });
    if (before) assert.deepEqual(context.window.SEEN_JEEM_DATA.questions.map(facts), before, 'question content and order must be preserved');
  }
  assert.ok(scripts.indexOf('data/question-photos-visual-priority.js') > scripts.indexOf('src/media-resolver.js'));
  assert.ok(scripts.indexOf('data/question-photos-visual-priority.js') < engine);
  assert.equal(scripts.filter(s => s === 'data/question-photos-visual-priority.js').length, 1);
  const data = context.window.SEEN_JEEM_DATA;
  for (const [id, answer, uri] of [
    ['macro_object_closeup_q01', 'الزعفران', 'assets/images/questions/food/saffron.webp'],
    ['macro_object_closeup_q03', 'الأناناس', 'assets/images/questions/visual-priority/pineapple.webp'],
    ['macro_object_closeup_q05', 'داخل حركة الساعة الميكانيكية', 'assets/images/questions/visual-priority/watch-spring.webp'],
    ['kw_museums_heritage_q05', 'منطقة الجهراء', 'assets/images/questions/visual-priority/red-fort.webp'],
    ['who_is_landmark_q14', 'برج التحرير', 'assets/images/questions/kuwait/liberation.webp'],
    ['who_is_landmark_q25', 'برجا بتروناس التوأم', 'assets/images/questions/visual-priority/petronas.webp'],
    ['who_is_landmark_q35', 'معبد اللوتس', 'assets/images/questions/visual-priority/lotus2.webp'],
    ['who_is_landmark_q40', 'قلعة حلب', 'assets/images/questions/visual-priority/aleppo.webp'],
    ['kw_old_markets_q15', 'الريال الفرنسي', 'assets/images/questions/visual-priority/maria-theresa-thaler.webp']
  ]) {
    const q = data.questions.find(q => q.id === id);
    assert.equal(q.answer, answer);
    assert.equal(data.mediaRegistry[q.assetId].dataUri, uri, id);
    assert.equal(context.window.SeenJeemMedia.shouldDisplayQuestionImage(q), true, id);
    assert.equal(context.window.SeenJeemMedia.isRealQuestionPhoto(q), true, id);
    const bytes = fs.readFileSync(path.join(root, uri));
    assert.equal(bytes.toString('ascii', 0, 4), 'RIFF', id);
    assert.equal(bytes.toString('ascii', 8, 12), 'WEBP', id);
    assert.ok(!q.imageAlt.includes(answer), `${id}: alt must not reveal answer`);
  }
});
