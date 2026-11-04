/* Local photographs from Wikimedia Commons. Credits: assets/images/questions/arab-capitals/ATTRIBUTION.md. */
(function () {
  'use strict';
  var data = window.SEEN_JEEM_DATA;
  if (!data || !Array.isArray(data.questions) || !data.mediaRegistry) return;
  // The first questions ask players to name the capital. Keep the alt text
  // neutral so that assistive technology does not disclose the answer.
  var photos = {
    arab_capitals_q01: 'cairo', arab_capitals_q02: 'amman', arab_capitals_q03: 'beirut',
    arab_capitals_q04: 'baghdad', arab_capitals_q05: 'rabat',
    arab_capitals_q06: 'tunis', arab_capitals_q07: 'algiers',
    arab_capitals_q08: 'khartoum', arab_capitals_q09: 'damascus',
    arab_capitals_q10: 'sanaa', arab_capitals_q11: 'tripoli',
    arab_capitals_q12: 'jerusalem', arab_capitals_q13: 'muscat',
    arab_capitals_q14: 'manama', arab_capitals_q16: 'mogadishu',
    arab_capitals_q17: 'djibouti', arab_capitals_q18: 'moroni',
    arab_capitals_q19: 'damascus', arab_capitals_q20: 'cairo',
    arab_capitals_q21: 'amman', arab_capitals_q22: 'tunis',
    arab_capitals_q23: 'rabat', arab_capitals_q24: 'sanaa',
    arab_capitals_q25: 'rabat', arab_capitals_q26: 'cairo',
    arab_capitals_q27: 'khartoum', arab_capitals_q28: 'baghdad',
    arab_capitals_q29: 'moroni', arab_capitals_q33: 'tripoli',
    arab_capitals_q34: 'tripoli', arab_capitals_q35: 'rabat',
    arab_capitals_q36: 'algiers', arab_capitals_q37: 'damascus',
    arab_capitals_q38: 'muscat', arab_capitals_q39: 'khartoum',
    arab_capitals_q40: 'tunis'
  };
  data.questions.forEach(function (question) {
    var photo = photos[question.id];
    if (!photo) return;
    var id = 'asset:question_photo_arab_capitals_' + question.id;
    var alt = 'صورة من المدينة المرتبطة بالسؤال';
    data.mediaRegistry[id] = {
      id: id, kind: 'question_media', category: question.categoryId,
      mime: 'image/webp', dataUri: 'assets/images/questions/arab-capitals/' + photo + '.webp', alt: alt
    };
    question.assetId = id;
    question.image = id;
    question.imageDataUri = id;
    question.imageAlt = alt;
  });
})();
