// Question-specific photographs; source and license details are in batch-nature/ATTRIBUTION.md.
(function () {
  'use strict';
  var data = window.SEEN_JEEM_DATA;
  if (!data || !data.mediaRegistry || !Array.isArray(data.questions)) return;
  var photos = {
    ahl_albarr_q05: ['desert-shrub', 'أزهار صفراء على شجيرة صحراوية'],
    kw_islands_q22: ['crab-plover', 'طائر ساحلي على الشاطئ'],
    ahl_albarr_q24: ['desert-truffle', 'فطر صحراوي على الأرض'],
    kw_cuisine_q32: ['desert-truffle', 'فطر صحراوي على الأرض'],
    video_games_q37: ['cordyceps', 'فطر ينمو على حشرة'],
    playstation_world_q21: ['cordyceps', 'فطر ينمو على حشرة'],
    kw_areas_names_q02: ['date-palm', 'نخلة تحمل عناقيد ثمار'],
    food_cultures_q20: ['coffee-plant', 'شجرة بأزهار بيضاء وأوراق خضراء'],
    hala_wa_gahwa_q23: ['coffee-plant', 'شجرة بأزهار بيضاء وأوراق خضراء'],
    gulf_cities_q27: ['bahrain-tree', 'شجرة منفردة في أرض صحراوية'],
    brd_coffee_cafes_q25: ['palm-civet', 'حيوان بري على غصن شجرة']
  };
  data.questions.forEach(function (question) {
    var photo = photos[question.id];
    if (!photo) return;
    // The q_vis assets in these selected questions are generic decorative panels.
    // Never replace an existing photograph or functional game media.
    if (question.assetId && !/^asset:q_vis_/.test(question.assetId)) return;
    var id = 'asset:batch_nature_' + question.id;
    data.mediaRegistry[id] = {
      id: id,
      kind: 'question_media',
      category: question.categoryId,
      mime: 'image/webp',
      dataUri: 'assets/images/questions/batch-nature/' + photo[0] + '.webp',
      alt: photo[1]
    };
    question.assetId = id;
    question.image = id;
    question.imageDataUri = id;
    question.imageAlt = photo[1];
  });
})();
