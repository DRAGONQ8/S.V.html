/* Question-specific, locally hosted photographs. See question-photos-geography-sources.md. */
(function () {
  'use strict';
  var data = window.SEEN_JEEM_DATA;
  if (!data || !data.mediaRegistry || !Array.isArray(data.questions)) return;
  var registry = data.mediaRegistry;
  var photos = {
    famous_landmarks_q01: 'eiffel', who_is_landmark_q02: 'eiffel',
    famous_landmarks_q02: 'taj', famous_landmarks_q18: 'taj', who_is_landmark_q05: 'taj',
    famous_landmarks_q04: 'pisa', who_is_landmark_q07: 'pisa',
    famous_landmarks_q09: 'petra', who_is_landmark_q03: 'petra',
    famous_landmarks_q10: 'sydney', famous_landmarks_q28: 'sydney', who_is_landmark_q11: 'sydney',
    famous_landmarks_q11: 'golden_gate', who_is_landmark_q13: 'golden_gate',
    famous_landmarks_q13: 'acropolis', who_is_landmark_q22: 'acropolis',
    famous_landmarks_q15: 'machu_picchu', who_is_landmark_q16: 'machu_picchu',
    famous_landmarks_q16: 'christ_redeemer', who_is_landmark_q18: 'christ_redeemer',
    famous_landmarks_q17: 'chichen_itza', who_is_landmark_q20: 'chichen_itza',
    kw_landmarks_q15: 'kuwait_towers',
    kw_landmarks_q16: 'kuwait_towers', kw_landmarks_q28: 'kuwait_towers',
    kw_landmarks_q29: 'kuwait_towers', who_is_landmark_q01: 'kuwait_towers'
  };
  var towers = registry['asset:photo_gulf_kw_towers'];
  data.questions.forEach(function (question) {
    var photo = photos[question.id];
    if (!photo) return;
    var uri = photo === 'kuwait_towers' ? (towers && towers.dataUri) :
      'assets/images/questions/geography/' + photo + '.webp';
    if (!uri) return;
    var id = 'asset:geo_question_' + question.id;
    registry[id] = { id: id, kind: 'question_media', mime: 'image/webp', dataUri: uri };
    question.assetId = id;
    question.image = id;
    question.imageDataUri = id;
    question.imageAlt = 'صورة توضيحية للمعلم المذكور في السؤال';
  });
})();
