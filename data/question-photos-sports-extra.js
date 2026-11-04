// Context photographs do not identify the athlete or answer; credits are in sports-extra/ATTRIBUTION.md.
(function () {
  'use strict';
  var data = window.SEEN_JEEM_DATA;
  if (!data || !data.questions || !data.mediaRegistry) return;
  var groups = [
    {file: 'boxing', alt: 'قفازا ملاكمة', questions: ['other_sports_q06', 'other_sports_q36', 'combat_and_team_sports_q01', 'combat_and_team_sports_q02', 'combat_and_team_sports_q03', 'combat_and_team_sports_q21', 'combat_and_team_sports_q22', 'combat_and_team_sports_q23']},
    {file: 'basketball', alt: 'كرة سلة', questions: ['other_sports_q03', 'other_sports_q08', 'other_sports_q12', 'other_sports_q23', 'other_sports_q24', 'other_sports_q25']},
    {file: 'volleyball', alt: 'كرة طائرة', questions: ['other_sports_q04', 'other_sports_q34', 'other_sports_q35', 'combat_and_team_sports_q12', 'combat_and_team_sports_q13', 'combat_and_team_sports_q32', 'combat_and_team_sports_q33']},
    {file: 'handball', alt: 'ملعب كرة يد أثناء مباراة', questions: ['other_sports_q05', 'combat_and_team_sports_q09', 'combat_and_team_sports_q10', 'combat_and_team_sports_q11', 'combat_and_team_sports_q29', 'combat_and_team_sports_q30', 'combat_and_team_sports_q31']},
    {file: 'track', alt: 'مضمار ألعاب قوى', questions: ['other_sports_q07', 'other_sports_q13', 'other_sports_q28', 'other_sports_q29', 'other_sports_q31']},
    {file: 'chess', alt: 'رقعة شطرنج وقطعها', questions: ['other_sports_q37', 'other_sports_q38']},
    {file: 'fencing', alt: 'مبارزة بالسلاح', questions: ['other_sports_q27', 'combat_and_team_sports_q08', 'combat_and_team_sports_q28']},
    {file: 'waterpolo', alt: 'مباراة كرة ماء', questions: ['combat_and_team_sports_q16']},
    {file: 'squash', alt: 'مباراة إسكواش', questions: ['combat_and_team_sports_q19']},
    {file: 'badminton', alt: 'مباراة ريشة طائرة', questions: ['combat_and_team_sports_q18']}
  ];
  var byId = {};
  data.questions.forEach(function (question) { byId[question.id] = question; });
  groups.forEach(function (group) {
    group.questions.forEach(function (id) {
      var question = byId[id];
      if (!question) return;
      var assetId = 'asset:question_photo_sports_extra_' + id;
      data.mediaRegistry[assetId] = {
        id: assetId,
        kind: 'question_media',
        category: question.categoryId,
        mime: 'image/webp',
        dataUri: 'assets/images/questions/sports-extra/' + group.file + '.webp',
        alt: group.alt
      };
      question.assetId = assetId;
      question.image = assetId;
      question.imageDataUri = assetId;
      question.imageAlt = group.alt;
    });
  });
})();
