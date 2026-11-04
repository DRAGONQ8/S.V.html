;
(function () {
  var loadedPacks = {};
  function getPackDataUri(packId, assetId) {
    if (!loadedPacks[packId]) {
      loadedPacks[packId] = {};
      if (typeof document !== 'undefined') {
        var el = document.getElementById('sj-media-pack-' + packId);
        if (el && el.textContent) {
          try {
            loadedPacks[packId] = JSON.parse(el.textContent);
          } catch (e) {}
        }
      }
    }
    return loadedPacks[packId][assetId] || '';
  }
  // Only curated local photographs with a documented source are counted.
  // Old question packs also contain decorative SVGs and unverified studio images.
  var documentedPhotos = {
    'assets/images/questions/geography/': ['acropolis', 'chichen_itza', 'christ_redeemer', 'eiffel', 'golden_gate', 'machu_picchu', 'petra', 'pisa', 'sydney', 'taj'],
    'assets/images/questions/science/': ['battery', 'braille', 'flight', 'mouse', 'steam', 'tv', 'vaccine'],
    'assets/images/questions/details/': ['camera-lens', 'crystal-geode', 'leaf-microscope', 'match-head', 'pollen-microscope'],
    'assets/images/questions/history/': ['samarra'],
    'assets/images/categories/': ['player_career_path', 'who_is_the_player', 'combat_and_team_sports', 'fifa_world_cup', 'uefa_champions_league', 'kw_landmarks', 'umayyad_era']
  };
  function isRealQuestionPhoto(question) {
    if (!question) return false;
    var registry = window.SEEN_JEEM_DATA && window.SEEN_JEEM_DATA.mediaRegistry || {};
    var ref = question.assetId || question.imageDataUri || question.image || '';
    var entry = registry[ref];
    var uri = entry && entry.dataUri || '';
    return Object.keys(documentedPhotos).some(function (directory) {
      return documentedPhotos[directory].some(function (name) {
        return uri === directory + name + '.webp';
      });
    });
  }
  function shouldDisplayQuestionImage(question) {
    if (!question) return false;
    var ref = question.assetId || question.imageDataUri || question.image || '';
    var registry = window.SEEN_JEEM_DATA && window.SEEN_JEEM_DATA.mediaRegistry || {};
    var uri = registry[ref] && registry[ref].dataUri || '';
    return isRealQuestionPhoto(question) ||
      uri === 'assets/images/questions/details/olympic-rings.webp' ||
      uri === 'assets/images/questions/details/rubin-vase.webp' ||
      ((question.format === 'progressive_clarity' || question.format === 'memory_observation') && !!ref) ||
      /^data:image\/(?:png|jpeg|webp|gif|svg\+xml)[;,]/i.test(ref) || /^https:\/\//i.test(ref);
  }
  window.SeenJeemMedia = { isRealQuestionPhoto: isRealQuestionPhoto, shouldDisplayQuestionImage: shouldDisplayQuestionImage };
  var reg = window.SEEN_JEEM_DATA && window.SEEN_JEEM_DATA.mediaRegistry;
  if (reg) {
    Object.keys(reg).forEach(function (aid) {
      var item = reg[aid];
      var pId = item.packId || 'covers';
      Object.defineProperty(item, 'dataUri', {
        enumerable: true,
        configurable: true,
        get: function () {
          if (this._cachedUri) return this._cachedUri;
          this._cachedUri = getPackDataUri(pId, aid);
          return this._cachedUri;
        },
        set: function (val) {
          this._cachedUri = val;
        }
      });
    });
  }
})();
