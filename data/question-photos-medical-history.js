// Real medical-history photographs; source and license credits are in
// assets/images/questions/medical-history/ATTRIBUTION.md.
(function () {
  'use strict';
  var data = window.SEEN_JEEM_DATA;
  if (!data || !data.questions || !data.mediaRegistry) return;
  var photos = {
    inventions_q04: ['fleming.webp', 'عالم في مختبر طبي'],
    inventions_q10: ['pasteur.webp', 'صورة لعالم في القرن التاسع عشر'],
    inventions_q34: ['koch.webp', 'صورة لطبيب وعالم أحياء دقيقة'],
    medical_discoveries_health_q01: ['fleming.webp', 'عالم في مختبر طبي'],
    medical_discoveries_health_q14: ['barnard.webp', 'صورة لجراح في القرن العشرين'],
    medical_discoveries_health_q17: ['hpylori.webp', 'صورة مجهرية لبكتيريا ذات أسواط'],
    medical_discoveries_health_q23: ['pasteur.webp', 'صورة لعالم في القرن التاسع عشر'],
    medical_discoveries_health_q24: ['koch.webp', 'صورة لطبيب وعالم أحياء دقيقة'],
    medical_discoveries_health_q29: ['barnard.webp', 'صورة لجراح في القرن العشرين']
  };
  data.questions.forEach(function (question) {
    var photo = photos[question.id];
    if (!photo) return;
    var id = 'asset:question_photo_medical_history_' + question.id;
    data.mediaRegistry[id] = {
      id: id,
      kind: 'question_media',
      category: question.categoryId,
      mime: 'image/webp',
      dataUri: 'assets/images/questions/medical-history/' + photo[0],
      alt: photo[1]
    };
    question.assetId = id;
    question.image = id;
    question.imageDataUri = id;
    question.imageAlt = photo[1];
  });
})();
