// Unlabeled Natural Earth map clues, documented in country-maps/ATTRIBUTION.md.
(function () {
  'use strict';
  var data = window.SEEN_JEEM_DATA;
  if (!data || !data.mediaRegistry || !Array.isArray(data.questions)) return;
  var maps = [
    'kwt', 'ita', 'sau', 'egy', 'qat', 'bhr', 'chl', 'aus', 'jpn', 'fra',
    'bra', null, 'ind', 'can', 'are', 'omn', 'dza', 'tur', 'jor', 'esp',
    'lka', 'mdg', 'zaf', 'nor', 'nzl', 'som', 'npl', 'uzb', 'gmb', 'nam',
    'afg', 'hrv', 'aze', 'cze', 'mys', 'pan', 'cod', 'mng', 'ltu', 'png'
  ];
  data.questions.forEach(function (question) {
    var match = /^guess_country_map_q(\d\d)$/.exec(question.id);
    if (!match || (window.SeenJeemMedia && window.SeenJeemMedia.isRealQuestionPhoto(question))) return;
    var name = maps[Number(match[1]) - 1];
    if (!name) return;
    var id = 'asset:country_map_clue_' + question.id;
    data.mediaRegistry[id] = { id: id, kind: 'question_media', category: question.categoryId, mime: 'image/webp', dataUri: 'assets/images/questions/country-maps/' + name + '.webp' };
    question.assetId = id;
    question.image = id;
    question.imageDataUri = id;
    question.imageAlt = 'خريطة لدولة محددة باللون البرتقالي ومحيطها';
  });
})();
