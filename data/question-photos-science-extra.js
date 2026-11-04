// Real photographs of the objects named in the question; see science-extra/ATTRIBUTION.md.
(function () {
  'use strict';
  var data = window.SEEN_JEEM_DATA;
  if (!data || !data.mediaRegistry || !data.questions) return;
  var photos = {
    inventions_q01: ['bulb', 'مصباح كهربائي متوهج'],
    inventions_q02: ['telephone', 'هاتف أرضي ذو قرص'],
    inventions_q05: ['printing', 'آلة طباعة يدوية تاريخية'],
    inventions_q06: ['dynamite', 'إدخال الديناميت في حفرة'],
    inventions_q11: ['telegraph', 'جهاز تلغراف كهربائي تاريخي'],
    inventions_q14: ['telescope', 'تلسكوب فلكي داخل مرصد'],
    inventions_q18: ['radio', 'أبراج بث إذاعي'],
    inventions_q20: ['transistor', 'ترانزستورات بأشكال مختلفة'],
    inventions_q23: ['balloon', 'منطاد هواء ساخن'],
    inventions_q27: ['polio', 'إعطاء لقاح شلل الأطفال'],
    inventions_q28: ['paper', 'صناعة الورق يدوياً'],
    inventions_q29: ['chip', 'صورة مكبرة لشريحة إلكترونية'],
    inventions_q30: ['laser', 'أشعة ليزر في مرصد فلكي'],
    inventions_q35: ['stethoscope', 'سماعة طبية'],
    inventions_q37: ['microwave', 'فرن ميكروويف'],
    inventions_q38: ['aircon', 'مكيف هواء'],
    medical_discoveries_health_q16: ['blood', 'كيس لنقل كريات الدم الحمراء'],
    medical_discoveries_health_q26: ['blood', 'كيس لنقل كريات الدم الحمراء']
  };
  data.questions.forEach(function (question) {
    var photo = photos[question.id];
    if (!photo) return;
    var assetId = 'asset:photo_science_extra_' + question.id;
    data.mediaRegistry[assetId] = {
      id: assetId,
      kind: 'question_media',
      category: question.categoryId,
      mime: 'image/webp',
      dataUri: 'assets/images/questions/science-extra/' + photo[0] + '.webp',
      alt: photo[1]
    };
    question.assetId = assetId;
    question.image = assetId;
    question.imageDataUri = assetId;
    question.imageAlt = photo[1];
  });
})();
