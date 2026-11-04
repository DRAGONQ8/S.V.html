const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const removed = new Set([
  'arabic_grammar', 'world_languages', 'cars_brands', 'devices_tools',
  'complete_poem_verse', 'vintage_tools', 'kw_old_ads_tv',
  'who_scored_the_goal', 'pro_wrestling', 'uae_knowledge',
  'saudi_arabia_knowledge', 'qatar_oman_bahrain', 'saudi_pro_league',
  'gcc_countries'
]);

const newlyRemoved = new Set([
  'national_teams', 'world_currencies', 'world_literature', 'arabic_word_meanings',
  'arabic_libraries_books', 'player_hairstyle', 'where_is_the_ball', 'laib_nadi_mudarrib',
  'sequence_order', 'jamad_nabat_insan', 'word_reveal_grid', 'tv_guess_from_scene',
  'tv_place_and_series', 'tv_comedy_series', 'kw_national_songs_operettas',
  'arabic_calligraphy_proverbs', 'gulf_folk_arts', 'arabic_synonyms_antonyms',
  'arab_novelists_modern_poets', 'mov_lord_of_the_rings', 'mov_fast_furious'
]);

const latestRemoved = new Set([
  'what_is_invention', 'fannan_musalsal_masrahiya', 'name_the_league',
  'game_screenshots_hud', 'game_character_outfit', 'anime_silhouettes',
  'young_celebrities', 'foreign_artist_career', 'apps_digital_icons', 'artists_challenge',
  'tv_better_call_saul', 'tv_stranger_things', 'tv_the_office', 'tv_big_bang_theory',
  'gta_open_world_games', 'marine_life_energy_env', 'ww1_ww2_history',
  'gulf_heritage_sports', 'cinema_oscars_arabic_films', 'tv_jilbab_abi',
  'tv_chernobyl', 'tv_alkabeer_awi', 'tv_alikhtiyar', 'tv_gaafar_elomda',
  'tv_layali_alhelmeya', 'tv_raafat_elhaggan', 'tv_valley_of_wolves',
  'tv_turkish_dubbed_drama', 'tv_narcos', 'tv_wednesday', 'tv_suits', 'tv_greys_anatomy'
]);

const currentRemoved = new Set(['arabic_rhetoric', 'arab_scientists_inventors', 'world_geography', 'seas_oceans', 'player_kits', 'retro_gaming', 'ani_studio_ghibli', 'ani_sailor_inuyasha_ranma', 'ani_frieren_apothecary_modern', 'tech_ai', 'tv_altaghreba', 'tv_rick_and_morty', 'tv_black_mirror', 'tv_ozark', 'tv_arcane_elite', 'tv_sopranos_wire', 'tv_crown_downton', 'tv_yellowstone_westworld', 'tv_true_detective_fargo', 'mov_jurassic_park', 'mov_minions_despicable_me', 'mov_bollywood', 'mov_saudi_gulf_oscar', 'mov_john_wick_matrix', 'mov_inception_scifi_modern', 'mov_action_crime_legends', 'mov_horror_thriller_icons', 'mov_classic_arabic_cinema']);

function loadData() {
  const context = { window: {} };
  const run = file => vm.runInNewContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file });
  run('data/catalog.js');
  for (const dir of ['questions', 'registry']) {
    for (const file of fs.readdirSync(path.join(root, 'data', dir)).filter(f => f.endsWith('.js')).sort()) {
      run(`data/${dir}/${file}`);
    }
  }
  return context.window.SEEN_JEEM_DATA;
}

test('requested categories, their questions and exclusive metadata are removed', () => {
  const data = loadData();
  for (const id of [...removed, ...newlyRemoved, ...latestRemoved, ...currentRemoved]) {
    assert.ok(!data.categories.some(cat => cat.id === id), `category remains: ${id}`);
    assert.ok(!data.questions.some(q => q.categoryId === id), `questions remain: ${id}`);
    assert.ok(!data.groups.some(group => group.categoryIds.includes(id)), `group reference remains: ${id}`);
    assert.ok(!Object.values(data.mediaRegistry).some(asset => asset.category === id), `media metadata remains: ${id}`);
    assert.ok(!fs.existsSync(path.join(root, 'assets/images/categories', `${id}.webp`)), `photo remains: ${id}`);
  }
});

test('remaining categories, questions and media stay linked, including shared assets', () => {
  const data = loadData();
  const categories = new Set(data.categories.map(cat => cat.id));
  assert.equal(categories.size, data.categories.length, 'duplicate category id');
  for (const id of ['kw_history', 'kw_culture', 'kw_sports_clubs', 'kw_landmarks', 'kw_old_markets', 'arabic_poetry', 'waddih_shway', 'spot_the_difference', 'macro_object_closeup']) {
    assert.ok(categories.has(id), `unrelated category missing: ${id}`);
  }
  for (const group of data.groups) {
    for (const id of group.categoryIds) assert.ok(categories.has(id), `unknown category ${id} in ${group.id}`);
  }
  for (const cat of data.categories) {
    assert.ok(data.mediaRegistry[cat.coverAssetId], `missing cover for ${cat.id}`);
    assert.ok(data.mediaRegistry[cat.thumbAssetId], `missing thumbnail for ${cat.id}`);
    const questions = data.questions.filter(q => q.categoryId === cat.id);
    for (const points of [200, 400, 600]) {
      assert.ok(questions.filter(q => q.points === points).length >= 2, `insufficient ${points}-point questions for ${cat.id}`);
    }
  }
  const questionIds = new Set();
  for (const q of data.questions) {
    assert.ok(categories.has(q.categoryId), `unknown category on ${q.id}`);
    assert.ok(!questionIds.has(q.id), `duplicate question ${q.id}`);
    questionIds.add(q.id);
    if (q.assetId) assert.ok(data.mediaRegistry[q.assetId], `missing asset ${q.assetId} for ${q.id}`);
  }
  for (const id of ['asset:photo_tool_polaroid', 'asset:photo_inv_gramophone']) {
    assert.ok(data.mediaRegistry[id], `shared asset removed: ${id}`);
    assert.ok(data.questions.some(q => q.assetId === id), `shared asset is no longer linked: ${id}`);
  }
  assert.equal(data.stats.totalCategories, data.categories.length);
  assert.equal(data.stats.totalQuestions, data.questions.length);
  assert.equal(data.stats.totalMediaAssets, Object.keys(data.mediaRegistry).length);
});
