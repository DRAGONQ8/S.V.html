/* Locally hosted photographs; see question-photos-ancient-civs-sources.md. */
(function () {
  'use strict';
  var data = window.SEEN_JEEM_DATA;
  if (!data || !data.mediaRegistry || !Array.isArray(data.questions)) return;
  var photos = {
    ancient_civs_q02: '02.webp',
    ancient_civs_q03: '03.webp',
    ancient_civs_q04: '04.webp',
    ancient_civs_q05: '05.webp',
    ancient_civs_q07: '07.webp',
    ancient_civs_q08: '08.webp',
    ancient_civs_q09: '09.webp',
    ancient_civs_q10: '10.webp',
    ancient_civs_q14: '14.webp',
    ancient_civs_q15: '15.webp',
    ancient_civs_q17: '17.webp',
    ancient_civs_q18: '18.webp',
    ancient_civs_q21: '21.webp',
    ancient_civs_q23: '23.webp',
    ancient_civs_q24: '24.webp',
    ancient_civs_q27: '27.webp',
    ancient_civs_q30: '30.webp',
    ancient_civs_q37: '37.webp',
    ancient_civs_q38: '38.webp',
    ancient_civs_q39: '39.webp',
  };
  data.questions.forEach(function (question) {
    var photo = photos[question.id];
    if (!photo) return;
    var id = 'asset:ancient_civs_photo_' + question.id;
    data.mediaRegistry[id] = { id: id, kind: 'question_media', mime: 'image/webp', dataUri: 'assets/images/questions/ancient-civs/' + photo };
    question.assetId = id;
    question.image = id;
    question.imageDataUri = id;
    question.imageAlt = 'صورة توضيحية مرتبطة بالسؤال';
  });
})();
