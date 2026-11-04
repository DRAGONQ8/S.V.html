/* Local photographs for specific Kuwait landmarks, islands and heritage questions.
 * Credits and licenses: question-photos-kuwait-sources.md. */
(function () {
  'use strict';
  var data = window.SEEN_JEEM_DATA;
  if (!data || !data.mediaRegistry || !Array.isArray(data.questions)) return;
  var photos = {
    kw_landmarks_q01: ['towers', 'أبراج الكويت'],
    kw_landmarks_q02: ['liberation', 'برج التحرير في أفق مدينة الكويت'],
    kw_landmarks_q03: ['mubarakiya', 'سوق المباركية'],
    kw_landmarks_q04: ['hamra', 'برج الحمراء في مدينة الكويت'],
    kw_landmarks_q05: ['seif', 'قصر السيف في الكويت'],
    kw_landmarks_q06: ['shaheed', 'ممر في حديقة الشهيد'],
    kw_landmarks_q07: ['failaka_sat', 'صورة فضائية لجزيرة كويتية'],
    kw_landmarks_q08: ['bubiyan_iss', 'صورة فضائية لجزيرة كويتية'],
    kw_landmarks_q10: ['grand_mosque', 'المسجد الكبير في الكويت'],
    kw_landmarks_q13: ['causeway', 'جسر الشيخ جابر الأحمد'],
    kw_landmarks_q17: ['liberation', 'برج التحرير في أفق مدينة الكويت'],
    kw_landmarks_q18: ['qaruh', 'جزيرة قاروه'],
    kw_landmarks_q24: ['grand_mosque', 'المسجد الكبير في الكويت'],
    kw_landmarks_q26: ['sadu', 'بيت السدو في الكويت'],
    kw_landmarks_q30: ['seif', 'قصر السيف في الكويت'],
    kw_landmarks_q32: ['national_museum', 'متحف الكويت الوطني'],
    kw_landmarks_q33: ['hamra', 'برج الحمراء في مدينة الكويت'],
    kw_landmarks_q34: ['causeway', 'جسر الشيخ جابر الأحمد'],
    kw_landmarks_q35: ['qurain', 'متحف شهداء القرين'],
    kw_landmarks_q36: ['grand_mosque', 'المسجد الكبير في الكويت'],
    kw_landmarks_q37: ['qaruh', 'جزيرة قاروه'],
    kw_islands_q02: ['bubiyan_iss', 'صورة فضائية لجزيرة كويتية'],
    kw_islands_q03: ['failaka_sat', 'صورة فضائية لجزيرة كويتية'],
    kw_islands_q04: ['qaruh', 'جزيرة قاروه'],
    kw_islands_q05: ['failaka_sat', 'صورة فضائية لجزيرة كويتية'],
    kw_islands_q14: ['qaruh', 'جزيرة قاروه'],
    kw_islands_q15: ['bubiyan_iss', 'صورة فضائية لجزيرة كويتية والمياه المحيطة'],
    kw_islands_q17: ['failaka_sat', 'صورة فضائية لجزيرة كويتية'],
    kw_islands_q18: ['failaka_sat', 'صورة فضائية لجزيرة كويتية'],
    kw_islands_q26: ['failaka_sat', 'صورة فضائية لجزيرة كويتية'],
    kw_islands_q28: ['failaka_sat', 'صورة فضائية لجزيرة كويتية'],
    kw_islands_q30: ['failaka_sat', 'صورة فضائية لجزيرة كويتية'],
    kw_islands_q33: ['failaka_sat', 'صورة فضائية لجزيرة كويتية'],
    kw_islands_q35: ['failaka_sat', 'صورة فضائية لجزيرة كويتية'],
    kw_museums_heritage_q01: ['national_museum', 'متحف الكويت الوطني'],
    kw_museums_heritage_q04: ['sadu', 'بيت السدو في الكويت'],
    kw_museums_heritage_q09: ['shaheed', 'ممر في حديقة الشهيد'],
    kw_museums_heritage_q17: ['national_museum', 'متحف الكويت الوطني'],
    kw_museums_heritage_q21: ['qurain', 'متحف شهداء القرين'],
    kw_old_markets_q01: ['mubarakiya', 'سوق المباركية'],
    kw_old_markets_q32: ['mubarakiya', 'سقف سوق المباركية التراثي']
  };
  data.questions.forEach(function (question) {
    var photo = photos[question.id];
    if (!photo) return;
    var id = 'asset:kuwait_question_' + question.id;
    var uri = photo[0] === 'towers' ? 'assets/images/categories/kw_landmarks.webp' : 'assets/images/questions/kuwait/' + photo[0] + '.webp';
    data.mediaRegistry[id] = { id: id, kind: 'question_media', mime: 'image/webp', dataUri: uri };
    question.assetId = question.image = question.imageDataUri = id;
    question.imageAlt = 'صورة مرتبطة بموضوع السؤال';
  });
})();
