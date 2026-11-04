const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const root = path.resolve(__dirname, '..');
test('history photo additions preserve prior photos and question content and reference credited local files', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const scripts = [...html.matchAll(/<script\s+src="([^"]+)"\s*><\/script>/g)].map(m => m[1]);
  const packs = {};
  const context = vm.createContext({window: {}, document: {createElement() {return {};}, body: {appendChild(el) {packs[el.id] = el;}}, getElementById(id) {return packs[id] || null;}}});
  for (const s of scripts.slice(0, scripts.indexOf('src/engine.js'))) {
    if (s !== 'data/question-photos-batch-history.js') vm.runInContext(fs.readFileSync(path.join(root,s),'utf8'),context);
  }
  const data = context.window.SEEN_JEEM_DATA;
  const before = data.questions.map(q => ({id:q.id, photo:q.assetId, real:context.window.SeenJeemMedia.shouldDisplayQuestionImage(q), facts:JSON.stringify([q.question,q.answer,q.options])}));
  const filename = path.join(root, 'data/question-photos-batch-history.js');
  assert.ok(fs.existsSync(filename), 'history image collection should exist');
  vm.runInContext(fs.readFileSync(filename,'utf8'),context);
  let count=0;
  const attribution=fs.readFileSync(path.join(root,'assets/images/questions/batch-history/ATTRIBUTION.md'),'utf8');
  for (let i=0;i<data.questions.length;i++) {
    const q=data.questions[i], old=before[i];
    assert.equal(JSON.stringify([q.question,q.answer,q.options]),old.facts,q.id);
    if (old.real) assert.equal(q.assetId,old.photo,`existing photo changed: ${q.id}`);
    if (q.assetId===old.photo) continue;
    count++;
    const uri=data.mediaRegistry[q.assetId].dataUri, bytes=fs.readFileSync(path.join(root,uri));
    assert.equal(bytes.toString('ascii',0,4),'RIFF',q.id);
    assert.equal(bytes.toString('ascii',8,12),'WEBP',q.id);
    assert.ok(q.imageAlt && !q.imageAlt.includes(q.answer),q.id);
    if (uri.includes('/batch-history/')) assert.ok(attribution.includes(path.basename(uri)),`uncredited: ${uri}`);
  }
  assert.ok(count>=5,`expected several images, found ${count}`);
});
