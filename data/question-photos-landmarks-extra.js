/* Locally hosted landmark photographs. See question-photos-landmarks-extra-sources.md. */
(function () {
  'use strict';
  var data = window.SEEN_JEEM_DATA;
  if (!data || !data.mediaRegistry || !Array.isArray(data.questions)) return;
  var photos = {
    famous_landmarks_q03: 'giza.webp',
    famous_landmarks_q05: 'greatwall.webp',
    who_is_landmark_q10: 'greatwall.webp',
    famous_landmarks_q06: 'liberty.webp',
    famous_landmarks_q29: 'liberty.webp',
    who_is_landmark_q08: 'liberty.webp',
    famous_landmarks_q07: 'colosseum.webp',
    who_is_landmark_q04: 'colosseum.webp',
    famous_landmarks_q08: 'bigben.webp',
    who_is_landmark_q06: 'bigben.webp',
    famous_landmarks_q12: 'kremlin.webp',
    famous_landmarks_q14: 'greatpyramid.webp',
    famous_landmarks_q19: 'stonehenge.webp',
    who_is_landmark_q23: 'stonehenge.webp',
    famous_landmarks_q20: 'moai.webp',
    who_is_landmark_q24: 'moai.webp',
    famous_landmarks_q21: 'louvre.webp',
    famous_landmarks_q30: 'louvre.webp',
    famous_landmarks_q22: 'angkor.webp',
    who_is_landmark_q21: 'angkor.webp',
    famous_landmarks_q23: 'versailles.webp',
    famous_landmarks_q24: 'brandenburg.webp',
    famous_landmarks_q25: 'forbidden.webp',
    famous_landmarks_q26: 'towerbridge.webp',
    who_is_landmark_q19: 'towerbridge.webp',
    famous_landmarks_q27: 'alhambra.webp',
    who_is_landmark_q15: 'alhambra.webp',
    famous_landmarks_q33: 'pantheon.webp',
    famous_landmarks_q34: 'potala.webp',
    famous_landmarks_q35: 'sagrada.webp',
    who_is_landmark_q26: 'sagrada.webp',
    famous_landmarks_q36: 'borobudur.webp',
    famous_landmarks_q37: 'pontdugard.webp',
    who_is_landmark_q32: 'pontdugard.webp',
    famous_landmarks_q38: 'rushmore.webp',
    famous_landmarks_q39: 'registan.webp',
    famous_landmarks_q40: 'empirestate.webp',
    who_is_landmark_q09: 'burjkhalifa.webp',
    who_is_landmark_q12: 'sphinx.webp',
    who_is_landmark_q17: 'hagiasophia.webp',
    who_is_landmark_q29: 'cairocitadel.webp',
    who_is_landmark_q31: 'atomium.webp',
    who_is_landmark_q33: 'neuschwanstein.webp',
    who_is_landmark_q34: 'kinderdijk.webp',
    who_is_landmark_q27: 'abusimbel.webp',
    who_is_landmark_q39: 'hegra.webp',
    who_is_landmark_q38: 'museumfuture.webp',
  };
  data.questions.forEach(function (question) {
    var photo = photos[question.id];
    if (!photo) return;
    var id = 'asset:landmark_extra_' + question.id;
    data.mediaRegistry[id] = { id: id, kind: 'question_media', mime: 'image/webp', dataUri: 'assets/images/questions/landmarks-extra/' + photo };
    question.assetId = id;
    question.image = id;
    question.imageDataUri = id;
    question.imageAlt = 'صورة توضيحية للمعلم المذكور في السؤال';
  });
})();
