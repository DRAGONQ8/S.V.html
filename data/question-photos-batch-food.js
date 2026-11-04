// Curated local food photographs; see assets/images/questions/batch-food/ATTRIBUTION.md.
(function () {
  'use strict';
  var data = window.SEEN_JEEM_DATA;
  if (!data || !data.mediaRegistry || !Array.isArray(data.questions)) return;
  var photos = {
    food_cultures_q06: ['mansaf', 'طبق أرز ولحم وصلصة لبن'],
    food_cultures_q29: ['chili', 'ثمار فلفل أحمر حار'],
    food_cultures_q32: ['breadcrust', 'أرغفة خبز محمّرة'],
    food_cultures_q37: ['parmesan', 'قطعة من جبن إيطالي'],
    food_cultures_q39: ['tea', 'تحضير الشاي في مجلس ياباني'],
    kw_cuisine_q28: ['machboos', 'طبق أرز مع الدجاج والتوابل'],
    kw_cuisine_q32: ['deserttruffle', 'فطر بري في أرض صحراوية'],
    kw_cuisine_q38: ['grouper', 'أسماك طازجة في سوق للسمك'],
    ramadan_sufra_q03: ['pudding', 'حلوى حليب في أوعية صغيرة'],
    ramadan_sufra_q04: ['harees', 'طبق من القمح المطبوخ'],
    ramadan_sufra_q16: ['halawet', 'حلوى من لفائف بيضاء'],
    ramadan_sufra_q18: ['dates', 'وعاء من ثمار النخيل المجففة'],
    ramadan_sufra_q30: ['pudding', 'حلوى حليب في أوعية صغيرة'],
    ramadan_sufra_q31: ['halawet', 'حلوى من لفائف بيضاء'],
    ramadan_sufra_q37: ['balaleet', 'طبق شعيرية مع البيض'],
    hala_wa_gahwa_q09: ['v60', 'قمع لتقطير القهوة'],
    hala_wa_gahwa_q18: ['maillard', 'تحميص حبوب البن'],
    hala_wa_gahwa_q28: ['cappuccino', 'فنجان قهوة بحليب ورغوة'],
    hala_wa_gahwa_q29: ['v60', 'قمع لتقطير القهوة']
  };
  data.questions.forEach(function (question) {
    var photo = photos[question.id];
    if (!photo) return;
    // Keep every image the existing resolver already displays, including game media.
    if (window.SeenJeemMedia && window.SeenJeemMedia.shouldDisplayQuestionImage(question)) return;
    var id = 'asset:batch_food_' + question.id;
    data.mediaRegistry[id] = {
      id: id, kind: 'question_media', category: question.categoryId,
      mime: 'image/webp', dataUri: 'assets/images/questions/batch-food/' + photo[0] + '.webp', alt: photo[1]
    };
    question.assetId = question.image = question.imageDataUri = id;
    question.imageAlt = photo[1];
    question.imageRevealCaption = '';
  });
})();
