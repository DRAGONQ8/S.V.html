/* Locally hosted stadium photographs; sources and licenses are documented in ATTRIBUTION.md. */
(function () {
  'use strict';
  var data = window.SEEN_JEEM_DATA;
  if (!data || !data.mediaRegistry || !Array.isArray(data.questions)) return;
  var photos = {
    football_stadiums_q01: '01.webp',
    football_stadiums_q02: '02.webp',
    football_stadiums_q03: '03.webp',
    football_stadiums_q04: '04.webp',
    football_stadiums_q05: '05.webp',
    football_stadiums_q06: '06.webp',
    football_stadiums_q07: '07.webp',
    football_stadiums_q08: '08.webp',
    football_stadiums_q11: '11.webp',
    football_stadiums_q12: '12.webp',
    football_stadiums_q13: '13.webp',
    football_stadiums_q14: '14.webp',
    football_stadiums_q15: '15.webp',
    football_stadiums_q17: '17.webp',
    football_stadiums_q19: '19.webp',
    football_stadiums_q20: '20.webp',
    football_stadiums_q21: '21.webp',
    football_stadiums_q22: '22.webp',
    football_stadiums_q23: '23.webp',
    football_stadiums_q24: '24.webp',
    football_stadiums_q25: '25.webp',
    football_stadiums_q26: '26.webp',
    football_stadiums_q28: '28.webp',
    football_stadiums_q29: '29.webp',
    football_stadiums_q30: '30.webp',
    football_stadiums_q32: '32.webp',
    football_stadiums_q33: '33.webp',
    football_stadiums_q34: '34.webp',
    football_stadiums_q35: '35.webp',
    football_stadiums_q36: '36.webp',
    football_stadiums_q37: '37.webp',
    football_stadiums_q38: '38.webp',
    football_stadiums_q39: '39.webp',
  };
  data.questions.forEach(function (question) {
    var photo = photos[question.id];
    if (!photo || (window.SeenJeemMedia && window.SeenJeemMedia.isRealQuestionPhoto(question))) return;
    var id = 'asset:stadium_photo_' + question.id;
    data.mediaRegistry[id] = { id: id, kind: 'question_media', mime: 'image/webp', dataUri: 'assets/images/questions/stadiums/' + photo };
    question.assetId = id;
    question.image = id;
    question.imageDataUri = id;
    question.imageAlt = 'صورة فوتوغرافية لملعب كرة قدم';
  });
})();
