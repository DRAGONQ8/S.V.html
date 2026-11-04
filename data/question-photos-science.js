// Question photos are local and loaded on demand. See QUESTION-PHOTOS-SCIENCE.md for credits.
(function () {
  'use strict';
  var data = window.SEEN_JEEM_DATA;
  if (!data || !data.mediaRegistry || !data.questions) return;
  // The objects shown are already named in each question; the pictures do not name the answer.
  var photos = {
    'inventions_q03': ['flight', 'الرحلة الأولى للطائرة ذات المحرك'],
    'inventions_q07': ['steam', 'محرك بخاري تاريخي'],
    'inventions_q13': ['braille', 'قراءة الكتابة البارزة باللمس'],
    'inventions_q15': ['motorwagen', 'رسم سيارة مبكرة بمحرك احتراق'],
    'inventions_q16': ['vaccine', 'لقاح الجدري وأداة التطعيم'],
    'inventions_q17': ['tv', 'أسرة تشاهد التلفاز قديماً'],
    'inventions_q19': ['dna', 'نموذج للولب المزدوج للحمض النووي'],
    'inventions_q33': ['mouse', 'فأرة حاسوب حديثة'],
    'inventions_q40': ['battery', 'بطارية أيون الليثيوم لحاسوب محمول'],
    'medical_discoveries_health_q08': ['vaccine', 'لقاح الجدري وأداة التطعيم'],
    'medical_discoveries_health_q22': ['vaccine', 'لقاح الجدري وأداة التطعيم']
  };
  data.questions.forEach(function (question) {
    var photo = photos[question.id];
    if (!photo) return;
    var assetId = 'asset:photo_science_' + question.id;
    data.mediaRegistry[assetId] = {
      id: assetId,
      kind: 'question_media',
      category: question.categoryId,
      mime: 'image/webp',
      dataUri: 'assets/images/questions/science/' + photo[0] + '.webp',
      alt: photo[1]
    };
    question.assetId = assetId;
    question.image = assetId;
    question.imageDataUri = assetId;
    question.imageAlt = photo[1];
  });
})();
