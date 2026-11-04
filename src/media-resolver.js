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
    'assets/images/questions/food/': ['ayran', 'baklava', 'basbousa', 'black-lime', 'cardamom', 'cocoa-bean', 'coffee-bean', 'couscous', 'croissant', 'dallah-coffee-pot', 'falafel', 'flatbread', 'guacamole', 'halva', 'harira', 'kanafeh', 'kibbeh', 'kimchi', 'koshary', 'luqaimat', 'macaron', 'mandi-food', 'masgouf', 'musakhan', 'paella', 'pizza-margherita', 'saffron', 'samosa', 'sushi', 'tabbouleh', 'tajine', 'tharid', 'tiramisu', 'truffle', 'umm-ali', 'vanilla'],
    'assets/images/questions/ancient-civs/': ['02', '03', '04', '05', '07', '08', '09', '10', '14', '15', '17', '18', '21', '23', '24', '27', '30', '37', '38', '39'],
    'assets/images/questions/desert/': ['camel'],
    'assets/images/questions/sports-extra/': ['badminton', 'basketball', 'boxing', 'chess', 'fencing', 'handball', 'squash', 'track', 'volleyball', 'waterpolo'],
    'assets/images/questions/kuwait/': ['bubiyan_iss', 'causeway', 'failaka_sat', 'grand_mosque', 'hamra', 'liberation', 'mubarakiya', 'national_museum', 'qaruh', 'qurain', 'sadu', 'seif', 'shaheed'],
    'assets/images/questions/landmarks-extra/': ['abusimbel', 'alhambra', 'angkor', 'atomium', 'bigben', 'borobudur', 'brandenburg', 'burjkhalifa', 'cairocitadel', 'colosseum', 'empirestate', 'forbidden', 'giza', 'greatpyramid', 'greatwall', 'hagiasophia', 'hegra', 'kinderdijk', 'kremlin', 'liberty', 'louvre', 'moai', 'museumfuture', 'neuschwanstein', 'pantheon', 'pontdugard', 'potala', 'registan', 'rushmore', 'sagrada', 'sphinx', 'stonehenge', 'towerbridge', 'versailles'],
    'assets/images/questions/science-extra/': ['aircon', 'balloon', 'blood', 'bulb', 'chip', 'dynamite', 'laser', 'microwave', 'paper', 'polio', 'printing', 'radio', 'stethoscope', 'telegraph', 'telephone', 'telescope', 'transistor'],
    'assets/images/questions/arab-capitals/': ['algiers', 'amman', 'baghdad', 'beirut', 'cairo', 'damascus', 'djibouti', 'jerusalem', 'khartoum', 'manama', 'mogadishu', 'moroni', 'muscat', 'rabat', 'sanaa', 'tripoli', 'tunis'],
    'assets/images/questions/gulf-cities/': ['abha', 'jais', 'jeddah', 'kingdom', 'kuwaittowers', 'salalah'],
    'assets/images/questions/kuwait-heritage/': ['harbour', 'heritage-dhow', 'mubarakiya', 'oil-export'],
    'assets/images/questions/general-knowledge/': ['rainbow'],
    'assets/images/questions/medical-history/': ['barnard', 'fleming', 'hpylori', 'koch', 'pasteur'],
    'assets/images/questions/visual-priority/': ['petronas', 'lotus2', 'aleppo', 'pineapple', 'watch-spring', 'red-fort', 'maria-theresa-thaler'],
    'assets/images/questions/batch-food/': ['balaleet', 'breadcrust', 'cappuccino', 'chili', 'dates', 'deserttruffle', 'grouper', 'halawet', 'harees', 'machboos', 'maillard', 'mansaf', 'parmesan', 'pudding', 'tea', 'v60'],
    'assets/images/questions/batch-history/': ['alhambra', 'berlin-wall', 'cordoba', 'dome-rock', 'ibn-tulun', 'kadesh', 'kairouan', 'mustansiriya', 'normandy', 'october', 'verdun', 'versailles'],
    'assets/images/questions/batch-landmarks/': ['bahla-fort', 'burj-al-arab', 'heydar-aliyev-center', 'louvre-abu-dhabi', 'nizwa', 'qatar-national-museum', 'sheikh-zayed-mosque', 'souq-waqif'],
    'assets/images/questions/batch-nature/': ['bahrain-tree', 'coffee-plant', 'cordyceps', 'crab-plover', 'date-palm', 'desert-shrub', 'desert-truffle', 'palm-civet'],
    'assets/images/questions/batch-science/': ['antarctica', 'bab-el-mandeb', 'bering', 'gibraltar', 'hurricane', 'sinai'],
    'assets/images/questions/stadiums/': ['01', '02', '03', '04', '05', '06', '07', '08', '11', '12', '13', '14', '15', '17', '19', '20', '21', '22', '23', '24', '25', '26', '28', '29', '30', '32', '33', '34', '35', '36', '37', '38', '39'],
    'assets/images/categories/': ['ahl_albarr', 'player_career_path', 'who_is_the_player', 'combat_and_team_sports', 'fifa_world_cup', 'uefa_champions_league', 'kw_landmarks', 'umayyad_era']
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
      /^assets\/images\/questions\/country-maps\/(?:kwt|ita|sau|egy|qat|bhr|chl|aus|jpn|fra|bra|ind|can|are|omn|dza|tur|jor|esp|lka|mdg|zaf|nor|nzl|som|npl|uzb|gmb|nam|afg|hrv|aze|cze|mys|pan|cod|mng|ltu|png)\.webp$/.test(uri) ||
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
