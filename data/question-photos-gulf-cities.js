// Local photographs of places named in the question. Sources: gulf-cities/ATTRIBUTION.md.
(function () {
  'use strict';
  var data = window.SEEN_JEEM_DATA;
  if (!data || !data.questions || !data.mediaRegistry) return;
  var photos = {
    'gulf_cities_q01': ['kingdom', 'برج المملكة ليلاً'],
    'gulf_cities_q05': ['salalah', 'منظر أخضر في وادي دربات قرب صلالة'],
    'gulf_cities_q07': ['jeddah', 'نافورة الملك فهد على البحر الأحمر'],
    'gulf_cities_q22': ['jais', 'منظر جبلي من جبل جيس'],
    'gulf_cities_q26': ['abha', 'منظر على الطريق من أبها إلى السودة'],
    'gulf_cities_q28': ['kuwaittowers', 'أبراج الكويت على الساحل']
  };
  data.questions.forEach(function (question) {
    var photo = photos[question.id];
    if (!photo || (window.SeenJeemMedia && window.SeenJeemMedia.isRealQuestionPhoto(question))) return;
    var id = 'asset:photo_gulf_cities_' + question.id;
    data.mediaRegistry[id] = {
      id: id,
      kind: 'question_media',
      category: question.categoryId,
      mime: 'image/webp',
      dataUri: 'assets/images/questions/gulf-cities/' + photo[0] + '.webp',
      alt: photo[1]
    };
    question.assetId = id;
    question.image = id;
    question.imageDataUri = id;
    question.imageAlt = photo[1];
  });
})();
