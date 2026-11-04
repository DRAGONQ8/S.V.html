// Local historical photographs with sources in batch-history/ATTRIBUTION.md.
(function () {
  'use strict';
  var data = window.SEEN_JEEM_DATA;
  if (!data || !data.mediaRegistry || !Array.isArray(data.questions)) return;
  var photos = {
    abbasid_history_q07: ['assets/images/questions/history/samarra.webp', 'المئذنة الملوية في مدينة سامراء كما تبدو اليوم'],
    abbasid_history_q36: ['assets/images/questions/batch-history/mustansiriya.webp', 'صحن مدرسة عباسية تاريخية في بغداد'],
    abbasid_history_q24: ['assets/images/questions/batch-history/ibn-tulun.webp', 'صحن جامع ابن طولون في القاهرة'],
    islamic_history_q19: ['assets/images/questions/batch-history/dome-rock.webp', 'قبة الصخرة في القدس'],
    islamic_history_q20: ['assets/images/questions/batch-history/kairouan.webp', 'الجامع الكبير في القيروان كما يبدو اليوم'],
    umayyad_era_q04: ['assets/images/questions/batch-history/kairouan.webp', 'الجامع الكبير في القيروان كما يبدو اليوم'],
    andalus_history_q33: ['assets/images/questions/batch-history/alhambra.webp', 'منظر لقصر الحمراء بمدينة غرناطة'],
    andalus_history_q28: ['assets/images/questions/batch-history/cordoba.webp', 'أقواس مسجد قرطبة التاريخي'],
    kw_history_q31: ['assets/images/questions/kuwait-heritage/oil-export.webp', 'بدء تصدير أول شحنة نفط من الكويت'],
    ancient_civs_q22: ['assets/images/questions/batch-history/kadesh.webp', 'نحت مصري قديم للملك رمسيس الثاني في أبو سمبل'],
    world_history_q02: ['assets/images/questions/batch-history/normandy.webp', 'جنود ينزلون إلى شاطئ نورماندي خلال الحرب العالمية الثانية'],
    world_history_q24: ['assets/images/questions/batch-history/october.webp', 'مجموعة من الحرس الثوري داخل قصر الشتاء في بتروغراد'],
    world_history_q33: ['assets/images/questions/batch-history/normandy.webp', 'جنود ينزلون إلى شاطئ نورماندي'],
    world_history_q01: ['assets/images/questions/batch-history/verdun.webp', 'جنود فرنسيون قرب فردان أثناء الحرب العالمية الأولى'],
    world_history_q09: ['assets/images/questions/batch-history/berlin-wall.webp', 'تجمع الناس عند جدار برلين وبوابة براندنبورغ'],
    world_history_q22: ['assets/images/questions/batch-history/versailles.webp', 'قاعة تاريخية مزينة بالمرايا والثريات']
  };
  data.questions.forEach(function (question) {
    var photo = photos[question.id];
    if (!photo || (window.SeenJeemMedia && window.SeenJeemMedia.shouldDisplayQuestionImage(question))) return;
    var id = 'asset:batch_history_' + question.id;
    data.mediaRegistry[id] = { id: id, kind: 'question_media', mime: 'image/webp', dataUri: photo[0], alt: photo[1] };
    question.assetId = question.imageDataUri = question.image = id;
    question.imageAlt = photo[1];
    question.imageRevealCaption = '';
  });
})();
