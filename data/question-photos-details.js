// Locally bundled visual clues. Sources and licenses: assets/images/questions/details/ATTRIBUTION.md.
(function () {
  'use strict';
  var data = window.SEEN_JEEM_DATA;
  if (!data || !data.questions || !data.mediaRegistry) return;
  var photos = {
    other_sports_q01: ['olympic-rings.webp', 'شعار رياضي بحلقات متداخلة'],
    macro_object_closeup_q02: ['crystal-geode.webp', 'بلورات بنفسجية داخل تجويف صخري'],
    macro_object_closeup_q04: ['camera-lens.webp', 'صورة مقربة لجهاز بصري'],
    macro_object_closeup_q10: ['match-head.webp', 'صورة مقربة لرأس عود ثقاب'],
    macro_object_closeup_q14: ['leaf-microscope.webp', 'نسيج ورقة نبات تحت المجهر'],
    macro_object_closeup_q18: ['pollen-microscope.webp', 'حبوب لقاح مصورة بالمجهر الإلكتروني']
  };
  data.questions.forEach(function (question) {
    var photo = photos[question.id];
    if (!photo) return;
    var id = 'asset:question_photo_detail_' + question.id;
    data.mediaRegistry[id] = {
      id: id,
      kind: 'question_media',
      category: question.categoryId,
      dataUri: 'assets/images/questions/details/' + photo[0],
      alt: photo[1]
    };
    question.assetId = id;
    question.image = id;
    question.imageDataUri = id;
    question.imageAlt = photo[1];
  });
})();
