



(function () {
  'use strict';

  var Engine = window.SeenJeemEngine;
  var AudioFX = window.SeenJeemAudio;
  var DATA = window.SEEN_JEEM_DATA || { groups: [], categories: [], questions: [], mediaRegistry: {}, stats: {} };

  var TEAM_COLORS = Engine.VALID_TEAM_COLORS;

  // Pre-index categories and questions once for O(1) lookups.
  var CAT_BY_ID = {};
  var QUESTIONS_BY_CAT = {};
  (DATA.categories || []).forEach(function (c) {
    CAT_BY_ID[c.id] = c;
    QUESTIONS_BY_CAT[c.id] = [];
  });
  (DATA.questions || []).forEach(function (q) {
    if (!QUESTIONS_BY_CAT[q.categoryId]) QUESTIONS_BY_CAT[q.categoryId] = [];
    QUESTIONS_BY_CAT[q.categoryId].push(q);
  });

  var SESSION_THEMES = {
    gulf_night: {
      key: 'gulf_night',
      title: '🇰🇼 سهرة خليجية وكويتية',
      subtitle: 'تراث الكويت والخليج، الأمثال، الأكلات، والقرقيعان',
      icon: '🇰🇼',
      accent: '#0284c7',
      slots: [
        ['kw_history', 'kw_landmarks', 'kw_qirqian_occasions'],
        ['kw_culture', 'gulf_attire_oud_jewelry', 'gulf_oil_economy_arch'],
        ['kw_proverbs', 'kw_old_words', 'ahl_albarr', 'kw_sea_pearling'],
        ['kw_cuisine', 'ramadan_sufra', 'hala_wa_gahwa', 'kw_restaurants', 'baqala_supermarket'],
        ['kw_gulf_drama', 'kw_theater', 'gulf_artist_clues'],
        ['gulf_cities', 'kw_brand_logos', 'bahrain_gulf_logos']
      ]
    },
    visual_night: {
      key: 'visual_night',
      title: '🖼️ سهرة بصرية مصورة',
      subtitle: 'ألغاز بصرية، معالم، أعلام، شعارات، ووضح شوي وركز شوي',
      icon: '🖼️',
      accent: '#ec4899',
      slots: [
        ['who_is_landmark', 'famous_landmarks', 'kw_landmarks'],
        ['flags_capitals', 'club_crests', 'guess_the_logo'],
        ['waddih_shway', 'rakkiz_shway', 'spot_the_difference'],
        ['game_screenshots_hud'],
        ['visual_puzzles', 'macro_object_closeup', 'world_of_watches'],
        ['player_kits', 'anime_silhouettes']
      ]
    },
    series_night: {
      key: 'series_night',
      icon: '📺',
      title: 'سهرة مسلسلات',
      desc: 'توليفة متجددة من المسلسلات الكويتية والعربية والعالمية وتحديات اللقطات',
      buildPools: function () {
        var gulf = DATA.categories.filter(function (c) { return c.tvSubgroup === 'gulf'; }).map(function (c) { return c.id; });
        var arabCross = DATA.categories.filter(function (c) { return c.tvSubgroup === 'arabic' || c.tvSubgroup === 'cross'; }).map(function (c) { return c.id; });
        var intl = DATA.categories.filter(function (c) { return c.tvSubgroup === 'international'; }).map(function (c) { return c.id; });
        return [gulf, gulf, arabCross, arabCross, intl, intl];
      }
    },
    diwaniya: {
      key: 'diwaniya',
      icon: '☕',
      title: 'ديوانية متنوعة',
      desc: 'خلطة متوازنة من الكويت والخليج، المسلسلات، كرة القدم، والمعلومات العامة',
      buildPools: function () {
        var kw = DATA.categories.filter(function (c) { return c.groupId === 'group_a'; }).map(function (c) { return c.id; });
        var tv = DATA.categories.filter(function (c) { return c.groupId === 'group_j' || c.tvSubgroup; }).map(function (c) { return c.id; });
        var sp = DATA.categories.filter(function (c) { return c.groupId === 'group_f'; }).map(function (c) { return c.id; });
        var gn = DATA.categories.filter(function (c) { return c.groupId === 'group_h' || c.groupId === 'group_d'; }).map(function (c) { return c.id; });
        var pz = DATA.categories.filter(function (c) { return c.groupId === 'group_i' || c.groupId === 'group_c'; }).map(function (c) { return c.id; });
        return [kw, kw, tv, sp, gn, pz];
      }
    },
    gulf_memories: {
      key: 'gulf_memories',
      icon: '🇰🇼',
      title: 'خليجي وذكريات',
      desc: 'تراث الكويت والخليج، دراما الزمن الجميل، وكرتون وبقالة الطيبين',
      buildPools: function () {
        var kw = DATA.categories.filter(function (c) { return c.groupId === 'group_a'; }).map(function (c) { return c.id; });
        var gulfTv = DATA.categories.filter(function (c) { return c.tvSubgroup === 'gulf' || c.id === 'tv_old_kuwaiti_series'; }).map(function (c) { return c.id; });
        var nost = ['spacetoon_classics', 'old_cartoons_babay', 'classic_anime', 'retro_gaming', 'baqala_supermarket'].filter(function (id) { return !!CAT_BY_ID[id]; });
        return [kw, kw, gulfTv, gulfTv, nost, nost];
      }
    },
    visual_challenge: {
      key: 'visual_challenge',
      icon: '📸',
      title: 'تحدي الصور',
      desc: '6 فئات بصرية وتفاعلية تعتمد على اللقطات والشعارات والمعالم ودقة الملاحظة',
      buildPools: function () {
        var vis = DATA.categories.filter(function (c) {
          var qs = QUESTIONS_BY_CAT[c.id] || [];
          return c.groupId === 'group_i' ||
            qs.filter(function (q) { return !!(q.assetId || q.imageDataUri); }).length >= 8;
        }).map(function (c) { return c.id; });
        return [vis, vis, vis, vis, vis, vis];
      }
    },
    every_sea_drop: {
      key: 'every_sea_drop',
      icon: '🌊',
      title: 'من كل بحر قطرة',
      desc: '6 فئات مختارة من 6 مجموعات معرفية مختلفة تماماً لتحدٍ شامل',
      buildPools: function () {
        var gIds = Engine.shuffleArray(DATA.groups.map(function (g) { return g.id; })).slice(0, 6);
        return gIds.map(function (gid) {
          return DATA.categories.filter(function (c) { return c.groupId === gid; }).map(function (c) { return c.id; });
        });
      }
    },
    series_and_games: {
      key: 'series_and_games',
      icon: '🎮',
      title: 'مسلسلات وألعاب',
      desc: '3 فئات من عالم المسلسلات والتلفزيون مقابل 3 فئات من الأنمي وألعاب الفيديو',
      buildPools: function () {
        var tv = DATA.categories.filter(function (c) { return c.groupId === 'group_j' || c.tvSubgroup; }).map(function (c) { return c.id; });
        var gm = DATA.categories.filter(function (c) { return c.groupId === 'group_g'; }).map(function (c) { return c.id; });
        return [tv, tv, tv, gm, gm, gm];
      }
    },
    foot_anime: {
      key: 'foot_anime',
      icon: '⚽',
      title: 'كورة وأنمي',
      desc: '3 فئات كرة قدم ورياضة متجددة مقابل 3 فئات أنمي وألعاب متجددة في كل ضغطة',
      buildPools: function () {
        var sp = DATA.categories.filter(function (c) { return c.groupId === 'group_f'; }).map(function (c) { return c.id; });
        var an = DATA.categories.filter(function (c) { return c.groupId === 'group_g'; }).map(function (c) { return c.id; });
        return [sp, sp, sp, an, an, an];
      }
    },
    cinema_and_stars: {
      key: 'cinema_and_stars',
      icon: '🎬',
      title: 'سينما ونجوم',
      desc: 'أشهر المسلسلات والأفلام والشخصيات والممثلين والأدوار الفنية',
      buildPools: function () {
        var cross = ['movies_tv', 'foreign_artist_career', 'artists_challenge', 'gulf_artist_clues', 'fannan_musalsal_masrahiya', 'tv_series_characters', 'tv_actor_and_role'].filter(function (id) { return !!CAT_BY_ID[id]; });
        var shows = DATA.categories.filter(function (c) { return c.groupId === 'group_j'; }).map(function (c) { return c.id; });
        return [cross, cross, cross, shows, shows, shows];
      }
    },
    family: {
      key: 'family',
      icon: '👨‍👩‍👧‍👦',
      title: 'تحدي العائلة',
      desc: 'تشكيلة عائلية تجمع القصص، الأكلات، الطبيعة، الاختراعات، والكوميديا',
      buildPools: function () {
        var p1 = DATA.categories.filter(function (c) { return c.groupId === 'group_b' || c.id === 'kw_cuisine' || c.id === 'ramadan_sufra' || c.id === 'hala_wa_gahwa' || c.id === 'food_cultures'; }).map(function (c) { return c.id; });
        var p2 = DATA.categories.filter(function (c) { return c.id === 'birds_world' || c.id === 'inventions' || c.id === 'what_is_invention' || c.id === 'general_knowledge'; }).map(function (c) { return c.id; });
        var p3 = DATA.categories.filter(function (c) { return c.tvSubgroup === 'gulf' || c.id === 'disney_pixar' || c.id === 'spacetoon_classics'; }).map(function (c) { return c.id; });
        return [p1, p1, p2, p2, p3, p3];
      }
    },
    kuwait: {
      key: 'kuwait',
      icon: '🌍',
      title: 'كويت والعالم',
      desc: '3 فئات من تاريخ وثقافة ومعالم الكويت مقابل 3 فئات من جغرافيا وتاريخ العالم',
      buildPools: function () {
        var kw = DATA.categories.filter(function (c) { return c.groupId === 'group_a'; }).map(function (c) { return c.id; });
        var wd = DATA.categories.filter(function (c) { return c.groupId === 'group_d'; }).map(function (c) { return c.id; });
        return [kw, kw, kw, wd, wd, wd];
      }
    },
    sports_and_knowledge: {
      key: 'sports_and_knowledge',
      icon: '🏆',
      title: 'رياضة ومعلومات',
      desc: '3 فئات رياضية وكروية مقابل 3 فئات من العلوم والتقنية والمعلومات العامة',
      buildPools: function () {
        var sp = DATA.categories.filter(function (c) { return c.groupId === 'group_f'; }).map(function (c) { return c.id; });
        var sc = DATA.categories.filter(function (c) { return c.groupId === 'group_e' || c.groupId === 'group_h'; }).map(function (c) { return c.id; });
        return [sp, sp, sp, sc, sc, sc];
      }
    },
    genius: {
      key: 'genius',
      icon: '🧠',
      title: 'تحدي العباقرة',
      desc: 'فئات عالية التحدي في اللغة والتاريخ والعلوم والألغاز المنطقية',
      buildPools: function () {
        var langHist = DATA.categories.filter(function (c) { return c.groupId === 'group_c' || c.groupId === 'group_d'; }).map(function (c) { return c.id; });
        var sciTech = DATA.categories.filter(function (c) { return c.groupId === 'group_e' || c.id === 'visual_puzzles' || c.id === 'tv_dark' || c.id === 'tv_sherlock'; }).map(function (c) { return c.id; });
        return [langHist, langHist, langHist, sciTech, sciTech, sciTech];
      }
    },
    movies_night: {
      key: 'movies_night',
      icon: '🎬',
      title: 'سهرة الأفلام والسينما',
      desc: 'تشكيلة سينمائية تجمع روائع هوليوود والسينما المصرية والخليجية والأنيميشن',
      buildPools: function () {
        var mv = DATA.categories.filter(function (c) { return c.groupId === 'group_k'; }).map(function (c) { return c.id; });
        var tv = DATA.categories.filter(function (c) { return c.groupId === 'group_j'; }).map(function (c) { return c.id; });
        return [mv, mv, mv, mv, tv, tv];
      }
    },
    brands_night: {
      key: 'brands_night',
      icon: '💎',
      title: 'الماركات والموضة والجمال',
      desc: 'تحدي العطور الخليجية والفرنسية والمكياج والأزياء الفاخرة والسيارات',
      buildPools: function () {
        var br = DATA.categories.filter(function (c) { return c.groupId === 'group_l'; }).map(function (c) { return c.id; });
        var lf = DATA.categories.filter(function (c) { return c.groupId === 'group_h' || c.groupId === 'group_a'; }).map(function (c) { return c.id; });
        return [br, br, br, br, lf, lf];
      }
    }
  };

  var ALL_SESSION_THEME_KEYS = Object.keys(SESSION_THEMES);

  var AppState = {
    currentScreen: 'home',
    draftSelection: {
      team1: [],            // explicit up to 3 category IDs owned by Team 1
      team2: [],            // explicit up to 3 category IDs owned by Team 2
      activePickerTeam: 'team1',
      history: []           // undo stack of selection snapshots
    },
    selectedCategories: [], // synchronized list (team1.concat(team2))
    categoryOwners: {},     // explicit map catId -> 'team1' | 'team2'
    lockedCategories: {},   // map catId -> true (preserved during random/session generation)
    recentSessionCats: [],  // bounded array of recently suggested/applied category IDs
    visibleSessionKeys: ['series_night', 'diwaniya', 'foot_anime', 'visual_challenge', 'every_sea_drop'],
    sessionRotationOffset: 0,
    proposedSessions: {},   // map themeKey -> { team1: [3], team2: [3] }
    favoriteCategories: {}, // map catId -> true
    questionReports: [],    // array of reported question issues
    activeGroupFilter: 'all',
    tvSubgroupFilter: 'all', // 'all' | 'gulf' | 'arabic' | 'international' | 'cross'
    filterDrawerOpen: true,
    statusFilter: 'all',    // 'all' | 'favorites' | 'selected' | 'unseen'
    sortBy: 'default',      // 'default' | 'alpha' | 'unseen_desc'
    searchQuery: '',
    activeDetailsCatId: null,
    boardCategoryTab: 'all',
    scoreAdjustUI: {
      activeTab: 'manual',
      teamId: 'team1',
      mode: 'add',
      amount: 200,
      rejudgeCellId: null
    },
    settings: Object.assign({}, Engine.DEFAULT_SETTINGS),
    playedHistory: {},
    exposedHistory: {},
    globalStats: { matchesPlayed: 0, totalQuestionsAnswered: 0 },
    activeMatch: null,
    storageWarningShown: false,
    modalStack: [],
    activeQuestionModal: {
      isOpen: false,
      cellId: null,
      timerIntervalId: null,
      callFriendIntervalId: null,
      lastAnnouncedSec: null
    }
  };

  function loadFromStorage(key, fallback) {
    try {
      var raw = window.localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  function saveToStorage(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      AppState.storageWarningShown = true;
      return false;
    }
  }

  function removeFromStorage(key) {
    try {
      window.localStorage.removeItem(key);
      return true;
    } catch (e) {
      return false;
    }
  }

  function showToast(message) {
    var container = document.getElementById('toast-container');
    if (!container) return;
    var el = document.createElement('div');
    el.className = 'toast-msg';
    el.setAttribute('role', 'status');
    el.textContent = message;
    container.appendChild(el);
    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 3600);
  }

  function resolveImg(uriOrAssetId) {
    return Engine.resolveMediaUri(uriOrAssetId, DATA.mediaRegistry);
  }

  function updateNavbarStickyOffset() {
    var nav = document.getElementById('top-navbar');
    if (!nav) return;
    var h = nav.getBoundingClientRect().height;
    if (h > 0) {
      document.documentElement.style.setProperty('--navbar-height', Math.ceil(h) + 'px');
    }
  }

  function getTopModalId() {
    if (AppState.modalStack.length === 0) return null;
    return AppState.modalStack[AppState.modalStack.length - 1].id;
  }

  function openModalLayer(modalId) {
    var backdrop = document.getElementById(modalId);
    if (!backdrop) return;

    var prevTopId = getTopModalId();
    var pausedQTimer = false;
    if (prevTopId === 'modal-question' && modalId !== 'modal-question' && AppState.activeMatch && AppState.activeQuestionModal.cellId) {
      var cell = Engine.findCell(AppState.activeMatch, AppState.activeQuestionModal.cellId);
      if (cell && cell.status === 'answering') {
        Engine.pauseCellTimer(AppState.activeMatch, cell.cellId, Date.now(), true);
        saveToStorage(Engine.STORAGE_KEYS.ACTIVE_MATCH, AppState.activeMatch);
        pausedQTimer = true;
        refreshQuestionTimerBadge();
      }
    }

    var existingIdx = AppState.modalStack.findIndex(function (m) { return m.id === modalId; });
    if (existingIdx !== -1) {
      AppState.modalStack.splice(existingIdx, 1);
    }

    AppState.modalStack.push({
      id: modalId,
      returnFocusEl: document.activeElement,
      pausedQuestionTimer: pausedQTimer
    });

    backdrop.classList.add('open');

    setTimeout(function () {
      var focusables = backdrop.querySelectorAll('button:not(:disabled), select:not(:disabled), input:not(:disabled), [tabindex="0"]');
      if (focusables.length > 0) {
        focusables[0].focus();
      }
    }, 20);
  }

  function closeModalLayer(modalId) {
    var targetId = modalId || getTopModalId();
    if (!targetId) return;

    var backdrop = document.getElementById(targetId);
    if (backdrop) {
      backdrop.classList.remove('open');
    }

    if (targetId === 'modal-question') {
      clearQuestionTimerInterval();
      if (AppState.activeMatch && AppState.activeQuestionModal.cellId) {
        var cell = Engine.findCell(AppState.activeMatch, AppState.activeQuestionModal.cellId);
        if (cell && cell.status === 'answering') {
          Engine.pauseCellTimer(AppState.activeMatch, cell.cellId, Date.now(), true);
        }
        saveToStorage(Engine.STORAGE_KEYS.ACTIVE_MATCH, AppState.activeMatch);
      }
      AppState.activeQuestionModal.isOpen = false;
      if (AppState.currentScreen === 'board') {
        renderGameBoard();
      }
    }

    var idx = AppState.modalStack.findIndex(function (m) { return m.id === targetId; });
    var popped = null;
    if (idx !== -1) {
      popped = AppState.modalStack.splice(idx, 1)[0];
    }

    if (popped && popped.pausedQuestionTimer && getTopModalId() === 'modal-question' && AppState.activeMatch && AppState.activeQuestionModal.cellId) {
      var qCell = Engine.findCell(AppState.activeMatch, AppState.activeQuestionModal.cellId);
      if (qCell && qCell.status === 'paused' && qCell.session && !qCell.session.isRevealed && qCell.session.remainingMs > 0) {
        Engine.pauseCellTimer(AppState.activeMatch, qCell.cellId, Date.now(), false);
        saveToStorage(Engine.STORAGE_KEYS.ACTIVE_MATCH, AppState.activeMatch);
        refreshQuestionTimerBadge();
      }
    }

    if (popped && popped.returnFocusEl && typeof popped.returnFocusEl.focus === 'function') {
      try { popped.returnFocusEl.focus(); } catch (e) {}
    }
  }

  function closeAllModals() {
    clearQuestionTimerInterval();
    AppState.activeQuestionModal.isOpen = false;
    AppState.modalStack = [];
    var modals = document.querySelectorAll('.modal-backdrop');
    for (var i = 0; i < modals.length; i++) {
      modals[i].classList.remove('open');
    }
  }

  function initApp() {
    // Custom categories must be available before restoring a saved match.
    loadAndMergeCustomPacks();
    var savedSettings = loadFromStorage(Engine.STORAGE_KEYS.SETTINGS, null);
    if (savedSettings && typeof savedSettings === 'object') {
      AppState.settings = Object.assign({}, Engine.DEFAULT_SETTINGS, savedSettings);
      AppState.settings.team1Color = Engine.sanitizeColor(AppState.settings.team1Color, Engine.DEFAULT_SETTINGS.team1Color);
      AppState.settings.team2Color = Engine.sanitizeColor(AppState.settings.team2Color, Engine.DEFAULT_SETTINGS.team2Color);
      AppState.settings.team1Lifelines = Engine.sanitizeLifelineList(AppState.settings.team1Lifelines, 3);
      AppState.settings.team2Lifelines = Engine.sanitizeLifelineList(AppState.settings.team2Lifelines, 3);
    }

    AppState.playedHistory = loadFromStorage(Engine.STORAGE_KEYS.PLAYED_HISTORY, {}) || {};
    AppState.exposedHistory = loadFromStorage(Engine.STORAGE_KEYS.EXPOSED_HISTORY, {}) || {};
    Object.assign(AppState.exposedHistory, AppState.playedHistory);

    AppState.favoriteCategories = loadFromStorage(Engine.STORAGE_KEYS.FAVORITE_CATEGORIES, {}) || {};
    AppState.lockedCategories = loadFromStorage(Engine.STORAGE_KEYS.LOCKED_CATEGORIES, {}) || {};
    AppState.recentSessionCats = loadFromStorage(Engine.STORAGE_KEYS.RECENT_SESSIONS, []) || [];
    if (!Array.isArray(AppState.recentSessionCats)) AppState.recentSessionCats = [];
    AppState.questionReports = loadFromStorage(Engine.STORAGE_KEYS.QUESTION_REPORTS, []) || [];
    AppState.globalStats = loadFromStorage(Engine.STORAGE_KEYS.STATS, { matchesPlayed: 0, totalQuestionsAnswered: 0 }) || { matchesPlayed: 0, totalQuestionsAnswered: 0 };

    var savedDraft = loadFromStorage(Engine.STORAGE_KEYS.DRAFT_SELECTION, null);
    var savedCats = loadFromStorage(Engine.STORAGE_KEYS.SELECTED_CATEGORIES, []);
    if (savedDraft && typeof savedDraft === 'object' && (Array.isArray(savedDraft.team1) || Array.isArray(savedDraft.team2))) {
      var validT1 = [];
      var validT2 = [];
      (savedDraft.team1 || []).forEach(function (cid) {
        if (CAT_BY_ID[cid] && validT1.indexOf(cid) === -1 && validT1.length < 3) validT1.push(cid);
      });
      (savedDraft.team2 || []).forEach(function (cid) {
        if (CAT_BY_ID[cid] && validT1.indexOf(cid) === -1 && validT2.indexOf(cid) === -1 && validT2.length < 3) validT2.push(cid);
      });
      AppState.draftSelection.team1 = validT1;
      AppState.draftSelection.team2 = validT2;
      AppState.draftSelection.activePickerTeam = savedDraft.activePickerTeam === 'team2' ? 'team2' : 'team1';
    } else if (Array.isArray(savedCats) && savedCats.length > 0) {
      // One-time deterministic migration from flat selectedCategories array
      var uniqueValidCats = [];
      savedCats.forEach(function (cid) {
        if (uniqueValidCats.indexOf(cid) === -1 && CAT_BY_ID[cid]) {
          uniqueValidCats.push(cid);
        }
      });
      AppState.draftSelection.team1 = uniqueValidCats.slice(0, 3);
      AppState.draftSelection.team2 = uniqueValidCats.slice(3, 6);
      AppState.draftSelection.activePickerTeam = AppState.draftSelection.team1.length < 3 ? 'team1' : 'team2';
    }
    rebuildCategoryOwners();

    var savedMatch = loadFromStorage(Engine.STORAGE_KEYS.ACTIVE_MATCH, null);
    if (savedMatch) {
      var check = Engine.validateImportedMatchState(savedMatch, CAT_BY_ID);
      if (check.valid) {
        AppState.activeMatch = check.matchState;
        Object.assign(AppState.playedHistory, check.playedHistory);
        Object.assign(AppState.exposedHistory, check.exposedHistory);
      } else {
        showToast('تعذرت استعادة المباراة المحفوظة: ' + check.error);
      }
    }

    updateNavbarStickyOffset();
    window.addEventListener('resize', updateNavbarStickyOffset);
    if (typeof ResizeObserver !== 'undefined') {
      var navEl = document.getElementById('top-navbar');
      if (navEl) {
        var ro = new ResizeObserver(updateNavbarStickyOffset);
        ro.observe(navEl);
      }
    }

    applySettingsToDOM();
    syncSetupInputsFromSettings();
    bindGlobalEvents();
    renderHomeStats();
    initSessionSuggestions();
    renderGroupTabs();
    renderCategoriesGrid();
    renderSelectedTray();
    renderColorSwatches();
    renderLifelinePickers();
    updateResumeBanner();
    initGamepadPolling();
  }

  function pushDraftHistorySnapshot() {
    AppState.draftSelection.history.push({
      team1: AppState.draftSelection.team1.slice(),
      team2: AppState.draftSelection.team2.slice(),
      activePickerTeam: AppState.draftSelection.activePickerTeam
    });
    if (AppState.draftSelection.history.length > 25) {
      AppState.draftSelection.history.shift();
    }
  }

  function rebuildCategoryOwners() {
    var t1 = [];
    var t2 = [];
    var owners = {};
    (AppState.draftSelection.team1 || []).forEach(function (cid) {
      if (CAT_BY_ID[cid] && !owners[cid] && t1.length < 3) {
        t1.push(cid);
        owners[cid] = 'team1';
      }
    });
    (AppState.draftSelection.team2 || []).forEach(function (cid) {
      if (CAT_BY_ID[cid] && !owners[cid] && t2.length < 3) {
        t2.push(cid);
        owners[cid] = 'team2';
      }
    });
    AppState.draftSelection.team1 = t1;
    AppState.draftSelection.team2 = t2;
    AppState.selectedCategories = t1.concat(t2);
    AppState.categoryOwners = owners;
  }

  function persistDraftSelection() {
    rebuildCategoryOwners();
    saveToStorage(Engine.STORAGE_KEYS.DRAFT_SELECTION, {
      team1: AppState.draftSelection.team1,
      team2: AppState.draftSelection.team2,
      activePickerTeam: AppState.draftSelection.activePickerTeam
    });
    saveToStorage(Engine.STORAGE_KEYS.SELECTED_CATEGORIES, AppState.selectedCategories);
  }

  function undoLastCategorySelection() {
    if (!AppState.draftSelection.history || AppState.draftSelection.history.length === 0) return;
    var snap = AppState.draftSelection.history.pop();
    AppState.draftSelection.team1 = snap.team1.slice();
    AppState.draftSelection.team2 = snap.team2.slice();
    AppState.draftSelection.activePickerTeam = snap.activePickerTeam || 'team1';
    persistDraftSelection();
    AudioFX.playClick();
    if (AppState.statusFilter === 'selected') {
      renderCategoriesGrid();
    } else {
      updateAllVisibleCardsSelectionDOM();
    }
    renderSelectedTray();
  }

  function computeEffectiveUiScale(settingVal) {
    if (AppState.settings && AppState.settings.bigScreenMode) {
      return 1.18;
    }
    var raw = String(settingVal || 'auto');
    if (raw !== 'auto' && raw !== 'normal' && raw !== 'large') {
      var parsed = parseInt(raw, 10);
      if (!isNaN(parsed) && parsed >= 80 && parsed <= 200) {
        return parsed / 100;
      }
    }
    if (raw === 'large') return 1.12;
    var vw = typeof window !== 'undefined' ? (window.innerWidth || 1024) : 1024;
    if (vw <= 640) return 0.9;
    if (vw >= 1920) return 1.15;
    return 1.0;
  }

  function applySettingsToDOM() {
    var effTheme = AppState.settings.theme || 'amoled';
    if (effTheme === 'system') {
      effTheme = (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) ? 'light' : 'amoled';
    }
    if (effTheme !== 'light' && effTheme !== 'dark' && effTheme !== 'amoled') {
      effTheme = 'amoled';
    }
    document.documentElement.setAttribute('data-theme', effTheme);
    document.documentElement.setAttribute('data-presentation', (AppState.settings.presentationMode === 'high-contrast' || AppState.settings.bigScreenMode) ? 'high-contrast' : 'normal');
    document.documentElement.setAttribute('data-big-screen', AppState.settings.bigScreenMode ? 'true' : 'false');
    var scaleVal = computeEffectiveUiScale(AppState.settings.textSize);
    document.documentElement.style.setProperty('--ui-scale', String(scaleVal));
    document.documentElement.setAttribute('data-text-size', scaleVal > 1.05 ? 'large' : 'normal');
    document.documentElement.setAttribute('data-density', AppState.settings.cardDensity === 'compact' ? 'compact' : 'comfortable');
    document.documentElement.setAttribute('data-motion', AppState.settings.animationIntensity === 'reduced' ? 'reduced' : 'normal');
    document.documentElement.style.setProperty('--team1-color', Engine.sanitizeColor(AppState.settings.team1Color, '#38bdf8'));
    document.documentElement.style.setProperty('--team2-color', Engine.sanitizeColor(AppState.settings.team2Color, '#f43f5e'));
    AudioFX.enabled = !!AppState.settings.soundEffects;

    var pctTxt = Math.round(scaleVal * 100) + '%';
    var navScaleLbl = document.getElementById('nav-ui-scale-label');
    if (navScaleLbl) navScaleLbl.textContent = pctTxt;
    var moreScaleLbl = document.getElementById('more-ui-scale-label');
    if (moreScaleLbl) moreScaleLbl.textContent = pctTxt;

    var themeBtn = document.getElementById('btn-toggle-theme');
    if (themeBtn) {
      themeBtn.innerHTML = effTheme === 'light'
        ? '<span>🌙</span><span class="btn-lbl">الوضع الداكن</span>'
        : '<span>☀️</span><span class="btn-lbl">الوضع الفاتح</span>';
    }
    var moreThemeLbl = document.getElementById('more-theme-label');
    if (moreThemeLbl) {
      moreThemeLbl.textContent = effTheme === 'light' ? 'تفعيل الوضع الداكن (أموليد)' : 'تفعيل الوضع الفاتح';
    }
    var heroImg = document.getElementById('hero-banner-img');
    if (heroImg && !heroImg.getAttribute('src')) {
      heroImg.src = resolveImg('asset:ui_hero_banner');
    }
    var resImg = document.getElementById('results-banner-img');
    if (resImg && !resImg.getAttribute('src')) {
      resImg.src = resolveImg('asset:ui_results_banner');
    }
    var repBadge = document.getElementById('reports-count-badge');
    if (repBadge) {
      repBadge.textContent = String((AppState.questionReports || []).length);
    }
  }

  function syncSetupInputsFromSettings() {
    var t1Input = document.getElementById('input-team1-name');
    var t2Input = document.getElementById('input-team2-name');
    var timerSelect = document.getElementById('select-match-timer');
    var lifelinesSelect = document.getElementById('select-lifelines-count');
    var stealSelect = document.getElementById('select-allow-steal');
    var penaltySelect = document.getElementById('select-penalty-mode');

    if (t1Input) t1Input.value = AppState.settings.team1DefaultName || Engine.DEFAULT_SETTINGS.team1DefaultName;
    if (t2Input) t2Input.value = AppState.settings.team2DefaultName || Engine.DEFAULT_SETTINGS.team2DefaultName;
    if (timerSelect) timerSelect.value = String(AppState.settings.timerSeconds);
    if (lifelinesSelect) lifelinesSelect.value = String(AppState.settings.lifelinesPerTeam);
    var spoilerSetupChk = document.getElementById('chk-setup-exclude-spoilers');
    if (stealSelect) stealSelect.value = String(!!AppState.settings.allowSteal);
    if (penaltySelect) penaltySelect.value = AppState.settings.penaltyMode || 'none';
    if (spoilerSetupChk) spoilerSetupChk.checked = !!AppState.settings.excludeSpoilers;
  }

  function navigateToScreen(screenId) {
    closeAllModals();
    AppState.currentScreen = screenId;
    var screens = document.querySelectorAll('.screen');
    for (var i = 0; i < screens.length; i++) {
      screens[i].classList.toggle('active', screens[i].id === 'screen-' + screenId);
    }
    window.scrollTo(0, 0);
    if (screenId === 'home') {
      renderHomeStats();
      updateResumeBanner();
    } else if (screenId === 'categories') {
      renderGroupTabs();
      renderCategoriesGrid();
      renderSelectedTray();
    } else if (screenId === 'setup') {
      populateSetupScreen();
    } else if (screenId === 'board') {
      renderGameBoard();
    } else if (screenId === 'results') {
      renderResultsScreen();
    }
  }

  function renderHomeStats() {
    var totalCatsEl = document.getElementById('stat-total-categories');
    var totalQsEl = document.getElementById('stat-total-questions');
    var unseenQsEl = document.getElementById('stat-unseen-questions');
    var matchesPlayedEl = document.getElementById('stat-matches-played');

    var totalQs = DATA.questions.length;
    var combinedSeen = Object.assign({}, AppState.playedHistory, AppState.exposedHistory);
    var seenCount = Object.keys(combinedSeen).length;
    var unseenCount = Math.max(0, totalQs - seenCount);

    var totalCats = DATA.categories.length;
    if (totalCatsEl) totalCatsEl.textContent = String(totalCats);
    if (totalQsEl) totalQsEl.textContent = String(totalQs);
    if (unseenQsEl) unseenQsEl.textContent = String(unseenCount);
    if (matchesPlayedEl) matchesPlayedEl.textContent = String(AppState.globalStats.matchesPlayed || 0);

    var brandSub = document.querySelector('#top-navbar .brand-sub');
    if (brandSub) {
      brandSub.textContent = 'المسابقة الثقافية العربية الكبرى • ' + totalCats + ' فئة • ' + totalQs + ' سؤالاً';
    }
    var chCats = document.getElementById('cats-header-total-cats');
    var chQs = document.getElementById('cats-header-total-qs');
    if (chCats) chCats.textContent = String(totalCats);
    if (chQs) chQs.textContent = String(totalQs);
    var htCats = document.getElementById('howto-total-cats');
    var htQs = document.getElementById('howto-total-qs');
    if (htCats) htCats.textContent = String(totalCats);
    if (htQs) htQs.textContent = String(totalQs);
    var rstQs = document.getElementById('reset-btn-total-qs');
    if (rstQs) rstQs.textContent = String(totalQs);
    document.title = 'سين جيم — تحدي المعرفة (' + totalCats + ' فئة • ' + totalQs + ' سؤالاً)';
  }

  function updateResumeBanner() {
    var banner = document.getElementById('resume-match-banner');
    var metaEl = document.getElementById('resume-match-meta');
    if (!banner) return;
    if (AppState.activeMatch && AppState.activeMatch.status === 'in_progress') {
      banner.style.display = 'flex';
      var t1 = AppState.activeMatch.teams.team1;
      var t2 = AppState.activeMatch.teams.team2;
      if (metaEl) {
        metaEl.textContent = t1.name + ' (' + t1.score + ') ضد ' + t2.name + ' (' + t2.score + ') — تم حسم ' + AppState.activeMatch.answeredCount + ' من ' + (AppState.activeMatch.totalCells || 36) + ' سؤالاً';
      }
    } else {
      banner.style.display = 'none';
    }
  }

  /* ========================================================================
     Category Selection Screen (120 Categories, Explicit Team Slots, Surgical DOM)
     ======================================================================== */
  function renderGroupTabs() {
    var container = document.getElementById('category-group-tabs');
    if (!container) return;
    container.textContent = '';

    var allBtn = document.createElement('button');
    allBtn.type = 'button';
    allBtn.className = 'group-tab' + (AppState.activeGroupFilter === 'all' ? ' active' : '');
    allBtn.textContent = 'جميع المجموعات (' + DATA.categories.length + ')';
    allBtn.addEventListener('click', function () {
      AudioFX.playClick();
      AppState.activeGroupFilter = 'all';
      renderGroupTabs();
      renderCategoriesGrid();
    });
    container.appendChild(allBtn);

    DATA.groups.forEach(function (g) {
      var gCount = DATA.categories.filter(function (c) {
        return c.groupId === g.id || (g.id === 'group_j' && !!c.tvSubgroup);
      }).length;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'group-tab' + (AppState.activeGroupFilter === g.id ? ' active' : '');
      btn.textContent = g.title + ' (' + gCount + ')';
      btn.addEventListener('click', function () {
        AudioFX.playClick();
        AppState.activeGroupFilter = g.id;
        renderGroupTabs();
        renderCategoriesGrid();
      });
      container.appendChild(btn);
    });

    // Also sync status filter buttons
    var statusContainer = document.getElementById('category-status-filters');
    if (statusContainer) {
      var favCount = Object.keys(AppState.favoriteCategories || {}).filter(function (k) { return AppState.favoriteCategories[k] && !!CAT_BY_ID[k]; }).length;
      var selCount = AppState.selectedCategories.length;
      var btns = statusContainer.querySelectorAll('[data-status-filter]');
      for (var i = 0; i < btns.length; i++) {
        var b = btns[i];
        var sf = b.getAttribute('data-status-filter');
        b.classList.toggle('active', AppState.statusFilter === sf);
        if (sf === 'all') b.textContent = 'الكل (' + DATA.categories.length + ')';
        else if (sf === 'favorites') b.textContent = '⭐ المفضلة (' + favCount + ')';
        else if (sf === 'selected') b.textContent = '✅ المختارة (' + selCount + '/6)';
        else if (sf === 'new_cats') {
          var newCnt = DATA.categories.filter(function (c) { return !!c.isNew; }).length;
          b.textContent = '✨ فئات جديدة (' + newCnt + ')';
        }
        else if (sf === 'unseen') b.textContent = '🆕 متاح بالجديد';
      }
    }

    var tvSubBar = document.getElementById('tv-subgroup-tabs');
    if (tvSubBar) {
      var isTvGroup = AppState.activeGroupFilter === 'group_j';
      tvSubBar.classList.toggle('visible', isTvGroup);
      var subBtns = tvSubBar.querySelectorAll('[data-tv-sub]');
      for (var s = 0; s < subBtns.length; s++) {
        var sb = subBtns[s];
        sb.classList.toggle('active', sb.getAttribute('data-tv-sub') === AppState.tvSubgroupFilter);
      }
    }

    var grpBanner = document.getElementById('group-banner-strip');
    var grpBannerImg = document.getElementById('group-banner-img');
    var grpBannerCap = document.getElementById('group-banner-caption');
    if (grpBanner && grpBannerImg && grpBannerCap) {
      var activeGrpObj = DATA.groups.find(function (g) { return g.id === AppState.activeGroupFilter; });
      if (activeGrpObj) {
        var bUri = resolveImg(activeGrpObj.bannerAssetId || ('asset:group_banner_' + activeGrpObj.id));
        if (bUri) {
          grpBanner.style.display = 'block';
          grpBannerImg.src = bUri;
          var grpCatCnt = DATA.categories.filter(function (c) { return c.groupId === activeGrpObj.id; }).length;
          grpBannerCap.innerHTML = '<span>📂 ' + activeGrpObj.title + '</span><span style="font-size:0.8rem; color:#f8fafc;">' + grpCatCnt + ' فئة متخصصة</span>';
        } else {
          grpBanner.style.display = 'none';
        }
      } else {
        grpBanner.style.display = 'none';
      }
    }
  }

  function applySingleCardSelectionDOM(card, catId) {
    if (!card) return;
    var ownerTeam = AppState.categoryOwners[catId] || null;
    var isSelected = !!ownerTeam;
    card.classList.toggle('selected', isSelected);
    card.setAttribute('aria-pressed', isSelected ? 'true' : 'false');

    if (isSelected) {
      var oCol = ownerTeam === 'team1'
        ? Engine.sanitizeColor(AppState.settings.team1Color, '#0ea5e9')
        : Engine.sanitizeColor(AppState.settings.team2Color, '#ec4899');
      card.style.setProperty('--card-owner-color', oCol);
      card.style.borderColor = oCol;
    } else {
      card.style.removeProperty('--card-owner-color');
      card.style.borderColor = '';
      card.style.boxShadow = '';
    }

    var chkBadge = card.querySelector('.cat-check-badge');
    if (chkBadge) {
      chkBadge.textContent = isSelected ? '✓' : '';
    }

    var artDiv = card.querySelector('.cat-card-art');
    var existingOwnBadge = card.querySelector('.cat-team-owner-badge');
    if (isSelected && ownerTeam) {
      var teamArr = AppState.draftSelection[ownerTeam] || [];
      var slotNum = teamArr.indexOf(catId) + 1;
      if (!existingOwnBadge && artDiv) {
        existingOwnBadge = document.createElement('span');
        existingOwnBadge.className = 'cat-team-owner-badge';
        artDiv.appendChild(existingOwnBadge);
      }
      if (existingOwnBadge) {
        existingOwnBadge.style.backgroundColor = ownerTeam === 'team1'
          ? Engine.sanitizeColor(AppState.settings.team1Color, '#0ea5e9')
          : Engine.sanitizeColor(AppState.settings.team2Color, '#ec4899');
        existingOwnBadge.textContent = (ownerTeam === 'team1' ? 'ف١' : 'ف٢') + (slotNum > 0 ? (' • ' + slotNum + '/3') : '');
      }
    } else if (existingOwnBadge && existingOwnBadge.parentNode) {
      existingOwnBadge.parentNode.removeChild(existingOwnBadge);
    }
  }

  function updateAllVisibleCardsSelectionDOM() {
    var grid = document.getElementById('categories-grid');
    if (!grid) return;
    var cards = grid.querySelectorAll('.cat-card');
    for (var i = 0; i < cards.length; i++) {
      var cid = cards[i].getAttribute('data-cat-id');
      if (cid) applySingleCardSelectionDOM(cards[i], cid);
    }
    renderGroupTabs();
    if (AppState.activeDetailsCatId) {
      syncCategoryDetailsModalButtons();
    }
  }

  function renderCategoriesGrid() {
    var grid = document.getElementById('categories-grid');
    if (!grid) return;
    grid.textContent = '';

    var qNorm = Engine.normalizeArabicText(AppState.searchQuery || '');
    var clearSearchBtn = document.getElementById('btn-clear-search');
    if (clearSearchBtn) {
      clearSearchBtn.style.display = qNorm ? 'inline-flex' : 'none';
    }

    var combinedSeen = Object.assign({}, AppState.playedHistory, AppState.exposedHistory);
    var unseenCache = {};
    var categoryNumbers = {};
    DATA.categories.forEach(function (c, index) {
      categoryNumbers[c.id] = index + 1;
      var qs = QUESTIONS_BY_CAT[c.id] || [];
      var u = 0;
      for (var i = 0; i < qs.length; i++) {
        if (!combinedSeen[qs[i].id]) u++;
      }
      unseenCache[c.id] = u;
    });

    var filtered = DATA.categories.filter(function (c) {
      if (AppState.activeGroupFilter === 'favorites') {
        if (!AppState.favoriteCategories[c.id]) return false;
      } else if (AppState.activeGroupFilter === 'group_j') {
        if (c.groupId !== 'group_j' && !c.tvSubgroup) return false;
        if (AppState.tvSubgroupFilter !== 'all' && c.tvSubgroup !== AppState.tvSubgroupFilter) return false;
      } else if (AppState.activeGroupFilter !== 'all') {
        if (c.groupId !== AppState.activeGroupFilter) return false;
      }

      if (AppState.statusFilter === 'favorites' && !AppState.favoriteCategories[c.id]) return false;
      if (AppState.statusFilter === 'selected' && !AppState.categoryOwners[c.id]) return false;
      if (AppState.statusFilter === 'visual') {
        var qsCheck = QUESTIONS_BY_CAT[c.id] || [];
        var hasVis = qsCheck.some(function (q) { return !!(q.assetId || q.imageDataUri || (q.format && q.format !== 'standard')); });
        if (!hasVis) return false;
      }
      if (AppState.statusFilter === 'visual_rich') {
        var qsVisRich = QUESTIONS_BY_CAT[c.id] || [];
        var imgCntRich = qsVisRich.filter(function (q) { return !!(q.assetId || q.imageDataUri); }).length;
        if (imgCntRich < Math.ceil(qsVisRich.length * 0.5)) return false;
      }
      if (AppState.statusFilter === 'new_cats' && !c.isNew) return false;
      if (AppState.statusFilter === 'unseen' && unseenCache[c.id] < 6) return false;

      if (!qNorm) return true;
      var hay = Engine.normalizeArabicText(
        [c.title, c.enTitle || '', c.description || '', c.groupTitle || '', c.id].join(' ')
      );
      return hay.indexOf(qNorm) !== -1;
    });

    if (AppState.sortBy === 'alpha') {
      filtered = filtered.slice().sort(function (a, b) {
        return a.title.localeCompare(b.title, 'ar');
      });
    } else if (AppState.sortBy === 'images_desc') {
      filtered = filtered.slice().sort(function (a, b) {
        var ia = (QUESTIONS_BY_CAT[a.id] || []).filter(function (q) { return !!(q.assetId || q.imageDataUri); }).length;
        var ib = (QUESTIONS_BY_CAT[b.id] || []).filter(function (q) { return !!(q.assetId || q.imageDataUri); }).length;
        return (ib - ia) || a.title.localeCompare(b.title, 'ar');
      });
    } else if (AppState.sortBy === 'unseen_desc') {
      filtered = filtered.slice().sort(function (a, b) {
        return (unseenCache[b.id] - unseenCache[a.id]) || a.title.localeCompare(b.title, 'ar');
      });
    }

    var resultCountEl = document.getElementById('categories-result-count');
    if (resultCountEl) {
      resultCountEl.textContent = 'عرض ' + filtered.length + ' من ' + DATA.categories.length + ' فئة';
    }

    if (filtered.length === 0) {
      var emptyMsg = document.createElement('div');
      emptyMsg.className = 'stat-card';
      emptyMsg.style.gridColumn = '1 / -1';
      emptyMsg.style.padding = '1rem';
      var empImg = document.createElement('img');
      empImg.src = resolveImg('asset:ui_empty_state');
      empImg.alt = 'لا توجد نتائج';
      empImg.style.cssText = 'width:180px; height:112px; object-fit:contain; margin:0 auto 0.45rem; display:block; border-radius:10px;';
      emptyMsg.appendChild(empImg);
      var empP = document.createElement('div');
      empP.textContent = (AppState.statusFilter === 'favorites' || AppState.activeGroupFilter === 'favorites')
        ? 'لم تقم بإضافة أي فئة إلى المفضلة بعد؛ اضغط على رمز النجمة ☆ أعلى أي بطاقة لإضافتها.'
        : 'لا توجد فئات مطابقة للتصفية أو البحث الحالي.';
      emptyMsg.appendChild(empP);
      grid.appendChild(emptyMsg);
      return;
    }

    filtered.forEach(function (cat) {
      var isFav = !!AppState.favoriteCategories[cat.id];
      var catQuestions = QUESTIONS_BY_CAT[cat.id] || [];
      var unseenInCat = unseenCache[cat.id];

      var card = document.createElement('div');
      card.className = 'cat-card';
      card.setAttribute('data-cat-id', cat.id);
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');

      var artDiv = document.createElement('div');
      artDiv.className = 'cat-card-art';

      var imgEl = document.createElement('img');
      imgEl.src = resolveImg(cat.coverAssetId || cat.imageDataUri || cat.image);
      imgEl.alt = 'صورة فئة ' + cat.title;
      imgEl.loading = 'lazy';
      imgEl.decoding = 'async';
      artDiv.appendChild(imgEl);

      var isLocked = !!(AppState.lockedCategories && AppState.lockedCategories[cat.id]);
      var lockBtn = document.createElement('button');
      lockBtn.type = 'button';
      lockBtn.className = 'cat-card-lock-btn' + (isLocked ? ' is-locked' : '');
      lockBtn.setAttribute('aria-label', isLocked ? 'إلغاء تثبيت الفئة' : 'تثبيت الفئة');
      lockBtn.title = isLocked ? 'الفئة مثبتة' : 'تثبيت الفئة في الاقتراحات';
      lockBtn.textContent = isLocked ? '🔒' : '🔓';
      lockBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleCategoryLock(cat.id);
        renderCategoriesGrid();
      });
      artDiv.appendChild(lockBtn);

      var grpBadge = document.createElement('span');
      grpBadge.className = 'cat-group-badge';
      grpBadge.textContent = cat.groupTitle;
      artDiv.appendChild(grpBadge);

      var favBtn = document.createElement('button');
      favBtn.type = 'button';
      favBtn.className = 'cat-card-fav-btn' + (isFav ? ' is-fav' : '');
      favBtn.setAttribute('aria-label', isFav ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة');
      favBtn.textContent = isFav ? '★' : '☆';
      favBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleCategoryFavorite(cat.id, favBtn);
      });
      artDiv.appendChild(favBtn);

      var infoBtn = document.createElement('button');
      infoBtn.type = 'button';
      infoBtn.className = 'cat-card-info-btn';
      infoBtn.setAttribute('aria-label', 'تفاصيل فئة ' + cat.title);
      infoBtn.title = 'عرض وصف وتفاصيل الفئة';
      infoBtn.textContent = 'ℹ️';
      infoBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        openCategoryDetailsModal(cat.id);
      });
      artDiv.appendChild(infoBtn);

      var chkBadge = document.createElement('span');
      chkBadge.className = 'cat-check-badge';
      artDiv.appendChild(chkBadge);

      var bodyDiv = document.createElement('div');
      bodyDiv.className = 'cat-card-body';

      var titleRow = document.createElement('div');
      titleRow.className = 'cat-card-title-row';

      var numberSpan = document.createElement('span');
      numberSpan.className = 'cat-card-number';
      numberSpan.textContent = '#' + categoryNumbers[cat.id];
      numberSpan.setAttribute('aria-label', 'رقم الفئة ' + categoryNumbers[cat.id]);
      titleRow.appendChild(numberSpan);

      var iconSpan = document.createElement('span');
      iconSpan.className = 'cat-card-icon';
      iconSpan.textContent = cat.icon;
      titleRow.appendChild(iconSpan);

      var titleSpan = document.createElement('span');
      titleSpan.className = 'cat-card-title';
      titleSpan.textContent = cat.title;
      titleRow.appendChild(titleSpan);

      var descP = document.createElement('p');
      descP.className = 'cat-card-desc';
      descP.textContent = cat.description;

      var footerDiv = document.createElement('div');
      footerDiv.className = 'cat-card-footer';

      var imgInCat = catQuestions.filter(function (q) { return !!(q.assetId || q.imageDataUri); }).length;
      var totalSpan = document.createElement('span');
      totalSpan.textContent = catQuestions.length + ' سؤال • 📸 ' + imgInCat;
      var unseenSpan = document.createElement('span');
      unseenSpan.innerHTML = '<span class="cat-diff-dots" title="توازن المستويات (٢٠٠ / ٤٠٠ / ٦٠٠)"><i class="cat-diff-dot easy"></i><i class="cat-diff-dot med"></i><i class="cat-diff-dot hard"></i></span> جديد: ' + unseenInCat;
      footerDiv.appendChild(totalSpan);
      footerDiv.appendChild(unseenSpan);

      bodyDiv.appendChild(titleRow);
      bodyDiv.appendChild(descP);
      bodyDiv.appendChild(footerDiv);

      card.appendChild(artDiv);
      card.appendChild(bodyDiv);

      applySingleCardSelectionDOM(card, cat.id);

      card.addEventListener('click', function (e) {
        if (e.target && e.target.closest && e.target.closest('.cat-card-fav-btn, .cat-card-info-btn')) {
          return;
        }
        toggleCategorySelection(cat.id);
      });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          if (e.target && e.target !== card) return;
          e.preventDefault();
          toggleCategorySelection(cat.id);
        }
      });
      grid.appendChild(card);
    });
  }

  function toggleCategoryFavorite(catId, favBtnEl) {
    AudioFX.playClick();
    if (AppState.favoriteCategories[catId]) {
      delete AppState.favoriteCategories[catId];
    } else {
      AppState.favoriteCategories[catId] = true;
    }
    var isFav = !!AppState.favoriteCategories[catId];
    saveToStorage(Engine.STORAGE_KEYS.FAVORITE_CATEGORIES, AppState.favoriteCategories);
    if (favBtnEl) {
      favBtnEl.classList.toggle('is-fav', isFav);
      favBtnEl.textContent = isFav ? '★' : '☆';
      favBtnEl.setAttribute('aria-label', isFav ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة');
    }
    renderGroupTabs();
    if (AppState.activeGroupFilter === 'favorites' || AppState.statusFilter === 'favorites') {
      renderCategoriesGrid();
    }
    if (AppState.activeDetailsCatId === catId) {
      syncCategoryDetailsModalButtons();
    }
  }

  function openCategoryDetailsModal(catId) {
    var cat = CAT_BY_ID[catId];
    if (!cat) return;
    AppState.activeDetailsCatId = catId;
    AudioFX.playClick();

    var titleEl = document.getElementById('cat-details-title');
    var imgEl = document.getElementById('cat-details-img');
    var grpEl = document.getElementById('cat-details-group');
    var countsEl = document.getElementById('cat-details-counts');
    var descEl = document.getElementById('cat-details-desc');
    var tiersEl = document.getElementById('cat-details-tiers');
    var srcEl = document.getElementById('cat-details-source');

    var combinedSeen = Object.assign({}, AppState.playedHistory, AppState.exposedHistory);
    var qs = QUESTIONS_BY_CAT[catId] || [];
    var unseen = qs.filter(function (q) { return !combinedSeen[q.id]; }).length;

    if (titleEl) titleEl.textContent = cat.icon + ' ' + cat.title;
    if (imgEl) {
      imgEl.src = resolveImg(cat.coverAssetId || cat.imageDataUri || cat.image);
      imgEl.alt = 'غلاف فئة ' + cat.title;
    }
    if (grpEl) grpEl.textContent = '📂 ' + cat.groupTitle;
    if (countsEl) countsEl.textContent = qs.length + ' سؤالاً متاحاً (جديد غير مكشوف: ' + unseen + ')';
    if (descEl) descEl.textContent = cat.description || '';
    if (tiersEl) {
      var c200 = qs.filter(function(q){return q.points===200;}).length;
      var c400 = qs.filter(function(q){return q.points===400;}).length;
      var c600 = qs.filter(function(q){return q.points===600;}).length;
      tiersEl.textContent = 'توزيع المستويات في البنك: ' + c200 + ' أسئلة (٢٠٠ نقطة) • ' + c400 + ' أسئلة (٤٠٠ نقطة) • ' + c600 + ' أسئلة (٦٠٠ نقطة)';
    }
    if (srcEl) {
      srcEl.textContent = 'المصدر المرجعي المعتمد: ' + (cat.sourceTitle || 'مراجع سين جيم الموثقة');
    }
    var sampleQEl = document.getElementById('cat-details-sample-q');
    var sampleAEl = document.getElementById('cat-details-sample-a');
    var toggleSampleBtn = document.getElementById('btn-toggle-sample-ans');
    var sampleItem = (cat.sampleQuestions && cat.sampleQuestions[0]) || (qs[0] ? { points: qs[0].points, question: qs[0].question, answer: qs[0].answer } : null);
    if (sampleItem && sampleQEl && sampleAEl && toggleSampleBtn) {
      sampleQEl.textContent = '(' + sampleItem.points + ' نقطة) ' + (sampleItem.question || sampleItem.question_ar || '');
      sampleAEl.textContent = '✅ الإجابة: ' + (sampleItem.answer || sampleItem.answer_ar || '');
      sampleAEl.style.display = 'none';
      toggleSampleBtn.textContent = '👁️ إظهار إجابة النموذج';
      toggleSampleBtn.onclick = function () {
        var isHidden = sampleAEl.style.display === 'none';
        sampleAEl.style.display = isHidden ? 'block' : 'none';
        toggleSampleBtn.textContent = isHidden ? '🙈 إخفاء إجابة النموذج' : '👁️ إظهار إجابة النموذج';
      };
    }
    var stripEl = document.getElementById('cat-details-preview-strip');
    if (stripEl) {
      stripEl.textContent = '';
      var imgQs = qs.filter(function (q) { return !!(q.assetId || q.imageDataUri); });
      var previewAssets = [];
      var seenAs = {};
      if (cat.coverAssetId) {
        previewAssets.push({ src: resolveImg(cat.coverAssetId), alt: 'غلاف ' + cat.title });
        seenAs[cat.coverAssetId] = true;
      }
      for (var pi = 0; pi < imgQs.length && previewAssets.length < 4; pi++) {
        var aid = imgQs[pi].assetId || imgQs[pi].imageDataUri;
        if (aid && !seenAs[aid]) {
          seenAs[aid] = true;
          previewAssets.push({ src: resolveImg(aid), alt: imgQs[pi].imageAlt || ('معاينة ' + (pi + 1)) });
        }
      }
      while (previewAssets.length < 4 && previewAssets.length > 0) {
        previewAssets.push(previewAssets[0]);
      }
      previewAssets.slice(0, 4).forEach(function (pa) {
        var th = document.createElement('div');
        th.className = 'cat-preview-thumb';
        var tim = document.createElement('img');
        tim.src = pa.src;
        tim.alt = pa.alt;
        tim.decoding = 'async';
        th.appendChild(tim);
        th.addEventListener('click', function () {
          var vImg = document.getElementById('q-modal-visual-img');
          if (vImg) {
            vImg.src = pa.src;
            vImg.alt = pa.alt;
          }
          openVisualLightbox();
        });
        stripEl.appendChild(th);
      });
    }
    syncCategoryDetailsModalButtons();
    openModalLayer('modal-cat-details');
  }

  function syncCategoryDetailsModalButtons() {
    var catId = AppState.activeDetailsCatId;
    if (!catId) return;
    var selBtn = document.getElementById('btn-modal-cat-toggle-select');
    var favBtn = document.getElementById('btn-modal-cat-toggle-fav');
    var owner = AppState.categoryOwners[catId];
    var isFav = !!AppState.favoriteCategories[catId];

    if (selBtn) {
      if (owner) {
        selBtn.textContent = '✕ إلغاء اختيار الفئة (' + (owner === 'team1' ? 'الفريق ١' : 'الفريق ٢') + ')';
      } else {
        var targetTeamLabel = AppState.draftSelection.activePickerTeam === 'team2' ? 'الفريق ٢' : 'الفريق ١';
        selBtn.textContent = '✅ اختيار الفئة لـ ' + targetTeamLabel;
      }
    }
    if (favBtn) {
      favBtn.textContent = isFav ? '★ إزالة من المفضلة' : '⭐ إضافة للمفضلة';
    }
    var lockBtn = document.getElementById('btn-modal-cat-toggle-lock');
    if (lockBtn) {
      if (owner) {
        var isLocked = !!AppState.lockedCategories[catId];
        lockBtn.style.display = 'inline-flex';
        lockBtn.textContent = isLocked ? '🔓 إلغاء تثبيت الفئة' : '🔒 تثبيت الفئة عند التدوير';
      } else {
        lockBtn.style.display = 'none';
      }
    }
  }

  function toggleCategorySelection(catId) {
    if (!CAT_BY_ID[catId]) return;

    var t1Idx = AppState.draftSelection.team1.indexOf(catId);
    var t2Idx = AppState.draftSelection.team2.indexOf(catId);

    if (t1Idx !== -1) {
      // Deselect from Team 1 ONLY; Team 2 categories stay strictly in Team 2!
      pushDraftHistorySnapshot();
      AppState.draftSelection.team1.splice(t1Idx, 1);
      AppState.draftSelection.activePickerTeam = 'team1';
      AudioFX.playClick();
    } else if (t2Idx !== -1) {
      // Deselect from Team 2 ONLY; Team 1 categories stay strictly in Team 1!
      pushDraftHistorySnapshot();
      AppState.draftSelection.team2.splice(t2Idx, 1);
      AppState.draftSelection.activePickerTeam = 'team2';
      AudioFX.playClick();
    } else {
      // Selecting a new category
      var t1Len = AppState.draftSelection.team1.length;
      var t2Len = AppState.draftSelection.team2.length;
      if (t1Len + t2Len >= 6) {
        showToast('لقد اخترت 6 فئات بالفعل (٣ لكل فريق)! اضغط على أي فئة مختارة لإلغائها أولاً.');
        return;
      }

      pushDraftHistorySnapshot();
      var targetTeam = AppState.draftSelection.activePickerTeam || 'team1';
      if (targetTeam === 'team1' && t1Len >= 3) {
        targetTeam = 'team2';
      } else if (targetTeam === 'team2' && t2Len >= 3) {
        targetTeam = 'team1';
      }

      AppState.draftSelection[targetTeam].push(catId);

      // Automatically advance activePickerTeam if this team reached 3/3 and the other has < 3
      if (targetTeam === 'team1' && AppState.draftSelection.team1.length >= 3 && AppState.draftSelection.team2.length < 3) {
        AppState.draftSelection.activePickerTeam = 'team2';
      } else if (targetTeam === 'team2' && AppState.draftSelection.team2.length >= 3 && AppState.draftSelection.team1.length < 3) {
        AppState.draftSelection.activePickerTeam = 'team1';
      }
      AudioFX.playSelectCard();
    }

    persistDraftSelection();
    if (AppState.statusFilter === 'selected') {
      renderCategoriesGrid();
    } else {
      updateAllVisibleCardsSelectionDOM();
    }
    renderSelectedTray();
  }

  function getUnseenCountForCategory(cid, combinedSeen) {
    var qs = QUESTIONS_BY_CAT[cid] || [];
    var u = 0;
    for (var i = 0; i < qs.length; i++) {
      if (!combinedSeen[qs[i].id]) u++;
    }
    return u;
  }

  function recordRecentSessionCategories(catIds) {
    if (!Array.isArray(catIds)) return;
    var recent = (AppState.recentSessionCats || []).slice();
    catIds.forEach(function (cid) {
      var existingIdx = recent.indexOf(cid);
      if (existingIdx !== -1) recent.splice(existingIdx, 1);
      recent.push(cid);
    });
    if (recent.length > 24) {
      recent = recent.slice(recent.length - 24);
    }
    AppState.recentSessionCats = recent;
    saveToStorage(Engine.STORAGE_KEYS.RECENT_SESSIONS, AppState.recentSessionCats);
  }

  function pickSmartCategoryFromPool(poolIds, alreadyChosenMap, combinedSeen, recentMap, rng) {
    var validPool = (poolIds || []).filter(function (cid) {
      return !!CAT_BY_ID[cid] && !alreadyChosenMap[cid];
    });
    if (validPool.length === 0) {
      validPool = DATA.categories.map(function (c) { return c.id; }).filter(function (cid) {
        return !alreadyChosenMap[cid];
      });
    }
    if (validPool.length === 0) return null;

    // Tier 1: unseen >= 6 AND not in recent sessions
    var tier1 = validPool.filter(function (cid) {
      return getUnseenCountForCategory(cid, combinedSeen) >= 6 && !recentMap[cid];
    });
    if (tier1.length > 0) {
      return Engine.shuffleArray(tier1, rng)[0];
    }
    // Tier 2: unseen >= 6 (even if recently used)
    var tier2 = validPool.filter(function (cid) {
      return getUnseenCountForCategory(cid, combinedSeen) >= 6;
    });
    if (tier2.length > 0) {
      return Engine.shuffleArray(tier2, rng)[0];
    }
    // Tier 3: any valid category in pool
    return Engine.shuffleArray(validPool, rng)[0];
  }

  function generateSessionLineup(themeKey, respectLocks, rng) {
    var theme = SESSION_THEMES[themeKey] || SESSION_THEMES.diwaniya;
    var pools = typeof theme.buildPools === 'function' ? theme.buildPools() : (theme.slots || []);
    var combinedSeen = Object.assign({}, AppState.playedHistory, AppState.exposedHistory);
    var recentMap = {};
    (AppState.recentSessionCats || []).slice(-12).forEach(function (cid) {
      recentMap[cid] = true;
    });

    var lockedT1 = [];
    var lockedT2 = [];
    var chosenMap = {};

    if (respectLocks) {
      (AppState.draftSelection.team1 || []).forEach(function (cid) {
        if (AppState.lockedCategories[cid] && CAT_BY_ID[cid] && !chosenMap[cid] && lockedT1.length < 3) {
          lockedT1.push(cid);
          chosenMap[cid] = true;
        }
      });
      (AppState.draftSelection.team2 || []).forEach(function (cid) {
        if (AppState.lockedCategories[cid] && CAT_BY_ID[cid] && !chosenMap[cid] && lockedT2.length < 3) {
          lockedT2.push(cid);
          chosenMap[cid] = true;
        }
      });
    }

    var t1 = lockedT1.slice();
    var t2 = lockedT2.slice();

    for (var s1 = t1.length; s1 < 3; s1++) {
      var pick1 = pickSmartCategoryFromPool(pools[s1] || [], chosenMap, combinedSeen, recentMap, rng);
      if (pick1) {
        t1.push(pick1);
        chosenMap[pick1] = true;
      }
    }
    for (var s2 = t2.length; s2 < 3; s2++) {
      var pick2 = pickSmartCategoryFromPool(pools[3 + s2] || [], chosenMap, combinedSeen, recentMap, rng);
      if (pick2) {
        t2.push(pick2);
        chosenMap[pick2] = true;
      }
    }

    return {
      team1: t1.slice(0, 3),
      team2: t2.slice(0, 3)
    };
  }

  function initSessionSuggestions() {
    AppState.visibleSessionKeys = ['series_night', 'diwaniya', 'foot_anime', 'visual_challenge', 'every_sea_drop'];
    ALL_SESSION_THEME_KEYS.forEach(function (k) {
      AppState.proposedSessions[k] = generateSessionLineup(k, true);
    });
    renderSessionSuggestions();
  }

  function refreshSessionSuggestions() {
    AudioFX.playClick();
    var nonPrimary = ALL_SESSION_THEME_KEYS.filter(function (k) { return k !== 'series_night'; });
    var shuffledOthers = Engine.shuffleArray(nonPrimary);
    // Always keep series_night or rotate through all 12 themes so 5 varied cards are shown
    AppState.sessionRotationOffset = (AppState.sessionRotationOffset + 1) % ALL_SESSION_THEME_KEYS.length;
    var rotated = Engine.shuffleArray(ALL_SESSION_THEME_KEYS);
    if (rotated.slice(0, 5).indexOf('series_night') === -1 && AppState.sessionRotationOffset % 2 === 0) {
      rotated[0] = 'series_night';
    }
    AppState.visibleSessionKeys = rotated.slice(0, 5);
    AppState.visibleSessionKeys.forEach(function (k) {
      AppState.proposedSessions[k] = generateSessionLineup(k, true);
    });
    renderSessionSuggestions();
    showToast('🔄 تم توليد تشكيلات وجلسات مقترحة جديدة!');
  }

  function renderSessionSuggestions() {
    var grid = document.getElementById('sessions-cards-grid');
    if (!grid) return;
    grid.textContent = '';

    (AppState.visibleSessionKeys || []).forEach(function (themeKey) {
      var theme = SESSION_THEMES[themeKey];
      if (!theme) return;
      if (!AppState.proposedSessions[themeKey]) {
        AppState.proposedSessions[themeKey] = generateSessionLineup(themeKey, true);
      }
      var lineup = AppState.proposedSessions[themeKey];

      var card = document.createElement('div');
      card.className = 'session-card session-preset-card';
      card.setAttribute('data-preset', themeKey);

      var head = document.createElement('div');
      head.className = 'session-card-head';

      var nameDiv = document.createElement('div');
      nameDiv.className = 'session-card-name';
      nameDiv.textContent = theme.icon + ' ' + theme.title;
      head.appendChild(nameDiv);

      var rerollBtn = document.createElement('button');
      rerollBtn.type = 'button';
      rerollBtn.className = 'session-card-reroll';
      rerollBtn.title = 'تبديل الفئات الست المقترحة لهذه الجلسة';
      rerollBtn.setAttribute('aria-label', 'تبديل فئات ' + theme.title);
      rerollBtn.textContent = '🎲';
      rerollBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        AudioFX.playClick();
        AppState.proposedSessions[themeKey] = generateSessionLineup(themeKey, true);
        recordRecentSessionCategories(AppState.proposedSessions[themeKey].team1.concat(AppState.proposedSessions[themeKey].team2));
        renderSessionSuggestions();
      });
      head.appendChild(rerollBtn);

      var descP = document.createElement('p');
      descP.className = 'session-card-desc';
      descP.textContent = theme.desc || theme.subtitle || '';

      var pillsWrap = document.createElement('div');
      pillsWrap.className = 'session-preview-pills';

      lineup.team1.forEach(function (cid) {
        var c = CAT_BY_ID[cid];
        if (!c) return;
        var tag = document.createElement('span');
        tag.className = 'session-preview-tag t1';
        var lockMark = AppState.lockedCategories[cid] ? '🔒 ' : '';
        tag.textContent = lockMark + c.icon + ' ' + c.title;
        pillsWrap.appendChild(tag);
      });
      lineup.team2.forEach(function (cid) {
        var c = CAT_BY_ID[cid];
        if (!c) return;
        var tag = document.createElement('span');
        tag.className = 'session-preview-tag t2';
        var lockMark = AppState.lockedCategories[cid] ? '🔒 ' : '';
        tag.textContent = lockMark + c.icon + ' ' + c.title;
        pillsWrap.appendChild(tag);
      });

      var applyBtn = document.createElement('button');
      applyBtn.type = 'button';
      applyBtn.className = 'session-apply-btn';
      applyBtn.setAttribute('data-apply-session', themeKey);
      applyBtn.textContent = '⚡ تطبيق التشكيلة (6 فئات)';
      applyBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        applyCategoryPreset(themeKey);
      });

      card.appendChild(head);
      card.appendChild(descP);
      card.appendChild(pillsWrap);
      card.appendChild(applyBtn);
      grid.appendChild(card);
    });
  }

  function toggleCategoryLock(catId) {
    if (!CAT_BY_ID[catId] || !AppState.categoryOwners[catId]) return;
    AudioFX.playClick();
    if (AppState.lockedCategories[catId]) {
      delete AppState.lockedCategories[catId];
      showToast('🔓 تم إلغاء تثبيت فئة «' + CAT_BY_ID[catId].title + '».');
    } else {
      AppState.lockedCategories[catId] = true;
      showToast('🔒 تم تثبيت فئة «' + CAT_BY_ID[catId].title + '»؛ ستبقى محفوظة عند التدوير العشوائي!');
    }
    saveToStorage(Engine.STORAGE_KEYS.LOCKED_CATEGORIES, AppState.lockedCategories);
    renderSelectedTray();
    renderSessionSuggestions();
    if (AppState.activeDetailsCatId === catId) {
      syncCategoryDetailsModalButtons();
    }
  }

  function applyCategoryPreset(presetKey) {
    var themeKey = SESSION_THEMES[presetKey] ? presetKey : 'diwaniya';
    var theme = SESSION_THEMES[themeKey];
    pushDraftHistorySnapshot();

    // Always generate or apply a fresh valid 6-category lineup respecting locked slots
    var lineup = AppState.proposedSessions[themeKey];
    var currentConcat = (AppState.draftSelection.team1 || []).concat(AppState.draftSelection.team2 || []).join(',');
    if (!lineup || lineup.team1.concat(lineup.team2).join(',') === currentConcat) {
      lineup = generateSessionLineup(themeKey, true);
    } else {
      // Ensure any newly locked categories are respected
      var hasLockedMismatch = false;
      (AppState.draftSelection.team1 || []).concat(AppState.draftSelection.team2 || []).forEach(function (cid) {
        if (AppState.lockedCategories[cid] && lineup.team1.indexOf(cid) === -1 && lineup.team2.indexOf(cid) === -1) {
          hasLockedMismatch = true;
        }
      });
      if (hasLockedMismatch) {
        lineup = generateSessionLineup(themeKey, true);
      }
    }

    AppState.draftSelection.team1 = lineup.team1.slice(0, 3);
    AppState.draftSelection.team2 = lineup.team2.slice(0, 3);
    AppState.draftSelection.activePickerTeam = 'team1';
    recordRecentSessionCategories(lineup.team1.concat(lineup.team2));
    // Pre-roll a new lineup for the next click so repeated clicks always vary!
    AppState.proposedSessions[themeKey] = generateSessionLineup(themeKey, true);

    persistDraftSelection();
    AudioFX.playSelectCard();
    if (AppState.statusFilter === 'selected') {
      renderCategoriesGrid();
    } else {
      updateAllVisibleCardsSelectionDOM();
    }
    renderSelectedTray();
    renderSessionSuggestions();
    showToast('⚡ تم تطبيق جلسة «' + theme.title + '» (٦ فئات متنوعة)!');
  }

  function renderSelectedTray() {
    var countBadge = document.getElementById('selected-cats-count');
    var turnHint = document.getElementById('selected-cats-turn-hint');
    var pillsContainer = document.getElementById('selected-cats-pills');
    var nextBtn = document.getElementById('btn-proceed-setup');
    var undoSelBtn = document.getElementById('btn-undo-cat-selection');
    var pickerT1Btn = document.getElementById('btn-picker-team1');
    var pickerT2Btn = document.getElementById('btn-picker-team2');

    var t1 = AppState.draftSelection.team1 || [];
    var t2 = AppState.draftSelection.team2 || [];
    var n = t1.length + t2.length;

    if (countBadge) {
      countBadge.textContent = n + ' / 6 فئات مختارة';
    }
    if (undoSelBtn) {
      undoSelBtn.disabled = !AppState.draftSelection.history || AppState.draftSelection.history.length === 0;
    }

    if (pickerT1Btn) {
      pickerT1Btn.textContent = '🛡️ الفريق ١ (' + t1.length + '/3)';
      pickerT1Btn.classList.toggle('active-team1', AppState.draftSelection.activePickerTeam === 'team1');
    }
    if (pickerT2Btn) {
      pickerT2Btn.textContent = '⚔️ الفريق ٢ (' + t2.length + '/3)';
      pickerT2Btn.classList.toggle('active-team2', AppState.draftSelection.activePickerTeam === 'team2');
    }

    if (turnHint) {
      if (n === 6) {
        turnHint.textContent = '✅ اكتمل اختيار الفئات الست (٣ لكل فريق)';
        turnHint.style.color = '#34d399';
      } else if (AppState.draftSelection.activePickerTeam === 'team1') {
        turnHint.textContent = '🛡️ يختار الآن: الفريق الأول (متبقي ' + (3 - t1.length) + ')';
        turnHint.style.color = '#38bdf8';
      } else {
        turnHint.textContent = '⚔️ يختار الآن: الفريق الثاني (متبقي ' + (3 - t2.length) + ')';
        turnHint.style.color = '#f472b6';
      }
    }

    if (nextBtn) {
      nextBtn.disabled = !(t1.length === 3 && t2.length === 3);
    }
    if (!pillsContainer) return;
    pillsContainer.textContent = '';

    if (n === 0) {
      var hint = document.createElement('span');
      hint.style.color = 'var(--text-muted)';
      hint.style.fontSize = '0.84rem';
      hint.textContent = 'اختر ٣ فئات للفريق الأول و٣ فئات للفريق الثاني (أو اختر من الجلسات المقترحة أعلاه)...';
      pillsContainer.appendChild(hint);
      return;
    }

    function appendTeamPills(teamArr, isT1) {
      teamArr.forEach(function (cid) {
        var cat = CAT_BY_ID[cid];
        if (!cat) return;
        var isLocked = !!AppState.lockedCategories[cid];
        var pill = document.createElement('span');
        pill.className = 'tray-pill ' + (isT1 ? 'team1-slot' : 'team2-slot');
        pill.setAttribute('data-pill-team', isT1 ? 'team1' : 'team2');
        pill.setAttribute('data-pill-cat-id', cid);
        var thImg = document.createElement('img');
        thImg.src = resolveImg(cat.thumbAssetId || cat.coverAssetId || cat.imageDataUri);
        thImg.alt = '';
        thImg.style.cssText = 'width:18px; height:18px; border-radius:4px; object-fit:cover; flex-shrink:0;';
        pill.appendChild(thImg);
        var txt = document.createElement('span');
        txt.textContent = (isT1 ? 'ف١: ' : 'ف٢: ') + cat.title;
        pill.appendChild(txt);

        var lockBtn = document.createElement('button');
        lockBtn.type = 'button';
        lockBtn.className = 'pill-lock-btn' + (isLocked ? ' locked' : '');
        lockBtn.title = isLocked ? 'إلغاء تثبيت الفئة' : 'تثبيت الفئة عند الاختيار العشوائي';
        lockBtn.setAttribute('aria-label', (isLocked ? 'إلغاء تثبيت ' : 'تثبيت ') + cat.title);
        lockBtn.textContent = isLocked ? '🔒' : '🔓';
        lockBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          toggleCategoryLock(cid);
        });
        pill.appendChild(lockBtn);

        var rmBtn = document.createElement('button');
        rmBtn.type = 'button';
        rmBtn.setAttribute('aria-label', 'إزالة ' + cat.title);
        rmBtn.textContent = '×';
        rmBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          delete AppState.lockedCategories[cid];
          saveToStorage(Engine.STORAGE_KEYS.LOCKED_CATEGORIES, AppState.lockedCategories);
          toggleCategorySelection(cid);
        });
        pill.appendChild(rmBtn);
        pillsContainer.appendChild(pill);
      });
    }

    appendTeamPills(t1, true);
    appendTeamPills(t2, false);
  }

  function pickRandomSixCategories() {
    pushDraftHistorySnapshot();
    var combinedSeen = Object.assign({}, AppState.playedHistory, AppState.exposedHistory);
    var recentMap = {};
    (AppState.recentSessionCats || []).slice(-12).forEach(function (cid) { recentMap[cid] = true; });

    var lockedT1 = (AppState.draftSelection.team1 || []).filter(function (cid) { return !!AppState.lockedCategories[cid] && !!CAT_BY_ID[cid]; }).slice(0, 3);
    var lockedT2 = (AppState.draftSelection.team2 || []).filter(function (cid) { return !!AppState.lockedCategories[cid] && !!CAT_BY_ID[cid] && lockedT1.indexOf(cid) === -1; }).slice(0, 3);
    var chosenMap = {};
    lockedT1.concat(lockedT2).forEach(function (cid) { chosenMap[cid] = true; });

    var allIds = DATA.categories.map(function (c) { return c.id; });
    var t1 = lockedT1.slice();
    var t2 = lockedT2.slice();

    while (t1.length < 3) {
      var p1 = pickSmartCategoryFromPool(allIds, chosenMap, combinedSeen, recentMap);
      if (!p1) break;
      t1.push(p1);
      chosenMap[p1] = true;
    }
    while (t2.length < 3) {
      var p2 = pickSmartCategoryFromPool(allIds, chosenMap, combinedSeen, recentMap);
      if (!p2) break;
      t2.push(p2);
      chosenMap[p2] = true;
    }

    AppState.draftSelection.team1 = t1;
    AppState.draftSelection.team2 = t2;
    AppState.draftSelection.activePickerTeam = 'team1';
    recordRecentSessionCategories(t1.concat(t2));
    persistDraftSelection();
    AudioFX.playSelectCard();
    if (AppState.statusFilter === 'selected') {
      renderCategoriesGrid();
    } else {
      updateAllVisibleCardsSelectionDOM();
    }
    renderSelectedTray();
    renderSessionSuggestions();
  }

  /* ========================================================================
     Two-Team Setup Screen (Colors + Up to 3 Lifelines per Team)
     ======================================================================== */
  function renderColorSwatches() {
    ['team1', 'team2'].forEach(function (teamKey) {
      var container = document.getElementById(teamKey + '-color-swatches');
      if (!container) return;
      container.textContent = '';
      var currentColor = AppState.settings[teamKey + 'Color'];
      TEAM_COLORS.forEach(function (hex) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'color-swatch' + (currentColor === hex ? ' active' : '');
        btn.style.backgroundColor = hex;
        btn.setAttribute('aria-label', 'لون ' + hex);
        btn.addEventListener('click', function () {
          AppState.settings[teamKey + 'Color'] = hex;
          saveToStorage(Engine.STORAGE_KEYS.SETTINGS, AppState.settings);
          applySettingsToDOM();
          renderColorSwatches();
        });
        container.appendChild(btn);
      });
    });
  }

  function renderLifelinePickers() {
    var maxAllowed = parseInt(String(AppState.settings.lifelinesPerTeam), 10);
    if (isNaN(maxAllowed)) maxAllowed = 3;

    ['team1', 'team2'].forEach(function (teamKey) {
      var container = document.getElementById(teamKey + '-lifelines-picker');
      if (!container) return;
      container.textContent = '';
      var propName = teamKey + 'Lifelines';
      var selectedList = Engine.sanitizeLifelineList(AppState.settings[propName], Math.max(1, maxAllowed));
      AppState.settings[propName] = selectedList;

      Object.keys(Engine.LIFELINE_CATALOG).forEach(function (llKey) {
        var meta = Engine.LIFELINE_CATALOG[llKey];
        var isChecked = maxAllowed > 0 && selectedList.indexOf(llKey) !== -1;
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'lifeline-check-card' + (isChecked ? ' checked' : '');
        btn.setAttribute('aria-pressed', isChecked ? 'true' : 'false');
        btn.title = meta.shortDesc;

        var ic = document.createElement('span');
        ic.textContent = (isChecked ? '✅ ' : '⬜ ') + meta.icon;
        var lb = document.createElement('span');
        lb.textContent = meta.title;
        btn.appendChild(ic);
        btn.appendChild(lb);

        btn.addEventListener('click', function () {
          if (maxAllowed <= 0) {
            showToast('وسائل المساعدة معطلة حالياً؛ فعّلها من قائمة الحد الأقصى لوسائل المساعدة.');
            return;
          }
          var cur = AppState.settings[propName].slice();
          var pos = cur.indexOf(llKey);
          if (pos !== -1) {
            if (cur.length <= 1) {
              showToast('يجب إبقاء وسيلة واحدة على الأقل أو تعطيل وسائل المساعدة من الإعدادات.');
              return;
            }
            cur.splice(pos, 1);
          } else {
            if (cur.length >= maxAllowed) {
              cur.shift();
            }
            cur.push(llKey);
          }
          AppState.settings[propName] = cur;
          saveToStorage(Engine.STORAGE_KEYS.SETTINGS, AppState.settings);
          renderLifelinePickers();
        });
        container.appendChild(btn);
      });
    });
  }

  function populateSetupScreen() {
    syncSetupInputsFromSettings();
    renderColorSwatches();
    renderLifelinePickers();

    var previewContainer = document.getElementById('setup-selected-cats-preview');
    if (previewContainer) {
      previewContainer.textContent = '';
      AppState.selectedCategories.forEach(function (cid, idx) {
        var cat = CAT_BY_ID[cid];
        if (!cat) return;
        var isT1 = (AppState.categoryOwners[cid] || (idx < 3 ? 'team1' : 'team2')) === 'team1';
        var item = document.createElement('div');
        item.className = 'preview-cat-mini';
        item.style.borderRight = '4px solid ' + (isT1 ? AppState.settings.team1Color : AppState.settings.team2Color);
        var thImg = document.createElement('img');
        thImg.src = resolveImg(cat.thumbAssetId || cat.coverAssetId || cat.imageDataUri);
        thImg.alt = cat.title;
        thImg.style.cssText = 'width:26px; height:26px; border-radius:6px; object-fit:cover; flex-shrink:0;';
        var tl = document.createElement('span');
        tl.textContent = cat.icon + ' ' + cat.title + (isT1 ? ' (ف١)' : ' (ف٢)');
        item.appendChild(thImg);
        item.appendChild(tl);
        previewContainer.appendChild(item);
      });
    }
  }

  function startNewMatchFromSetup(overrideCategoryIds, overrideTeamConfig) {
    var catIds = Array.isArray(overrideCategoryIds) && overrideCategoryIds.length === 6
      ? overrideCategoryIds.slice()
      : AppState.selectedCategories.slice();

    if (catIds.length !== 6) {
      showToast('يرجى اختيار 6 فئات أولاً.');
      navigateToScreen('categories');
      return;
    }

    if (Array.isArray(overrideCategoryIds) && overrideCategoryIds.length === 6) {
      AppState.draftSelection.team1 = overrideCategoryIds.slice(0, 3);
      AppState.draftSelection.team2 = overrideCategoryIds.slice(3, 6);
    }
    persistDraftSelection();

    var t1Input = document.getElementById('input-team1-name');
    var t2Input = document.getElementById('input-team2-name');
    var timerSelect = document.getElementById('select-match-timer');
    var lifelinesSelect = document.getElementById('select-lifelines-count');
    var stealSelect = document.getElementById('select-allow-steal');
    var penaltySelect = document.getElementById('select-penalty-mode');

    var t1Name = overrideTeamConfig && overrideTeamConfig.team1Name
      ? overrideTeamConfig.team1Name
      : ((t1Input && t1Input.value.trim()) ? t1Input.value.trim() : AppState.settings.team1DefaultName);
    var t2Name = overrideTeamConfig && overrideTeamConfig.team2Name
      ? overrideTeamConfig.team2Name
      : ((t2Input && t2Input.value.trim()) ? t2Input.value.trim() : AppState.settings.team2DefaultName);
    var t1Color = overrideTeamConfig && overrideTeamConfig.team1Color
      ? overrideTeamConfig.team1Color
      : AppState.settings.team1Color;
    var t2Color = overrideTeamConfig && overrideTeamConfig.team2Color
      ? overrideTeamConfig.team2Color
      : AppState.settings.team2Color;

    var timerSec = timerSelect ? parseInt(timerSelect.value, 10) : AppState.settings.timerSeconds;
    var lifelinesPerTeam = lifelinesSelect ? parseInt(lifelinesSelect.value, 10) : AppState.settings.lifelinesPerTeam;
    var allowSteal = stealSelect ? (stealSelect.value === 'true') : AppState.settings.allowSteal;
    var penaltyMode = penaltySelect ? penaltySelect.value : AppState.settings.penaltyMode;

    AppState.settings.team1DefaultName = t1Name;
    AppState.settings.team2DefaultName = t2Name;
    AppState.settings.team1Color = Engine.sanitizeColor(t1Color, Engine.DEFAULT_SETTINGS.team1Color);
    AppState.settings.team2Color = Engine.sanitizeColor(t2Color, Engine.DEFAULT_SETTINGS.team2Color);
    AppState.settings.timerSeconds = isNaN(timerSec) ? 60 : timerSec;
    AppState.settings.lifelinesPerTeam = isNaN(lifelinesPerTeam) ? 3 : lifelinesPerTeam;
    var spoilerSetupChk = document.getElementById('chk-setup-exclude-spoilers');
    if (spoilerSetupChk) {
      AppState.settings.excludeSpoilers = !!spoilerSetupChk.checked;
    }
    AppState.settings.allowSteal = allowSteal;
    AppState.settings.penaltyMode = penaltyMode;
    saveToStorage(Engine.STORAGE_KEYS.SETTINGS, AppState.settings);

    var bmSelect = document.getElementById('select-board-mode');
    var chosenBoardMode = (bmSelect && bmSelect.value === 'quick') ? 'quick' : (AppState.settings.boardMode || 'classic');
    var goldenChk = document.getElementById('chk-setup-golden-cells');
    if (goldenChk) AppState.settings.goldenCellsEnabled = !!goldenChk.checked;
    var match = Engine.createMatch({
      boardMode: chosenBoardMode,
      excludeSpoilers: !!AppState.settings.excludeSpoilers,
      goldenCellsEnabled: AppState.settings.goldenCellsEnabled !== false,
      selectedCategoryIds: AppState.selectedCategories,
      categoryOwners: AppState.categoryOwners,
      categories: DATA.categories,
      questions: DATA.questions,
      playedHistory: AppState.playedHistory,
      exposedHistory: AppState.exposedHistory,
      team1Name: t1Name,
      team2Name: t2Name,
      team1Color: AppState.settings.team1Color,
      team2Color: AppState.settings.team2Color,
      timerSeconds: AppState.settings.timerSeconds,
      lifelinesPerTeam: AppState.settings.lifelinesPerTeam,
      team1Lifelines: AppState.settings.team1Lifelines,
      team2Lifelines: AppState.settings.team2Lifelines,
      allowSteal: AppState.settings.allowSteal,
      stealTimerSeconds: AppState.settings.stealTimerSeconds,
      penaltyMode: AppState.settings.penaltyMode
    });

    if (match.poolFallbackCategories && match.poolFallbackCategories.length > 0) {
      showToast('تم استنفاد بعض الأسئلة الجديدة في (' + match.poolFallbackCategories.join('، ') + ')؛ تم تدوير الأسئلة لتكملة اللوحة.');
    }

    AppState.activeMatch = match;
    AppState.boardCategoryTab = 'all';
    saveToStorage(Engine.STORAGE_KEYS.ACTIVE_MATCH, AppState.activeMatch);
    AudioFX.playSelectCard();
    navigateToScreen('board');
  }

  /* ========================================================================
     Main 36-Question Game Board
     ======================================================================== */
  function renderTeamLifelineChips(containerEl, match, teamKey) {
    if (!containerEl) return;
    containerEl.textContent = '';
    var llEnabled = (match.settings.lifelinesPerTeam || 0) > 0;
    if (!llEnabled) {
      containerEl.textContent = '🎙️ إجابة شفهية مفتوحة (بدون وسائل مساعدة)';
      return;
    }
    var team = match.teams[teamKey];
    var keys = (team.selectedLifelines && team.selectedLifelines.length)
      ? team.selectedLifelines
      : ['show_options'];

    var row = document.createElement('span');
    row.className = 'hud-lifelines-row';
    keys.forEach(function (k) {
      var catMeta = Engine.LIFELINE_CATALOG[k];
      if (!catMeta) return;
      var itemState = team.lifelines && team.lifelines[k] ? team.lifelines[k] : { enabled: true, used: false };
      var isArmedPit = k === 'the_pit' && match.armedPitByTeam === teamKey;
      var chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'hud-ll-chip' + (itemState.used ? ' used' : '') + (isArmedPit ? ' armed' : '');
      chip.disabled = !!itemState.used;
      chip.innerHTML = '<span>' + catMeta.icon + '</span><span class="ll-chip-txt"> ' + catMeta.title + (isArmedPit ? ' (مفعّلة!)' : '') + '</span>';
      chip.title = catMeta.shortDesc;

      if (k === 'the_pit' && !itemState.used) {
        chip.addEventListener('click', function () {
          try {
            var res = Engine.armPitLifeline(match, teamKey);
            AudioFX.playLifeline();
            saveToStorage(Engine.STORAGE_KEYS.ACTIVE_MATCH, match);
            renderGameBoard();
            showToast(res.armed
              ? '🕳️ تم تفعيل «الحفرة» لـ «' + team.name + '»! اختر سؤالاً الآن.'
              : 'تم إلغاء تفعيل «الحفرة».');
          } catch (err) {
            showToast(err.message);
          }
        });
      } else if (!itemState.used) {
        chip.addEventListener('click', function () {
          showToast('تُفعّل وسيلة «' + catMeta.title + '» من داخل نافذة السؤال عند فتحه.');
        });
      }
      row.appendChild(chip);
    });
    containerEl.appendChild(row);
  }

  function renderGameBoard() {
    var match = AppState.activeMatch;
    if (!match) {
      navigateToScreen('home');
      return;
    }

    var t1Box = document.getElementById('hud-team1-box');
    var t2Box = document.getElementById('hud-team2-box');
    var t1NameEl = document.getElementById('hud-team1-name');
    var t2NameEl = document.getElementById('hud-team2-name');
    var t1ScoreEl = document.getElementById('hud-team1-score');
    var t2ScoreEl = document.getElementById('hud-team2-score');
    var t1TurnPill = document.getElementById('hud-team1-turn');
    var t2TurnPill = document.getElementById('hud-team2-turn');
    var t1LifelinesEl = document.getElementById('hud-team1-lifelines');
    var t2LifelinesEl = document.getElementById('hud-team2-lifelines');
    var progressEl = document.getElementById('board-progress-pill');
    var undoBtn = document.getElementById('btn-board-undo');

    var t1Col = Engine.sanitizeColor(match.teams.team1.color, '#0ea5e9');
    var t2Col = Engine.sanitizeColor(match.teams.team2.color, '#ec4899');

    if (t1Box) {
      t1Box.classList.toggle('active-turn', match.currentTurn === 'team1');
      t1Box.style.borderRight = '5px solid ' + t1Col;
    }
    if (t2Box) {
      t2Box.classList.toggle('active-turn', match.currentTurn === 'team2');
      t2Box.style.borderRight = '5px solid ' + t2Col;
    }
    if (t1NameEl) t1NameEl.textContent = match.teams.team1.name;
    if (t2NameEl) t2NameEl.textContent = match.teams.team2.name;
    function setAnimatedScore(el, targetScore) {
      if (!el) return;
      var prev = parseInt(el.getAttribute('data-score-val') || el.textContent || '0', 10);
      if (isNaN(prev)) prev = 0;
      el.setAttribute('data-score-val', String(targetScore));
      if (prev === targetScore) {
        el.textContent = String(targetScore);
        return;
      }
      var start = performance.now();
      var dur = 180;
      function step(now) {
        var p = Math.min(1, (now - start) / dur);
        var cur = Math.round(prev + (targetScore - prev) * p);
        el.textContent = String(cur);
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    setAnimatedScore(t1ScoreEl, match.teams.team1.score);
    setAnimatedScore(t2ScoreEl, match.teams.team2.score);
    if (t1TurnPill) t1TurnPill.style.display = match.currentTurn === 'team1' ? 'inline-block' : 'none';
    if (t2TurnPill) t2TurnPill.style.display = match.currentTurn === 'team2' ? 'inline-block' : 'none';
    var turnArrowEl = document.getElementById('hud-turn-arrow');
    if (turnArrowEl) {
      turnArrowEl.textContent = match.currentTurn === 'team1' ? '▶ ضد' : 'ضد ◀';
    }
    var armPitBtn = document.getElementById('btn-arm-pit');
    if (armPitBtn) {
      armPitBtn.classList.toggle('is-armed', !!match.armedPitByTeam);
    }

    renderTeamLifelineChips(t1LifelinesEl, match, 'team1');
    renderTeamLifelineChips(t2LifelinesEl, match, 'team2');

    if (progressEl) {
      progressEl.textContent = 'السؤال ' + match.answeredCount + ' من ' + match.totalCells;
    }
    if (undoBtn) {
      undoBtn.disabled = !match.actionHistory || match.actionHistory.length === 0;
    }

    var pitBanner = document.getElementById('pit-armed-banner');
    var pitBannerTxt = document.getElementById('pit-armed-banner-text');
    if (pitBanner) {
      if (match.armedPitByTeam && match.teams[match.armedPitByTeam]) {
        pitBanner.classList.add('visible');
        if (pitBannerTxt) {
          pitBannerTxt.textContent = '🕳️ «الحفرة» مفعّلة لصالح «' + match.teams[match.armedPitByTeam].name + '»! السؤال القادم سيخصم نقاطه من الخصم عند الفوز به.';
        }
      } else {
        pitBanner.classList.remove('visible');
      }
    }

    var activeBanner = document.getElementById('active-question-banner');
    var activeBannerMeta = document.getElementById('active-question-banner-meta');
    var activeCell = match.activeCellId ? Engine.findCell(match, match.activeCellId) : null;
    if (activeBanner) {
      if (activeCell && !activeCell.answered && activeCell.status !== 'unopened' && activeCell.status !== 'resolved') {
        var activeCol = match.columns.find(function (c) { return c.categoryId === activeCell.categoryId; });
        var statusMap = {
          answering: 'قيد الإجابة',
          paused: 'متوقف مؤقتاً',
          expired: 'انتهى الوقت وبانتظار الكشف/التحكيم',
          revealed: 'تم كشف الإجابة وبانتظار التحكيم'
        };
        activeBanner.classList.add('visible');
        if (activeBannerMeta) {
          activeBannerMeta.textContent = (activeCol ? activeCol.title : '') + ' (' + activeCell.points + ' نقطة) — ' + (statusMap[activeCell.status] || 'مفتوح');
        }
      } else {
        activeBanner.classList.remove('visible');
      }
    }

    var mobileTabs = document.getElementById('board-mobile-tabs');
    if (mobileTabs) {
      mobileTabs.textContent = '';
      var allTab = document.createElement('button');
      allTab.type = 'button';
      allTab.className = 'board-cat-tab-btn' + (AppState.boardCategoryTab === 'all' ? ' active' : '');
      allTab.textContent = 'الكل (' + match.totalCells + ')';
      allTab.addEventListener('click', function () {
        AppState.boardCategoryTab = 'all';
        renderGameBoard();
      });
      mobileTabs.appendChild(allTab);

      match.columns.forEach(function (col, cIdx) {
        var tBtn = document.createElement('button');
        tBtn.type = 'button';
        var key = String(cIdx);
        tBtn.className = 'board-cat-tab-btn' + (AppState.boardCategoryTab === key ? ' active' : '');
        var catObj = CAT_BY_ID[col.categoryId] || col;
        var tImg = document.createElement('img');
        tImg.className = 'tab-thumb';
        tImg.src = resolveImg(col.thumbAssetId || catObj.thumbAssetId || col.coverAssetId || col.imageDataUri);
        tImg.alt = '';
        tBtn.appendChild(tImg);
        var tSpan = document.createElement('span');
        tSpan.textContent = col.title;
        tBtn.appendChild(tSpan);
        tBtn.addEventListener('click', function () {
          AppState.boardCategoryTab = key;
          renderGameBoard();
        });
        mobileTabs.appendChild(tBtn);
      });
    }

    var boardGrid = document.getElementById('trivia-board-grid');
    if (!boardGrid) return;
    boardGrid.textContent = '';
    boardGrid.classList.toggle('single-cat-mode', AppState.boardCategoryTab !== 'all');

    match.columns.forEach(function (col, cIdx) {
      var colEl = document.createElement('div');
      colEl.className = 'board-column';
      if (AppState.boardCategoryTab !== 'all' && AppState.boardCategoryTab !== String(cIdx)) {
        colEl.style.display = 'none';
      }

      var headerEl = document.createElement('div');
      headerEl.className = 'board-cat-header';
      var ownerKey = col.selectedByTeam || (cIdx < 3 ? 'team1' : 'team2');
      var ownerTeamObj = match.teams[ownerKey];
      if (ownerTeamObj) {
        headerEl.style.borderBottom = '3px solid ' + Engine.sanitizeColor(ownerTeamObj.color, '#38bdf8');
      }

      var thumbDiv = document.createElement('div');
      thumbDiv.className = 'board-cat-thumb';
      var imgEl = document.createElement('img');
      imgEl.src = resolveImg(col.coverAssetId || col.imageDataUri || col.image);
      imgEl.alt = col.title;
      thumbDiv.appendChild(imgEl);

      var titleDiv = document.createElement('div');
      titleDiv.className = 'board-cat-title';
      titleDiv.textContent = col.icon + ' ' + col.title;

      headerEl.appendChild(thumbDiv);
      headerEl.appendChild(titleDiv);
      colEl.appendChild(headerEl);

      var stackEl = document.createElement('div');
      stackEl.className = 'board-cells-stack';

      col.cells.forEach(function (cell) {
        var btn = document.createElement('button');
        btn.type = 'button';
        var isInProgress = !cell.answered && cell.status && cell.status !== 'unopened' && cell.status !== 'resolved';
        var wonCls = cell.answered
          ? (cell.awardedTo === 'team1' ? ' won-team1' : (cell.awardedTo === 'team2' ? ' won-team2' : ''))
          : '';
        btn.className = 'board-cell-btn tier-' + cell.points +
          (cell.answered ? ' answered' + wonCls : '') +
          (isInProgress ? ' in-progress-cell' : '');
        btn.setAttribute('data-cell-id', cell.cellId);
        btn.disabled = !!cell.answered;

        if (cell.answered) {
          var checkSpan = document.createElement('span');
          checkSpan.textContent = cell.awardedTo === 'abandoned' ? '⊘' : '✓';
          var winnerTag = document.createElement('span');
          winnerTag.className = 'cell-winner-tag';
          if (cell.awardedTo === 'team1') winnerTag.textContent = match.teams.team1.name;
          else if (cell.awardedTo === 'team2') winnerTag.textContent = match.teams.team2.name;
          else if (cell.awardedTo === 'abandoned') winnerTag.textContent = 'ملغى';
          else winnerTag.textContent = 'لا أحد';
          btn.appendChild(checkSpan);
          btn.appendChild(winnerTag);
        } else {
          var ptsSpan = document.createElement('span');
          ptsSpan.textContent = String(cell.points);
          btn.appendChild(ptsSpan);
          if (cell.isGoldenDouble && (cell.status !== 'unopened' || AppState.settings.showGoldenHints)) {
            btn.classList.add('golden-cell-btn');
          }
          if (isInProgress) {
            var progTag = document.createElement('span');
            progTag.className = 'cell-winner-tag';
            progTag.style.color = '#ffffff';
            progTag.textContent = '⏳ استكمال';
            btn.appendChild(progTag);
          }
          btn.addEventListener('click', function () {
            openQuestionModal(cell.cellId);
          });
        }
        stackEl.appendChild(btn);
      });

      colEl.appendChild(stackEl);
      boardGrid.appendChild(colEl);
    });
  }

  /* ========================================================================
     Question Modal, 4 Lifelines, Steal/Pass, and Host Judging
     ======================================================================== */
  function clearQuestionTimerInterval() {
    if (AppState.activeQuestionModal.timerIntervalId) {
      clearInterval(AppState.activeQuestionModal.timerIntervalId);
      AppState.activeQuestionModal.timerIntervalId = null;
    }
    if (AppState.activeQuestionModal.callFriendIntervalId) {
      clearInterval(AppState.activeQuestionModal.callFriendIntervalId);
      AppState.activeQuestionModal.callFriendIntervalId = null;
    }
  }

  function openQuestionModal(cellId) {
    var match = AppState.activeMatch;
    if (!match) return;

    var opened;
    try {
      opened = Engine.openCellSession(match, cellId, Date.now());
    } catch (err) {
      showToast(err.message || 'تعذر فتح السؤال.');
      if (match.activeCellId && match.activeCellId !== cellId) {
        openQuestionModal(match.activeCellId);
      }
      return;
    }

    var q = opened.question;
    if (q && q.id) {
      AppState.exposedHistory[q.id] = true;
      saveToStorage(Engine.STORAGE_KEYS.EXPOSED_HISTORY, AppState.exposedHistory);
    }
    saveToStorage(Engine.STORAGE_KEYS.ACTIVE_MATCH, match);

    clearQuestionTimerInterval();
    AppState.activeQuestionModal.isOpen = true;
    AppState.activeQuestionModal.cellId = cellId;
    AppState.activeQuestionModal.lastAnnouncedSec = null;

    AudioFX.playOpenQuestion();
    renderQuestionModalState();
    startQuestionTimerLoop();
    openModalLayer('modal-question');
    renderGameBoard();
  }

  function renderQuestionModalState() {
    var match = AppState.activeMatch;
    var cellId = AppState.activeQuestionModal.cellId;
    if (!match || !cellId) return;

    var cell = Engine.findCell(match, cellId);
    var q = match.questionsByCell[cellId];
    if (!cell || !cell.session || !q) return;

    var s = cell.session;
    var col = match.columns.find(function (c) { return c.categoryId === q.categoryId; });

    var catPill = document.getElementById('q-modal-cat-pill');
    var ptsPill = document.getElementById('q-modal-pts-pill');
    var turnPill = document.getElementById('q-modal-turn-pill');
    var statusPill = document.getElementById('q-modal-status-pill');
    var visualWrapper = document.getElementById('q-modal-visual-wrapper');
    var visualImg = document.getElementById('q-modal-visual-img');
    var promptBox = document.getElementById('q-modal-prompt');
    var guideBanner = document.getElementById('q-open-answer-guide');
    var effectsStrip = document.getElementById('q-active-effects-strip');
    var preToolbar = document.getElementById('q-pre-reveal-toolbar');
    var lifelineBtn = document.getElementById('btn-use-lifeline');
    var twoAnsBtn = document.getElementById('btn-use-two-answers');
    var callFriendBtn = document.getElementById('btn-use-call-friend');
    var passBtn = document.getElementById('btn-pass-turn');
    var revealBtn = document.getElementById('btn-reveal-answer');
    var optionsList = document.getElementById('q-modal-options');
    var canonicalBox = document.getElementById('q-modal-canonical-box');
    var canonicalVal = document.getElementById('q-modal-canonical-answer');
    var acceptedHint = document.getElementById('q-modal-accepted-answers');
    var expBox = document.getElementById('q-modal-explanation-box');
    var expText = document.getElementById('q-modal-explanation-text');
    var expSource = document.getElementById('q-modal-source-text');
    var judgingPanel = document.getElementById('host-judging-panel');
    var awardT1Btn = document.getElementById('btn-award-team1');
    var awardT2Btn = document.getElementById('btn-award-team2');
    var penaltyRow = document.getElementById('host-penalty-row');
    var penaltySelect = document.getElementById('select-penalty-target');

    if (catPill) catPill.textContent = (col ? col.icon + ' ' + col.title : q.categoryId);
    var effPtsModal = cell.isGoldenDouble ? (q.points * 2) : q.points;
    if (ptsPill) {
      ptsPill.textContent = cell.isGoldenDouble ? ('⭐ سؤال ذهبي مضاعف: ' + effPtsModal + ' نقطة (×2)!') : (q.points + ' نقطة');
      ptsPill.classList.toggle('golden-double', !!cell.isGoldenDouble);
    }

    var answeringTeamObj = match.teams[s.answeringTeam] || match.teams[match.currentTurn];
    var selectingTeamObj = match.teams[s.selectingTeam || match.currentTurn];
    if (turnPill && answeringTeamObj) {
      turnPill.textContent = s.stealUsed
        ? ('خطف/تمرير إلى: ' + answeringTeamObj.name + ' (اختيار: ' + (selectingTeamObj ? selectingTeamObj.name : '') + ')')
        : ('يجيب الآن: ' + answeringTeamObj.name);
      turnPill.style.borderColor = Engine.sanitizeColor(answeringTeamObj.color, '#fbbf24');
    }

    if (statusPill) {
      var statusLabels = {
        answering: s.optionsShown ? 'إجابة مع الخيارات الثلاثة' : 'بانتظار الإجابة الشفهية',
        paused: 'المؤقت متوقف مؤقتاً',
        expired: 'انتهى وقت التفكير!',
        revealed: 'تم كشف الإجابة المعتمدة'
      };
      statusPill.textContent = statusLabels[cell.status] || 'سؤال نشط';
    }

    var qImgSrc = resolveImg(q.assetId || q.imageDataUri || q.image);
    var visualFrame = document.getElementById('q-modal-visual-frame');
    var revealCapEl = document.getElementById('q-modal-reveal-caption');
    if (visualWrapper && visualImg) {
      if (qImgSrc) {
        if (visualFrame && visualImg.getAttribute('data-loaded-src') !== qImgSrc) {
          visualFrame.classList.add('is-loading');
        }
        visualImg.onload = function () {
          if (visualFrame) visualFrame.classList.remove('is-loading');
          visualImg.setAttribute('data-loaded-src', qImgSrc);
        };
        visualImg.onerror = function () {
          if (visualFrame) visualFrame.classList.remove('is-loading');
          var fallbackCov = col && col.coverAssetId ? resolveImg(col.coverAssetId) : '';
          if (fallbackCov && visualImg.src !== fallbackCov) {
            visualImg.src = fallbackCov;
          }
        };
        visualImg.decoding = 'async';
        visualImg.src = qImgSrc;
        visualImg.alt = s.isRevealed
          ? (q.imageRevealCaption || q.imageAlt || 'رسم توضيحي للسؤال')
          : (q.imageAlt || 'رسم توضيحي للسؤال');
        visualWrapper.classList.add('visible');
        if (revealCapEl) {
          if (s.isRevealed && (q.imageRevealCaption || q.answer)) {
            revealCapEl.textContent = '✨ اللوحة الكاملة بعد الكشف: ' + (q.imageRevealCaption || q.answer);
            revealCapEl.classList.add('visible');
          } else {
            revealCapEl.textContent = '';
            revealCapEl.classList.remove('visible');
          }
        }
      } else {
        visualWrapper.classList.remove('visible');
        if (revealCapEl) revealCapEl.classList.remove('visible');
      }
    }
    // Preload next unopened question image on the board
    try {
      if (match && Array.isArray(match.columns)) {
        for (var pc = 0; pc < match.columns.length; pc++) {
          var pCol = match.columns[pc];
          var nextCell = pCol.cells.find(function (cl) { return !cl.answered && cl.cellId !== cellId; });
          if (nextCell && match.questionsByCell[nextCell.cellId]) {
            var nq = match.questionsByCell[nextCell.cellId];
            var nSrc = resolveImg(nq.assetId || nq.imageDataUri || nq.image);
            if (nSrc) {
              var preImg = new Image();
              preImg.decoding = 'async';
              preImg.src = nSrc;
              break;
            }
          }
        }
      }
    } catch (e) {}

    if (promptBox) promptBox.textContent = q.question;

    if (guideBanner) {
      guideBanner.style.display = (AppState.settings.showOpenAnswerHint !== false && !s.isRevealed && !s.optionsShown) ? 'block' : 'none';
    }
    renderInteractiveQuestionWidget(q, s, cell);

    // Active effects strip (Pit, Two Answers, Call a Friend)
    if (effectsStrip) {
      effectsStrip.textContent = '';
      if (s.pitArmedByTeam && match.teams[s.pitArmedByTeam]) {
        var pitPill = document.createElement('span');
        pitPill.className = 'q-effect-pill pit';
        pitPill.textContent = '🕳️ الحفرة مفعّلة لصالح «' + match.teams[s.pitArmedByTeam].name + '» (فوزهم يخصم ' + q.points + ' نقطة من الخصم!)';
        effectsStrip.appendChild(pitPill);
      }
      if (s.twoAnswersActiveFor && match.teams[s.twoAnswersActiveFor]) {
        var twoPill = document.createElement('span');
        twoPill.className = 'q-effect-pill';
        twoPill.textContent = '✌️ جوابان مفعّلة: يحق لـ «' + match.teams[s.twoAnswersActiveFor].name + '» تقديم إجابتين شفهيتين!';
        effectsStrip.appendChild(twoPill);
      }
      if (s.callFriendActiveFor && match.teams[s.callFriendActiveFor]) {
        var cfPill = document.createElement('span');
        cfPill.className = 'q-effect-pill friend';
        var cfRem = Math.ceil((s.callFriendRemainingMs || 0) / 1000);
        cfPill.textContent = '📞 اتصال بصديق لـ «' + match.teams[s.callFriendActiveFor].name + '»: ' + (cfRem > 0 ? (cfRem + ' ث متبقية') : 'انتهى وقت الاتصال');
        effectsStrip.appendChild(cfPill);
      }
      if (s.istarihActiveFor && match.teams[s.istarihActiveFor]) {
        var istPill = document.createElement('span');
        istPill.className = 'q-effect-pill';
        istPill.textContent = '🪑 استريح مفعّلة لصالح «' + match.teams[s.istarihActiveFor].name + '»: يُستبعد لاعب واحد من الفريق الخصم في هذا السؤال!';
        effectsStrip.appendChild(istPill);
      }
      if (s.fakhArmedBy && match.teams[s.fakhArmedBy]) {
        var fkhPill = document.createElement('span');
        fkhPill.className = 'q-effect-pill pit';
        fkhPill.textContent = '🪤 الفخ مفعّل من «' + match.teams[s.fakhArmedBy].name + '»: حُوّل السؤال للخصم مع عقوبة نصف النقاط إن أخفق!';
        effectsStrip.appendChild(fkhPill);
      }
    }

    if (preToolbar) {
      preToolbar.style.display = s.isRevealed ? 'none' : 'flex';
    }

    var maxLifelines = match.settings.lifelinesPerTeam || 0;
    function syncInModalLifelineBtn(btnEl, llKey, activeCheck, labelPrefix) {
      if (!btnEl || !answeringTeamObj) return;
      if (maxLifelines <= 0) {
        btnEl.style.display = 'none';
        return;
      }
      var llMap = answeringTeamObj.lifelines || {};
      var entry = llMap[llKey];
      if (!entry || !entry.enabled) {
        btnEl.style.display = 'none';
        return;
      }
      btnEl.style.display = 'inline-flex';
      if (activeCheck) {
        btnEl.disabled = true;
        btnEl.textContent = '✅ ' + labelPrefix + ' (مفعّلة)';
      } else if (cell.status === 'expired' || entry.used) {
        btnEl.disabled = true;
        btnEl.textContent = labelPrefix + (entry.used ? ' (مستخدمة)' : ' (انتهى الوقت)');
      } else {
        btnEl.disabled = false;
        btnEl.textContent = labelPrefix + ' لـ «' + answeringTeamObj.name + '»';
      }
    }

    syncInModalLifelineBtn(lifelineBtn, 'show_options', s.optionsShown, '💡 إظهار الخيارات');
    syncInModalLifelineBtn(twoAnsBtn, 'two_answers', s.twoAnswersActiveFor === s.answeringTeam, '✌️ جاوب جوابين');
    syncInModalLifelineBtn(callFriendBtn, 'call_friend', s.callFriendActiveFor === s.answeringTeam, '📞 اتصال بصديق');
    syncInModalLifelineBtn(document.getElementById('btn-use-istarih'), 'istarih', !!s.istarihActiveFor, '🪑 استريح');
    syncInModalLifelineBtn(document.getElementById('btn-use-alfakh'), 'al_fakh', !!s.fakhArmedBy, '🪤 الفخ');

    if (passBtn) {
      if (match.settings.allowSteal && !s.stealUsed && !s.isRevealed) {
        var otherTeamKey = s.answeringTeam === 'team1' ? 'team2' : 'team1';
        var otherTeamName = match.teams[otherTeamKey].name;
        passBtn.style.display = 'inline-flex';
        passBtn.disabled = false;
        passBtn.textContent = '🔄 تمرير الفرصة لـ «' + otherTeamName + '» (' + (match.settings.stealTimerSeconds || 10) + ' ث)';
      } else {
        passBtn.style.display = 'none';
      }
    }

    if (revealBtn) {
      revealBtn.style.display = s.isRevealed ? 'none' : 'inline-flex';
    }

    if (optionsList) {
      optionsList.textContent = '';
      if (s.optionsShown && Array.isArray(s.shuffledOptions)) {
        optionsList.classList.add('visible');
        var letters = ['أ', 'ب', 'ج'];
        s.shuffledOptions.forEach(function (optItem, idx) {
          var optBtn = document.createElement('button');
          optBtn.type = 'button';
          var cls = 'q-option-btn';
          if (s.selectedShuffledIndex === idx) cls += ' selected-guess';
          if (s.isRevealed) {
            cls += ' revealed';
            if (optItem.isCorrect) cls += ' correct-choice';
            else if (s.selectedShuffledIndex === idx) cls += ' wrong-guess';
          }
          optBtn.className = cls;
          optBtn.setAttribute('data-opt-idx', String(idx));

          var letSpan = document.createElement('span');
          letSpan.className = 'opt-letter';
          letSpan.textContent = letters[idx] || String(idx + 1);
          var txtSpan = document.createElement('span');
          txtSpan.textContent = optItem.text;

          optBtn.appendChild(letSpan);
          optBtn.appendChild(txtSpan);

          optBtn.addEventListener('click', function () {
            if (s.isRevealed) return;
            AudioFX.playClick();
            s.selectedShuffledIndex = idx;
            saveToStorage(Engine.STORAGE_KEYS.ACTIVE_MATCH, match);
            renderQuestionModalState();
          });
          optionsList.appendChild(optBtn);
        });
      } else {
        optionsList.classList.remove('visible');
      }
    }

    if (canonicalBox && canonicalVal && acceptedHint) {
      canonicalBox.classList.toggle('visible', !!s.isRevealed);
      canonicalVal.textContent = q.answer || q.options[q.correctAnswerIndex];
      var extraAccepted = (q.acceptedAnswers || []).filter(function (a) { return a !== q.answer; });
      if (extraAccepted.length > 0) {
        acceptedHint.style.display = 'block';
        acceptedHint.textContent = 'تُقبل أيضاً إجابات مكافئة مثل: ' + extraAccepted.join(' ، ');
      } else {
        acceptedHint.style.display = 'none';
      }
    }

    if (expBox) expBox.classList.toggle('visible', !!s.isRevealed);
    if (expText) expText.textContent = q.explanation;
    if (expSource) {
      expSource.textContent = 'المصدر المرجعي: ' + (q.sourceTitle || q.source || 'مراجع سين جيم الموثقة') + ' ';
      if (q.sourceUrl && q.sourceUrl.indexOf('http') === 0) {
        var srcLink = document.createElement('a');
        srcLink.href = q.sourceUrl;
        srcLink.target = '_blank';
        srcLink.rel = 'noopener noreferrer';
        srcLink.style.color = 'var(--accent-gold)';
        srcLink.style.textDecoration = 'underline';
        srcLink.textContent = '[رابط المصدر الموثق ↗]';
        expSource.appendChild(srcLink);
      }
    }

    if (judgingPanel) judgingPanel.classList.toggle('visible', !!s.isRevealed);
    var t1Hex = Engine.sanitizeColor(match.teams.team1.color, '#0ea5e9');
    var t2Hex = Engine.sanitizeColor(match.teams.team2.color, '#ec4899');
    if (awardT1Btn) {
      awardT1Btn.textContent = '🏆 منح ' + effPtsModal + ' نقطة لـ «' + match.teams.team1.name + '»' +
        (s.pitArmedByTeam === 'team1' ? ' (+خصم ' + effPtsModal + ' من الخصم 🕳️)' : '');
      awardT1Btn.style.background = t1Hex;
      awardT1Btn.style.borderColor = t1Hex;
    }
    if (awardT2Btn) {
      awardT2Btn.textContent = '🏆 منح ' + effPtsModal + ' نقطة لـ «' + match.teams.team2.name + '»' +
        (s.pitArmedByTeam === 'team2' ? ' (+خصم ' + effPtsModal + ' من الخصم 🕳️)' : '');
      awardT2Btn.style.background = t2Hex;
      awardT2Btn.style.borderColor = t2Hex;
    }

    if (penaltyRow && penaltySelect) {
      if (match.settings.penaltyMode && match.settings.penaltyMode !== 'none') {
        var penAmt = Engine.getPenaltyAmount(q.points, match.settings.penaltyMode);
        penaltyRow.style.display = 'flex';
        var prevVal = penaltySelect.value || 'none';
        penaltySelect.textContent = '';

        var optNone = document.createElement('option');
        optNone.value = 'none';
        optNone.textContent = 'بدون خصم نقاط';
        penaltySelect.appendChild(optNone);

        var optT1 = document.createElement('option');
        optT1.value = 'team1';
        optT1.textContent = 'خصم ' + penAmt + ' نقطة من «' + match.teams.team1.name + '»';
        penaltySelect.appendChild(optT1);

        var optT2 = document.createElement('option');
        optT2.value = 'team2';
        optT2.textContent = 'خصم ' + penAmt + ' نقطة من «' + match.teams.team2.name + '»';
        penaltySelect.appendChild(optT2);

        penaltySelect.value = ['none', 'team1', 'team2'].indexOf(prevVal) !== -1 ? prevVal : 'none';
      } else {
        penaltyRow.style.display = 'none';
      }
    }

    var smartBox = document.getElementById('q-smart-checker-box');
    var smartInput = document.getElementById('input-smart-answer-guess');
    var smartFb = document.getElementById('smart-answer-feedback');
    if (smartBox) {
      smartBox.style.display = s.isRevealed ? 'none' : 'flex';
    }
    if (smartFb && !s.lastSmartFeedback) {
      smartFb.className = 'smart-answer-feedback';
      smartFb.textContent = '';
    }
    if (smartInput && !s.lastSmartGuess) {
      smartInput.value = '';
    }
    refreshQuestionTimerBadge();
  }

  function refreshQuestionTimerBadge() {
    var match = AppState.activeMatch;
    var cellId = AppState.activeQuestionModal.cellId;
    var timerCluster = document.getElementById('q-modal-timer-cluster');
    var timerBadge = document.getElementById('q-modal-timer-badge');
    var pauseBtn = document.getElementById('btn-q-timer-pause');
    if (!timerCluster || !timerBadge || !match || !cellId) return;

    var cell = Engine.findCell(match, cellId);
    if (!cell || !cell.session) return;
    var s = cell.session;

    if (!s.timerTotalMs || s.timerTotalMs <= 0) {
      timerCluster.style.display = 'none';
      return;
    }

    timerCluster.style.display = 'flex';
    var remSec = Math.max(0, Math.ceil((s.remainingMs || 0) / 1000));

    var ringFg = document.getElementById('q-timer-ring-fg');
    var totalMs = Math.max(1000, s.timerTotalMs || 60000);
    var ratio = Math.max(0, Math.min(1, (s.remainingMs || 0) / totalMs));
    if (ringFg) {
      var circum = 94.25;
      ringFg.style.strokeDashoffset = String((1 - ratio) * circum);
      ringFg.classList.toggle('warning', remSec <= 10 || cell.status === 'expired');
    }

    if (cell.status === 'expired' || remSec <= 0) {
      timerBadge.textContent = '0 ث';
      timerBadge.classList.add('warning');
    } else {
      timerBadge.textContent = remSec + ' ث';
      timerBadge.classList.toggle('warning', remSec <= 10);
    }

    if (pauseBtn) {
      if (s.isRevealed || cell.status === 'revealed' || cell.status === 'expired') {
        pauseBtn.disabled = true;
        pauseBtn.textContent = '⏹️';
      } else {
        pauseBtn.disabled = false;
        pauseBtn.textContent = cell.status === 'paused' ? '▶️' : '⏸️';
      }
    }
  }

  function startQuestionTimerLoop() {
    clearQuestionTimerInterval();
    var match = AppState.activeMatch;
    var cellId = AppState.activeQuestionModal.cellId;
    if (!match || !cellId) return;

    var cell = Engine.findCell(match, cellId);
    if (!cell || !cell.session || cell.session.timerTotalMs <= 0) {
      refreshQuestionTimerBadge();
      return;
    }

    AppState.activeQuestionModal.timerIntervalId = setInterval(function () {
      if (!AppState.activeQuestionModal.isOpen || getTopModalId() !== 'modal-question') return;
      var c = Engine.findCell(match, cellId);
      if (!c || !c.session) return;

      if (c.session.callFriendActiveFor && c.session.callFriendRemainingMs > 0) {
        c.session.callFriendRemainingMs = Math.max(0, c.session.callFriendRemainingMs - 250);
        renderQuestionModalState();
        if (c.session.callFriendRemainingMs <= 0) {
          showToast('انتهى وقت الاتصال بصديق! يمكنك استئناف مؤقت السؤال.');
        }
      }

      Engine.syncSessionTimer(match, cellId, Date.now());
      var remSec = Math.max(0, Math.ceil((c.session.remainingMs || 0) / 1000));

      if (c.status === 'answering' && remSec <= 10 && remSec > 0 && AppState.activeQuestionModal.lastAnnouncedSec !== remSec) {
        AppState.activeQuestionModal.lastAnnouncedSec = remSec;
        AudioFX.playTick();
      }

      if (c.status === 'expired' && !c.session.expiredFired) {
        c.session.expiredFired = true;
        AudioFX.playTimeUp();
        saveToStorage(Engine.STORAGE_KEYS.ACTIVE_MATCH, match);
        renderQuestionModalState();
        return;
      }

      refreshQuestionTimerBadge();
    }, 250);
  }

  function handleActivateLifelineKey(llKey) {
    var match = AppState.activeMatch;
    var cellId = AppState.activeQuestionModal.cellId;
    if (!match || !cellId) return;
    try {
      var res = Engine.useTeamLifeline(match, cellId, null, llKey);
      if (res.activated) {
        AudioFX.playLifeline();
        saveToStorage(Engine.STORAGE_KEYS.ACTIVE_MATCH, match);
        renderQuestionModalState();
        renderGameBoard();
      }
    } catch (err) {
      showToast(err.message || 'تعذر تفعيل وسيلة المساعدة.');
    }
  }

  function handlePassTurnToOtherTeam() {
    var match = AppState.activeMatch;
    var cellId = AppState.activeQuestionModal.cellId;
    if (!match || !cellId) return;
    try {
      var res = Engine.passTurnToOtherTeam(match, cellId, Date.now());
      AppState.activeQuestionModal.lastAnnouncedSec = null;
      AudioFX.playSelectCard();
      saveToStorage(Engine.STORAGE_KEYS.ACTIVE_MATCH, match);
      renderQuestionModalState();
      startQuestionTimerLoop();
      showToast('تم تمرير الفرصة إلى «' + match.teams[res.passedTo].name + '» (' + (match.settings.stealTimerSeconds || 10) + ' ثوانٍ)!');
    } catch (err) {
      showToast(err.message || 'تعذر تمرير الفرصة.');
    }
  }

  function revealCurrentQuestionAnswer() {
    if (!AppState.activeQuestionModal.isOpen) return;
    var match = AppState.activeMatch;
    var cellId = AppState.activeQuestionModal.cellId;
    if (!match || !cellId) return;
    var cell = Engine.findCell(match, cellId);
    if (!cell || (cell.session && cell.session.isRevealed)) return;

    Engine.revealCellAnswer(match, cellId, Date.now());
    clearQuestionTimerInterval();
    saveToStorage(Engine.STORAGE_KEYS.ACTIVE_MATCH, match);
    AudioFX.playRevealAnswer();
    renderQuestionModalState();
  }

  function assignQuestionPoints(awardedTo) {
    if (!AppState.activeQuestionModal.isOpen) return;
    var match = AppState.activeMatch;
    var cellId = AppState.activeQuestionModal.cellId;
    if (!match || !cellId) return;

    var penaltySelect = document.getElementById('select-penalty-target');
    var penalizedTeam = (penaltySelect && penaltySelect.value !== 'none') ? penaltySelect.value : null;

    var q = match.questionsByCell[cellId];
    Engine.scoreCell(match, cellId, {
      awardedTo: awardedTo,
      penalizedTeam: penalizedTeam
    });

    if (q && q.id) {
      AppState.playedHistory[q.id] = true;
      AppState.exposedHistory[q.id] = true;
      saveToStorage(Engine.STORAGE_KEYS.PLAYED_HISTORY, AppState.playedHistory);
      saveToStorage(Engine.STORAGE_KEYS.EXPOSED_HISTORY, AppState.exposedHistory);
    }

    if (awardedTo !== 'abandoned') {
      AppState.globalStats.totalQuestionsAnswered = (AppState.globalStats.totalQuestionsAnswered || 0) + 1;
    }
    if (match.status === 'completed') {
      AppState.globalStats.matchesPlayed = (AppState.globalStats.matchesPlayed || 0) + 1;
    }
    saveToStorage(Engine.STORAGE_KEYS.STATS, AppState.globalStats);
    saveToStorage(Engine.STORAGE_KEYS.ACTIVE_MATCH, match);

    AudioFX.playAwardPoints();
    closeAllModals();

    if (match.status === 'completed') {
      AudioFX.playFanfare();
      navigateToScreen('results');
    } else {
      renderGameBoard();
    }
  }

  function handleAbandonActiveQuestion() {
    var match = AppState.activeMatch;
    if (!match || !match.activeCellId) return;
    var cellId = match.activeCellId;
    var q = match.questionsByCell[cellId];

    Engine.abandonCellQuestion(match, cellId);
    if (q && q.id) {
      AppState.exposedHistory[q.id] = true;
      saveToStorage(Engine.STORAGE_KEYS.EXPOSED_HISTORY, AppState.exposedHistory);
    }
    if (match.status === 'completed') {
      AppState.globalStats.matchesPlayed = (AppState.globalStats.matchesPlayed || 0) + 1;
      saveToStorage(Engine.STORAGE_KEYS.STATS, AppState.globalStats);
    }
    saveToStorage(Engine.STORAGE_KEYS.ACTIVE_MATCH, match);
    closeAllModals();
    showToast('تم إلغاء/تخطي السؤال المكشوف دون احتساب نقاط.');
    if (match.status === 'completed') {
      navigateToScreen('results');
    } else {
      renderGameBoard();
    }
  }

  function handleUndoLastScoredAction() {
    var match = AppState.activeMatch;
    if (!match) return;
    var res = Engine.undoLastAction(match);
    if (res.undone) {
      if (res.wasScoredQuestion) {
        AppState.globalStats.totalQuestionsAnswered = Math.max(0, (AppState.globalStats.totalQuestionsAnswered || 0) - 1);
      }
      if (res.wasCompletedTransition) {
        AppState.globalStats.matchesPlayed = Math.max(0, (AppState.globalStats.matchesPlayed || 0) - 1);
      }
      if (res.undoneAction && res.undoneAction.type === 'SCORE_CELL' && res.undoneAction.questionId) {
        delete AppState.playedHistory[res.undoneAction.questionId];
        saveToStorage(Engine.STORAGE_KEYS.PLAYED_HISTORY, AppState.playedHistory);
      }
      saveToStorage(Engine.STORAGE_KEYS.STATS, AppState.globalStats);
      saveToStorage(Engine.STORAGE_KEYS.ACTIVE_MATCH, match);
      if (AppState.currentScreen === 'results' && match.status !== 'completed') {
        navigateToScreen('board');
      } else if (AppState.currentScreen === 'results') {
        renderResultsScreen();
      } else {
        renderGameBoard();
      }
      var actType = res.undoneAction ? res.undoneAction.type : '';
      if (actType === 'SCORE_ADJUSTMENT') {
        showToast('↩️ تم التراجع عن تعديل النقاط اليدوي بنجاح.');
      } else if (actType === 'REJUDGE_CELL') {
        showToast('↩️ تم التراجع عن تصحيح احتساب السؤال بنجاح.');
      } else {
        showToast('↩️ تم التراجع عن آخر عملية احتساب نقاط بنجاح.');
      }
    }
  }

  function renderResultsScreen() {
    var match = AppState.activeMatch;
    if (!match) {
      navigateToScreen('home');
      return;
    }
    var res = Engine.getMatchResult(match);
    var headline = document.getElementById('results-winner-headline');
    var subline = document.getElementById('results-winner-sub');
    var t1Card = document.getElementById('results-team1-card');
    var t2Card = document.getElementById('results-team2-card');
    var adjSummary = document.getElementById('results-adjustments-summary');

    if (headline) {
      headline.textContent = res.isTie ? 'تعادل مثير بين الفريقين!' : 'الفائز: ' + res.winnerName + ' 🎉';
    }
    if (subline) {
      subline.textContent = res.isTie
        ? 'قدم الفريقان أداءً متكافئاً في جميع الجولات!'
        : 'حسم اللقب بفارق ' + res.scoreDiff + ' نقطة بعد منافسة معرفية رائعة.';
    }

    function populateTeamResultCard(cardEl, teamObj, isWinner) {
      if (!cardEl) return;
      cardEl.classList.toggle('winner', isWinner);
      cardEl.textContent = '';

      var h3 = document.createElement('h3');
      h3.textContent = teamObj.name;

      var scoreDiv = document.createElement('div');
      scoreDiv.className = 'stat-val';
      scoreDiv.style.margin = '0.4rem 0';
      scoreDiv.style.direction = 'ltr';
      scoreDiv.textContent = teamObj.score + ' نقطة';

      var corrP = document.createElement('p');
      corrP.className = 'stat-lbl';
      corrP.textContent = 'إجابات صحيحة: ' + teamObj.correctCount + ' | وسائل مساعدة مستخدمة: ' + (teamObj.lifelinesUsed || 0);

      cardEl.appendChild(h3);
      cardEl.appendChild(scoreDiv);
      cardEl.appendChild(corrP);
    }

    populateTeamResultCard(t1Card, res.team1, res.winnerId === 'team1');
    populateTeamResultCard(t2Card, res.team2, res.winnerId === 'team2');

    if (adjSummary) {
      var hist = match.actionHistory || [];
      var manualAdjs = hist.filter(function (a) { return a.type === 'SCORE_ADJUSTMENT'; });
      var rejudges = hist.filter(function (a) { return a.type === 'REJUDGE_CELL'; });
      if (manualAdjs.length > 0 || rejudges.length > 0) {
        var net1 = 0;
        var net2 = 0;
        manualAdjs.forEach(function (a) {
          if (a.teamId === 'team1') net1 += a.delta;
          if (a.teamId === 'team2') net2 += a.delta;
        });
        adjSummary.style.display = 'block';
        adjSummary.textContent = '⚖️ سجل التعديلات: ' + manualAdjs.length + ' تعديل نقاط يدوي (' +
          match.teams.team1.name + ': ' + (net1 >= 0 ? '+' + net1 : net1) + ' | ' +
          match.teams.team2.name + ': ' + (net2 >= 0 ? '+' + net2 : net2) + ') • ' +
          rejudges.length + ' عملية تصحيح احتساب سؤال.';
      } else {
        adjSummary.style.display = 'none';
      }
    }

    var analyticsGrid = document.getElementById('results-analytics-grid');
    if (analyticsGrid) {
      analyticsGrid.textContent = '';
      var goldenWon = 0;
      var stealsCount = 0;
      var catScores = {};
      (match.columns || []).forEach(function (col) {
        catScores[col.title] = 0;
        (col.cells || []).forEach(function (cl) {
          if (cl.answered && (cl.awardedTo === 'team1' || cl.awardedTo === 'team2')) {
            catScores[col.title] += (cl.effectivePoints || cl.points);
            if (cl.isGoldenDouble) goldenWon++;
            if (cl.session && cl.session.stealUsed && cl.awardedTo !== cl.selectingTeam) stealsCount++;
          }
        });
      });
      var topCat = '—';
      var topCatPts = -1;
      Object.keys(catScores).forEach(function (k) {
        if (catScores[k] > topCatPts) {
          topCatPts = catScores[k];
          topCat = k;
        }
      });
      var items = [
        { lbl: 'أقوى فئة نقاطاً', val: topCat },
        { lbl: 'الأسئلة الذهبية المحسومة', val: goldenWon + ' ⭐' },
        { lbl: 'خطف النقاط الناجح', val: stealsCount + ' 🔄' },
        { lbl: 'إجمالي الأسئلة المحسومة', val: match.answeredCount + ' / ' + match.totalCells }
      ];
      items.forEach(function (it) {
        var b = document.createElement('div');
        b.className = 'results-analytic-badge';
        var v = document.createElement('strong');
        v.style.color = 'var(--accent-gold)';
        v.style.fontSize = '0.96rem';
        v.textContent = it.val;
        var l = document.createElement('span');
        l.style.fontSize = '0.76rem';
        l.style.color = 'var(--text-secondary)';
        l.textContent = it.lbl;
        b.appendChild(v);
        b.appendChild(l);
        analyticsGrid.appendChild(b);
      });
    }
    launchVictoryConfetti();
  }

  /* ========================================================================
     Discreet Host Score Adjustment & Match History Modal Controller
     ======================================================================== */
  function openScoreAdjustModal(initialTab, preselectTeamId) {
    var match = AppState.activeMatch;
    if (!match) {
      showToast('لا توجد مباراة نشطة حالياً.');
      return;
    }
    AudioFX.playClick();
    AppState.scoreAdjustUI.activeTab = initialTab === 'history' ? 'history' : 'manual';
    if (preselectTeamId === 'team1' || preselectTeamId === 'team2') {
      AppState.scoreAdjustUI.teamId = preselectTeamId;
    }
    AppState.scoreAdjustUI.rejudgeCellId = null;
    var errEl = document.getElementById('adj-validation-error');
    if (errEl) errEl.style.display = 'none';
    var reasonInput = document.getElementById('input-adj-reason');
    if (reasonInput) reasonInput.value = '';
    syncScoreAdjustModalUI();
    openModalLayer('modal-score-adjust');
  }

  function syncScoreAdjustModalUI() {
    var match = AppState.activeMatch;
    if (!match) return;

    var tabManualBtn = document.getElementById('tab-btn-score-manual');
    var tabHistBtn = document.getElementById('tab-btn-score-history');
    var paneManual = document.getElementById('score-pane-manual');
    var paneHist = document.getElementById('score-pane-history');
    var histBadge = document.getElementById('history-count-badge');

    var isHist = AppState.scoreAdjustUI.activeTab === 'history';
    if (tabManualBtn) tabManualBtn.classList.toggle('active', !isHist);
    if (tabHistBtn) tabHistBtn.classList.toggle('active', isHist);
    if (paneManual) paneManual.classList.toggle('active', !isHist);
    if (paneHist) paneHist.classList.toggle('active', isHist);
    if (histBadge) histBadge.textContent = String((match.actionHistory || []).length);

    var btnT1 = document.getElementById('btn-adj-team1');
    var btnT2 = document.getElementById('btn-adj-team2');
    var isT1 = AppState.scoreAdjustUI.teamId !== 'team2';
    var t1Col = Engine.sanitizeColor(match.teams.team1.color, '#2563EB');
    var t2Col = Engine.sanitizeColor(match.teams.team2.color, '#C2410C');

    if (btnT1) {
      btnT1.textContent = '🛡️ ' + match.teams.team1.name + ' (' + match.teams.team1.score + ')';
      btnT1.style.borderColor = isT1 ? t1Col : '';
      btnT1.style.background = isT1 ? t1Col : '';
      btnT1.style.color = isT1 ? '#ffffff' : '';
    }
    if (btnT2) {
      btnT2.textContent = '⚔️ ' + match.teams.team2.name + ' (' + match.teams.team2.score + ')';
      btnT2.style.borderColor = !isT1 ? t2Col : '';
      btnT2.style.background = !isT1 ? t2Col : '';
      btnT2.style.color = !isT1 ? '#ffffff' : '';
    }

    var btnAdd = document.getElementById('btn-adj-mode-add');
    var btnDed = document.getElementById('btn-adj-mode-deduct');
    var isAdd = AppState.scoreAdjustUI.mode !== 'deduct';
    if (btnAdd) {
      btnAdd.style.borderColor = isAdd ? '#15803D' : '';
      btnAdd.style.background = isAdd ? '#15803D' : '';
      btnAdd.style.color = isAdd ? '#ffffff' : '';
    }
    if (btnDed) {
      btnDed.style.borderColor = !isAdd ? '#B91C1C' : '';
      btnDed.style.background = !isAdd ? '#B91C1C' : '';
      btnDed.style.color = !isAdd ? '#ffffff' : '';
    }

    var amtInput = document.getElementById('input-adj-amount');
    var rawVal = amtInput ? Number(amtInput.value) : AppState.scoreAdjustUI.amount;
    var validAmt = (Number.isFinite(rawVal) && Math.floor(rawVal) === rawVal && rawVal > 0) ? Math.trunc(rawVal) : 0;

    var presetBtns = document.querySelectorAll('[data-adj-preset]');
    for (var i = 0; i < presetBtns.length; i++) {
      var pv = parseInt(presetBtns[i].getAttribute('data-adj-preset'), 10);
      presetBtns[i].classList.toggle('active', pv === validAmt);
    }

    var selTeamObj = match.teams[isT1 ? 'team1' : 'team2'];
    var curScore = selTeamObj.score;
    var delta = isAdd ? validAmt : -validAmt;
    var projScore = curScore + delta;

    var teamLbl = document.getElementById('adj-preview-team-lbl');
    var curEl = document.getElementById('adj-preview-current');
    var deltaEl = document.getElementById('adj-preview-delta');
    var projEl = document.getElementById('adj-preview-projected');

    if (teamLbl) teamLbl.textContent = 'رصيد «' + selTeamObj.name + '» الحالي';
    if (curEl) curEl.textContent = String(curScore);
    if (deltaEl) {
      deltaEl.textContent = (delta >= 0 ? '+' : '') + String(delta);
      deltaEl.style.color = isAdd ? '#15803D' : '#B91C1C';
    }
    if (projEl) {
      projEl.textContent = String(projScore);
    }

    renderMatchHistoryList();
  }

  function handleApplyManualScoreAdjust() {
    var match = AppState.activeMatch;
    if (!match) return;
    var amtInput = document.getElementById('input-adj-amount');
    var reasonInput = document.getElementById('input-adj-reason');
    var errEl = document.getElementById('adj-validation-error');

    var rawStr = amtInput ? String(amtInput.value).trim() : '';
    var num = Number(rawStr);
    if (!rawStr || !Number.isFinite(num) || Math.floor(num) !== num || num <= 0 || num > 100000) {
      if (errEl) errEl.style.display = 'block';
      return;
    }
    if (errEl) errEl.style.display = 'none';

    try {
      var res = Engine.adjustTeamScore(match, {
        teamId: AppState.scoreAdjustUI.teamId,
        mode: AppState.scoreAdjustUI.mode,
        amount: Math.trunc(num),
        reason: reasonInput ? reasonInput.value : ''
      });
      saveToStorage(Engine.STORAGE_KEYS.ACTIVE_MATCH, match);
      AudioFX.playAwardPoints();
      if (AppState.currentScreen === 'results') {
        renderResultsScreen();
      } else {
        renderGameBoard();
      }
      syncScoreAdjustModalUI();
      closeModalLayer('modal-score-adjust');
      var tName = match.teams[res.teamId].name;
      var signStr = res.delta >= 0 ? ('+' + res.delta) : String(res.delta);
      showToast('✅ تم تعديل نقاط «' + tName + '» (' + signStr + ') — الرصيد الجديد: ' + res.newScore);
    } catch (err) {
      showToast(err.message || 'تعذر تعديل النقاط.');
    }
  }

  function openRejudgeBoxForCell(cellId) {
    var match = AppState.activeMatch;
    if (!match) return;
    var cell = Engine.findCell(match, cellId);
    if (!cell || !cell.answered) return;
    var q = match.questionsByCell[cellId];
    var col = match.columns.find(function (c) { return c.categoryId === cell.categoryId; });

    AppState.scoreAdjustUI.rejudgeCellId = cellId;
    var box = document.getElementById('rejudge-cell-box');
    var titleEl = document.getElementById('rejudge-cell-title');
    var winSel = document.getElementById('select-rejudge-winner');
    var penGroup = document.getElementById('rejudge-penalty-group');
    var penSel = document.getElementById('select-rejudge-penalty');

    if (!box || !winSel) return;
    box.style.display = 'flex';
    if (titleEl) {
      titleEl.textContent = '✏️ تصحيح احتساب سؤال: ' + (col ? col.title : '') + ' (' + cell.points + ' نقطة) — ' + (q ? q.answer : '');
    }

    winSel.textContent = '';
    [
      { val: 'team1', label: '🏆 منح ' + cell.points + ' نقطة لـ «' + match.teams.team1.name + '»' },
      { val: 'team2', label: '🏆 منح ' + cell.points + ' نقطة لـ «' + match.teams.team2.name + '»' },
      { val: 'none', label: '⚪ لا أحد (بدون نقاط)' }
    ].forEach(function (opt) {
      var o = document.createElement('option');
      o.value = opt.val;
      o.textContent = opt.label;
      winSel.appendChild(o);
    });
    winSel.value = (cell.awardedTo === 'team1' || cell.awardedTo === 'team2') ? cell.awardedTo : 'none';

    if (penGroup && penSel) {
      if (match.settings.penaltyMode && match.settings.penaltyMode !== 'none') {
        var penAmt = Engine.getPenaltyAmount(cell.points, match.settings.penaltyMode);
        penGroup.style.display = 'flex';
        penSel.textContent = '';
        [
          { val: 'none', label: 'بدون خصم عقوبة' },
          { val: 'team1', label: 'خصم ' + penAmt + ' من «' + match.teams.team1.name + '»' },
          { val: 'team2', label: 'خصم ' + penAmt + ' من «' + match.teams.team2.name + '»' }
        ].forEach(function (po) {
          var o2 = document.createElement('option');
          o2.value = po.val;
          o2.textContent = po.label;
          penSel.appendChild(o2);
        });
        penSel.value = cell.penaltyAppliedTo || 'none';
      } else {
        penGroup.style.display = 'none';
      }
    }
  }

  function handleConfirmRejudgeCell() {
    var match = AppState.activeMatch;
    var cellId = AppState.scoreAdjustUI.rejudgeCellId;
    if (!match || !cellId) return;
    var winSel = document.getElementById('select-rejudge-winner');
    var penSel = document.getElementById('select-rejudge-penalty');
    var newAward = winSel ? winSel.value : 'none';
    var newPen = (penSel && match.settings.penaltyMode !== 'none' && penSel.value !== 'none') ? penSel.value : null;

    try {
      var res = Engine.rejudgeResolvedCell(match, cellId, {
        awardedTo: newAward,
        penalizedTeam: newPen
      });
      var box = document.getElementById('rejudge-cell-box');
      if (box) box.style.display = 'none';
      AppState.scoreAdjustUI.rejudgeCellId = null;

      if (res.unchanged) {
        showToast('لم يتغير قرار الاحتساب عن النتيجة السابقة.');
        return;
      }
      saveToStorage(Engine.STORAGE_KEYS.ACTIVE_MATCH, match);
      AudioFX.playAwardPoints();
      if (AppState.currentScreen === 'results') {
        renderResultsScreen();
      } else {
        renderGameBoard();
      }
      syncScoreAdjustModalUI();
      showToast('✅ تم تصحيح احتساب السؤال وتحديث النقاط بنجاح!');
    } catch (err) {
      showToast(err.message || 'تعذر تصحيح احتساب السؤال.');
    }
  }

  function renderMatchHistoryList() {
    var listEl = document.getElementById('match-history-list');
    var match = AppState.activeMatch;
    if (!listEl || !match) return;
    listEl.textContent = '';

    var hist = (match.actionHistory || []).slice().reverse();
    if (hist.length === 0) {
      var empty = document.createElement('div');
      empty.className = 'stat-card';
      empty.textContent = 'لا توجد أحداث مسجلة في هذه المباراة بعد.';
      listEl.appendChild(empty);
      return;
    }

    hist.forEach(function (act, idx) {
      var card = document.createElement('div');
      card.className = 'history-entry-card';

      var meta = document.createElement('div');
      meta.className = 'history-entry-meta';

      var title = document.createElement('div');
      title.className = 'history-entry-title';

      var sub = document.createElement('div');
      sub.className = 'history-entry-sub';

      if (act.type === 'SCORE_ADJUSTMENT') {
        var tName = match.teams[act.teamId] ? match.teams[act.teamId].name : act.teamId;
        var sign = act.delta >= 0 ? ('+' + act.delta) : String(act.delta);
        title.textContent = '⚖️ تعديل نقاط يدوي: «' + tName + '» (' + sign + ' نقطة)';
        sub.textContent = 'السبب: ' + (act.reason || 'تعديل يدوي') + ' • الرصيد: ' + act.prevTeam1Score + '/' + act.prevTeam2Score + ' ⬅️ ' + act.newTeam1Score + '/' + act.newTeam2Score;
      } else if (act.type === 'REJUDGE_CELL') {
        var rCol = match.columns.find(function (c) {
          return c.cells.some(function (cl) { return cl.cellId === act.cellId; });
        });
        var newWinName = act.awardedTo === 'team1' ? match.teams.team1.name : (act.awardedTo === 'team2' ? match.teams.team2.name : 'لا أحد');
        title.textContent = '✏️ تصحيح احتساب سؤال: ' + (rCol ? rCol.title : '') + ' (' + act.points + ' نقطة)';
        sub.textContent = 'الفائز بعد التصحيح: ' + newWinName + ' • النتيجة: ' + act.newTeam1Score + ' - ' + act.newTeam2Score;
      } else {
        var sCol = match.columns.find(function (c) {
          return c.cells.some(function (cl) { return cl.cellId === act.cellId; });
        });
        var curCell = Engine.findCell(match, act.cellId);
        var curWinner = curCell ? curCell.awardedTo : act.awardedTo;
        var winLabel = curWinner === 'team1' ? match.teams.team1.name : (curWinner === 'team2' ? match.teams.team2.name : (curWinner === 'abandoned' ? 'ملغى' : 'لا أحد'));
        title.textContent = (act.type === 'ABANDON_CELL' ? '🚫 إلغاء سؤال: ' : '🏆 حسم سؤال: ') + (sCol ? sCol.title : '') + ' (' + act.points + ' نقطة)';
        sub.textContent = 'الفائز المحتسب حالياً: ' + winLabel;
      }

      meta.appendChild(title);
      meta.appendChild(sub);
      card.appendChild(meta);

      if (act.cellId) {
        var targetCell = Engine.findCell(match, act.cellId);
        if (targetCell && targetCell.answered && targetCell.status === 'resolved') {
          var editBtn = document.createElement('button');
          editBtn.type = 'button';
          editBtn.className = 'icon-btn';
          editBtn.style.minHeight = '36px';
          editBtn.style.fontSize = '0.78rem';
          editBtn.textContent = '✏️ تصحيح الاحتساب';
          editBtn.addEventListener('click', function () {
            openRejudgeBoxForCell(act.cellId);
          });
          card.appendChild(editBtn);
        }
      }

      listEl.appendChild(card);
    });
  }

  function openVisualLightbox() {
    var visualImg = document.getElementById('q-modal-visual-img');
    var lbImg = document.getElementById('lightbox-img');
    var lbCap = document.getElementById('lightbox-caption');
    if (!visualImg || !visualImg.src || !lbImg) return;
    if (visualImg.style.visibility === 'hidden') {
      showToast('الصورة مخفية حالياً في تحدي الذاكرة (ركز شوي)؛ ستظهر بعد كشف الإجابة!');
      return;
    }

    lbImg.src = visualImg.src;
    lbImg.alt = visualImg.alt || 'معاينة مكبرة';
    // Preserve anti-spoiler blur if in progressive_clarity mode before reveal
    lbImg.style.filter = visualImg.style.filter || 'none';
    setLightboxZoom(1, true);
    if (lbCap) {
      lbCap.textContent = '🔍 ' + (visualImg.alt || 'معاينة الصورة (اسحب أو كبّر بإصبعين)');
    }
    openModalLayer('modal-image-lightbox');
  }

  /* ========================================================================
     Local Question Issue Reporting (VAR)
     ======================================================================== */
  function openReportIssueModal() {
    var match = AppState.activeMatch;
    var cellId = AppState.activeQuestionModal.cellId;
    if (!match || !cellId) return;
    var q = match.questionsByCell[cellId];
    if (!q) return;
    var metaEl = document.getElementById('report-issue-q-meta');
    var noteInput = document.getElementById('input-issue-note');
    if (metaEl) {
      metaEl.textContent = 'السؤال (' + q.points + ' نقطة) — ' + q.question.slice(0, 65) + '...';
    }
    if (noteInput) noteInput.value = '';
    openModalLayer('modal-report-issue');
  }

  function submitQuestionIssueReport() {
    var match = AppState.activeMatch;
    var cellId = AppState.activeQuestionModal.cellId;
    if (!match || !cellId) return;
    var q = match.questionsByCell[cellId];
    if (!q) return;

    var typeSel = document.getElementById('select-issue-type');
    var noteInput = document.getElementById('input-issue-note');
    var reportEntry = {
      reportId: 'rep_' + Date.now(),
      reportedAt: new Date().toISOString(),
      questionId: q.id,
      categoryId: q.categoryId,
      points: q.points,
      questionPrompt: q.question,
      canonicalAnswer: q.answer,
      issueType: typeSel ? typeSel.value : 'other',
      note: (noteInput && noteInput.value.trim()) ? noteInput.value.trim() : 'بدون ملاحظة نصية'
    };
    AppState.questionReports.push(reportEntry);
    saveToStorage(Engine.STORAGE_KEYS.QUESTION_REPORTS, AppState.questionReports);
    applySettingsToDOM();
    closeModalLayer('modal-report-issue');
    showToast('🚩 تم حفظ بلاغ مراجعة السؤال (' + q.id + ') محلياً بنجاح!');
  }

  function exportQuestionIssueReportsJSON() {
    if (!AppState.questionReports || AppState.questionReports.length === 0) {
      showToast('لا توجد بلاغات أسئلة مسجلة حالياً.');
      return;
    }
    var jsonStr = JSON.stringify({
      app: 'Seen Jeem v3 — Question Issue Reports',
      exportedAt: new Date().toISOString(),
      totalReports: AppState.questionReports.length,
      reports: AppState.questionReports
    }, null, 2);
    var blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'seen-jeem-question-reports-' + Date.now() + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
    showToast('تم تصدير سجل بلاغات الأسئلة بنجاح.');
  }

  function toggleFullscreen() {
    var doc = window.document;
    var docEl = doc.documentElement;

    var requestFull = docEl.requestFullscreen || docEl.webkitRequestFullscreen || docEl.msRequestFullscreen;
    var exitFull = doc.exitFullscreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
    var isFull = doc.fullscreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement;

    if (!requestFull) {
      showToast('متصفحك الحالي لا يدعم واجهة ملء الشاشة البرمجية؛ تم تفعيل التمدد الكامل المتوافق تلقائياً.');
      return;
    }

    if (!isFull) {
      try {
        var promise = requestFull.call(docEl);
        if (promise && promise.catch) {
          promise.catch(function () {
            showToast('تعذر تفعيل ملء الشاشة في هذا الإطار؛ يمكنك فتح اللعبة في نافذة مستقلة.');
          });
        }
      } catch (e) {
        showToast('تعذر تفعيل ملء الشاشة.');
      }
    } else if (exitFull) {
      try { exitFull.call(doc); } catch (e) {}
    }
  }

  function exportCurrentMatchJSON() {
    if (!AppState.activeMatch) {
      showToast('لا توجد مباراة نشطة حالياً لتصديرها.');
      return;
    }
    var payload = {
      app: 'سين جيم — تحدي المعرفة',
      schemaVersion: Engine.SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      matchState: AppState.activeMatch,
      playedHistory: AppState.playedHistory,
      exposedHistory: AppState.exposedHistory
    };
    var jsonStr = JSON.stringify(payload, null, 2);
    var blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'seen-jeem-match-' + Date.now() + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
    showToast('تم تصدير ملف حالة المباراة وسجل الأسئلة بنجاح.');
  }

  function handleImportMatchFile(file) {
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (evt) {
      try {
        var parsed = JSON.parse(evt.target.result);
        var check = Engine.validateImportedMatchState(parsed, CAT_BY_ID);
        if (!check.valid) {
          showToast('خطأ في استيراد الملف: ' + check.error);
          return;
        }
        AppState.activeMatch = check.matchState;
        Object.assign(AppState.playedHistory, check.playedHistory);
        Object.assign(AppState.exposedHistory, check.exposedHistory);
        var impT1 = [];
        var impT2 = [];
        (AppState.activeMatch.columns || []).forEach(function (col, idx) {
          if (col.selectedByTeam === 'team2' || (col.selectedByTeam !== 'team1' && idx >= 3)) {
            if (impT2.length < 3) impT2.push(col.categoryId);
          } else {
            if (impT1.length < 3) impT1.push(col.categoryId);
          }
        });
        if (impT1.length + impT2.length !== 6) {
          impT1 = check.selectedCategories.slice(0, 3);
          impT2 = check.selectedCategories.slice(3, 6);
        }
        AppState.draftSelection.team1 = impT1;
        AppState.draftSelection.team2 = impT2;
        persistDraftSelection();

        AppState.settings.team1DefaultName = AppState.activeMatch.teams.team1.name;
        AppState.settings.team2DefaultName = AppState.activeMatch.teams.team2.name;
        AppState.settings.team1Color = AppState.activeMatch.teams.team1.color;
        AppState.settings.team2Color = AppState.activeMatch.teams.team2.color;

        saveToStorage(Engine.STORAGE_KEYS.ACTIVE_MATCH, AppState.activeMatch);
        saveToStorage(Engine.STORAGE_KEYS.PLAYED_HISTORY, AppState.playedHistory);
        saveToStorage(Engine.STORAGE_KEYS.EXPOSED_HISTORY, AppState.exposedHistory);
        saveToStorage(Engine.STORAGE_KEYS.SELECTED_CATEGORIES, AppState.selectedCategories);
        saveToStorage(Engine.STORAGE_KEYS.SETTINGS, AppState.settings);

        applySettingsToDOM();
        syncSetupInputsFromSettings();
        renderHomeStats();
        showToast('تم استيراد المباراة وسجل الأسئلة واستعادتها بنجاح!');
        navigateToScreen(AppState.activeMatch.status === 'completed' ? 'results' : 'board');
      } catch (err) {
        showToast('ملف البيانات غير صالح أو تالف.');
      }
    };
    reader.readAsText(file);
  }

  function bindGlobalEvents() {
    var brandCluster = document.getElementById('nav-brand-home');
    if (brandCluster) {
      brandCluster.addEventListener('click', function () {
        AudioFX.playClick();
        navigateToScreen('home');
      });
      brandCluster.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          AudioFX.playClick();
          navigateToScreen('home');
        }
      });
    }

    var homeLightningBtn = document.getElementById('btn-home-lightning');
    if (homeLightningBtn) {
      homeLightningBtn.addEventListener('click', function () {
        AudioFX.playSelectCard();
        openLightningChallengeModal();
      });
    }
    var closeLightningBtn = document.getElementById('btn-close-lightning');
    if (closeLightningBtn) {
      closeLightningBtn.addEventListener('click', function () {
        LightningState.active = false;
        stopLightningTimer();
        closeModalLayer('modal-lightning');
      });
    }
    var restartLightningBtn = document.getElementById('btn-lt-restart');
    if (restartLightningBtn) {
      restartLightningBtn.addEventListener('click', function () {
        AudioFX.playSelectCard();
        startNewLightningRound();
      });
    }
    var checkSmartBtn = document.getElementById('btn-check-smart-answer');
    var smartGuessInput = document.getElementById('input-smart-answer-guess');
    if (checkSmartBtn) {
      checkSmartBtn.addEventListener('click', checkSmartWrittenAnswer);
    }
    if (smartGuessInput) {
      smartGuessInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          checkSmartWrittenAnswer();
        }
      });
    }

    var startPlayBtn = document.getElementById('btn-home-start');
    if (startPlayBtn) {
      startPlayBtn.addEventListener('click', function () {
        AudioFX.playSelectCard();
        navigateToScreen('categories');
      });
    }

    var resumeBtn = document.getElementById('btn-resume-match');
    if (resumeBtn) {
      resumeBtn.addEventListener('click', function () {
        AudioFX.playSelectCard();
        navigateToScreen('board');
      });
    }

    var howToBtn = document.getElementById('btn-open-howto');
    if (howToBtn) {
      howToBtn.addEventListener('click', function () {
        AudioFX.playClick();
        openModalLayer('modal-howto');
      });
    }

    var openSettingsBtn = document.getElementById('btn-open-settings');
    if (openSettingsBtn) {
      openSettingsBtn.addEventListener('click', function () {
        AudioFX.playClick();
        syncSettingsModalUI();
        openModalLayer('modal-settings');
      });
    }

    var fsBtn = document.getElementById('btn-toggle-fullscreen');
    if (fsBtn) {
      fsBtn.addEventListener('click', toggleFullscreen);
    }

    var themeBtn = document.getElementById('btn-toggle-theme');
    if (themeBtn) {
      themeBtn.addEventListener('click', function () {
        AppState.settings.theme = AppState.settings.theme === 'light' ? 'dark' : 'light';
        saveToStorage(Engine.STORAGE_KEYS.SETTINGS, AppState.settings);
        applySettingsToDOM();
      });
    }

    var searchInput = document.getElementById('input-search-categories');
    if (searchInput) {
      searchInput.addEventListener('input', function (e) {
        AppState.searchQuery = e.target.value;
        renderCategoriesGrid();
      });
    }

    var randomCatsBtn = document.getElementById('btn-random-categories');
    if (randomCatsBtn) {
      randomCatsBtn.addEventListener('click', pickRandomSixCategories);
    }

    var clearCatsBtn = document.getElementById('btn-clear-categories');
    if (clearCatsBtn) {
      clearCatsBtn.addEventListener('click', function () {
        if (AppState.selectedCategories.length === 0) return;
        pushDraftHistorySnapshot();
        AppState.draftSelection.team1 = [];
        AppState.draftSelection.team2 = [];
        AppState.lockedCategories = {};
        saveToStorage(Engine.STORAGE_KEYS.LOCKED_CATEGORIES, AppState.lockedCategories);
        AppState.draftSelection.activePickerTeam = 'team1';
        persistDraftSelection();
        if (AppState.statusFilter === 'selected') {
          renderCategoriesGrid();
        } else {
          updateAllVisibleCardsSelectionDOM();
        }
        renderSelectedTray();
      });
    }

    var undoCatSelBtn = document.getElementById('btn-undo-cat-selection');
    if (undoCatSelBtn) {
      undoCatSelBtn.addEventListener('click', undoLastCategorySelection);
    }

    var pickerT1Btn = document.getElementById('btn-picker-team1');
    if (pickerT1Btn) {
      pickerT1Btn.addEventListener('click', function () {
        AudioFX.playClick();
        AppState.draftSelection.activePickerTeam = 'team1';
        persistDraftSelection();
        renderSelectedTray();
      });
    }

    var pickerT2Btn = document.getElementById('btn-picker-team2');
    if (pickerT2Btn) {
      pickerT2Btn.addEventListener('click', function () {
        AudioFX.playClick();
        AppState.draftSelection.activePickerTeam = 'team2';
        persistDraftSelection();
        renderSelectedTray();
      });
    }

    var clearT1Btn = document.getElementById('btn-clear-team1');
    if (clearT1Btn) {
      clearT1Btn.addEventListener('click', function () {
        if (AppState.draftSelection.team1.length === 0) return;
        pushDraftHistorySnapshot();
        AppState.draftSelection.team1 = [];
        AppState.draftSelection.activePickerTeam = 'team1';
        persistDraftSelection();
        updateAllVisibleCardsSelectionDOM();
        renderSelectedTray();
      });
    }

    var clearT2Btn = document.getElementById('btn-clear-team2');
    if (clearT2Btn) {
      clearT2Btn.addEventListener('click', function () {
        if (AppState.draftSelection.team2.length === 0) return;
        pushDraftHistorySnapshot();
        AppState.draftSelection.team2 = [];
        AppState.draftSelection.activePickerTeam = 'team2';
        persistDraftSelection();
        updateAllVisibleCardsSelectionDOM();
        renderSelectedTray();
      });
    }

    var refreshSessionsBtn = document.getElementById('btn-refresh-sessions');
    if (refreshSessionsBtn) {
      refreshSessionsBtn.addEventListener('click', refreshSessionSuggestions);
    }

    var filterDrawerBtn = document.getElementById('btn-toggle-filter-drawer');
    var filterSecRow = document.getElementById('filter-secondary-row');
    if (filterDrawerBtn && filterSecRow) {
      filterDrawerBtn.addEventListener('click', function () {
        AudioFX.playClick();
        AppState.filterDrawerOpen = !AppState.filterDrawerOpen;
        filterSecRow.style.display = AppState.filterDrawerOpen ? 'flex' : 'none';
        filterDrawerBtn.setAttribute('aria-expanded', AppState.filterDrawerOpen ? 'true' : 'false');
      });
    }

    var tvSubBtns = document.querySelectorAll('[data-tv-sub]');
    for (var tvIdx = 0; tvIdx < tvSubBtns.length; tvIdx++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          AudioFX.playClick();
          AppState.tvSubgroupFilter = btn.getAttribute('data-tv-sub') || 'all';
          renderGroupTabs();
          renderCategoriesGrid();
        });
      })(tvSubBtns[tvIdx]);
    }

    var modalCatLockBtn = document.getElementById('btn-modal-cat-toggle-lock');
    if (modalCatLockBtn) {
      modalCatLockBtn.addEventListener('click', function () {
        if (AppState.activeDetailsCatId) {
          toggleCategoryLock(AppState.activeDetailsCatId);
        }
      });
    }

    var statusFilterBtns = document.querySelectorAll('[data-status-filter]');
    for (var sIdx = 0; sIdx < statusFilterBtns.length; sIdx++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          AudioFX.playClick();
          AppState.statusFilter = btn.getAttribute('data-status-filter') || 'all';
          renderGroupTabs();
          renderCategoriesGrid();
        });
      })(statusFilterBtns[sIdx]);
    }

    var sortCatsSelect = document.getElementById('select-sort-categories');
    if (sortCatsSelect) {
      sortCatsSelect.addEventListener('change', function (e) {
        AppState.sortBy = e.target.value || 'default';
        renderCategoriesGrid();
      });
    }

    var clearSearchBtn = document.getElementById('btn-clear-search');
    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', function () {
        AppState.searchQuery = '';
        var sInp = document.getElementById('input-search-categories');
        if (sInp) sInp.value = '';
        renderCategoriesGrid();
      });
    }

    var modalCatSelBtn = document.getElementById('btn-modal-cat-toggle-select');
    if (modalCatSelBtn) {
      modalCatSelBtn.addEventListener('click', function () {
        if (AppState.activeDetailsCatId) {
          toggleCategorySelection(AppState.activeDetailsCatId);
          syncCategoryDetailsModalButtons();
        }
      });
    }

    var modalCatFavBtn = document.getElementById('btn-modal-cat-toggle-fav');
    if (modalCatFavBtn) {
      modalCatFavBtn.addEventListener('click', function () {
        if (AppState.activeDetailsCatId) {
          var cardEl = document.querySelector('.cat-card[data-cat-id="' + AppState.activeDetailsCatId + '"] .cat-card-fav-btn');
          toggleCategoryFavorite(AppState.activeDetailsCatId, cardEl);
        }
      });
    }

    var proceedSetupBtn = document.getElementById('btn-proceed-setup');
    if (proceedSetupBtn) {
      proceedSetupBtn.addEventListener('click', function () {
        if (AppState.selectedCategories.length === 6) {
          AudioFX.playSelectCard();
          navigateToScreen('setup');
        }
      });
    }

    var backCatsBtn = document.getElementById('btn-back-to-categories');
    if (backCatsBtn) {
      backCatsBtn.addEventListener('click', function () {
        navigateToScreen('categories');
      });
    }

    var lifelinesCountSelect = document.getElementById('select-lifelines-count');
    if (lifelinesCountSelect) {
      lifelinesCountSelect.addEventListener('change', function (e) {
        AppState.settings.lifelinesPerTeam = parseInt(e.target.value, 10);
        renderLifelinePickers();
      });
    }

    var launchMatchBtn = document.getElementById('btn-launch-match');
    if (launchMatchBtn) {
      launchMatchBtn.addEventListener('click', function () {
        startNewMatchFromSetup();
      });
    }

    var switchTurnBtn = document.getElementById('btn-switch-turn');
    if (switchTurnBtn) {
      switchTurnBtn.addEventListener('click', function () {
        if (!AppState.activeMatch) return;
        if (AppState.activeMatch.activeCellId) {
          var openCell = Engine.findCell(AppState.activeMatch, AppState.activeMatch.activeCellId);
          if (openCell && !openCell.answered && openCell.status !== 'unopened' && openCell.status !== 'resolved') {
            showToast('لا يمكن تبديل الدور يدوياً أثناء وجود سؤال مفتوح قيد اللعب.');
            return;
          }
        }
        AppState.activeMatch.currentTurn = AppState.activeMatch.currentTurn === 'team1' ? 'team2' : 'team1';
        saveToStorage(Engine.STORAGE_KEYS.ACTIVE_MATCH, AppState.activeMatch);
        renderGameBoard();
      });
    }

    var cancelPitBtn = document.getElementById('btn-cancel-armed-pit');
    if (cancelPitBtn) {
      cancelPitBtn.addEventListener('click', function () {
        if (!AppState.activeMatch) return;
        AppState.activeMatch.armedPitByTeam = null;
        saveToStorage(Engine.STORAGE_KEYS.ACTIVE_MATCH, AppState.activeMatch);
        renderGameBoard();
      });
    }

    var undoBtn = document.getElementById('btn-board-undo');
    if (undoBtn) {
      undoBtn.addEventListener('click', handleUndoLastScoredAction);
    }

    var resultsUndoBtn = document.getElementById('btn-results-undo');
    if (resultsUndoBtn) {
      resultsUndoBtn.addEventListener('click', handleUndoLastScoredAction);
    }

    var openScoreAdjBtn = document.getElementById('btn-open-score-adjust');
    if (openScoreAdjBtn) {
      openScoreAdjBtn.addEventListener('click', function () {
        openScoreAdjustModal('manual', AppState.activeMatch ? AppState.activeMatch.currentTurn : 'team1');
      });
    }
    var quickAdjT1 = document.getElementById('btn-quick-adjust-team1');
    if (quickAdjT1) {
      quickAdjT1.addEventListener('click', function () {
        openScoreAdjustModal('manual', 'team1');
      });
    }
    var quickAdjT2 = document.getElementById('btn-quick-adjust-team2');
    if (quickAdjT2) {
      quickAdjT2.addEventListener('click', function () {
        openScoreAdjustModal('manual', 'team2');
      });
    }
    var boardHistBtn = document.getElementById('btn-board-history');
    if (boardHistBtn) {
      boardHistBtn.addEventListener('click', function () {
        openScoreAdjustModal('history');
      });
    }
    var resultsHistBtn = document.getElementById('btn-results-open-history');
    if (resultsHistBtn) {
      resultsHistBtn.addEventListener('click', function () {
        openScoreAdjustModal('history');
      });
    }

    var scoreTabBtns = document.querySelectorAll('[data-score-tab]');
    for (var stIdx = 0; stIdx < scoreTabBtns.length; stIdx++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          AudioFX.playClick();
          AppState.scoreAdjustUI.activeTab = btn.getAttribute('data-score-tab') || 'manual';
          syncScoreAdjustModalUI();
        });
      })(scoreTabBtns[stIdx]);
    }

    var adjT1Btn = document.getElementById('btn-adj-team1');
    if (adjT1Btn) {
      adjT1Btn.addEventListener('click', function () {
        AudioFX.playClick();
        AppState.scoreAdjustUI.teamId = 'team1';
        syncScoreAdjustModalUI();
      });
    }
    var adjT2Btn = document.getElementById('btn-adj-team2');
    if (adjT2Btn) {
      adjT2Btn.addEventListener('click', function () {
        AudioFX.playClick();
        AppState.scoreAdjustUI.teamId = 'team2';
        syncScoreAdjustModalUI();
      });
    }
    var adjAddBtn = document.getElementById('btn-adj-mode-add');
    if (adjAddBtn) {
      adjAddBtn.addEventListener('click', function () {
        AudioFX.playClick();
        AppState.scoreAdjustUI.mode = 'add';
        syncScoreAdjustModalUI();
      });
    }
    var adjDedBtn = document.getElementById('btn-adj-mode-deduct');
    if (adjDedBtn) {
      adjDedBtn.addEventListener('click', function () {
        AudioFX.playClick();
        AppState.scoreAdjustUI.mode = 'deduct';
        syncScoreAdjustModalUI();
      });
    }

    var adjPresetBtns = document.querySelectorAll('[data-adj-preset]');
    for (var apIdx = 0; apIdx < adjPresetBtns.length; apIdx++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          AudioFX.playClick();
          var val = parseInt(btn.getAttribute('data-adj-preset'), 10) || 200;
          AppState.scoreAdjustUI.amount = val;
          var inp = document.getElementById('input-adj-amount');
          if (inp) inp.value = String(val);
          var errEl = document.getElementById('adj-validation-error');
          if (errEl) errEl.style.display = 'none';
          syncScoreAdjustModalUI();
        });
      })(adjPresetBtns[apIdx]);
    }

    var adjAmtInput = document.getElementById('input-adj-amount');
    if (adjAmtInput) {
      adjAmtInput.addEventListener('input', function () {
        syncScoreAdjustModalUI();
      });
    }

    var confirmScoreAdjBtn = document.getElementById('btn-confirm-score-adjust');
    if (confirmScoreAdjBtn) {
      confirmScoreAdjBtn.addEventListener('click', handleApplyManualScoreAdjust);
    }

    var cancelRejudgeBtn = document.getElementById('btn-cancel-rejudge');
    if (cancelRejudgeBtn) {
      cancelRejudgeBtn.addEventListener('click', function () {
        var box = document.getElementById('rejudge-cell-box');
        if (box) box.style.display = 'none';
        AppState.scoreAdjustUI.rejudgeCellId = null;
      });
    }
    var confirmRejudgeBtn = document.getElementById('btn-confirm-rejudge');
    if (confirmRejudgeBtn) {
      confirmRejudgeBtn.addEventListener('click', handleConfirmRejudgeCell);
    }

    var bannerResumeBtn = document.getElementById('btn-banner-resume-question');
    if (bannerResumeBtn) {
      bannerResumeBtn.addEventListener('click', function () {
        if (AppState.activeMatch && AppState.activeMatch.activeCellId) {
          openQuestionModal(AppState.activeMatch.activeCellId);
        }
      });
    }

    var bannerAbandonBtn = document.getElementById('btn-banner-abandon-question');
    if (bannerAbandonBtn) {
      bannerAbandonBtn.addEventListener('click', handleAbandonActiveQuestion);
    }

    var exportBtn = document.getElementById('btn-export-match');
    if (exportBtn) {
      exportBtn.addEventListener('click', exportCurrentMatchJSON);
    }

    var importTriggerBtn = document.getElementById('btn-import-match-trigger');
    var importFileInput = document.getElementById('input-import-match-file');
    if (importTriggerBtn && importFileInput) {
      importTriggerBtn.addEventListener('click', function () {
        importFileInput.click();
      });
      importFileInput.addEventListener('change', function (e) {
        if (e.target.files && e.target.files[0]) {
          handleImportMatchFile(e.target.files[0]);
          e.target.value = '';
        }
      });
    }

    var boardHomeBtn = document.getElementById('btn-board-home');
    if (boardHomeBtn) {
      boardHomeBtn.addEventListener('click', function () {
        navigateToScreen('home');
      });
    }

    // Question Modal Lifeline & Action Controls
    var lifelineBtn = document.getElementById('btn-use-lifeline');
    if (lifelineBtn) {
      lifelineBtn.addEventListener('click', function () { handleActivateLifelineKey('show_options'); });
    }
    var twoAnsBtn = document.getElementById('btn-use-two-answers');
    if (twoAnsBtn) {
      twoAnsBtn.addEventListener('click', function () { handleActivateLifelineKey('two_answers'); });
    }
    var callFriendBtn = document.getElementById('btn-use-call-friend');
    if (callFriendBtn) {
      callFriendBtn.addEventListener('click', function () { handleActivateLifelineKey('call_friend'); });
    }

    var passTurnBtn = document.getElementById('btn-pass-turn');
    if (passTurnBtn) {
      passTurnBtn.addEventListener('click', handlePassTurnToOtherTeam);
    }

    var revealBtn = document.getElementById('btn-reveal-answer');
    if (revealBtn) {
      revealBtn.addEventListener('click', revealCurrentQuestionAnswer);
    }

    var pauseTimerBtn = document.getElementById('btn-q-timer-pause');
    if (pauseTimerBtn) {
      pauseTimerBtn.addEventListener('click', function () {
        var match = AppState.activeMatch;
        var cellId = AppState.activeQuestionModal.cellId;
        if (!match || !cellId) return;
        Engine.pauseCellTimer(match, cellId, Date.now());
        saveToStorage(Engine.STORAGE_KEYS.ACTIVE_MATCH, match);
        renderQuestionModalState();
      });
    }

    var openReportBtn = document.getElementById('btn-open-report-issue');
    if (openReportBtn) {
      openReportBtn.addEventListener('click', openReportIssueModal);
    }

    var submitReportBtn = document.getElementById('btn-submit-issue-report');
    if (submitReportBtn) {
      submitReportBtn.addEventListener('click', submitQuestionIssueReport);
    }

    var exportReportsBtn = document.getElementById('btn-export-issue-reports');
    if (exportReportsBtn) {
      exportReportsBtn.addEventListener('click', exportQuestionIssueReportsJSON);
    }

    var closeQModalBtn = document.getElementById('btn-close-q-modal');
    if (closeQModalBtn) {
      closeQModalBtn.addEventListener('click', function () {
        closeModalLayer('modal-question');
      });
    }

    var visualFrame = document.getElementById('q-modal-visual-frame');
    var zoomBtn = document.getElementById('btn-zoom-visual');
    var closeLightboxBtn = document.getElementById('btn-close-lightbox');
    if (visualFrame) {
      visualFrame.addEventListener('click', openVisualLightbox);
      visualFrame.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openVisualLightbox();
        }
      });
    }
    if (zoomBtn) {
      zoomBtn.addEventListener('click', openVisualLightbox);
    }
    if (closeLightboxBtn) {
      closeLightboxBtn.addEventListener('click', function () {
        closeModalLayer('modal-image-lightbox');
      });
    }

    var awardT1Btn = document.getElementById('btn-award-team1');
    if (awardT1Btn) {
      awardT1Btn.addEventListener('click', function () { assignQuestionPoints('team1'); });
    }
    var awardT2Btn = document.getElementById('btn-award-team2');
    if (awardT2Btn) {
      awardT2Btn.addEventListener('click', function () { assignQuestionPoints('team2'); });
    }
    var awardNoneBtn = document.getElementById('btn-award-none');
    if (awardNoneBtn) {
      awardNoneBtn.addEventListener('click', function () { assignQuestionPoints('none'); });
    }

    var playAgainSameBtn = document.getElementById('btn-play-again-same');
    if (playAgainSameBtn) {
      playAgainSameBtn.addEventListener('click', function () {
        var match = AppState.activeMatch;
        if (match && Array.isArray(match.columns) && match.columns.length === 6) {
          var matchCats = match.columns.map(function (c) { return c.categoryId; });
          startNewMatchFromSetup(matchCats, {
            team1Name: match.teams.team1.name,
            team2Name: match.teams.team2.name,
            team1Color: match.teams.team1.color,
            team2Color: match.teams.team2.color
          });
        } else {
          startNewMatchFromSetup();
        }
      });
    }

    var playAgainNewBtn = document.getElementById('btn-play-again-new');
    if (playAgainNewBtn) {
      playAgainNewBtn.addEventListener('click', function () {
        navigateToScreen('categories');
      });
    }

    var closeButtons = document.querySelectorAll('[data-close-modal]');
    for (var i = 0; i < closeButtons.length; i++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          closeModalLayer(btn.getAttribute('data-close-modal'));
        });
      })(closeButtons[i]);
    }

    bindSettingsModalEvents();

    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden' && AppState.activeMatch && AppState.activeQuestionModal.cellId) {
        var cell = Engine.findCell(AppState.activeMatch, AppState.activeQuestionModal.cellId);
        if (cell && cell.status === 'answering') {
          Engine.pauseCellTimer(AppState.activeMatch, cell.cellId, Date.now(), true);
          saveToStorage(Engine.STORAGE_KEYS.ACTIVE_MATCH, AppState.activeMatch);
          refreshQuestionTimerBadge();
        }
      }
    });

    window.addEventListener('keydown', function (e) {
      var topModalId = getTopModalId();

      if (e.key === 'Escape' && topModalId) {
        e.preventDefault();
        closeModalLayer(topModalId);
        return;
      }

      if (e.key === 'Tab' && topModalId) {
        var modalEl = document.getElementById(topModalId);
        if (modalEl) {
          var focusables = modalEl.querySelectorAll('button:not(:disabled), select:not(:disabled), input:not(:disabled), [tabindex="0"]');
          if (focusables.length > 0) {
            var first = focusables[0];
            var last = focusables[focusables.length - 1];
            if (e.shiftKey && document.activeElement === first) {
              e.preventDefault();
              last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        }
      }

      if (e.key === ' ' && topModalId === 'modal-question' && AppState.activeQuestionModal.isOpen) {
        var tag = document.activeElement ? document.activeElement.tagName : '';
        if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA' || tag === 'BUTTON') {
          return;
        }
        var c = AppState.activeMatch && Engine.findCell(AppState.activeMatch, AppState.activeQuestionModal.cellId);
        if (c && c.session && !c.session.isRevealed) {
          e.preventDefault();
          revealCurrentQuestionAnswer();
        }
      }
    });
  }


  function renderInteractiveQuestionWidget(q, s, cell) {
    var widget = document.getElementById('q-interactive-widget');
    var visualImg = document.getElementById('q-modal-visual-img');
    var visualWrapper = document.getElementById('q-modal-visual-wrapper');
    if (!widget) return;
    widget.textContent = '';
    widget.classList.remove('visible');
    if (visualImg) {
      visualImg.style.filter = 'none';
      visualImg.style.visibility = 'visible';
    }

    var fmt = q.format || 'standard';
    if (fmt === 'standard' || fmt === 'visual_clue') {
      // Check if question has progressive clues_ar array
      if (Array.isArray(q.clues_ar) && q.clues_ar.length > 0) {
        fmt = 'progressive_clues';
      } else {
        return;
      }
    }

    widget.classList.add('visible');

    // 1. Progressive Clues (منو الشخصية / مسيرة لاعب / التسلسل)
    if (fmt === 'progressive_clues' && Array.isArray(q.clues_ar)) {
      if (typeof s.revealedCluesCount !== 'number') s.revealedCluesCount = 1;
      var maxClues = s.isRevealed ? q.clues_ar.length : Math.min(q.clues_ar.length, s.revealedCluesCount);
      var hdr = document.createElement('div');
      hdr.style.fontWeight = '900';
      hdr.style.color = 'var(--accent-primary)';
      hdr.textContent = '🧩 التلميحات المتدرجة (' + maxClues + ' من ' + q.clues_ar.length + '):';
      widget.appendChild(hdr);

      for (var cIdx = 0; cIdx < maxClues; cIdx++) {
        var cDiv = document.createElement('div');
        cDiv.className = 'clue-step-item';
        cDiv.textContent = 'التلميح ' + (cIdx + 1) + ': ' + q.clues_ar[cIdx];
        widget.appendChild(cDiv);
      }

      if (!s.isRevealed && s.revealedCluesCount < q.clues_ar.length) {
        var nextBtn = document.createElement('button');
        nextBtn.type = 'button';
        nextBtn.className = 'btn-secondary';
        nextBtn.textContent = '🔓 كشف التلميح التالي (' + (s.revealedCluesCount + 1) + '/' + q.clues_ar.length + ')';
        nextBtn.addEventListener('click', function () {
          AudioFX.playClick();
          s.revealedCluesCount += 1;
          saveToStorage(Engine.STORAGE_KEYS.ACTIVE_MATCH, AppState.activeMatch);
          renderQuestionModalState();
        });
        widget.appendChild(nextBtn);
      }
    }

    // 2. Progressive Clarity (وضح شوي)
    else if (fmt === 'progressive_clarity') {
      var blurLevels = [18, 10, 4, 0];
      if (typeof s.clarityStep !== 'number') s.clarityStep = 0;
      var curStep = s.isRevealed ? 3 : Math.min(3, s.clarityStep);
      var px = blurLevels[curStep];
      if (visualImg) {
        visualImg.style.filter = px > 0 ? ('blur(' + px + 'px)') : 'none';
      }
      var row = document.createElement('div');
      row.style.display = 'flex';
      row.style.alignItems = 'center';
      row.style.justifyContent = 'space-between';
      row.style.flexWrap = 'wrap';
      row.style.gap = '0.5rem';

      var badge = document.createElement('span');
      badge.style.fontWeight = '800';
      badge.textContent = '🔍 درجة وضوح الصورة: المرحلة ' + (curStep + 1) + ' من 4 ' + (px === 0 ? '(واضحة بالكامل)' : '(تشويش ' + px + ' درجة)');
      row.appendChild(badge);

      if (!s.isRevealed && curStep < 3) {
        var clrBtn = document.createElement('button');
        clrBtn.type = 'button';
        clrBtn.className = 'btn-secondary';
        clrBtn.textContent = '✨ وضّح الصورة خطوة إضافية (' + (curStep + 2) + '/4)';
        clrBtn.addEventListener('click', function () {
          AudioFX.playClick();
          s.clarityStep = Math.min(3, (s.clarityStep || 0) + 1);
          saveToStorage(Engine.STORAGE_KEYS.ACTIVE_MATCH, AppState.activeMatch);
          renderQuestionModalState();
        });
        row.appendChild(clrBtn);
      }
      widget.appendChild(row);
    }

    // 3. Memory Observation (ركز شوي)
    else if (fmt === 'memory_observation') {
      if (typeof s.memoryHidden !== 'boolean') s.memoryHidden = false;
      if (visualImg) {
        visualImg.style.visibility = (s.memoryHidden && !s.isRevealed) ? 'hidden' : 'visible';
      }
      var mRow = document.createElement('div');
      mRow.style.display = 'flex';
      mRow.style.alignItems = 'center';
      mRow.style.justifyContent = 'space-between';
      mRow.style.flexWrap = 'wrap';
      mRow.style.gap = '0.5rem';

      var mTxt = document.createElement('span');
      mTxt.style.fontWeight = '800';
      mTxt.textContent = s.isRevealed
        ? '👁️ تم إظهار الصورة مجدداً للتحقق من تفاصيل المشهد!'
        : (s.memoryHidden ? '🙈 تم إخفاء الصورة! أجب الآن من ذاكرتك البصرية.' : '👁️ ركّز جيداً في تفاصيل الصورة قبل إخفائها!');
      mRow.appendChild(mTxt);

      if (!s.isRevealed) {
        var toggleMemBtn = document.createElement('button');
        toggleMemBtn.type = 'button';
        toggleMemBtn.className = 'btn-secondary';
        toggleMemBtn.textContent = s.memoryHidden ? '👁️ إظهار الصورة مؤقتاً (للمقدم)' : '🙈 إخفاء الصورة الآن وبدء التخمين';
        toggleMemBtn.addEventListener('click', function () {
          AudioFX.playClick();
          s.memoryHidden = !s.memoryHidden;
          saveToStorage(Engine.STORAGE_KEYS.ACTIVE_MATCH, AppState.activeMatch);
          renderQuestionModalState();
        });
        mRow.appendChild(toggleMemBtn);
      }
      widget.appendChild(mRow);
    }

    // 4. Spot the Difference (صور مختلفة)
    else if (fmt === 'spot_difference') {
      var diffGrid = document.createElement('div');
      diffGrid.className = 'spot-diff-grid';

      var cardA = document.createElement('div');
      cardA.className = 'spot-diff-card';
      var lblA = document.createElement('strong');
      lblA.textContent = 'اللوحة (أ) — الأصلية';
      var canA = document.createElement('canvas');
      canA.width = 360;
      canA.height = 240;
      cardA.appendChild(lblA);
      cardA.appendChild(canA);

      var cardB = document.createElement('div');
      cardB.className = 'spot-diff-card';
      var lblB = document.createElement('strong');
      lblB.textContent = 'اللوحة (ب) — المعدّلة';
      var canB = document.createElement('canvas');
      canB.width = 360;
      canB.height = 240;
      cardB.appendChild(lblB);
      cardB.appendChild(canB);

      diffGrid.appendChild(cardA);
      diffGrid.appendChild(cardB);
      widget.appendChild(diffGrid);

      var srcImg = new Image();
      srcImg.onload = function () {
        var ctxA = canA.getContext('2d');
        var ctxB = canB.getContext('2d');
        ctxA.drawImage(srcImg, 0, 0, 360, 240);
        ctxB.drawImage(srcImg, 0, 0, 360, 240);
        var dIdx = typeof q.diffIndex === 'number' ? q.diffIndex : 0;
        var spots = [
          { x: 280, y: 55, r: 22, color: '#F59E0B' },
          { x: 95, y: 65, r: 20, color: '#EF4444' },
          { x: 180, y: 175, r: 24, color: '#3B82F6' },
          { x: 265, y: 165, r: 22, color: '#10B981' },
          { x: 110, y: 155, r: 22, color: '#8B5CF6' },
          { x: 210, y: 80, r: 20, color: '#EC4899' }
        ];
        var sp = spots[dIdx % spots.length];
        ctxB.save();
        ctxB.fillStyle = sp.color;
        ctxB.beginPath();
        ctxB.arc(sp.x, sp.y, sp.r, 0, Math.PI * 2);
        ctxB.fill();
        if (s.isRevealed) {
          ctxB.strokeStyle = '#FFFFFF';
          ctxB.lineWidth = 4;
          ctxB.beginPath();
          ctxB.arc(sp.x, sp.y, sp.r + 8, 0, Math.PI * 2);
          ctxB.stroke();
        }
        ctxB.restore();
      };
      srcImg.src = resolveImg(q.assetId || q.imageDataUri || q.image);
      if (visualWrapper) visualWrapper.classList.remove('visible');
    }

    // 5. Private Handover (ولا كلمة أنمي)
    else if (fmt === 'private_handover') {
      var pBox = document.createElement('div');
      pBox.style.display = 'flex';
      pBox.style.flexDirection = 'column';
      pBox.style.gap = '0.5rem';

      var pInfo = document.createElement('div');
      pInfo.style.fontWeight = '800';
      pInfo.textContent = '🤫 وضع التمثيل الصامت (ولا كلمة): سلّم الجهاز للممثل فقط ليرى العنوان السري ثم يخفيه قبل بدء التمثيل!';
      pBox.appendChild(pInfo);

      var secretDiv = document.createElement('div');
      secretDiv.className = 'clue-step-item';
      secretDiv.style.display = s.secretVisible ? 'block' : 'none';
      secretDiv.style.background = 'rgba(15, 118, 110, 0.12)';
      secretDiv.textContent = q.secretPrompt || ('العنوان السري للتمثيل: ' + q.answer);

      var toggleSecBtn = document.createElement('button');
      toggleSecBtn.type = 'button';
      toggleSecBtn.className = 'btn-secondary';
      toggleSecBtn.textContent = s.secretVisible ? '🙈 إخفاء العنوان السري وبدء التمثيل' : '👁️ إظهار العنوان السري للممثل فقط';
      toggleSecBtn.addEventListener('click', function () {
        AudioFX.playClick();
        s.secretVisible = !s.secretVisible;
        renderQuestionModalState();
      });

      pBox.appendChild(toggleSecBtn);
      pBox.appendChild(secretDiv);
      widget.appendChild(pBox);
    }

    // 6. Interactive Drawing Pad (رسم وتخمين)
    else if (fmt === 'drawing_pad') {
      var dWrap = document.createElement('div');
      dWrap.className = 'drawing-canvas-wrap';

      var secToggle = document.createElement('button');
      secToggle.type = 'button';
      secToggle.className = 'btn-secondary';
      secToggle.textContent = s.secretVisible ? ('🙈 إخفاء المطلوب رسمه (' + (q.secretPrompt || q.answer) + ')') : '👁️ إظهار الكلمة السرية للرسام فقط';
      secToggle.addEventListener('click', function () {
        AudioFX.playClick();
        s.secretVisible = !s.secretVisible;
        renderQuestionModalState();
      });
      dWrap.appendChild(secToggle);

      var canvas = document.createElement('canvas');
      canvas.id = 'q-drawing-canvas';
      canvas.width = 520;
      canvas.height = 240;

      var toolsRow = document.createElement('div');
      toolsRow.style.display = 'flex';
      toolsRow.style.gap = '0.4rem';
      toolsRow.style.flexWrap = 'wrap';
      toolsRow.style.alignItems = 'center';

      var brushColor = '#17212B';
      ['#17212B', '#2563EB', '#C2410C', '#15803D', '#B91C1C'].forEach(function (colHex) {
        var cBtn = document.createElement('button');
        cBtn.type = 'button';
        cBtn.style.width = '34px';
        cBtn.style.height = '34px';
        cBtn.style.borderRadius = '50%';
        cBtn.style.background = colHex;
        cBtn.style.border = '2px solid #FFFFFF';
        cBtn.style.boxShadow = '0 1px 4px rgba(0,0,0,0.3)';
        cBtn.style.cursor = 'pointer';
        cBtn.addEventListener('click', function () { brushColor = colHex; });
        toolsRow.appendChild(cBtn);
      });

      var clrCanvasBtn = document.createElement('button');
      clrCanvasBtn.type = 'button';
      clrCanvasBtn.className = 'icon-btn';
      clrCanvasBtn.style.minHeight = '36px';
      clrCanvasBtn.textContent = '🧹 مسح اللوحة';
      toolsRow.appendChild(clrCanvasBtn);

      dWrap.appendChild(canvas);
      dWrap.appendChild(toolsRow);
      widget.appendChild(dWrap);

      var ctx = canvas.getContext('2d');
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 4;

      var drawing = false;
      function getCanvasPos(ev) {
        var rect = canvas.getBoundingClientRect();
        return {
          x: (ev.clientX - rect.left) * (canvas.width / rect.width),
          y: (ev.clientY - rect.top) * (canvas.height / rect.height)
        };
      }
      canvas.addEventListener('pointerdown', function (ev) {
        drawing = true;
        var p = getCanvasPos(ev);
        ctx.strokeStyle = brushColor;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
      });
      canvas.addEventListener('pointermove', function (ev) {
        if (!drawing) return;
        var p = getCanvasPos(ev);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      });
      window.addEventListener('pointerup', function () { drawing = false; });
      clrCanvasBtn.addEventListener('click', function () {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });
    }

    // 6b. First Letter & Length Hint Challenge (تحدي الحرف الأول)
    else if (fmt === 'first_letter_hint') {
      var flRow = document.createElement('div');
      flRow.style.display = 'flex';
      flRow.style.alignItems = 'center';
      flRow.style.justifyContent = 'space-between';
      flRow.style.flexWrap = 'wrap';
      flRow.style.gap = '0.6rem';

      var cleanAns = (q.answer || '').replace(/^ال/, '').trim();
      var fLet = q.firstLetter || (cleanAns ? cleanAns.charAt(0) : 'أ');
      var wLen = q.wordLen || (q.answer ? q.answer.length : 5);

      var flBadge = document.createElement('span');
      flBadge.style.fontWeight = '800';
      flBadge.style.color = 'var(--accent-gold)';
      flBadge.textContent = (s.firstLetterRevealed || s.isRevealed)
        ? ('🔠 تلميح الكلمة: تبدأ بحرف «' + fLet + '» وعدد حروف الإجابة (' + wLen + ') حروف')
        : '🔠 تحدي الحرف الأول: حاول الإجابة مباشرة أو اكشف الحرف الأول وعدد الحروف!';
      flRow.appendChild(flBadge);

      if (!s.isRevealed && !s.firstLetterRevealed) {
        var flBtn = document.createElement('button');
        flBtn.type = 'button';
        flBtn.className = 'btn-secondary';
        flBtn.textContent = '🔓 كشف الحرف الأول وعدد الحروف';
        flBtn.addEventListener('click', function () {
          AudioFX.playClick();
          s.firstLetterRevealed = true;
          saveToStorage(Engine.STORAGE_KEYS.ACTIVE_MATCH, AppState.activeMatch);
          renderQuestionModalState();
        });
        flRow.appendChild(flBtn);
      }
      widget.appendChild(flRow);
    }

    // 7. Audio Challenge (خمن الصوت والإيقاع)
    else if (fmt === 'audio_challenge') {
      var aRow = document.createElement('div');
      aRow.style.display = 'flex';
      aRow.style.alignItems = 'center';
      aRow.style.justifyContent = 'space-between';
      aRow.style.flexWrap = 'wrap';
      aRow.style.gap = '0.6rem';

      var aLbl = document.createElement('span');
      aLbl.style.fontWeight = '800';
      aLbl.textContent = '🎵 مقطع صوتي تفاعلي — استمع للنغمة أو الإيقاع وخمّن الإجابة:';
      aRow.appendChild(aLbl);

      var playBtn = document.createElement('button');
      playBtn.type = 'button';
      playBtn.className = 'btn-primary';
      playBtn.id = 'btn-play-audio-challenge';
      playBtn.textContent = '🔊 تشغيل المقطع الصوتي الآن';
      playBtn.addEventListener('click', function () {
        AudioFX.playChallengeClip(q.audioClipId || 'nokia_tune');
      });
      aRow.appendChild(playBtn);
      widget.appendChild(aRow);
    }
  }


  /* ==========================================================================
     SEEN JEEM v5 — FULL-VIEWPORT PAN/ZOOM LIGHTBOX, SPECIAL INTERACTIVE MODES,
     18 OFFLINE AUDIO CHALLENGE CLIPS, AND 5-TAB SETTINGS CONTROLLER
     ========================================================================== */
  var LightboxState = {
    scale: 1,
    tx: 0,
    ty: 0,
    pointers: {},
    lastPinchDist: null,
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0,
    startTx: 0,
    startTy: 0,
    lastTapAt: 0
  };

  function applyLightboxTransform() {
    var img = document.getElementById('lightbox-img');
    var badge = document.getElementById('lightbox-zoom-badge');
    if (!img) return;
    var maxPan = Math.max(0, (LightboxState.scale - 1) * 320);
    LightboxState.tx = Math.max(-maxPan, Math.min(maxPan, LightboxState.tx));
    LightboxState.ty = Math.max(-maxPan, Math.min(maxPan, LightboxState.ty));
    img.style.transform = 'translate3d(' + LightboxState.tx.toFixed(1) + 'px, ' + LightboxState.ty.toFixed(1) + 'px, 0) scale(' + LightboxState.scale.toFixed(2) + ')';
    if (badge) {
      badge.textContent = Math.round(LightboxState.scale * 100) + '%';
    }
  }

  function setLightboxZoom(newScale, resetPan) {
    LightboxState.scale = Math.max(1, Math.min(6, newScale));
    if (LightboxState.scale <= 1.01 || resetPan) {
      LightboxState.tx = 0;
      LightboxState.ty = 0;
    }
    applyLightboxTransform();
  }

  function initLightboxPanZoom() {
    var stage = document.getElementById('lightbox-stage');
    var zoomInBtn = document.getElementById('btn-lightbox-zoom-in');
    var zoomOutBtn = document.getElementById('btn-lightbox-zoom-out');
    var resetBtn = document.getElementById('btn-lightbox-reset');
    if (!stage) return;

    if (zoomInBtn) {
      zoomInBtn.addEventListener('click', function () {
        setLightboxZoom(LightboxState.scale + 0.5, false);
      });
    }
    if (zoomOutBtn) {
      zoomOutBtn.addEventListener('click', function () {
        setLightboxZoom(LightboxState.scale - 0.5, false);
      });
    }
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        setLightboxZoom(1, true);
      });
    }

    stage.addEventListener('wheel', function (e) {
      e.preventDefault();
      var delta = e.deltaY < 0 ? 0.35 : -0.35;
      setLightboxZoom(LightboxState.scale + delta, false);
    }, { passive: false });

    stage.addEventListener('pointerdown', function (e) {
      LightboxState.pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
      var keys = Object.keys(LightboxState.pointers);
      if (keys.length === 1) {
        var now = Date.now();
        if (now - LightboxState.lastTapAt < 280) {
          setLightboxZoom(LightboxState.scale > 1.2 ? 1 : 2.5, true);
          LightboxState.lastTapAt = 0;
          return;
        }
        LightboxState.lastTapAt = now;
        LightboxState.isDragging = true;
        LightboxState.dragStartX = e.clientX;
        LightboxState.dragStartY = e.clientY;
        LightboxState.startTx = LightboxState.tx;
        LightboxState.startTy = LightboxState.ty;
        stage.classList.add('dragging');
      } else if (keys.length === 2) {
        var p1 = LightboxState.pointers[keys[0]];
        var p2 = LightboxState.pointers[keys[1]];
        LightboxState.lastPinchDist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      }
    });

    window.addEventListener('pointermove', function (e) {
      if (!LightboxState.pointers[e.pointerId]) return;
      LightboxState.pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
      var keys = Object.keys(LightboxState.pointers);
      if (keys.length === 2) {
        var p1 = LightboxState.pointers[keys[0]];
        var p2 = LightboxState.pointers[keys[1]];
        var dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        if (LightboxState.lastPinchDist && LightboxState.lastPinchDist > 10) {
          var ratio = dist / LightboxState.lastPinchDist;
          setLightboxZoom(LightboxState.scale * ratio, false);
        }
        LightboxState.lastPinchDist = dist;
      } else if (keys.length === 1 && LightboxState.isDragging && LightboxState.scale > 1) {
        LightboxState.tx = LightboxState.startTx + (e.clientX - LightboxState.dragStartX);
        LightboxState.ty = LightboxState.startTy + (e.clientY - LightboxState.dragStartY);
        applyLightboxTransform();
      }
    });

    function endPointer(e) {
      delete LightboxState.pointers[e.pointerId];
      if (Object.keys(LightboxState.pointers).length < 2) {
        LightboxState.lastPinchDist = null;
      }
      if (Object.keys(LightboxState.pointers).length === 0) {
        LightboxState.isDragging = false;
        stage.classList.remove('dragging');
      }
    }
    window.addEventListener('pointerup', endPointer);
    window.addEventListener('pointercancel', endPointer);
  }

  // Synthesized Audio Challenge Player for 'guess_the_sound' (18 distinct offline clips)
  AudioFX.playChallengeClip = function (clipId) {
    var prevEnabled = this.enabled;
    this.enabled = true;
    var seq = [];
    if (clipId === 'whistle_end') {
      seq = [[2800, 'triangle', 0.18, 0], [2800, 'triangle', 0.18, 0.26], [2800, 'triangle', 0.65, 0.52]];
    } else if (clipId === 'nokia_tune') {
      seq = [[1318.5, 'sine', 0.15, 0], [1174.7, 'sine', 0.15, 0.16], [739.99, 'sine', 0.28, 0.32], [830.61, 'sine', 0.28, 0.62], [1108.7, 'sine', 0.15, 0.92], [987.77, 'sine', 0.15, 1.08], [587.33, 'sine', 0.28, 1.24], [659.25, 'sine', 0.28, 1.54], [987.77, 'sine', 0.15, 1.84], [880, 'sine', 0.15, 2.0], [554.37, 'sine', 0.28, 2.16], [659.25, 'sine', 0.28, 2.46], [880, 'sine', 0.55, 2.76]];
    } else if (clipId === 'morse_sos') {
      seq = [
        [880, 'sine', 0.1, 0], [880, 'sine', 0.1, 0.18], [880, 'sine', 0.1, 0.36],
        [880, 'sine', 0.32, 0.62], [880, 'sine', 0.32, 1.02], [880, 'sine', 0.32, 1.42],
        [880, 'sine', 0.1, 1.86], [880, 'sine', 0.1, 2.04], [880, 'sine', 0.1, 2.22]
      ];
    } else if (clipId === 'mario_intro') {
      seq = [[659.25, 'square', 0.12, 0], [659.25, 'square', 0.12, 0.16], [659.25, 'square', 0.12, 0.38], [523.25, 'square', 0.12, 0.56], [659.25, 'square', 0.16, 0.72], [783.99, 'square', 0.28, 0.96], [392.0, 'square', 0.32, 1.38]];
    } else if (clipId === 'countdown_buzzer') {
      seq = [[1000, 'sine', 0.08, 0], [1000, 'sine', 0.08, 0.45], [1000, 'sine', 0.08, 0.9], [1000, 'sine', 0.08, 1.35], [220, 'sawtooth', 0.7, 1.8]];
    } else if (clipId === 'coin_collect') {
      seq = [[987.77, 'square', 0.09, 0], [1318.5, 'square', 0.42, 0.09]];
    } else if (clipId === 'beethoven_fifth') {
      seq = [[392.0, 'sawtooth', 0.16, 0], [392.0, 'sawtooth', 0.16, 0.2], [392.0, 'sawtooth', 0.16, 0.4], [311.13, 'sawtooth', 0.65, 0.62], [349.23, 'sawtooth', 0.16, 1.4], [349.23, 'sawtooth', 0.16, 1.6], [349.23, 'sawtooth', 0.16, 1.8], [293.66, 'sawtooth', 0.75, 2.02]];
    } else if (clipId === 'fur_elise') {
      seq = [[659.25, 'triangle', 0.16, 0], [622.25, 'triangle', 0.16, 0.18], [659.25, 'triangle', 0.16, 0.36], [622.25, 'triangle', 0.16, 0.54], [659.25, 'triangle', 0.16, 0.72], [493.88, 'triangle', 0.18, 0.9], [587.33, 'triangle', 0.18, 1.1], [523.25, 'triangle', 0.18, 1.3], [440.0, 'triangle', 0.45, 1.5]];
    } else if (clipId === 'tetris_theme') {
      seq = [[659.25, 'square', 0.24, 0], [493.88, 'square', 0.12, 0.26], [523.25, 'square', 0.12, 0.4], [587.33, 'square', 0.24, 0.54], [523.25, 'square', 0.12, 0.8], [493.88, 'square', 0.12, 0.94], [440.0, 'square', 0.24, 1.08]];
    } else if (clipId === 'ecg_beep') {
      seq = [[1046.5, 'sine', 0.09, 0], [1046.5, 'sine', 0.09, 0.75], [1046.5, 'sine', 0.09, 1.5], [1046.5, 'sine', 0.09, 2.25]];
    } else if (clipId === 'ambulance_siren') {
      seq = [[660, 'triangle', 0.35, 0], [880, 'triangle', 0.35, 0.36], [660, 'triangle', 0.35, 0.72], [880, 'triangle', 0.35, 1.08], [660, 'triangle', 0.35, 1.44], [880, 'triangle', 0.35, 1.8]];
    } else if (clipId === 'dtmf_dial') {
      seq = [[697, 'sine', 0.14, 0], [1209, 'sine', 0.14, 0], [770, 'sine', 0.14, 0.22], [1336, 'sine', 0.14, 0.22], [852, 'sine', 0.14, 0.44], [1477, 'sine', 0.14, 0.44], [941, 'sine', 0.18, 0.66], [1336, 'sine', 0.18, 0.66]];
    } else if (clipId === 'major_scale') {
      var notes = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25];
      seq = notes.map(function (n, idx) { return [n, 'triangle', 0.22, idx * 0.22]; });
    } else if (clipId === 'khaleeji_rhythm') {
      seq = [[110, 'triangle', 0.16, 0], [320, 'sine', 0.09, 0.22], [110, 'triangle', 0.16, 0.44], [110, 'triangle', 0.16, 0.64], [320, 'sine', 0.12, 0.88], [110, 'triangle', 0.16, 1.15], [320, 'sine', 0.09, 1.37]];
    } else if (clipId === 'sonar_ping') {
      seq = [[1480, 'sine', 0.45, 0], [1480, 'sine', 0.25, 0.55], [1480, 'sine', 0.45, 1.3], [1480, 'sine', 0.25, 1.85]];
    } else if (clipId === 'arcade_gameover') {
      seq = [[523.25, 'sawtooth', 0.25, 0], [493.88, 'sawtooth', 0.25, 0.28], [466.16, 'sawtooth', 0.25, 0.56], [440.0, 'sawtooth', 0.65, 0.84]];
    } else if (clipId === 'modem_dialup') {
      seq = [[1200, 'sawtooth', 0.18, 0], [2100, 'square', 0.25, 0.2], [1650, 'sawtooth', 0.2, 0.48], [2400, 'square', 0.3, 0.7], [980, 'sawtooth', 0.3, 1.05]];
    } else {
      // big_ben_chime
      seq = [[329.63, 'triangle', 0.42, 0], [261.63, 'triangle', 0.42, 0.46], [293.66, 'triangle', 0.42, 0.92], [196.0, 'triangle', 0.75, 1.38]];
    }
    var ctx = (typeof this.getAudioContext === 'function') ? this.getAudioContext() : null;
    if (ctx) {
      var vol = (AppState.settings && typeof AppState.settings.soundVolume === 'number') ? (AppState.settings.soundVolume / 100) : 0.85;
      seq.forEach(function (item) {
        try {
          var now = ctx.currentTime + item[3];
          var osc = ctx.createOscillator();
          var g = ctx.createGain();
          osc.type = item[1];
          osc.frequency.setValueAtTime(item[0], now);
          g.gain.setValueAtTime(0.18 * vol, now);
          g.gain.exponentialRampToValueAtTime(0.001, now + item[2]);
          osc.connect(g);
          g.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + item[2]);
        } catch (e) {}
      });
    }
    this.enabled = prevEnabled;
  };

  function syncSettingsModalUI() {
    var themeSel = document.getElementById('sel-setting-theme');
    var presSel = document.getElementById('sel-setting-presentation');
    var txtSizeSel = document.getElementById('sel-setting-text-size');
    var densSel = document.getElementById('sel-setting-density');
    var soundChk = document.getElementById('chk-setting-sound');
    var volRng = document.getElementById('rng-setting-volume');
    var volLbl = document.getElementById('lbl-setting-volume');
    var motionChk = document.getElementById('chk-setting-reduced-motion');
    var timerSel = document.getElementById('sel-setting-timer');
    var lifelinesSel = document.getElementById('sel-setting-lifelines');
    var stealSel = document.getElementById('sel-setting-steal');
    var stealTimerSel = document.getElementById('sel-setting-steal-timer');
    var boardModeSel = document.getElementById('sel-setting-board-mode');
    var penaltySel = document.getElementById('sel-setting-penalty');
    var openHintChk = document.getElementById('chk-setting-open-hint');
    var excludeSpoilersChk = document.getElementById('chk-setting-exclude-spoilers');
    var confirmBox = document.getElementById('confirm-delete-all-box');

    if (themeSel) themeSel.value = AppState.settings.theme || 'light';
    if (presSel) presSel.value = AppState.settings.presentationMode || 'normal';
    if (txtSizeSel) txtSizeSel.value = AppState.settings.textSize || 'normal';
    if (densSel) densSel.value = AppState.settings.cardDensity || 'comfortable';
    if (soundChk) soundChk.checked = !!AppState.settings.soundEffects;
    if (volRng) volRng.value = String(typeof AppState.settings.soundVolume === 'number' ? AppState.settings.soundVolume : 85);
    if (volLbl) volLbl.textContent = (volRng ? volRng.value : '85') + '%';
    if (motionChk) motionChk.checked = AppState.settings.animationIntensity === 'reduced';
    if (timerSel) timerSel.value = String(AppState.settings.timerSeconds);
    if (lifelinesSel) lifelinesSel.value = String(AppState.settings.lifelinesPerTeam);
    if (stealSel) stealSel.value = String(!!AppState.settings.allowSteal);
    if (stealTimerSel) stealTimerSel.value = String(AppState.settings.stealTimerSeconds || 10);
    if (boardModeSel) boardModeSel.value = AppState.settings.boardMode || 'classic';
    if (penaltySel) penaltySel.value = AppState.settings.penaltyMode || 'none';
    if (openHintChk) openHintChk.checked = AppState.settings.showOpenAnswerHint !== false;
    if (excludeSpoilersChk) excludeSpoilersChk.checked = !!AppState.settings.excludeSpoilers;
    if (confirmBox) confirmBox.style.display = 'none';
  }

  function bindSettingsModalEvents() {
    initLightboxPanZoom();

    // Settings Tabs Switching
    var tabBtns = document.querySelectorAll('[data-settings-tab]');
    for (var tIdx = 0; tIdx < tabBtns.length; tIdx++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          AudioFX.playClick();
          var targetTab = btn.getAttribute('data-settings-tab');
          for (var j = 0; j < tabBtns.length; j++) {
            tabBtns[j].classList.toggle('active', tabBtns[j] === btn);
          }
          var panes = document.querySelectorAll('.settings-tab-pane');
          for (var k = 0; k < panes.length; k++) {
            panes[k].classList.toggle('active', panes[k].id === 'settings-pane-' + targetTab);
          }
        });
      })(tabBtns[tIdx]);
    }

    var volRng = document.getElementById('rng-setting-volume');
    var volLbl = document.getElementById('lbl-setting-volume');
    if (volRng && volLbl) {
      volRng.addEventListener('input', function () {
        volLbl.textContent = volRng.value + '%';
        AppState.settings.soundVolume = parseInt(volRng.value, 10);
      });
    }

    var testSoundBtn = document.getElementById('btn-test-sound');
    if (testSoundBtn) {
      testSoundBtn.addEventListener('click', function () {
        AudioFX.playChallengeClip('coin_collect');
      });
    }

    var settingsFsBtn = document.getElementById('btn-settings-fullscreen');
    if (settingsFsBtn) {
      settingsFsBtn.addEventListener('click', toggleFullscreen);
    }

    var settingsHowtoBtn = document.getElementById('btn-settings-open-howto');
    if (settingsHowtoBtn) {
      settingsHowtoBtn.addEventListener('click', function () {
        closeModalLayer('modal-settings');
        openModalLayer('modal-howto');
      });
    }

    var settingsExpBtn = document.getElementById('btn-settings-export-match');
    if (settingsExpBtn) {
      settingsExpBtn.addEventListener('click', exportCurrentMatchJSON);
    }

    var settingsImpBtn = document.getElementById('btn-settings-import-match');
    var importFileInput = document.getElementById('input-import-match-file');
    if (settingsImpBtn && importFileInput) {
      settingsImpBtn.addEventListener('click', function () {
        importFileInput.click();
      });
    }

    var clrFavsBtn = document.getElementById('btn-clear-favorites-data');
    if (clrFavsBtn) {
      clrFavsBtn.addEventListener('click', function () {
        AppState.favoriteCategories = {};
        removeFromStorage(Engine.STORAGE_KEYS.FAVORITE_CATEGORIES);
        renderGroupTabs();
        renderCategoriesGrid();
        showToast('تم مسح قائمة الفئات المفضلة بنجاح.');
      });
    }

    var resetDefSettingsBtn = document.getElementById('btn-reset-default-settings');
    if (resetDefSettingsBtn) {
      resetDefSettingsBtn.addEventListener('click', function () {
        AppState.settings = Object.assign({}, Engine.DEFAULT_SETTINGS);
        saveToStorage(Engine.STORAGE_KEYS.SETTINGS, AppState.settings);
        applySettingsToDOM();
        syncSettingsModalUI();
        syncSetupInputsFromSettings();
        showToast('تمت استعادة الإعدادات الافتراضية.');
      });
    }

    // Arm Pit button on board
    var armPitBtn = document.getElementById('btn-arm-pit');
    if (armPitBtn) {
      armPitBtn.addEventListener('click', function () {
        if (!AppState.activeMatch) return;
        try {
          var res = Engine.armPitLifeline(AppState.activeMatch, AppState.activeMatch.currentTurn);
          AudioFX.playLifeline();
          saveToStorage(Engine.STORAGE_KEYS.ACTIVE_MATCH, AppState.activeMatch);
          renderGameBoard();
          showToast(res.armed ? '🕳️ تم تفعيل «الحفرة» للسؤال القادم!' : 'تم إلغاء تفعيل «الحفرة».');
        } catch (err) {
          showToast(err.message || 'تعذر تفعيل الحفرة.');
        }
      });
    }

    // Additional in-question lifelines: istarih & al_fakh
    var istarihBtn = document.getElementById('btn-use-istarih');
    if (istarihBtn) {
      istarihBtn.addEventListener('click', function () { handleActivateLifelineKey('istarih'); });
    }
    var alfakhBtn = document.getElementById('btn-use-alfakh');
    if (alfakhBtn) {
      alfakhBtn.addEventListener('click', function () { handleActivateLifelineKey('al_fakh'); });
    }

    var saveSettingsBtn = document.getElementById('btn-save-settings');
    if (saveSettingsBtn) {
      saveSettingsBtn.addEventListener('click', function () {
        var themeSel = document.getElementById('sel-setting-theme');
        var presSel = document.getElementById('sel-setting-presentation');
        var txtSizeSel = document.getElementById('sel-setting-text-size');
        var densSel = document.getElementById('sel-setting-density');
        var soundChk = document.getElementById('chk-setting-sound');
        var motionChk = document.getElementById('chk-setting-reduced-motion');
        var timerSel = document.getElementById('sel-setting-timer');
        var lifelinesSel = document.getElementById('sel-setting-lifelines');
        var stealSel = document.getElementById('sel-setting-steal');
        var stealTimerSel = document.getElementById('sel-setting-steal-timer');
        var boardModeSel = document.getElementById('sel-setting-board-mode');
        var penaltySel = document.getElementById('sel-setting-penalty');
        var openHintChk = document.getElementById('chk-setting-open-hint');
        var excludeSpoilersChk = document.getElementById('chk-setting-exclude-spoilers');

        if (themeSel) AppState.settings.theme = themeSel.value;
        if (presSel) AppState.settings.presentationMode = presSel.value;
        if (txtSizeSel) AppState.settings.textSize = txtSizeSel.value;
        if (densSel) AppState.settings.cardDensity = densSel.value;
        AppState.settings.soundEffects = soundChk ? soundChk.checked : true;
        AppState.settings.animationIntensity = (motionChk && motionChk.checked) ? 'reduced' : 'normal';
        if (timerSel) AppState.settings.timerSeconds = parseInt(timerSel.value, 10);
        if (lifelinesSel) AppState.settings.lifelinesPerTeam = parseInt(lifelinesSel.value, 10);
        if (stealSel) AppState.settings.allowSteal = stealSel.value === 'true';
        if (stealTimerSel) AppState.settings.stealTimerSeconds = parseInt(stealTimerSel.value, 10);
        if (boardModeSel) AppState.settings.boardMode = boardModeSel.value;
        if (penaltySel) AppState.settings.penaltyMode = penaltySel.value;
        if (openHintChk) AppState.settings.showOpenAnswerHint = !!openHintChk.checked;
        if (excludeSpoilersChk) AppState.settings.excludeSpoilers = !!excludeSpoilersChk.checked;

        if (AppState.activeMatch) {
          AppState.activeMatch.settings.timerSeconds = AppState.settings.timerSeconds;
          AppState.activeMatch.settings.penaltyMode = AppState.settings.penaltyMode;
          AppState.activeMatch.settings.allowSteal = AppState.settings.allowSteal;
          AppState.activeMatch.settings.stealTimerSeconds = AppState.settings.stealTimerSeconds;
          saveToStorage(Engine.STORAGE_KEYS.ACTIVE_MATCH, AppState.activeMatch);
        }

        saveToStorage(Engine.STORAGE_KEYS.SETTINGS, AppState.settings);
        applySettingsToDOM();
        syncSetupInputsFromSettings();
        renderLifelinePickers();
        closeModalLayer('modal-settings');
        showToast('تم حفظ وتطبيق الإعدادات بنجاح.');
      });
    }

    var resetHistoryBtn = document.getElementById('btn-reset-question-history');
    if (resetHistoryBtn) {
      resetHistoryBtn.addEventListener('click', function () {
        AppState.playedHistory = {};
        AppState.exposedHistory = {};
        removeFromStorage(Engine.STORAGE_KEYS.PLAYED_HISTORY);
        removeFromStorage(Engine.STORAGE_KEYS.EXPOSED_HISTORY);
        renderHomeStats();
        renderCategoriesGrid();
        showToast('تم تصفير سجل الأسئلة المكشوفة والملعوبة؛ جميع الـ ' + DATA.questions.length + ' سؤالاً متاحة كجديدة الآن.');
      });
    }

    // Two-step confirmation for destructive data deletion
    var triggerDelBtn = document.getElementById('btn-trigger-delete-all');
    var cancelDelBtn = document.getElementById('btn-cancel-delete-all');
    var confirmBox = document.getElementById('confirm-delete-all-box');
    if (triggerDelBtn && confirmBox) {
      triggerDelBtn.addEventListener('click', function () {
        confirmBox.style.display = 'block';
      });
    }
    if (cancelDelBtn && confirmBox) {
      cancelDelBtn.addEventListener('click', function () {
        confirmBox.style.display = 'none';
      });
    }

    var resetAllDataBtn = document.getElementById('btn-reset-all-local-data');
    if (resetAllDataBtn) {
      resetAllDataBtn.addEventListener('click', function () {
        AppState.playedHistory = {};
        AppState.exposedHistory = {};
        AppState.activeMatch = null;
        AppState.draftSelection = { team1: [], team2: [], activePickerTeam: 'team1', history: [] };
        AppState.selectedCategories = [];
        AppState.categoryOwners = {};
        AppState.favoriteCategories = {};
        removeFromStorage(Engine.STORAGE_KEYS.DRAFT_SELECTION);
        AppState.questionReports = [];
        AppState.globalStats = { matchesPlayed: 0, totalQuestionsAnswered: 0 };
        AppState.settings = Object.assign({}, Engine.DEFAULT_SETTINGS);

        removeFromStorage(Engine.STORAGE_KEYS.ACTIVE_MATCH);
        removeFromStorage(Engine.STORAGE_KEYS.PLAYED_HISTORY);
        removeFromStorage(Engine.STORAGE_KEYS.EXPOSED_HISTORY);
        removeFromStorage(Engine.STORAGE_KEYS.SELECTED_CATEGORIES);
        removeFromStorage(Engine.STORAGE_KEYS.FAVORITE_CATEGORIES);
        removeFromStorage(Engine.STORAGE_KEYS.QUESTION_REPORTS);
        removeFromStorage(Engine.STORAGE_KEYS.STATS);
        removeFromStorage(Engine.STORAGE_KEYS.SETTINGS);

        applySettingsToDOM();
        syncSetupInputsFromSettings();
        closeAllModals();
        navigateToScreen('home');
        showToast('تم مسح جميع البيانات والإعدادات المحلية وإعادة ضبط اللعبة بالكامل.');
      });
    }
  }


  /* ==========================================================================
     UPGRADE v8.0 CONTROLLERS: SMART ANSWER CHECKER, LIGHTNING 60S CHALLENGE,
     CONFETTI CELEBRATION, AND EXTENDED DUALSENSE CONTROLLER SHORTCUTS
     ========================================================================== */
  function checkSmartWrittenAnswer() {
    var match = AppState.activeMatch;
    var cellId = AppState.activeQuestionModal.cellId;
    if (!match || !cellId) return;
    var cell = Engine.findCell(match, cellId);
    var q = match.questionsByCell[cellId];
    var inp = document.getElementById('input-smart-answer-guess');
    var fb = document.getElementById('smart-answer-feedback');
    if (!cell || !cell.session || !q || !inp || !fb) return;

    var rawGuess = inp.value.trim();
    if (!rawGuess) {
      showToast('اكتب إجابة الفريق أولاً للتحقق منها.');
      return;
    }
    cell.session.lastSmartGuess = rawGuess;
    cell.session.lastSmartFeedback = true;

    var normGuess = Engine.normalizeArabicText(rawGuess).replace(/^ال/, '');
    var candidates = [q.answer].concat(q.acceptedAnswers || []);
    var isMatch = false;
    candidates.forEach(function (cand) {
      if (!cand) return;
      var cleanCand = String(cand).replace(/\s*\(.*?\)/g, '').trim();
      var normCand = Engine.normalizeArabicText(cleanCand).replace(/^ال/, '');
      var normFull = Engine.normalizeArabicText(String(cand)).replace(/^ال/, '');
      if (normGuess && (normGuess === normCand || normGuess === normFull ||
          (normGuess.length >= 4 && (normCand.indexOf(normGuess) !== -1 || normGuess.indexOf(normCand) !== -1)))) {
        isMatch = true;
      }
    });

    if (isMatch) {
      AudioFX.playAwardPoints();
      fb.className = 'smart-answer-feedback match';
      fb.textContent = '✅ إجابة صحيحة ومطابقة! يمكنك الآن الضغط على «كشف الإجابة» ومنح النقاط للفريق.';
    } else {
      AudioFX.playTimeUp();
      fb.className = 'smart-answer-feedback mismatch';
      fb.textContent = '❌ غير مطابقة للإجابة المعتمدة — يمكن للفريق المحاولة مجدداً أو تمرير الفرصة.';
    }
  }

  var LightningState = {
    active: false,
    remainingSec: 60,
    score: 0,
    streak: 0,
    correctCount: 0,
    bestScore: 0,
    timerId: null,
    currentQ: null,
    shuffledOpts: [],
    lockedInput: false
  };

  function openLightningChallengeModal() {
    LightningState.bestScore = loadFromStorage('seen_jeem_lightning_best_v1', 0) || 0;
    startNewLightningRound();
    openModalLayer('modal-lightning');
  }

  function stopLightningTimer() {
    if (LightningState.timerId) {
      clearInterval(LightningState.timerId);
      LightningState.timerId = null;
    }
  }

  function startNewLightningRound() {
    stopLightningTimer();
    LightningState.active = true;
    LightningState.remainingSec = 60;
    LightningState.score = 0;
    LightningState.streak = 0;
    LightningState.correctCount = 0;
    LightningState.lockedInput = false;

    var activeStage = document.getElementById('lt-stage-active');
    var sumStage = document.getElementById('lt-stage-summary');
    if (activeStage) activeStage.style.display = 'flex';
    if (sumStage) sumStage.style.display = 'none';

    pickNextLightningQuestion();
    syncLightningHUD();

    LightningState.timerId = setInterval(function () {
      if (!LightningState.active || getTopModalId() !== 'modal-lightning') return;
      LightningState.remainingSec = Math.max(0, LightningState.remainingSec - 1);
      syncLightningHUD();
      if (LightningState.remainingSec <= 10 && LightningState.remainingSec > 0) {
        AudioFX.playTick();
      }
      if (LightningState.remainingSec <= 0) {
        finishLightningRound();
      }
    }, 1000);
  }

  function syncLightningHUD() {
    var tEl = document.getElementById('lt-timer-val');
    var sEl = document.getElementById('lt-score-val');
    var stEl = document.getElementById('lt-streak-val');
    var bEl = document.getElementById('lt-best-val');
    if (tEl) tEl.textContent = LightningState.remainingSec + ' ث';
    if (sEl) sEl.textContent = String(LightningState.score);
    if (stEl) stEl.textContent = '🔥 ' + LightningState.streak;
    if (bEl) bEl.textContent = '🏆 ' + Math.max(LightningState.bestScore, LightningState.score);
  }

  function pickNextLightningQuestion() {
    var pool = DATA.questions.filter(function (q) {
      return (!q.format || q.format === 'standard') && Array.isArray(q.options) && q.options.length === 3;
    });
    if (pool.length === 0) pool = DATA.questions;
    var q = pool[Math.floor(Math.random() * pool.length)];
    LightningState.currentQ = q;
    LightningState.shuffledOpts = Engine.shuffleArray(
      q.options.map(function (txt, idx) {
        return { text: txt, isCorrect: idx === q.correctAnswerIndex };
      })
    );
    LightningState.lockedInput = false;

    var cat = CAT_BY_ID[q.categoryId];
    var catBadge = document.getElementById('lt-cat-badge');
    var ptsBadge = document.getElementById('lt-pts-badge');
    var qTxt = document.getElementById('lt-question-text');
    var optsGrid = document.getElementById('lt-options-grid');

    if (catBadge) catBadge.textContent = cat ? (cat.icon + ' ' + cat.title) : q.categoryId;
    if (ptsBadge) ptsBadge.textContent = q.points + ' نقطة';
    if (qTxt) qTxt.textContent = q.question;
    if (optsGrid) {
      optsGrid.textContent = '';
      var letters = ['أ', 'ب', 'ج'];
      LightningState.shuffledOpts.forEach(function (opt, idx) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'lightning-opt-btn';
        var lSpan = document.createElement('span');
        lSpan.className = 'opt-letter';
        lSpan.textContent = letters[idx] || String(idx + 1);
        var tSpan = document.createElement('span');
        tSpan.textContent = opt.text;
        btn.appendChild(lSpan);
        btn.appendChild(tSpan);
        btn.addEventListener('click', function () {
          handleLightningAnswer(idx, btn);
        });
        optsGrid.appendChild(btn);
      });
    }
  }

  function handleLightningAnswer(idx, clickedBtn) {
    if (!LightningState.active || LightningState.lockedInput) return;
    LightningState.lockedInput = true;
    var opt = LightningState.shuffledOpts[idx];
    var optsGrid = document.getElementById('lt-options-grid');
    var allBtns = optsGrid ? optsGrid.querySelectorAll('.lightning-opt-btn') : [];

    if (opt && opt.isCorrect) {
      clickedBtn.classList.add('correct');
      LightningState.streak += 1;
      LightningState.correctCount += 1;
      var bonus = LightningState.streak >= 3 ? 100 : 0;
      LightningState.score += (LightningState.currentQ ? LightningState.currentQ.points : 200) + bonus;
      if (LightningState.score > LightningState.bestScore) {
        LightningState.bestScore = LightningState.score;
        saveToStorage('seen_jeem_lightning_best_v1', LightningState.bestScore);
      }
      AudioFX.playAwardPoints();
    } else {
      clickedBtn.classList.add('wrong');
      LightningState.streak = 0;
      for (var i = 0; i < allBtns.length; i++) {
        if (LightningState.shuffledOpts[i] && LightningState.shuffledOpts[i].isCorrect) {
          allBtns[i].classList.add('correct');
        }
      }
      AudioFX.playTimeUp();
    }
    syncLightningHUD();
    setTimeout(function () {
      if (LightningState.active && LightningState.remainingSec > 0) {
        pickNextLightningQuestion();
      }
    }, 520);
  }

  function finishLightningRound() {
    LightningState.active = false;
    stopLightningTimer();
    AudioFX.playFanfare();
    var activeStage = document.getElementById('lt-stage-active');
    var sumStage = document.getElementById('lt-stage-summary');
    var sumHeadline = document.getElementById('lt-summary-headline');
    var sumDetails = document.getElementById('lt-summary-details');
    if (activeStage) activeStage.style.display = 'none';
    if (sumStage) sumStage.style.display = 'flex';
    if (sumHeadline) {
      sumHeadline.textContent = 'انتهى تحدي البرق! رصيدك: ' + LightningState.score + ' نقطة ⚡';
    }
    if (sumDetails) {
      sumDetails.textContent = 'أجبت بشكل صحيح على ' + LightningState.correctCount + ' أسئلة في 60 ثانية • أعلى رقم قياسي على جهازك: ' + LightningState.bestScore + ' نقطة.';
    }
  }

  function launchVictoryConfetti() {
    if (AppState.settings.animationIntensity === 'reduced') return;
    var canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.display = 'block';
    var ctx = canvas.getContext('2d');
    var pieces = [];
    var colors = ['#fbbf24', '#38bdf8', '#10b981', '#f43f5e', '#a78bfa', '#ffffff'];
    for (var i = 0; i < 85; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * canvas.height * 0.5,
        w: 7 + Math.random() * 6,
        h: 10 + Math.random() * 8,
        vy: 2.5 + Math.random() * 4,
        vx: -1.5 + Math.random() * 3,
        rot: Math.random() * Math.PI * 2,
        vrot: -0.08 + Math.random() * 0.16,
        color: colors[i % colors.length]
      });
    }
    var startTime = Date.now();
    function step() {
      if (Date.now() - startTime > 3800) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.style.display = 'none';
        return;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach(function (p) {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vrot;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
  }

  function initGamepadPolling() {
    if (typeof navigator === 'undefined' || !navigator.getGamepads) return;
    var lastBtnState = {};
    var lastMoveTime = 0;

    function getNavigableElements() {
      var topId = getTopModalId();
      var rootEl = topId ? document.getElementById(topId) : document.querySelector('.screen.active');
      if (!rootEl) return [];
      return Array.prototype.slice.call(
        rootEl.querySelectorAll('button:not(:disabled), input:not(:disabled), select:not(:disabled), [tabindex="0"]')
      ).filter(function (el) {
        return el.offsetParent !== null;
      });
    }

    function stepFocus(delta) {
      var els = getNavigableElements();
      if (els.length === 0) return;
      var curIdx = els.indexOf(document.activeElement);
      var nextIdx = curIdx === -1 ? 0 : (curIdx + delta + els.length) % els.length;
      els.forEach(function (el) { el.classList.remove('gamepad-focus'); });
      els[nextIdx].classList.add('gamepad-focus');
      els[nextIdx].focus();
    }

    function poll() {
      var pads = navigator.getGamepads ? navigator.getGamepads() : [];
      var pad = pads && (pads[0] || pads[1] || pads[2] || pads[3]);
      if (pad && pad.connected) {
        var now = Date.now();
        var axesX = pad.axes && pad.axes[0] ? pad.axes[0] : 0;
        var axesY = pad.axes && pad.axes[1] ? pad.axes[1] : 0;
        var dUp = pad.buttons[12] && pad.buttons[12].pressed;
        var dDown = pad.buttons[13] && pad.buttons[13].pressed;
        var dLeft = pad.buttons[14] && pad.buttons[14].pressed;
        var dRight = pad.buttons[15] && pad.buttons[15].pressed;

        if (now - lastMoveTime > 190) {
          if (dDown || dLeft || axesY > 0.55 || axesX < -0.55) {
            stepFocus(1);
            lastMoveTime = now;
          } else if (dUp || dRight || axesY < -0.55 || axesX > 0.55) {
            stepFocus(-1);
            lastMoveTime = now;
          }
        }

        var b0 = !!(pad.buttons[0] && pad.buttons[0].pressed);
        if (b0 && !lastBtnState[0] && document.activeElement) {
          document.activeElement.click();
        }
        lastBtnState[0] = b0;

        var b1 = !!(pad.buttons[1] && pad.buttons[1].pressed);
        if (b1 && !lastBtnState[1] && getTopModalId()) {
          closeModalLayer(getTopModalId());
        }
        lastBtnState[1] = b1;

        var b2 = !!(pad.buttons[2] && pad.buttons[2].pressed);
        if (b2 && !lastBtnState[2] && getTopModalId() === 'modal-question') {
          revealCurrentQuestionAnswer();
        }
        lastBtnState[2] = b2;

        var b3 = !!(pad.buttons[3] && pad.buttons[3].pressed);
        if (b3 && !lastBtnState[3] && getTopModalId() === 'modal-question') {
          handleActivateLifelineKey('show_options');
        }
        lastBtnState[3] = b3;

        var b4 = !!(pad.buttons[4] && pad.buttons[4].pressed);
        if (b4 && !lastBtnState[4] && getTopModalId() === 'modal-question') {
          handlePassTurnToOtherTeam();
        }
        lastBtnState[4] = b4;

        var b5 = !!(pad.buttons[5] && pad.buttons[5].pressed);
        if (b5 && !lastBtnState[5] && getTopModalId() === 'modal-question' && AppState.activeMatch && AppState.activeQuestionModal.cellId) {
          Engine.pauseCellTimer(AppState.activeMatch, AppState.activeQuestionModal.cellId, Date.now());
          saveToStorage(Engine.STORAGE_KEYS.ACTIVE_MATCH, AppState.activeMatch);
          renderQuestionModalState();
        }
        lastBtnState[5] = b5;
      }
      window.requestAnimationFrame(poll);
    }

    window.addEventListener('gamepadconnected', function () {
      showToast('🎮 تم توصيل يد التحكم بنجاح! استخدم الأسهم للتنقل و✕ للاختيار.');
    });
    window.requestAnimationFrame(poll);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

  /* ==========================================================================
     SEEN JEEM v9 — TTS READ-ALOUD, WAKE LOCK, UI SCALE, KEYBOARD NAVIGATION,
     HALL OF FAME, SHAREABLE SCOREBOARD PNG, AND CUSTOM PACKS MANAGER
     ========================================================================== */
  var activeWakeLock = null;
  function requestMatchWakeLock() {
    try {
      if (typeof navigator !== 'undefined' && navigator.wakeLock && typeof navigator.wakeLock.request === 'function') {
        navigator.wakeLock.request('screen').then(function (lock) {
          activeWakeLock = lock;
        }).catch(function () {});
      }
    } catch (e) {}
  }

  function speakCurrentQuestion() {
    var match = AppState.activeMatch;
    var cellId = AppState.activeQuestionModal && AppState.activeQuestionModal.cellId;
    if (!match || !cellId || !match.questionsByCell[cellId]) return;
    var q = match.questionsByCell[cellId];
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      showToast('ميزة القراءة الصوتية غير مدعومة في هذا المتصفح.');
      return;
    }
    try {
      window.speechSynthesis.cancel();
      var utter = new SpeechSynthesisUtterance(q.question);
      utter.lang = 'ar-KW';
      var voices = window.speechSynthesis.getVoices ? window.speechSynthesis.getVoices() : [];
      var arVoice = voices.find(function (v) { return v.lang && v.lang.indexOf('ar-KW') === 0; }) ||
                    voices.find(function (v) { return v.lang && v.lang.indexOf('ar-SA') === 0; }) ||
                    voices.find(function (v) { return v.lang && v.lang.indexOf('ar') === 0; });
      if (arVoice) utter.voice = arVoice;
      utter.rate = 0.96;
      window.speechSynthesis.speak(utter);
      showToast('🔊 جاري قراءة السؤال صوتياً...');
    } catch (e) {
      showToast('تعذر تشغيل القراءة الصوتية.');
    }
  }

  function stepUiScale(deltaPercent) {
    var cur = computeEffectiveUiScale(AppState.settings.textSize || 'auto');
    var nextPct = Math.max(90, Math.min(200, Math.round(cur * 100 / 10) * 10 + deltaPercent));
    AppState.settings.textSize = String(nextPct);
    saveToStorage(Engine.STORAGE_KEYS.SETTINGS, AppState.settings);
    applySettingsToDOM();
    syncSettingsModalUI();
  }

  function toggleBigScreenPresentation() {
    AppState.settings.bigScreenMode = !AppState.settings.bigScreenMode;
    saveToStorage(Engine.STORAGE_KEYS.SETTINGS, AppState.settings);
    applySettingsToDOM();
    showToast(AppState.settings.bigScreenMode ? '🖥️ تم تفعيل وضع العرض الكبير للجمهور' : 'تم العودة للوضع القياسي');
  }

  function renderHallOfFameModal() {
    var summaryEl = document.getElementById('hof-stats-summary');
    var listEl = document.getElementById('hof-records-list');
    var stats = loadFromStorage(Engine.STORAGE_KEYS.STATS, { matchesCompleted: 0, highestScore: 0, records: [] });
    var playedCount = Object.keys(AppState.playedHistory || {}).length;
    if (summaryEl) {
      summaryEl.innerHTML =
        '<div class="stat-card"><div class="stat-val">' + (stats.matchesCompleted || 0) + '</div><div class="stat-lbl">مباريات مكتملة</div></div>' +
        '<div class="stat-card"><div class="stat-val">' + (stats.highestScore || 0) + '</div><div class="stat-lbl">أعلى نقاط فريق</div></div>' +
        '<div class="stat-card"><div class="stat-val">' + playedCount + '</div><div class="stat-lbl">أسئلة تم حسمها</div></div>' +
        '<div class="stat-card"><div class="stat-val">' + DATA.categories.length + '</div><div class="stat-lbl">إجمالي الفئات</div></div>';
    }
    if (listEl) {
      var recs = Array.isArray(stats.records) ? stats.records : [];
      if (recs.length === 0) {
        listEl.innerHTML = '<div style="color:var(--text-muted);">لا توجد مباريات مسجلة بعد؛ أكمل مباراة لتخليد نتيجتها في لوحة الشرف!</div>';
      } else {
        listEl.innerHTML = recs.slice(0, 8).map(function (r, idx) {
          return '<div style="display:flex; justify-content:space-between; padding:0.45rem 0.65rem; background:var(--bg-surface); border-radius:8px;">' +
            '<strong>#' + (idx + 1) + ' — ' + (r.winner || 'تعادل') + '</strong>' +
            '<span style="color:var(--accent-gold); font-weight:800;">' + (r.scoreText || '') + '</span>' +
            '</div>';
        }).join('');
      }
    }
  }

  function downloadScoreboardPng() {
    var match = AppState.activeMatch;
    if (!match) {
      showToast('لا توجد نتيجة مباراة حالية لحفظها.');
      return;
    }
    try {
      var can = document.createElement('canvas');
      can.width = 1200;
      can.height = 675;
      var ctx = can.getContext('2d');
      var grad = ctx.createLinearGradient(0, 0, 1200, 675);
      grad.addColorStop(0, '#000000');
      grad.addColorStop(0.5, '#0f172a');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1200, 675);

      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 5;
      ctx.strokeRect(28, 28, 1144, 619);

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 46px Tajawal, Cairo, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('سين جيم — تحدي المعرفة • النتيجة النهائية', 600, 110);

      var t1 = match.teams.team1;
      var t2 = match.teams.team2;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(100, 180, 440, 300);
      ctx.fillRect(660, 180, 440, 300);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 38px Tajawal, Cairo, sans-serif';
      ctx.fillText(t1.name, 320, 260);
      ctx.fillStyle = '#f97316';
      ctx.fillText(t2.name, 880, 260);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 76px Tajawal, Cairo, sans-serif';
      ctx.fillText(String(t1.score), 320, 385);
      ctx.fillText(String(t2.score), 880, 385);

      var winnerTxt = t1.score > t2.score ? ('🏆 الفائز: ' + t1.name) : (t2.score > t1.score ? ('🏆 الفائز: ' + t2.name) : '🤝 تعادل مثير بين الفريقين!');
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 42px Tajawal, Cairo, sans-serif';
      ctx.fillText(winnerTxt, 600, 565);

      var dataUrl = can.toDataURL('image/png');
      var a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'seen_jeem_scoreboard.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast('📸 تم حفظ بطاقة النتيجة كصورة بنجاح!');
    } catch (e) {
      showToast('تعذر إنشاء صورة النتيجة.');
    }
  }

  function loadAndMergeCustomPacks() {
    var packs = loadFromStorage(Engine.STORAGE_KEYS.CUSTOM_PACKS, []);
    if (!Array.isArray(packs)) packs = [];
    packs.forEach(function (item) {
      if (!item || !item.catId || !item.catTitle || !item.question) return;
      var cat = CAT_BY_ID[item.catId];
      if (!cat) {
        cat = {
          id: item.catId,
          groupId: 'group_h',
          groupTitle: 'مخصص',
          title: item.catTitle + ' (مخصص)',
          enTitle: '',
          description: 'فئة مخصصة أضافها مقدم المسابقة محلياً على هذا الجهاز.',
          icon: '✨',
          theme: { primary: '#7c3aed', secondary: '#a78bfa', accent: '#fbbf24' },
          image: 'asset:cat_cover_general_knowledge',
          imageDataUri: 'asset:cat_cover_general_knowledge',
          coverAssetId: 'asset:cat_cover_general_knowledge',
          questionCount: 0,
          difficultyDistribution: { '200': 0, '400': 0, '600': 0 },
          isNew: true,
          isCustom: true,
          sampleQuestions: []
        };
        DATA.categories.push(cat);
        CAT_BY_ID[cat.id] = cat;
        QUESTIONS_BY_CAT[cat.id] = [];
      }
      if (!QUESTIONS_BY_CAT[cat.id].some(function (q) { return q.id === item.qObj.id; })) {
        DATA.questions.push(item.qObj);
        QUESTIONS_BY_CAT[cat.id].push(item.qObj);
        cat.questionCount = QUESTIONS_BY_CAT[cat.id].length;
      }
    });
    var badge = document.getElementById('custom-packs-count-badge');
    if (badge) badge.textContent = packs.length + ' أسئلة مخصصة';
  }

  function bindV9ExtraEvents() {
    loadAndMergeCustomPacks();

    var scaleDownBtn = document.getElementById('btn-ui-scale-down');
    var scaleUpBtn = document.getElementById('btn-ui-scale-up');
    if (scaleDownBtn) scaleDownBtn.addEventListener('click', function () { stepUiScale(-10); });
    if (scaleUpBtn) scaleUpBtn.addEventListener('click', function () { stepUiScale(10); });

    var bigBtn = document.getElementById('btn-toggle-big-screen');
    if (bigBtn) bigBtn.addEventListener('click', toggleBigScreenPresentation);

    var ttsBtn = document.getElementById('btn-tts-question');
    if (ttsBtn) ttsBtn.addEventListener('click', speakCurrentQuestion);

    var hofBtn = document.getElementById('btn-open-hall-of-fame');
    if (hofBtn) {
      hofBtn.addEventListener('click', function () {
        renderHallOfFameModal();
        openModalLayer('modal-hall-of-fame');
      });
    }

    var cpBtn = document.getElementById('btn-open-custom-packs');
    if (cpBtn) {
      cpBtn.addEventListener('click', function () {
        openModalLayer('modal-custom-packs');
      });
    }

    var scBtn = document.getElementById('btn-open-shortcuts');
    if (scBtn) {
      scBtn.addEventListener('click', function () {
        openModalLayer('modal-shortcuts');
      });
    }

    var pngBtn = document.getElementById('btn-download-scoreboard-png');
    if (pngBtn) pngBtn.addEventListener('click', downloadScoreboardPng);

    // Custom Question Add with optional WebP image conversion on <canvas>
    var addCustomBtn = document.getElementById('btn-add-custom-question');
    if (addCustomBtn) {
      addCustomBtn.addEventListener('click', function () {
        var cTitle = (document.getElementById('input-custom-cat-title').value || '').trim() || 'حزمة مخصصة';
        var qTxt = (document.getElementById('input-custom-q-text').value || '').trim();
        var ans = (document.getElementById('input-custom-q-ans').value || '').trim();
        var w1 = (document.getElementById('input-custom-q-w1').value || '').trim() || 'خيار بديل ١';
        var w2 = (document.getElementById('input-custom-q-w2').value || '').trim() || 'خيار بديل ٢';
        var fileInp = document.getElementById('input-custom-q-img');
        if (!qTxt || !ans) {
          showToast('يرجى إدخال نص السؤال والإجابة الصحيحة.');
          return;
        }
        var cid = 'custom_' + Engine.normalizeArabicText(cTitle).replace(/\s+/g, '_').slice(0, 18);
        function finalizeCustomQuestion(webpDataUri) {
          var packs = loadFromStorage(Engine.STORAGE_KEYS.CUSTOM_PACKS, []);
          if (!Array.isArray(packs)) packs = [];
          var ptsArr = [200, 400, 600];
          var pts = ptsArr[packs.length % 3];
          var qObj = {
            id: cid + '_q' + (packs.length + 1),
            categoryId: cid,
            difficulty: pts === 200 ? 'easy' : (pts === 400 ? 'medium' : 'hard'),
            points: pts,
            question: qTxt,
            options: [ans, w1, w2],
            correctAnswerIndex: 0,
            answer: ans,
            acceptedAnswers: [ans],
            explanation: 'سؤال مخصص أُضيف بواسطة مقدم المسابقة.',
            image: webpDataUri || null,
            imageDataUri: webpDataUri || null,
            assetId: null,
            imageAlt: webpDataUri ? ('صورة سؤال مخصص في ' + cTitle) : '',
            imageRevealCaption: webpDataUri ? ans : '',
            source: 'حزمة مخصصة',
            sourceTitle: 'حزمة مخصصة',
            sourceUrl: '',
            reviewStatus: 'curated',
            format: webpDataUri ? 'visual_clue' : 'standard'
          };
          packs.push({ catId: cid, catTitle: cTitle, question: qTxt, qObj: qObj });
          saveToStorage(Engine.STORAGE_KEYS.CUSTOM_PACKS, packs);
          loadAndMergeCustomPacks();
          renderCategoriesGrid();
          renderHomeStats();
          showToast('✅ تمت إضافة السؤال المخصص بنجاح!');
        }
        if (fileInp && fileInp.files && fileInp.files[0]) {
          var reader = new FileReader();
          reader.onload = function (ev) {
            var im = new Image();
            im.onload = function () {
              var c = document.createElement('canvas');
              c.width = 640;
              c.height = 427;
              var cx = c.getContext('2d');
              cx.drawImage(im, 0, 0, 640, 427);
              finalizeCustomQuestion(c.toDataURL('image/webp', 0.74));
            };
            im.src = ev.target.result;
          };
          reader.readAsDataURL(fileInp.files[0]);
        } else {
          finalizeCustomQuestion('');
        }
      });
    }

    // Export / Import Custom Packs
    var expCpBtn = document.getElementById('btn-export-custom-packs');
    if (expCpBtn) {
      expCpBtn.addEventListener('click', function () {
        var packs = loadFromStorage(Engine.STORAGE_KEYS.CUSTOM_PACKS, []);
        var blob = new Blob([JSON.stringify(packs, null, 2)], { type: 'application/json' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'seen_jeem_custom_packs.json';
        a.click();
      });
    }
    var impCpBtn = document.getElementById('btn-import-custom-packs');
    var impCpFile = document.getElementById('input-import-custom-packs-file');
    if (impCpBtn && impCpFile) {
      impCpBtn.addEventListener('click', function () { impCpFile.click(); });
      impCpFile.addEventListener('change', function (e) {
        if (e.target.files && e.target.files[0]) {
          var r = new FileReader();
          r.onload = function (ev) {
            try {
              var arr = JSON.parse(ev.target.result);
              if (Array.isArray(arr)) {
                saveToStorage(Engine.STORAGE_KEYS.CUSTOM_PACKS, arr);
                loadAndMergeCustomPacks();
                renderCategoriesGrid();
                showToast('✅ تم استيراد الحزمة المخصصة بنجاح!');
              }
            } catch (err) {
              showToast('ملف الحزمة غير صالح.');
            }
          };
          r.readAsText(e.target.files[0]);
        }
      });
    }

    // Drag-and-Drop Match JSON Import anywhere on window
    window.addEventListener('dragover', function (e) { e.preventDefault(); });
    window.addEventListener('drop', function (e) {
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        var f = e.dataTransfer.files[0];
        if (f.name && f.name.endsWith('.json')) {
          e.preventDefault();
          handleImportMatchFile(f);
        }
      }
    });

    // Ctrl+Wheel & Keyboard Shortcuts (1/2/3, P/ح, F/ف, +/-, ?/؟, Arrows)
    window.addEventListener('wheel', function (e) {
      if (e.ctrlKey) {
        e.preventDefault();
        stepUiScale(e.deltaY < 0 ? 10 : -10);
      }
    }, { passive: false });

    window.addEventListener('keydown', function (e) {
      var tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      if (e.ctrlKey && (e.key === '+' || e.key === '=')) {
        e.preventDefault();
        stepUiScale(10);
        return;
      }
      if (e.ctrlKey && e.key === '-') {
        e.preventDefault();
        stepUiScale(-10);
        return;
      }

      var topModal = getTopModalId();
      if (topModal === 'modal-image-lightbox') {
        if (e.key === '+' || e.key === '=') { e.preventDefault(); setLightboxZoom(LightboxState.scale + 0.5, false); return; }
        if (e.key === '-') { e.preventDefault(); setLightboxZoom(LightboxState.scale - 0.5, false); return; }
      }

      if (e.key === '?' || e.key === '؟') {
        e.preventDefault();
        openModalLayer('modal-shortcuts');
        return;
      }
      if (e.key === 'f' || e.key === 'F' || e.key === 'ف') {
        e.preventDefault();
        toggleFullscreen();
        return;
      }

      if (topModal === 'modal-question') {
        if (e.key === 'p' || e.key === 'P' || e.key === 'ح') {
          e.preventDefault();
          var pauseB = document.getElementById('btn-q-timer-pause');
          if (pauseB) pauseB.click();
          return;
        }
        if (e.key === 'ص') {
          e.preventDefault();
          speakCurrentQuestion();
          return;
        }
        if (['1', '2', '3', '١', '٢', '٣'].indexOf(e.key) !== -1) {
          var idx = ['1', '2', '3'].indexOf(e.key);
          if (idx === -1) idx = ['١', '٢', '٣'].indexOf(e.key);
          var optBtns = document.querySelectorAll('#q-modal-options .q-option-card');
          if (optBtns && optBtns[idx]) {
            e.preventDefault();
            optBtns[idx].click();
          }
          return;
        }
      }

      if (['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].indexOf(e.key) !== -1) {
        e.preventDefault();
        var delta = (e.key === 'ArrowLeft' || e.key === 'ArrowDown') ? 1 : -1;
        stepFocus(delta);
      }
    });

    // Overflow "⋯" bottom sheet modal wiring
    var btnNavMore = document.getElementById('btn-nav-more');
    if (btnNavMore) {
      btnNavMore.addEventListener('click', function () {
        applySettingsToDOM();
        openModalLayer('modal-nav-more');
      });
    }
    function bindMoreSheetAction(btnId, fn) {
      var el = document.getElementById(btnId);
      if (el) {
        el.addEventListener('click', function () {
          closeModalLayer('modal-nav-more');
          fn();
        });
      }
    }
    bindMoreSheetAction('btn-more-hall-of-fame', function () {
      renderHallOfFameModal();
      openModalLayer('modal-hall-of-fame');
    });
    bindMoreSheetAction('btn-more-custom-packs', function () {
      updateCustomPacksBadge();
      openModalLayer('modal-custom-packs');
    });
    bindMoreSheetAction('btn-more-shortcuts', function () {
      openModalLayer('modal-shortcuts');
    });
    bindMoreSheetAction('btn-more-howto', function () {
      openModalLayer('modal-howto');
    });
    bindMoreSheetAction('btn-more-theme', function () {
      var tBtn = document.getElementById('btn-toggle-theme');
      if (tBtn) tBtn.click();
    });
    bindMoreSheetAction('btn-more-big-screen', function () {
      toggleBigScreenPresentation();
    });
    var moreDown = document.getElementById('btn-more-scale-down');
    if (moreDown) moreDown.addEventListener('click', function () { stepUiScale(-10); });
    var moreUp = document.getElementById('btn-more-scale-up');
    if (moreUp) moreUp.addEventListener('click', function () { stepUiScale(10); });

    // Orientation & visualViewport listeners
    window.addEventListener('orientationchange', function () {
      setTimeout(function () {
        applySettingsToDOM();
        updateNavbarStickyOffset();
      }, 120);
    });
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', function () {
        updateNavbarStickyOffset();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindV9ExtraEvents);
  } else {
    setTimeout(bindV9ExtraEvents, 0);
  }

})();

