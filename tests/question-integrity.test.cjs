const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function loadQuestions() {
  const window = { SEEN_JEEM_DATA: { questions: [] } };
  const dir = path.join(__dirname, '..', 'data', 'questions');
  for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.js')).sort()) {
    vm.runInNewContext(fs.readFileSync(path.join(dir, file), 'utf8'), { window }, { filename: file });
  }
  return window.SEEN_JEEM_DATA.questions;
}

test('question options are distinct and match the canonical answer', () => {
  const failures = loadQuestions().filter(q => !Array.isArray(q.options) || q.options.length !== 3 ||
    new Set(q.options.map(option => String(option).trim())).size !== 3 ||
    q.options[q.correctAnswerIndex] !== q.answer).map(q => q.id);
  assert.deepEqual(failures, []);
});

test('question difficulty agrees with its points', () => {
  const tier = { 200: 'easy', 400: 'medium', 600: 'hard' };
  const failures = loadQuestions().filter(q => !tier[q.points] || q.difficulty !== tier[q.points]).map(q => q.id);
  assert.deepEqual(failures, []);
});

test('Abbasid question about Irene does not describe Nikephoros as her son', () => {
  const q = loadQuestions().find(item => item.id === 'abbasid_history_q22');
  assert.ok(q);
  assert.doesNotMatch(q.question, /ابنها/);
  assert.match(q.explanation, /806/);
  assert.doesNotMatch(q.explanation, /187/);
});

test('every category can supply a board ordered by increasing points', () => {
  const engine = require('../src/engine.js');
  const byCategory = new Map();
  for (const q of loadQuestions()) {
    if (!byCategory.has(q.categoryId)) byCategory.set(q.categoryId, []);
    byCategory.get(q.categoryId).push(q);
  }
  const failures = [];
  for (const [id, questions] of byCategory) {
    const chosen = engine.selectCategoryMatchQuestions(questions, {}, () => 0.5);
    if (chosen.questions.map(q => q.points).join(',') !== '200,200,400,400,600,600') failures.push(id);
  }
  assert.deepEqual(failures, []);
});

test('last Abbasid caliph in Cairo question avoids an uncontested transfer claim', () => {
  const q = loadQuestions().find(item => item.id === 'abbasid_history_q40');
  assert.ok(q);
  assert.doesNotMatch(q.question, /انتقلت بعده الخلافة/);
  assert.match(q.question, /1517/);
});

test('Vikings questions identify the person or fact being asked about', () => {
  const questions = loadQuestions();
  const question = id => questions.find(item => item.id === `tv_vikings_q${id}`).question;
  assert.match(question('04'), /لاغيرثا/);
  assert.match(question('11'), /راغنار ولاغيرثا/);
  assert.match(question('19'), /عرض/);
  assert.match(question('22'), /أثيلستان/);
});
