// Correct legacy photo links only when the original, known-wrong link remains.
// Questions that rely on an image keep their original link until a suitable replacement exists.
(function () {
  'use strict';
  var data = window.SEEN_JEEM_DATA;
  if (!data || !Array.isArray(data.questions)) return;
  data.mediaRegistry['asset:memory_mint_tea'] = { id: 'asset:memory_mint_tea', kind: 'question_media', mime: 'image/svg+xml', dataUri: 'assets/images/questions/mint-tea-memory.svg', alt: 'مشهد شاي بالنعناع' };
  var corrections = {
    kw_culture_q01: ['asset:photo_gulf_sadu_weave', ''],
    kw_culture_q07: ['asset:photo_nos_school_desk', ''],
    kw_culture_q11: ['asset:photo_art_mirwas_tar', ''],
    islamic_civ_q01: ['asset:photo_gulf_mia_doha', ''],
    other_sports_q04: ['asset:photo_sp_billiards', ''],
    other_sports_q07: ['asset:photo_sp_bowling', ''],
    other_sports_q10: ['asset:photo_sp_archery', ''],
    inventions_q01: ['asset:photo_inv_steam_locomotive', ''],
    inventions_q04: ['asset:photo_veh_biplane', ''],
    food_cultures_q01: ['asset:photo_fd_saffron', 'asset:photo_fd_sushi', 'طبق من المأكولات البحرية والأرز'],
    food_cultures_q05: ['asset:photo_fd_sushi', ''],
    kw_old_words_q01: ['asset:asset_q_kw_liwan', ''],
    kw_old_words_q04: ['asset:photo_gulf_hibb_water', ''],
    kw_old_words_q07: ['asset:photo_nos_payphone', ''],
    kw_figures_q01: ['asset:asset_q_kw_astronomy', ''],
    kw_cuisine_q01: ['asset:photo_kw_machboos', ''],
    kw_museums_heritage_q01: ['asset:photo_kw_red_palace', ''],
    kw_old_markets_q09: ['asset:photo_inv_gramophone', ''],
    andalus_history_q01: ['asset:photo_mon_alhambra', ''],
    ahl_albarr_q04: ['asset:photo_an_arabian_oryx', 'asset:photo_hb_falcon_burqa', 'أدوات الصقّار'],
    ahl_albarr_q09: ['asset:photo_veh_desert_suv', ''],
    ramadan_sufra_q01: ['asset:photo_food_luqaimat', ''],
    kw_restaurants_q01: ['asset:photo_nos_khubz_irani', ''],
    baqala_supermarket_q01: ['asset:photo_nos_vimto_bottle', ''],
    rakkiz_shway_q09: ['asset:photo_food_ramadan_sherbet', 'asset:memory_mint_tea', 'مشهد شاي بالنعناع'],
    macro_object_closeup_q01: ['asset:photo_mac_peacock_feather', 'asset:photo_fd_saffron', 'خيوط حمراء دقيقة عن قرب'],
    macro_object_closeup_q07: ['asset:photo_mac_sunflower', 'asset:photo_mac_butterfly_scales', 'تفاصيل متراكبة مكبرة'],
    macro_object_closeup_q21: ['asset:photo_mac_matchstick', 'asset:photo_mac_butterfly_scales', 'تفاصيل متراكبة مكبرة']
  };
  data.questions.forEach(function (q) {
    var fix = corrections[q.id];
    if (!fix || q.assetId !== fix[0]) return;
    q.assetId = fix[1];
    q.image = fix[1];
    q.imageDataUri = fix[1];
    q.imageAlt = fix[2] || '';
    q.imageRevealCaption = fix[1] ? (q.answer || '') : '';
  });
})();
