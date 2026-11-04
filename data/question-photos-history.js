// Verified local photographs; attribution in assets/images/questions/history/ATTRIBUTION.md.
(function () {
  'use strict';
  var data = window.SEEN_JEEM_DATA;
  if (!data || !data.mediaRegistry || !data.questions) return;
  var photos = {
    abbasid_history_q23: ['assets/images/questions/history/samarra.webp', 'مئذنة حلزونية تاريخية في سامراء'],
    umayyad_era_q10: ['assets/images/categories/umayyad_era.webp', 'الجامع الأموي الكبير في دمشق']
  };
  data.questions.forEach(function (question) {
    var photo = photos[question.id];
    if (!photo) return;
    var id = 'asset:question_photo_history_' + question.id;
    data.mediaRegistry[id] = { id: id, kind: 'question_media', dataUri: photo[0], alt: photo[1] };
    question.assetId = question.imageDataUri = question.image = id;
    question.imageAlt = photo[1];
    question.imageRevealCaption = '';
  });
})();
