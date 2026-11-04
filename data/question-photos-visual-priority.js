// Question-specific local clues; sources are in visual-priority/ATTRIBUTION.md.
// Reused images retain their existing attribution in their original directories.
(function () {
  'use strict';
  var data = window.SEEN_JEEM_DATA;
  if (!data || !data.mediaRegistry || !Array.isArray(data.questions)) return;
  var photos = {
    macro_object_closeup_q05: ['assets/images/questions/visual-priority/watch-spring.webp', 'تروس ونابض حلزوني دقيق'],
    kw_museums_heritage_q05: ['assets/images/questions/visual-priority/red-fort.webp', 'أحد أبراج قصر طيني أحمر في الكويت'],
    macro_object_closeup_q03: ['assets/images/questions/visual-priority/pineapple.webp', 'قشرة فاكهة بتفاصيل هندسية متراصة'],
    macro_object_closeup_q01: ['assets/images/questions/food/saffron.webp', 'خيوط حمراء دقيقة في وعاء'],
    who_is_landmark_q14: ['assets/images/questions/kuwait/liberation.webp', 'برج اتصالات في مدينة الكويت'],
    who_is_landmark_q25: ['assets/images/questions/visual-priority/petronas.webp', 'برجان متصلان بجسر مرتفع'],
    who_is_landmark_q35: ['assets/images/questions/visual-priority/lotus2.webp', 'مبنى أبيض ذو بتلات في حديقة'],
    who_is_landmark_q40: ['assets/images/questions/visual-priority/aleppo.webp', 'قلعة حجرية على تلة وجسر مقنطر'],
    kw_old_markets_q15: ['assets/images/questions/visual-priority/maria-theresa-thaler.webp', 'وجها عملة فضية تحمل صورة ماريا تيريزا']
  };
  data.questions.forEach(function (question) {
    var photo = photos[question.id];
    if (!photo || (window.SeenJeemMedia && window.SeenJeemMedia.isRealQuestionPhoto(question))) return;
    var id = 'asset:visual_priority_' + question.id;
    data.mediaRegistry[id] = { id: id, kind: 'question_media', category: question.categoryId, mime: 'image/webp', dataUri: photo[0], alt: photo[1] };
    question.assetId = id;
    question.image = id;
    question.imageDataUri = id;
    question.imageAlt = photo[1];
  });
})();
