// NASA satellite and astronaut photographs. Credits: batch-science/ATTRIBUTION.md.
(function () {
  'use strict';
  var data = window.SEEN_JEEM_DATA;
  if (!data || !data.mediaRegistry || !Array.isArray(data.questions)) return;
  var photos = {
    maps_borders_q09: ['gibraltar', 'صورة فضائية لممر بحري بين اليابستين'],
    maps_borders_q10: ['bab-el-mandeb', 'صورة فضائية لممر بحري عند جنوب البحر الأحمر'],
    maps_borders_q14: ['sinai', 'صورة فضائية لشبه جزيرة بين خليجين'],
    maps_borders_q21: ['bering', 'صورة فضائية لمضيق بحري بين كتلتين بريتين'],
    general_knowledge_q14: ['antarctica', 'منظر فضائي لأرض مغطاة بالجليد'],
    general_knowledge_q26: ['hurricane', 'صورة فضائية لعين إعصار مداري']
  };
  data.questions.forEach(function (question) {
    var photo = photos[question.id];
    if (!photo || (window.SeenJeemMedia && window.SeenJeemMedia.shouldDisplayQuestionImage(question))) return;
    var id = 'asset:batch_science_' + question.id;
    data.mediaRegistry[id] = { id: id, kind: 'question_media', category: question.categoryId, mime: 'image/webp', dataUri: 'assets/images/questions/batch-science/' + photo[0] + '.webp', alt: photo[1] };
    question.assetId = id;
    question.image = id;
    question.imageDataUri = id;
    question.imageAlt = photo[1];
  });
})();
