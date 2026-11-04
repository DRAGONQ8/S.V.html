const test = require('node:test');
const assert = require('node:assert/strict');
const Engine = require('../src/engine.js');

test('unseen count only considers current questions and treats either history as seen', () => {
  const questions = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }];
  assert.equal(Engine.countUnseenQuestions(questions,
    { a: true, b: true, removed: true, d: false },
    { b: false, c: true, stale: true }), 1);
});

test('unseen count handles missing histories and an empty catalog', () => {
  assert.equal(Engine.countUnseenQuestions([{ id: 'a' }]), 1);
  assert.equal(Engine.countUnseenQuestions([], { stale: true }), 0);
});

test('catalog question totals and difficulty distributions match the loaded questions', () => {
  const fs = require('node:fs');
  const vm = require('node:vm');
  const path = require('node:path');
  const root = path.resolve(__dirname, '..');
  const context = { window: {} };
  const run = file => vm.runInNewContext(fs.readFileSync(path.join(root, file), 'utf8'), context);
  run('data/catalog.js');
  for (const file of fs.readdirSync(path.join(root, 'data/questions')).filter(f => f.endsWith('.js')).sort()) run('data/questions/' + file);
  const data = context.window.SEEN_JEEM_DATA;
  assert.equal(data.stats.totalQuestions, data.questions.length);
  for (const cat of data.categories) {
    const qs = data.questions.filter(q => q.categoryId === cat.id);
    assert.equal(cat.questionCount, qs.length, cat.id);
    for (const points of [200, 400, 600]) {
      assert.equal(cat.difficultyDistribution[points], qs.filter(q => q.points === points).length, `${cat.id} ${points}`);
    }
    for (const sample of cat.sampleQuestions || []) {
      const question = qs.find(q => q.id === sample.id);
      assert.ok(question, `${cat.id} ${sample.id}`);
      assert.equal(sample.question, question.question, sample.id);
      assert.equal(sample.answer, question.answer, sample.id);
    }
  }
});

test('completed match records are updated without duplicates and removed on undo', () => {
  const stats = { matchesPlayed: 4 };
  const match = { matchId: 'match-1', status: 'completed', teams: {
    team1: { name: 'الفريق الأول', score: 400 }, team2: { name: 'الفريق الثاني', score: 200 }
  } };
  Engine.recordCompletedMatch(stats, match);
  Engine.recordCompletedMatch(stats, match);
  assert.equal(stats.records.length, 1);
  assert.equal(stats.matchesPlayed, 5);
  assert.equal(stats.records[0].winner, 'الفريق الأول');
  assert.equal(stats.records[0].highestScore, 400);
  match.teams.team2.score = 600;
  Engine.recordCompletedMatch(stats, match);
  assert.equal(stats.records.length, 1);
  assert.equal(stats.records[0].winner, 'الفريق الثاني');
  assert.equal(stats.records[0].highestScore, 600);
  assert.equal(stats.matchesPlayed, 5);
  Engine.removeCompletedMatchRecord(stats, match.matchId);
  assert.equal(stats.records.length, 0);
  assert.equal(stats.matchesPlayed, 4);
  Engine.removeCompletedMatchRecord(stats, match.matchId);
  assert.equal(stats.matchesPlayed, 4);
});

test('unfinished matches do not create hall of fame records', () => {
  const stats = {};
  Engine.recordCompletedMatch(stats, { matchId: 'match-2', status: 'in_progress' });
  assert.equal((stats.records || []).length, 0);
});

test('undo preserves question history from earlier matches and handles old saves conservatively', () => {
  const history = { old: true, fresh: true, legacy: true };
  Engine.restorePlayedHistoryOnUndo(history, { type: 'SCORE_CELL', questionId: 'old', previouslyPlayed: true });
  Engine.restorePlayedHistoryOnUndo(history, { type: 'SCORE_CELL', questionId: 'fresh', previouslyPlayed: false });
  Engine.restorePlayedHistoryOnUndo(history, { type: 'SCORE_CELL', questionId: 'legacy' });
  assert.deepEqual(history, { old: true, legacy: true });
});
