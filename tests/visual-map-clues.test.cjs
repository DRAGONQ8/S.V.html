const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');

test('map clues display locally without being counted as photographs', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const scripts = [...html.matchAll(/<script\s+src="([^"]+)"\s*><\/script>/g)].map(m => m[1]);
  const engine = scripts.indexOf('src/engine.js');
  const packs = {};
  const document = { createElement() { return {}; }, body: { appendChild(el) { packs[el.id] = el; } }, getElementById(id) { return packs[id] || null; } };
  const context = vm.createContext({ window: {}, document });
  const facts = q => JSON.stringify([q.id, q.categoryId, q.question, q.answer, q.options, q.correctAnswerIndex, q.points, q.difficulty]);
  for (const file of scripts.slice(0, engine)) {
    const before = file === 'data/question-maps-countries.js' ? context.window.SEEN_JEEM_DATA.questions.map(facts) : null;
    vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file });
    if (before) assert.deepEqual(context.window.SEEN_JEEM_DATA.questions.map(facts), before, 'question content and order must be preserved');
  }
  const data = context.window.SEEN_JEEM_DATA;
  assert.ok(scripts.indexOf('data/question-maps-countries.js') > scripts.indexOf('src/media-resolver.js'));
  assert.ok(scripts.indexOf('data/question-maps-countries.js') < engine);
  const names = 'kwt ita sau egy qat bhr chl aus jpn fra bra mar ind can are omn dza tur jor esp lka mdg zaf nor nzl som npl uzb gmb nam afg hrv aze cze mys pan cod mng ltu png'.split(' ');
  const answers = 'دولة الكويت|إيطاليا|المملكة العربية السعودية|جمهورية مصر العربية|دولة قطر|مملكة البحرين|تشيلي|أستراليا|اليابان|فرنسا|البرازيل|المملكة المغربية|الهند|كندا|الإمارات العربية المتحدة|سلطنة عُمان|الجزائر|تركيا|المملكة الأردنية الهاشمية|إسبانيا|سريلانكا|مدغشقر|جمهورية جنوب إفريقيا|النرويج|نيوزيلندا|الصومال|نيبال|أوزبكستان|غامبيا|ناميبيا|أفغانستان|كرواتيا|أذربيجان|جمهورية التشيك|ماليزيا|بنما|جمهورية الكونغو الديمقراطية|منغوليا|ليتوانيا|بابوا غينيا الجديدة'.split('|');
  for (let i = 0; i < names.length; i++) {
    const id = `guess_country_map_q${String(i + 1).padStart(2, '0')}`;
    const q = data.questions.find(q => q.id === id);
    assert.equal(q.answer, answers[i], id);
    if (i === 11) {
      assert.equal(context.window.SeenJeemMedia.shouldDisplayQuestionImage(q), false, id);
      continue;
    }
    assert.equal(context.window.SeenJeemMedia.shouldDisplayQuestionImage(q), true, id);
    assert.equal(context.window.SeenJeemMedia.isRealQuestionPhoto(q), false, id);
    const uri = data.mediaRegistry[q.assetId].dataUri;
    assert.equal(uri, `assets/images/questions/country-maps/${names[i]}.webp`, id);
    const bytes = fs.readFileSync(path.join(root, uri));
    assert.equal(bytes.toString('ascii', 0, 4), 'RIFF', id);
    assert.equal(bytes.toString('ascii', 8, 12), 'WEBP', id);
    assert.ok(!q.imageAlt.includes(q.answer), id);
  }
});
