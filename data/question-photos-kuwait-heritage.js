// Photographs and licenses: assets/images/questions/kuwait-heritage/ATTRIBUTION.md.
(function () {
  'use strict';
  var data = window.SEEN_JEEM_DATA;
  if (!data || !Array.isArray(data.questions) || !data.mediaRegistry) return;
  var photos = {
    kw_history_q16: ['oil-export.webp', 'صورة تاريخية لحفل بدء تصدير النفط الكويتي'],
    kw_old_markets_q01: ['mubarakiya.webp', 'ممر مسقوف في سوق المباركية بالكويت'],
    kw_old_markets_q16: ['mubarakiya.webp', 'ممر تجاري مسقوف في سوق المباركية بالكويت'],
    kw_culture_q01: ['heritage-dhow.webp', 'سفينة خشبية تقليدية معروضة في مدينة الكويت'],
    kw_culture_q09: ['heritage-dhow.webp', 'سفينة خشبية تقليدية معروضة في مدينة الكويت'],
    kw_culture_q15: ['heritage-dhow.webp', 'سفينة خشبية تقليدية معروضة في مدينة الكويت'],
    kw_culture_q16: ['harbour.webp', 'قوارب خشبية في مرفأ مدينة الكويت'],
    kw_culture_q38: ['heritage-dhow.webp', 'سفينة خشبية تقليدية معروضة في مدينة الكويت'],
    kw_culture_q39: ['heritage-dhow.webp', 'سفينة خشبية تقليدية معروضة في مدينة الكويت'],
    kw_sea_pearling_q01: ['heritage-dhow.webp', 'سفينة خشبية تقليدية معروضة في مدينة الكويت'],
    kw_sea_pearling_q05: ['harbour.webp', 'قوارب خشبية في مرفأ مدينة الكويت'],
    kw_sea_pearling_q16: ['heritage-dhow.webp', 'سفينة خشبية تقليدية معروضة في مدينة الكويت'],
    kw_sea_pearling_q37: ['heritage-dhow.webp', 'سفينـة خشبية بسوارٍ وأذرع خشبية في مدينة الكويت']
  };
  data.questions.forEach(function (question) {
    var photo = photos[question.id];
    if (!photo || (window.SeenJeemMedia && window.SeenJeemMedia.isRealQuestionPhoto(question))) return;
    var assetId = 'asset:question_photo_kuwait_heritage_' + question.id;
    data.mediaRegistry[assetId] = {
      id: assetId,
      kind: 'question_media',
      category: question.categoryId,
      dataUri: 'assets/images/questions/kuwait-heritage/' + photo[0],
      alt: photo[1]
    };
    question.assetId = assetId;
    question.image = assetId;
    question.imageDataUri = assetId;
    question.imageAlt = photo[1];
  });
})();
