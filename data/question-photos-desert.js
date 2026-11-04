// A documented local photograph adds context to falconry questions.
// Source and license: assets/images/ATTRIBUTION.md (أهل البر والمقناص).
(function () {
  'use strict';
  var data = window.SEEN_JEEM_DATA;
  if (!data || !Array.isArray(data.questions) || !data.mediaRegistry) return;

  // The photograph shows a man with a bird of prey in the Kuwaiti countryside.
  // It supplies context without naming the specialized terms asked for below.
  var ids = [
    'ahl_albarr_q01', 'ahl_albarr_q04', 'ahl_albarr_q09',
    'ahl_albarr_q13', 'ahl_albarr_q17', 'ahl_albarr_q18', 'ahl_albarr_q19',
    'ahl_albarr_q20', 'ahl_albarr_q27', 'ahl_albarr_q28',
    'ahl_albarr_q29', 'ahl_albarr_q30', 'ahl_albarr_q31'
  ];
  var selected = Object.create(null);
  ids.forEach(function (id) { selected[id] = true; });
  data.questions.forEach(function (question) {
    if (!selected[question.id]) return;
    var assetId = 'asset:question_photo_desert_' + question.id;
    var camel = question.id === 'ahl_albarr_q17';
    var alt = camel ? 'جمل في صحراء جنوب سيناء' : 'رجل يحمل طائراً جارحاً في البر الكويتي';
    data.mediaRegistry[assetId] = {
      id: assetId,
      kind: 'question_media',
      category: question.categoryId,
      dataUri: camel ? 'assets/images/questions/desert/camel.webp' : 'assets/images/categories/ahl_albarr.webp',
      alt: alt
    };
    question.assetId = assetId;
    question.image = assetId;
    question.imageDataUri = assetId;
    question.imageAlt = alt;
  });
})();
