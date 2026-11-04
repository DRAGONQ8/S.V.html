// Existing, credited local images reused as context for related questions.
// Attribution remains in their original photo collection source files.
(function () {
  'use strict';
  var data = window.SEEN_JEEM_DATA;
  if (!data || !data.mediaRegistry || !Array.isArray(data.questions)) return;
  var photos = {
    gulf_cities_q04: ['assets/images/questions/batch-landmarks/souq-waqif.webp', 'ساحة في سوق تراثي في الدوحة'],
    gulf_cities_q12: ['assets/images/questions/batch-landmarks/nizwa.webp', 'قلعة تاريخية في مدينة عُمانية تحيط بها واحة'],
    who_is_landmark_q36: ['assets/images/questions/batch-landmarks/heydar-aliyev-center.webp', 'مبنى ثقافي بانحناءات بيضاء انسيابية'],
    who_is_landmark_q37: ['assets/images/questions/batch-landmarks/louvre-abu-dhabi.webp', 'متحف ذو قبة هندسية قرب الماء'],
    gulf_cities_q02: ['assets/images/questions/batch-landmarks/sheikh-zayed-mosque.webp', 'مسجد كبير بقباب ومآذن مضاءة'],
    gulf_cities_q03: ['assets/images/questions/batch-landmarks/burj-al-arab.webp', 'فندق على الساحل بتصميم يشبه الشراع'],
    gulf_cities_q18: ['assets/images/questions/batch-landmarks/qatar-national-museum.webp', 'متحف ذو تصميم مستوحى من وردة الصحراء'],
    gulf_cities_q32: ['assets/images/questions/batch-landmarks/bahla-fort.webp', 'قلعة طينية تاريخية في عُمان'],
    gulf_cities_q09: ['assets/images/questions/kuwait/failaka_sat.webp', 'صورة فضائية لجزيرة كويتية'],
    gulf_cities_q10: ['assets/images/questions/kuwait/bubiyan_iss.webp', 'صورة فضائية لجزيرة كويتية كبيرة'],
    gulf_cities_q11: ['assets/images/questions/landmarks-extra/hegra.webp', 'مقبرة منحوتة في صخر موقع أثري بشمال غرب الجزيرة العربية'],
    gulf_cities_q15: ['assets/images/questions/landmarks-extra/burjkhalifa.webp', 'أفق دبي وفيه ناطحة سحاب عالية'],
    gulf_cities_q20: ['assets/images/questions/kuwait/causeway.webp', 'منظر أسفل جسر بحري في الكويت'],
    gulf_cities_q35: ['assets/images/questions/kuwait/liberation.webp', 'برج اتصالات وسط مدينة الكويت'],
    kw_history_q39: ['assets/images/questions/kuwait/failaka_sat.webp', 'صورة فضائية لجزيرة في الخليج'],
    kw_history_q40: ['assets/images/questions/kuwait/failaka_sat.webp', 'صورة فضائية لجزيرة في الخليج'],
    kw_islands_q21: ['assets/images/questions/kuwait/failaka_sat.webp', 'صورة فضائية لجزيرة كويتية'],
    kw_islands_q23: ['assets/images/questions/kuwait/failaka_sat.webp', 'صورة فضائية لجزيرة كويتية']
  };
  data.questions.forEach(function (question) {
    var photo = photos[question.id];
    if (!photo || (window.SeenJeemMedia && window.SeenJeemMedia.shouldDisplayQuestionImage(question))) return;
    var id = 'asset:batch_landmarks_' + question.id;
    data.mediaRegistry[id] = { id: id, kind: 'question_media', category: question.categoryId, mime: 'image/webp', dataUri: photo[0], alt: photo[1] };
    question.assetId = id;
    question.image = id;
    question.imageDataUri = id;
    question.imageAlt = photo[1];
  });
})();
