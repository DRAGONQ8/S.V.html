// Locally bundled general-knowledge photographs; see the image attribution files.
(function () {
  'use strict';
  var data = window.SEEN_JEEM_DATA;
  if (!data || !data.questions || !data.mediaRegistry) return;
  var photos = {
    general_knowledge_q06: ['assets/images/questions/sports-extra/chess.webp', 'رقعة شطرنج وقطعها في بداية المباراة'],
    general_knowledge_q07: ['assets/images/questions/general-knowledge/rainbow.webp', 'قوس ملون فوق نهر ومنظر طبيعي'],
    general_knowledge_q31: ['assets/images/questions/sports-extra/chess.webp', 'رقعة شطرنج وقطعها في بداية المباراة']
  };
  data.questions.forEach(function (question) {
    var photo = photos[question.id];
    if (!photo || (window.SeenJeemMedia && window.SeenJeemMedia.isRealQuestionPhoto(question))) return;
    var id = 'asset:question_photo_general_knowledge_' + question.id;
    data.mediaRegistry[id] = {
      id: id, kind: 'question_media', category: question.categoryId,
      mime: 'image/webp', dataUri: photo[0], alt: photo[1]
    };
    question.assetId = id;
    question.image = id;
    question.imageDataUri = id;
    question.imageAlt = photo[1];
  });
})();
