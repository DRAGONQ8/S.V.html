



/**
 * سين جيم — تحدي المعرفة (Seen Jeem — The Ultimate Arabic Quiz Game)
 * Core Deterministic Game Engine v3
 * - 80 Categories & 3,200 Arabic Questions Support
 * - Centralized MEDIA_REGISTRY & Asset ID Resolution (Lightweight State/Saves)
 * - Arabic Search Normalization & Category Favorites
 * - Two-Team Category Selection Ownership (3 per team) & Alternating Board Turns
 * - Distinct selectingTeam, answeringTeam, and awardedTo
 * - 60s Default Primary Timer + 10s Default Steal/Pass Opportunity
 * - 4 Single-Use Lifelines per Team (Up to 3 chosen pre-match):
 *   1. show_options (إظهار الخيارات)
 *   2. two_answers (جوابان)
 *   3. call_friend (اتصال بصديق)
 *   4. the_pit (الحفرة — armed before opening a question; deducts points from opponent on win)
 * - Reconciled Undo + Active-Question Lock & Local Question Issue Reporting (VAR)
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.SeenJeemEngine = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var SCHEMA_VERSION = 3;

  var STORAGE_KEYS = {
    ACTIVE_MATCH: 'seen_jeem_active_match_v1',
    PLAYED_HISTORY: 'seen_jeem_played_qids_v1',
    EXPOSED_HISTORY: 'seen_jeem_exposed_qids_v1',
    SETTINGS: 'seen_jeem_settings_v1',
    SELECTED_CATEGORIES: 'seen_jeem_selected_cats_v1',
    DRAFT_SELECTION: 'seen_jeem_draft_selection_v4',
    FAVORITE_CATEGORIES: 'seen_jeem_fav_cats_v1',
    QUESTION_REPORTS: 'seen_jeem_question_reports_v1',
    STATS: 'seen_jeem_global_stats_v1',
    RECENT_SESSIONS: 'seen_jeem_recent_sessions_v1',
    LOCKED_CATEGORIES: 'seen_jeem_locked_cats_v1',
    CUSTOM_PACKS: 'seen_jeem_custom_packs_v1',
    HALL_OF_FAME: 'seen_jeem_hall_of_fame_v1'
  };

  var VALID_TEAM_COLORS = [
    '#2563EB', '#C2410C', '#0F766E', '#15803D',
    '#7C3AED', '#B91C1C', '#0369A1', '#B45309'
  ];

  var LIFELINE_CATALOG = {
    show_options: {
      key: 'show_options',
      title: 'إظهار الخيارات',
      icon: '💡',
      shortDesc: 'كشف 3 خيارات محتملة للسؤال الحالي دون كشف الإجابة تلقائياً.'
    },
    two_answers: {
      key: 'two_answers',
      title: 'جاوب جوابين',
      icon: '✌️',
      shortDesc: 'يمنح الفريق المجيب حق تقديم إجابتين شفهيتين للسؤال الحالي.'
    },
    call_friend: {
      key: 'call_friend',
      title: 'اتصال بصديق',
      icon: '📞',
      shortDesc: 'نافذة تشاور مؤقتة لمدة 30 ثانية مع إيقاف مؤقت السؤال الأصلي.'
    },
    the_pit: {
      key: 'the_pit',
      title: 'الحفرة',
      icon: '🕳️',
      shortDesc: 'تُفعّل قبل فتح السؤال؛ إذا فاز بها الفريق تُمنح له النقاط وتُخصم نفس القيمة من الخصم!'
    },
    istarih: {
      key: 'istarih',
      title: 'استريح',
      icon: '🪑',
      shortDesc: 'استبعاد أحد لاعبي الفريق الخصم من المشاركة أو التشاور في هذا السؤال.'
    },
    al_fakh: {
      key: 'al_fakh',
      title: 'الفخ',
      icon: '🪤',
      shortDesc: 'تحويل السؤال إجبارياً للفريق الخصم؛ وإذا أخفق الخصم يُخصم منه نصف نقاط السؤال!'
    }
  };

  var DEFAULT_LIFELINE_LOADOUT = ['show_options', 'two_answers', 'the_pit'];

  var DEFAULT_SETTINGS = {
    theme: 'amoled',
    presentationMode: 'normal',   // 'normal' | 'high-contrast'
    textSize: 'auto',             // 'auto' | '90'..'200'
    bigScreenMode: false,
    cardDensity: 'comfortable',   // 'comfortable' | 'compact'
    soundEffects: true,
    soundVolume: 85,
    musicEnabled: false,
    animationIntensity: 'normal', // 'normal' | 'reduced'
    timerSeconds: 60,             // 0 (off), 30, 45, 60 (default), 90
    penaltyMode: 'none',          // 'none' | 'half' | 'full'
    boardMode: 'classic',         // 'classic' (36 cells) | 'quick' (18 cells)
    showOpenAnswerHint: true,
    lifelinesPerTeam: 3,          // 0 (disabled), 1, 2, 3 (default)
    team1Lifelines: ['show_options', 'two_answers', 'the_pit'],
    team2Lifelines: ['show_options', 'two_answers', 'the_pit'],
    allowSteal: true,             // true | false
    stealTimerSeconds: 10,        // 10 (default) | 15 | 20
    excludeSpoilers: false,       // true | false
    goldenCellsEnabled: true,     // true | false (2 random 2x Golden Double cells)
    selectionMode: 'team_turns',  // 'team_turns' (3 per team) | 'host_quick'
    team1DefaultName: 'صقور المعرفة',
    team2DefaultName: 'فرسان التحدي',
    team1Color: '#2563EB',
    team2Color: '#C2410C'
  };

  function safeClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function sanitizeColor(color, fallback) {
    if (typeof color === 'string' && /^#[0-9a-fA-F]{6}$/.test(color.trim())) {
      return color.trim();
    }
    return fallback || '#0ea5e9';
  }

  function sanitizeImageUri(uri) {
    if (!uri || typeof uri !== 'string') return '';
    var trimmed = uri.trim();
    if (trimmed.indexOf('asset:') === 0 ||
        trimmed.indexOf('https://') === 0 ||
        trimmed.indexOf('data:image/webp') === 0 ||
        trimmed.indexOf('data:image/png') === 0 ||
        trimmed.indexOf('data:image/jpeg') === 0 ||
        trimmed.indexOf('data:image/svg+xml') === 0 ||
        trimmed.indexOf('src/assets/') === 0) {
      return trimmed;
    }
    return '';
  }

  function resolveMediaUri(uriOrAssetId, registry) {
    var clean = sanitizeImageUri(uriOrAssetId);
    if (!clean) return '';
    if (clean.indexOf('asset:') === 0) {
      var reg = registry || (typeof self !== 'undefined' && self.SEEN_JEEM_DATA && self.SEEN_JEEM_DATA.mediaRegistry) || null;
      if (reg && reg[clean] && reg[clean].dataUri) {
        return reg[clean].dataUri;
      }
      return '';
    }
    return clean;
  }

  function getMediaMetadata(uriOrAssetId, registry) {
    if (!uriOrAssetId || typeof uriOrAssetId !== 'string') return null;
    var trimmed = uriOrAssetId.trim();
    var reg = registry || (typeof self !== 'undefined' && self.SEEN_JEEM_DATA && self.SEEN_JEEM_DATA.mediaRegistry) || null;
    if (reg && reg[trimmed]) {
      return reg[trimmed];
    }
    return null;
  }

  function normalizeArabicText(str) {
    if (typeof str !== 'string') return '';
    return str
      .trim()
      .toLowerCase()
      .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '') // remove tashkeel
      .replace(/\u0640/g, '')                              // remove tatweel
      .replace(/[أإآٱ]/g, 'ا')                             // normalize alef
      .replace(/ة/g, 'ه')                                  // normalize taa marbuta
      .replace(/[ىئ]/g, 'ي')                               // normalize alef maqsura / yaa hamza
      .replace(/ؤ/g, 'و')                                  // normalize waw hamza
      .replace(/\s+/g, ' ');
  }

  function sanitizeText(str, maxLen, fallback) {
    if (typeof str !== 'string') return fallback || '';
    var cleaned = str.trim();
    if (!cleaned) return fallback || '';
    return maxLen ? cleaned.slice(0, maxLen) : cleaned;
  }

  function sanitizeLifelineList(list, maxCount) {
    var cap = typeof maxCount === 'number' ? Math.max(0, Math.min(3, Math.floor(maxCount))) : 3;
    if (cap === 0) return [];
    var validKeys = Object.keys(LIFELINE_CATALOG);
    var out = [];
    if (Array.isArray(list)) {
      list.forEach(function (k) {
        if (validKeys.indexOf(k) !== -1 && out.indexOf(k) === -1 && out.length < cap) {
          out.push(k);
        }
      });
    }
    if (out.length === 0 && cap > 0) {
      out = DEFAULT_LIFELINE_LOADOUT.slice(0, cap);
    }
    return out;
  }

  function buildTeamLifelineState(selectedKeys, maxCount) {
    var cap = typeof maxCount === 'number' ? Math.max(0, Math.min(3, Math.floor(maxCount))) : 3;
    var keys = sanitizeLifelineList(selectedKeys, cap);
    var map = {};
    Object.keys(LIFELINE_CATALOG).forEach(function (k) {
      map[k] = {
        enabled: keys.indexOf(k) !== -1,
        used: false,
        usedOnCellId: null
      };
    });
    return {
      selectedKeys: keys,
      items: map,
      remainingCount: keys.length,
      usedCount: 0
    };
  }

  function shuffleArray(arr, rng) {
    var randomFn = rng || (typeof self !== 'undefined' && typeof self.__SEEN_JEEM_RNG === 'function' ? self.__SEEN_JEEM_RNG : Math.random);
    var copy = arr.slice();
    for (var i = copy.length - 1; i > 0; i--) {
      var j = Math.floor(randomFn() * (i + 1));
      var temp = copy[i];
      copy[i] = copy[j];
      copy[j] = temp;
    }
    return copy;
  }

  function buildShuffledOptions(question, rng) {
    var rawOpts = Array.isArray(question.options) ? question.options : [];
    var corrIdx = typeof question.correctAnswerIndex === 'number' ? question.correctAnswerIndex : 0;
    var indexed = rawOpts.map(function (text, idx) {
      return {
        text: String(text),
        originalIndex: idx,
        isCorrect: idx === corrIdx
      };
    });
    return shuffleArray(indexed, rng);
  }

  function validateDatabase(categories, questions) {
    var errors = [];
    if (!Array.isArray(categories) || categories.length < 40) {
      errors.push('Category count must be at least 40.');
    }
    if (!Array.isArray(questions) || questions.length < 1600) {
      errors.push('Question count must be at least 1600.');
    }
    var catMap = {};
    var catCounts = {};
    (categories || []).forEach(function (c) {
      if (!c.id || !c.title || !c.image) {
        errors.push('Invalid category metadata for ' + (c.id || 'unknown'));
      }
      catMap[c.id] = c;
      catCounts[c.id] = { total: 0, 200: 0, 400: 0, 600: 0 };
    });

    var seenIds = {};
    (questions || []).forEach(function (q) {
      if (!q.id || seenIds[q.id]) {
        errors.push('Duplicate or missing question ID: ' + q.id);
      }
      seenIds[q.id] = true;
      if (!catMap[q.categoryId]) {
        errors.push('Unknown categoryId ' + q.categoryId + ' in question ' + q.id);
      } else {
        catCounts[q.categoryId].total += 1;
        catCounts[q.categoryId][q.points] = (catCounts[q.categoryId][q.points] || 0) + 1;
      }
      if ([200, 400, 600].indexOf(q.points) === -1) {
        errors.push('Invalid points in ' + q.id);
      }
      if (!q.answer || typeof q.answer !== 'string') {
        errors.push('Missing canonical answer in ' + q.id);
      }
      if (!Array.isArray(q.acceptedAnswers) || q.acceptedAnswers.length < 1) {
        errors.push('Missing acceptedAnswers in ' + q.id);
      }
      if (!Array.isArray(q.options) || q.options.length !== 3) {
        errors.push('Options length !== 3 in ' + q.id);
      }
      if ([0, 1, 2].indexOf(q.correctAnswerIndex) === -1) {
        errors.push('Invalid correctAnswerIndex in ' + q.id);
      }
      if (!q.explanation || typeof q.explanation !== 'string') {
        errors.push('Missing explanation in ' + q.id);
      }
      if (!q.source || typeof q.source !== 'string') {
        errors.push('Missing source in ' + q.id);
      }
    });

    Object.keys(catCounts).forEach(function (cid) {
      var dist = catCounts[cid];
      if (dist[200] < 2 || dist[400] < 2 || dist[600] < 2) {
        errors.push('Insufficient difficulty supply in category ' + cid);
      }
    });

    return {
      valid: errors.length === 0,
      errors: errors,
      categoryCounts: catCounts,
      totalCategories: (categories || []).length,
      totalQuestions: (questions || []).length
    };
  }

  function selectCategoryMatchQuestions(categoryQuestions, seenHistorySet, rng, perTierCount, excludeSpoilers) {
    var needPerTier = perTierCount === 1 ? 1 : 2;
    var tiers = [200, 400, 600];
    var selected = [];
    var newlyResetPool = false;
    var exhaustedTiers = [];
    var historyMap = seenHistorySet || {};

    tiers.forEach(function (pts) {
      var rawTierPool = categoryQuestions.filter(function (q) { return q.points === pts; });
      var nonSpoilerPool = excludeSpoilers ? rawTierPool.filter(function (q) { return !q.spoiler; }) : rawTierPool;
      var tierPool = nonSpoilerPool.length >= needPerTier ? nonSpoilerPool : rawTierPool;
      var unseen = tierPool.filter(function (q) { return !historyMap[q.id]; });
      var seen = tierPool.filter(function (q) { return !!historyMap[q.id]; });

      var shuffledUnseen = shuffleArray(unseen, rng);
      var picks = shuffledUnseen.slice(0, needPerTier);

      if (picks.length < needPerTier) {
        newlyResetPool = true;
        exhaustedTiers.push(pts);
        var needed = needPerTier - picks.length;
        var shuffledSeen = shuffleArray(seen, rng);
        picks = picks.concat(shuffledSeen.slice(0, needed));
      }
      selected = selected.concat(picks);
    });

    return {
      questions: selected,
      poolExhaustedFallback: newlyResetPool,
      exhaustedTiers: exhaustedTiers
    };
  }

  function createMatch(config) {
    var selectedCatIds = config.selectedCategoryIds || [];
    if (!Array.isArray(selectedCatIds) || selectedCatIds.length !== 6) {
      throw new Error('يجب اختيار 6 فئات بالضبط لبدء المباراة.');
    }
    var uniqueCats = {};
    selectedCatIds.forEach(function (id) { uniqueCats[id] = true; });
    if (Object.keys(uniqueCats).length !== 6) {
      throw new Error('لا يمكن تكرار نفس الفئة مرتين في المباراة الواحدة.');
    }

    var allCategories = config.categories || [];
    var allQuestions = config.questions || [];
    var playedHistory = config.playedHistory || {};
    var exposedHistory = config.exposedHistory || {};
    var combinedSeen = Object.assign({}, playedHistory, exposedHistory);
    var rng = config.rng || Math.random;

    var lifelinesPerTeam = typeof config.lifelinesPerTeam === 'number'
      ? Math.max(0, Math.min(3, Math.floor(config.lifelinesPerTeam)))
      : DEFAULT_SETTINGS.lifelinesPerTeam;

    var t1LifelineState = buildTeamLifelineState(config.team1Lifelines || DEFAULT_LIFELINE_LOADOUT, lifelinesPerTeam);
    var t2LifelineState = buildTeamLifelineState(config.team2Lifelines || DEFAULT_LIFELINE_LOADOUT, lifelinesPerTeam);

    var allowSteal = typeof config.allowSteal === 'boolean'
      ? config.allowSteal
      : DEFAULT_SETTINGS.allowSteal;
    var stealTimerSeconds = typeof config.stealTimerSeconds === 'number' && config.stealTimerSeconds > 0
      ? config.stealTimerSeconds
      : DEFAULT_SETTINGS.stealTimerSeconds;

    var categoryOwners = config.categoryOwners || {};
    var columns = [];
    var matchQuestionMap = {};
    var poolFallbackCategories = [];

    selectedCatIds.forEach(function (cid, colIdx) {
      var catMeta = allCategories.find(function (c) { return c.id === cid; });
      if (!catMeta) {
        throw new Error('فئة غير موجودة: ' + cid);
      }
      var catQuestions = allQuestions.filter(function (q) { return q.categoryId === cid; });
      var isQuick = config.boardMode === 'quick';
      var perTier = isQuick ? 1 : 2;
      var selection = selectCategoryMatchQuestions(catQuestions, combinedSeen, rng, perTier, !!config.excludeSpoilers);
      if (selection.questions.length !== perTier * 3) {
        throw new Error('عدد الأسئلة غير كافٍ في الفئة: ' + catMeta.title);
      }
      if (selection.poolExhaustedFallback) {
        poolFallbackCategories.push(catMeta.title);
      }

      var ownerTeam = categoryOwners[cid] || (colIdx < 3 ? 'team1' : 'team2');

      var cells = selection.questions.map(function (q, idx) {
        var cellId = 'cell_' + colIdx + '_' + idx;
        var qClone = safeClone(q);
        if (!qClone.answer && Array.isArray(qClone.options) && typeof qClone.correctAnswerIndex === 'number') {
          qClone.answer = qClone.options[qClone.correctAnswerIndex];
        }
        if (!Array.isArray(qClone.acceptedAnswers) || qClone.acceptedAnswers.length === 0) {
          qClone.acceptedAnswers = qClone.answer ? [qClone.answer] : [];
        }
        // Keep only lightweight asset ID or URI reference in match state
        if (qClone.assetId) {
          qClone.imageDataUri = sanitizeImageUri(qClone.assetId);
        } else {
          qClone.imageDataUri = sanitizeImageUri(qClone.imageDataUri);
        }
        matchQuestionMap[cellId] = qClone;
        return {
          cellId: cellId,
          categoryId: cid,
          questionId: qClone.id,
          points: qClone.points,
          slotIndex: idx,
          status: 'unopened',
          answered: false,
          selectingTeam: null,
          awardedTo: null,
          penaltyAppliedTo: null,
          pitAppliedTo: null,
          pitDeduction: 0,
          session: null
        };
      });

      var coverRef = sanitizeImageUri(catMeta.coverAssetId || catMeta.imageDataUri || catMeta.image);
      var thumbRef = sanitizeImageUri(catMeta.thumbAssetId || coverRef);
      columns.push({
        categoryId: cid,
        title: catMeta.title,
        icon: catMeta.icon,
        selectedByTeam: ownerTeam,
        image: sanitizeImageUri(catMeta.image),
        imageDataUri: coverRef,
        coverAssetId: coverRef,
        thumbAssetId: thumbRef,
        theme: catMeta.theme,
        cells: cells
      });
    });

    return {
      schemaVersion: SCHEMA_VERSION,
      matchId: 'match_' + Date.now(),
      createdAt: new Date().toISOString(),
      status: 'in_progress',
      teams: {
        team1: {
          id: 'team1',
          name: sanitizeText(config.team1Name, 28, DEFAULT_SETTINGS.team1DefaultName),
          color: sanitizeColor(config.team1Color, DEFAULT_SETTINGS.team1Color),
          score: 0,
          correctCount: 0,
          penaltyCount: 0,
          lifelinesRemaining: t1LifelineState.remainingCount,
          lifelinesUsed: 0,
          lifelines: t1LifelineState.items,
          selectedLifelines: t1LifelineState.selectedKeys
        },
        team2: {
          id: 'team2',
          name: sanitizeText(config.team2Name, 28, DEFAULT_SETTINGS.team2DefaultName),
          color: sanitizeColor(config.team2Color, DEFAULT_SETTINGS.team2Color),
          score: 0,
          correctCount: 0,
          penaltyCount: 0,
          lifelinesRemaining: t2LifelineState.remainingCount,
          lifelinesUsed: 0,
          lifelines: t2LifelineState.items,
          selectedLifelines: t2LifelineState.selectedKeys
        }
      },
      currentTurn: 'team1',
      armedPitByTeam: null, // 'team1' | 'team2' | null (armed before opening a cell)
      settings: {
        timerSeconds: typeof config.timerSeconds === 'number' ? config.timerSeconds : DEFAULT_SETTINGS.timerSeconds,
        penaltyMode: ['none', 'half', 'full'].indexOf(config.penaltyMode) !== -1 ? config.penaltyMode : DEFAULT_SETTINGS.penaltyMode,
        lifelinesPerTeam: lifelinesPerTeam,
        allowSteal: allowSteal,
        stealTimerSeconds: stealTimerSeconds,
        excludeSpoilers: !!config.excludeSpoilers
      },
      columns: (function () {
        if (config.goldenCellsEnabled !== false) {
          var t1High = [];
          var t2High = [];
          columns.forEach(function (col, cIdx) {
            col.cells.forEach(function (cl) {
              if (cl.points >= 400) {
                if (cIdx < 3) t1High.push(cl);
                else t2High.push(cl);
              }
            });
          });
          if (t1High.length > 0) {
            var g1 = shuffleArray(t1High, rng)[0];
            g1.isGoldenDouble = true;
          }
          if (t2High.length > 0) {
            var g2 = shuffleArray(t2High, rng)[0];
            g2.isGoldenDouble = true;
          }
        }
        return columns;
      })(),
      questionsByCell: matchQuestionMap,
      activeCellId: null,
      answeredCount: 0,
      totalCells: (config.boardMode === 'quick' ? 18 : 36),
      boardMode: (config.boardMode === 'quick' ? 'quick' : 'classic'),
      poolFallbackCategories: poolFallbackCategories,
      actionHistory: []
    };
  }

  function findCell(matchState, cellId) {
    if (!matchState || !Array.isArray(matchState.columns)) return null;
    for (var c = 0; c < matchState.columns.length; c++) {
      var col = matchState.columns[c];
      for (var r = 0; r < col.cells.length; r++) {
        if (col.cells[r].cellId === cellId) {
          return col.cells[r];
        }
      }
    }
    return null;
  }

  /**
   * Arms or disarms "الحفرة" (the_pit) before opening a question cell.
   */
  function armPitLifeline(matchState, teamId) {
    if (!matchState || matchState.status !== 'in_progress') {
      throw new Error('لا توجد مباراة نشطة.');
    }
    if (matchState.activeCellId) {
      var activeOther = findCell(matchState, matchState.activeCellId);
      if (activeOther && !activeOther.answered && activeOther.status !== 'unopened' && activeOther.status !== 'resolved') {
        throw new Error('يجب تفعيل وسيلة «الحفرة» قبل فتح السؤال وليس بعد فتحه!');
      }
    }
    var targetTeamId = teamId || matchState.currentTurn;
    if (targetTeamId !== matchState.currentTurn) {
      throw new Error('لا يمكن تفعيل «الحفرة» إلا للفريق صاحب دور الاختيار الحالي (' + matchState.teams[matchState.currentTurn].name + ').');
    }
    var team = matchState.teams[targetTeamId];
    if (!team || !team.lifelines || !team.lifelines.the_pit || !team.lifelines.the_pit.enabled) {
      throw new Error('وسيلة «الحفرة» غير ضمن وسائل المساعدة المختارة لهذا الفريق.');
    }
    if (team.lifelines.the_pit.used) {
      throw new Error('تم استخدام وسيلة «الحفرة» مسبقاً لهذا الفريق.');
    }

    if (matchState.armedPitByTeam === targetTeamId) {
      matchState.armedPitByTeam = null;
      return { armed: false, teamId: targetTeamId };
    }
    matchState.armedPitByTeam = targetTeamId;
    return { armed: true, teamId: targetTeamId };
  }

  function openCellSession(matchState, cellId, nowMs, rng) {
    var now = typeof nowMs === 'number' ? nowMs : Date.now();
    var cell = findCell(matchState, cellId);
    if (!cell) {
      throw new Error('لم يتم العثور على الخلية المطلوبة.');
    }
    if (cell.answered || cell.status === 'resolved') {
      throw new Error('تم حسم هذا السؤال مسبقاً.');
    }

    if (matchState.activeCellId && matchState.activeCellId !== cellId) {
      var activeOther = findCell(matchState, matchState.activeCellId);
      if (activeOther && !activeOther.answered && activeOther.status !== 'unopened' && activeOther.status !== 'resolved') {
        throw new Error('يوجد سؤال مفتوح قيد اللعب حالياً؛ يرجى استكماله أو حسمه أولاً.');
      }
    }

    var q = matchState.questionsByCell[cellId];
    if (!q) {
      throw new Error('بيانات السؤال غير موجودة.');
    }

    var isNewExposure = false;
    if (!cell.session || cell.status === 'unopened') {
      isNewExposure = true;
      var totalMs = Math.max(0, (matchState.settings.timerSeconds || 0) * 1000);
      var pitTeam = null;
      if (matchState.armedPitByTeam && matchState.teams[matchState.armedPitByTeam]) {
        var armTeamObj = matchState.teams[matchState.armedPitByTeam];
        if (armTeamObj.lifelines && armTeamObj.lifelines.the_pit && armTeamObj.lifelines.the_pit.enabled && !armTeamObj.lifelines.the_pit.used) {
          pitTeam = matchState.armedPitByTeam;
          armTeamObj.lifelines.the_pit.used = true;
          armTeamObj.lifelines.the_pit.usedOnCellId = cellId;
          armTeamObj.lifelinesRemaining = Math.max(0, (armTeamObj.lifelinesRemaining || 0) - 1);
          armTeamObj.lifelinesUsed = (armTeamObj.lifelinesUsed || 0) + 1;
        }
        matchState.armedPitByTeam = null;
      }

      cell.selectingTeam = matchState.currentTurn;
      cell.session = {
        openedAt: now,
        selectingTeam: matchState.currentTurn,
        answeringTeam: matchState.currentTurn,
        stealUsed: false,
        timerTotalMs: totalMs,
        remainingMs: totalMs,
        timerRunning: totalMs > 0,
        lastTickAt: now,
        expiredFired: false,
        optionsShown: false,
        optionsUsedByTeam: null,
        twoAnswersActiveFor: null,
        callFriendActiveFor: null,
        callFriendRemainingMs: 0,
        pitArmedByTeam: pitTeam,
        shuffledOptions: buildShuffledOptions(q, rng),
        selectedShuffledIndex: null,
        isRevealed: false
      };
      cell.status = 'answering';
    } else {
      if (cell.status === 'answering' && cell.session.timerRunning && !cell.session.isRevealed) {
        cell.session.lastTickAt = now;
      }
    }

    matchState.activeCellId = cellId;
    return {
      cell: cell,
      session: cell.session,
      question: q,
      isNewExposure: isNewExposure
    };
  }

  function syncSessionTimer(matchState, cellId, nowMs) {
    var now = typeof nowMs === 'number' ? nowMs : Date.now();
    var cell = findCell(matchState, cellId);
    if (!cell || !cell.session) return null;
    var s = cell.session;

    if (s.timerTotalMs <= 0 || s.isRevealed || cell.status === 'resolved' || cell.status === 'revealed') {
      s.timerRunning = false;
      return s;
    }

    if (s.timerRunning && cell.status === 'answering') {
      var elapsed = Math.max(0, now - (s.lastTickAt || now));
      s.remainingMs = Math.max(0, s.remainingMs - elapsed);
      s.lastTickAt = now;
      if (s.remainingMs <= 0) {
        s.remainingMs = 0;
        s.timerRunning = false;
        cell.status = 'expired';
      }
    }
    return s;
  }

  function pauseCellTimer(matchState, cellId, nowMs, forcePause) {
    var now = typeof nowMs === 'number' ? nowMs : Date.now();
    var cell = findCell(matchState, cellId);
    if (!cell || !cell.session) return null;
    var s = cell.session;

    if (s.timerTotalMs <= 0 || s.isRevealed || cell.status === 'revealed' || cell.status === 'expired' || cell.status === 'resolved') {
      return s;
    }

    syncSessionTimer(matchState, cellId, now);
    if (cell.status === 'expired') return s;

    var shouldPause = typeof forcePause === 'boolean' ? forcePause : (cell.status === 'answering');
    if (shouldPause) {
      s.timerRunning = false;
      s.lastTickAt = now;
      cell.status = 'paused';
    } else {
      if (s.remainingMs > 0) {
        s.timerRunning = true;
        s.lastTickAt = now;
        cell.status = 'answering';
      }
    }
    return s;
  }

  /**
   * Unified handler for in-question lifelines:
   * - 'show_options' (إظهار الخيارات)
   * - 'two_answers' (جوابان)
   * - 'call_friend' (اتصال بصديق)
   */
  function useTeamLifeline(matchState, cellId, teamId, lifelineKey) {
    var key = lifelineKey || 'show_options';
    var cell = findCell(matchState, cellId);
    if (!cell || !cell.session) {
      throw new Error('لا توجد جلسة سؤال نشطة.');
    }
    var s = cell.session;
    if (s.isRevealed || cell.status === 'revealed' || cell.status === 'resolved') {
      throw new Error('لا يمكن استخدام وسيلة المساعدة بعد كشف الإجابة.');
    }
    if (cell.status === 'expired') {
      throw new Error('انتهى وقت السؤال ولا يمكن تفعيل وسيلة المساعدة الآن.');
    }
    if ((matchState.settings.lifelinesPerTeam || 0) <= 0) {
      throw new Error('وسائل المساعدة غير مفعلة في إعدادات هذه المباراة.');
    }
    if (key === 'the_pit') {
      throw new Error('وسيلة «الحفرة» تُفعّل من لوحة اللعب قبل فتح السؤال وليس بعد فتحه!');
    }

    var targetTeamId = teamId || s.answeringTeam || matchState.currentTurn;
    var team = matchState.teams[targetTeamId];
    if (!team) {
      throw new Error('الفريق المحدد غير صالح.');
    }

    // Ensure lifelines map exists for v1/v2 migrated saves
    if (!team.lifelines) {
      var migrated = buildTeamLifelineState(DEFAULT_LIFELINE_LOADOUT, matchState.settings.lifelinesPerTeam);
      team.lifelines = migrated.items;
    }

    var llEntry = team.lifelines[key];
    if (!llEntry || !llEntry.enabled) {
      throw new Error('هذه الوسيلة غير متاحة ضمن اختيارات «' + team.name + '».');
    }
    if (llEntry.used) {
      throw new Error('استخدم «' + team.name + '» هذه الوسيلة مسبقاً في المباراة.');
    }

    if (key === 'show_options') {
      if (s.optionsShown) {
        return { activated: false, alreadyShown: true, lifelineKey: key, session: s };
      }
      s.optionsShown = true;
      s.optionsUsedByTeam = targetTeamId;
    } else if (key === 'two_answers') {
      if (s.twoAnswersActiveFor === targetTeamId) {
        return { activated: false, alreadyShown: true, lifelineKey: key, session: s };
      }
      s.twoAnswersActiveFor = targetTeamId;
    } else if (key === 'call_friend') {
      if (s.callFriendActiveFor === targetTeamId) {
        return { activated: false, alreadyShown: true, lifelineKey: key, session: s };
      }
      s.callFriendActiveFor = targetTeamId;
      s.callFriendRemainingMs = 30000;
      pauseCellTimer(matchState, cellId, Date.now(), true);
    } else if (key === 'istarih') {
      if (s.istarihActiveFor === targetTeamId) {
        return { activated: false, alreadyShown: true, lifelineKey: key, session: s };
      }
      s.istarihActiveFor = targetTeamId;
    } else if (key === 'al_fakh') {
      if (s.fakhArmedBy === targetTeamId) {
        return { activated: false, alreadyShown: true, lifelineKey: key, session: s };
      }
      s.fakhArmedBy = targetTeamId;
      var otherT = targetTeamId === 'team1' ? 'team2' : 'team1';
      s.answeringTeam = otherT;
      s.stealUsed = true;
    } else {
      throw new Error('وسيلة مساعدة غير معروفة: ' + key);
    }

    llEntry.used = true;
    llEntry.usedOnCellId = cellId;
    team.lifelinesRemaining = Math.max(0, (team.lifelinesRemaining || 1) - 1);
    team.lifelinesUsed = (team.lifelinesUsed || 0) + 1;

    return {
      activated: true,
      lifelineKey: key,
      usedByTeam: targetTeamId,
      remainingForTeam: team.lifelinesRemaining,
      session: s
    };
  }

  function useShowOptionsLifeline(matchState, cellId, teamId) {
    return useTeamLifeline(matchState, cellId, teamId, 'show_options');
  }

  function passTurnToOtherTeam(matchState, cellId, nowMs) {
    var now = typeof nowMs === 'number' ? nowMs : Date.now();
    var cell = findCell(matchState, cellId);
    if (!cell || !cell.session) {
      throw new Error('لا توجد جلسة سؤال نشطة.');
    }
    var s = cell.session;
    if (!matchState.settings.allowSteal) {
      throw new Error('ميزة تمرير الفرصة للفريق الآخر غير مفعلة في هذه المباراة.');
    }
    if (s.isRevealed || cell.status === 'revealed' || cell.status === 'resolved') {
      throw new Error('لا يمكن تمرير الفرصة بعد كشف الإجابة.');
    }
    if (s.stealUsed) {
      throw new Error('تم تمرير الفرصة مرة واحدة بالفعل في هذا السؤال.');
    }

    var nextTeam = s.answeringTeam === 'team1' ? 'team2' : 'team1';
    var stealSec = matchState.settings.stealTimerSeconds || DEFAULT_SETTINGS.stealTimerSeconds;
    var stealMs = Math.max(0, stealSec * 1000);

    s.answeringTeam = nextTeam;
    s.stealUsed = true;
    s.timerTotalMs = stealMs;
    s.remainingMs = stealMs;
    s.timerRunning = stealMs > 0;
    s.lastTickAt = now;
    s.expiredFired = false;
    cell.status = 'answering';

    return {
      passedTo: nextTeam,
      remainingMs: stealMs,
      session: s
    };
  }

  function revealCellAnswer(matchState, cellId, nowMs) {
    var now = typeof nowMs === 'number' ? nowMs : Date.now();
    var cell = findCell(matchState, cellId);
    if (!cell) {
      throw new Error('لم يتم العثور على الخلية.');
    }
    if (!cell.session) {
      openCellSession(matchState, cellId, now);
    }
    syncSessionTimer(matchState, cellId, now);
    cell.session.timerRunning = false;
    cell.session.isRevealed = true;
    cell.status = 'revealed';
    return cell.session;
  }

  function getPenaltyAmount(points, penaltyMode) {
    if (penaltyMode === 'half') {
      return Math.floor(points / 2);
    }
    if (penaltyMode === 'full') {
      return points;
    }
    return 0;
  }

  function abandonCellQuestion(matchState, cellId) {
    return scoreCell(matchState, cellId, {
      awardedTo: 'abandoned',
      penalizedTeam: null
    });
  }

  function scoreCell(matchState, cellId, outcome) {
    if (!matchState || !cellId) {
      throw new Error('حالة المباراة أو الخلية غير صالحة.');
    }
    var targetCell = findCell(matchState, cellId);
    if (!targetCell) {
      throw new Error('لم يتم العثور على الخلية المطلوبة.');
    }
    if (targetCell.answered || targetCell.status === 'resolved') {
      throw new Error('تم احتساب هذا السؤال مسبقاً ولا يمكن احتسابه مرتين.');
    }

    var awardedTo = outcome && outcome.awardedTo ? outcome.awardedTo : 'none';
    if (['team1', 'team2', 'none', 'abandoned'].indexOf(awardedTo) === -1) {
      throw new Error('اختيار الفريق غير صالح.');
    }

    var penalizedTeam = outcome && outcome.penalizedTeam ? outcome.penalizedTeam : null;
    var basePoints = targetCell.points;
    var points = targetCell.isGoldenDouble ? (basePoints * 2) : basePoints;
    var penaltyDeduction = 0;
    var fakhArmedBy = (targetCell.session && targetCell.session.fakhArmedBy) ? targetCell.session.fakhArmedBy : null;
    var fakhTargetTeam = fakhArmedBy ? (fakhArmedBy === 'team1' ? 'team2' : 'team1') : null;
    if (fakhTargetTeam && awardedTo !== fakhTargetTeam && awardedTo !== 'abandoned') {
      penalizedTeam = fakhTargetTeam;
      penaltyDeduction = Math.floor(points / 2);
    } else if (penalizedTeam && (penalizedTeam === 'team1' || penalizedTeam === 'team2')) {
      penaltyDeduction = getPenaltyAmount(points, matchState.settings.penaltyMode);
    }

    // Evaluate "الحفرة" (the_pit) effect if armed on this question session
    var pitArmedBy = (targetCell.session && targetCell.session.pitArmedByTeam) ? targetCell.session.pitArmedByTeam : null;
    var pitTargetTeam = null;
    var pitDeduction = 0;
    if (pitArmedBy && (awardedTo === 'team1' || awardedTo === 'team2') && awardedTo === pitArmedBy) {
      pitTargetTeam = pitArmedBy === 'team1' ? 'team2' : 'team1';
      pitDeduction = points;
    }

    var selectingTeam = (targetCell.session && targetCell.session.selectingTeam) || targetCell.selectingTeam || matchState.currentTurn;
    var prevStatus = matchState.status;
    var prevSessionClone = targetCell.session ? safeClone(targetCell.session) : null;
    if (prevSessionClone) {
      prevSessionClone.timerRunning = false;
    }

    var actionEntry = {
      type: awardedTo === 'abandoned' ? 'ABANDON_CELL' : 'SCORE_CELL',
      cellId: cellId,
      questionId: targetCell.questionId,
      points: points,
      selectingTeam: selectingTeam,
      prevTeam1Score: matchState.teams.team1.score,
      prevTeam2Score: matchState.teams.team2.score,
      prevTeam1Correct: matchState.teams.team1.correctCount,
      prevTeam2Correct: matchState.teams.team2.correctCount,
      prevTeam1Penalty: matchState.teams.team1.penaltyCount,
      prevTeam2Penalty: matchState.teams.team2.penaltyCount,
      prevTeam1Lifelines: safeClone(matchState.teams.team1.lifelines),
      prevTeam2Lifelines: safeClone(matchState.teams.team2.lifelines),
      prevTeam1LifelinesRem: matchState.teams.team1.lifelinesRemaining,
      prevTeam2LifelinesRem: matchState.teams.team2.lifelinesRemaining,
      prevTeam1LifelinesUsed: matchState.teams.team1.lifelinesUsed,
      prevTeam2LifelinesUsed: matchState.teams.team2.lifelinesUsed,
      prevTurn: matchState.currentTurn,
      prevAnsweredCount: matchState.answeredCount,
      prevStatus: prevStatus,
      prevCellStatus: targetCell.status === 'unopened' ? 'revealed' : targetCell.status,
      prevCellSession: prevSessionClone,
      awardedTo: awardedTo,
      penalizedTeam: penalizedTeam,
      penaltyDeduction: penaltyDeduction,
      pitAppliedTo: pitTargetTeam,
      pitDeduction: pitDeduction,
      wasCompletedTransition: false
    };

    if (awardedTo === 'team1') {
      matchState.teams.team1.score += points;
      matchState.teams.team1.correctCount += 1;
    } else if (awardedTo === 'team2') {
      matchState.teams.team2.score += points;
      matchState.teams.team2.correctCount += 1;
    }

    if (penalizedTeam && penaltyDeduction > 0) {
      matchState.teams[penalizedTeam].score -= penaltyDeduction;
      matchState.teams[penalizedTeam].penaltyCount += 1;
    }

    if (pitTargetTeam && pitDeduction > 0) {
      matchState.teams[pitTargetTeam].score -= pitDeduction;
    }

    targetCell.answered = true;
    targetCell.status = 'resolved';
    targetCell.selectingTeam = selectingTeam;
    targetCell.awardedTo = awardedTo;
    targetCell.effectivePoints = points;
    targetCell.penaltyAppliedTo = penalizedTeam;
    targetCell.penaltyDeduction = penaltyDeduction;
    targetCell.pitAppliedTo = pitTargetTeam;
    targetCell.pitDeduction = pitDeduction;
    if (targetCell.session) {
      targetCell.session.timerRunning = false;
      targetCell.session.isRevealed = true;
    }

    if (matchState.activeCellId === cellId) {
      matchState.activeCellId = null;
    }

    matchState.answeredCount += 1;
    // Turn alternation is strictly based on selectingTeam regardless of who won the points
    matchState.currentTurn = selectingTeam === 'team1' ? 'team2' : 'team1';

    if (matchState.answeredCount >= matchState.totalCells) {
      matchState.status = 'completed';
      if (prevStatus !== 'completed') {
        actionEntry.wasCompletedTransition = true;
      }
    }

    matchState.actionHistory.push(actionEntry);
    return matchState;
  }

  function adjustTeamScore(matchState, payload) {
    if (!matchState || !matchState.teams) {
      throw new Error('لا توجد مباراة نشطة لتعديل نقاطها.');
    }
    var p = payload || {};
    var teamId = p.teamId;
    if (teamId !== 'team1' && teamId !== 'team2') {
      throw new Error('يرجى اختيار فريق صالح (الفريق الأول أو الفريق الثاني).');
    }
    var mode = p.mode === 'deduct' ? 'deduct' : (p.mode === 'add' ? 'add' : '');
    if (!mode) {
      throw new Error('نوع عملية التعديل غير صالح (إضافة أو خصم).');
    }
    var rawAmt = typeof p.amount === 'number' ? p.amount : Number(p.amount);
    if (!Number.isFinite(rawAmt) || Math.floor(rawAmt) !== rawAmt || rawAmt <= 0 || rawAmt > 100000) {
      throw new Error('يرجى إدخال قيمة نقاط صحيحة موجبة أكبر من الصفر.');
    }
    var amount = Math.trunc(rawAmt);
    var delta = mode === 'add' ? amount : -amount;
    var defaultReason = mode === 'add' ? 'إضافة نقاط يدوية' : 'خصم نقاط يدوي';
    var reason = sanitizeText(p.reason, 100, defaultReason);

    var prevT1Score = matchState.teams.team1.score;
    var prevT2Score = matchState.teams.team2.score;

    matchState.teams[teamId].score += delta;

    var entry = {
      type: 'SCORE_ADJUSTMENT',
      actionId: 'adj_' + Date.now() + '_' + Math.floor(Math.random() * 10000),
      timestamp: new Date(p.nowMs || Date.now()).toISOString(),
      teamId: teamId,
      mode: mode,
      amount: amount,
      delta: delta,
      reason: reason,
      prevTeam1Score: prevT1Score,
      prevTeam2Score: prevT2Score,
      newTeam1Score: matchState.teams.team1.score,
      newTeam2Score: matchState.teams.team2.score,
      prevTeam1Correct: matchState.teams.team1.correctCount,
      prevTeam2Correct: matchState.teams.team2.correctCount,
      prevTeam1Penalty: matchState.teams.team1.penaltyCount,
      prevTeam2Penalty: matchState.teams.team2.penaltyCount,
      prevTurn: matchState.currentTurn,
      prevAnsweredCount: matchState.answeredCount,
      prevStatus: matchState.status
    };

    if (!Array.isArray(matchState.actionHistory)) {
      matchState.actionHistory = [];
    }
    matchState.actionHistory.push(entry);
    return {
      adjusted: true,
      entry: entry,
      teamId: teamId,
      delta: delta,
      newScore: matchState.teams[teamId].score,
      matchState: matchState
    };
  }

  function rejudgeResolvedCell(matchState, cellId, newOutcome, reason) {
    if (!matchState || !cellId) {
      throw new Error('بيانات المباراة أو السؤال غير صالحة.');
    }
    var targetCell = findCell(matchState, cellId);
    if (!targetCell || !targetCell.answered || targetCell.status !== 'resolved') {
      throw new Error('لا يمكن تصحيح الاحتساب إلا لسؤال تم حسمه مسبقاً.');
    }
    var newAwardedTo = newOutcome && newOutcome.awardedTo ? newOutcome.awardedTo : 'none';
    if (['team1', 'team2', 'none'].indexOf(newAwardedTo) === -1) {
      throw new Error('اختيار الفريق الفائز غير صالح.');
    }
    var newPenalizedTeam = (newOutcome && (newOutcome.penalizedTeam === 'team1' || newOutcome.penalizedTeam === 'team2'))
      ? newOutcome.penalizedTeam
      : null;

    var prevAwardedTo = targetCell.awardedTo;
    var prevPenaltyTeam = targetCell.penaltyAppliedTo;
    var prevPitTeam = targetCell.pitAppliedTo;
    var prevPitDed = targetCell.pitDeduction || 0;

    if (prevAwardedTo === newAwardedTo && prevPenaltyTeam === newPenalizedTeam) {
      return { rejudged: false, unchanged: true, matchState: matchState };
    }

    var points = targetCell.effectivePoints || (targetCell.isGoldenDouble ? targetCell.points * 2 : targetCell.points);
    var prevT1Score = matchState.teams.team1.score;
    var prevT2Score = matchState.teams.team2.score;
    var prevT1Correct = matchState.teams.team1.correctCount;
    var prevT2Correct = matchState.teams.team2.correctCount;
    var prevT1Penalty = matchState.teams.team1.penaltyCount;
    var prevT2Penalty = matchState.teams.team2.penaltyCount;

    // 1. Reverse previous cell outcome
    if (prevAwardedTo === 'team1' || prevAwardedTo === 'team2') {
      matchState.teams[prevAwardedTo].score -= points;
      matchState.teams[prevAwardedTo].correctCount = Math.max(0, matchState.teams[prevAwardedTo].correctCount - 1);
    }
    if (prevPenaltyTeam === 'team1' || prevPenaltyTeam === 'team2') {
      var oldPenAmt = typeof targetCell.penaltyDeduction === 'number' ? targetCell.penaltyDeduction : getPenaltyAmount(points, matchState.settings.penaltyMode);
      matchState.teams[prevPenaltyTeam].score += oldPenAmt;
      matchState.teams[prevPenaltyTeam].penaltyCount = Math.max(0, matchState.teams[prevPenaltyTeam].penaltyCount - 1);
    }
    if ((prevPitTeam === 'team1' || prevPitTeam === 'team2') && prevPitDed > 0) {
      matchState.teams[prevPitTeam].score += prevPitDed;
    }

    // 2. Apply new cell outcome
    var newPenaltyDeduction = 0;
    if (newPenalizedTeam) {
      newPenaltyDeduction = getPenaltyAmount(points, matchState.settings.penaltyMode);
    }
    var pitArmedBy = (targetCell.session && targetCell.session.pitArmedByTeam) ? targetCell.session.pitArmedByTeam : null;
    var newPitTargetTeam = null;
    var newPitDeduction = 0;
    if (pitArmedBy && (newAwardedTo === 'team1' || newAwardedTo === 'team2') && newAwardedTo === pitArmedBy) {
      newPitTargetTeam = pitArmedBy === 'team1' ? 'team2' : 'team1';
      newPitDeduction = points;
    }

    if (newAwardedTo === 'team1' || newAwardedTo === 'team2') {
      matchState.teams[newAwardedTo].score += points;
      matchState.teams[newAwardedTo].correctCount += 1;
    }
    if (newPenalizedTeam && newPenaltyDeduction > 0) {
      matchState.teams[newPenalizedTeam].score -= newPenaltyDeduction;
      matchState.teams[newPenalizedTeam].penaltyCount += 1;
    }
    if (newPitTargetTeam && newPitDeduction > 0) {
      matchState.teams[newPitTargetTeam].score -= newPitDeduction;
    }

    targetCell.awardedTo = newAwardedTo;
    targetCell.penaltyAppliedTo = newPenalizedTeam;
    targetCell.pitAppliedTo = newPitTargetTeam;
    targetCell.pitDeduction = newPitDeduction;

    var entry = {
      type: 'REJUDGE_CELL',
      actionId: 'rej_' + Date.now() + '_' + Math.floor(Math.random() * 10000),
      timestamp: new Date().toISOString(),
      cellId: cellId,
      questionId: targetCell.questionId,
      points: points,
      reason: sanitizeText(reason, 100, 'تصحيح احتساب نتيجة السؤال'),
      prevAwardedTo: prevAwardedTo,
      prevPenaltyAppliedTo: prevPenaltyTeam,
      prevPitAppliedTo: prevPitTeam,
      prevPitDeduction: prevPitDed,
      awardedTo: newAwardedTo,
      penalizedTeam: newPenalizedTeam,
      penaltyDeduction: newPenaltyDeduction,
      pitAppliedTo: newPitTargetTeam,
      pitDeduction: newPitDeduction,
      prevTeam1Score: prevT1Score,
      prevTeam2Score: prevT2Score,
      newTeam1Score: matchState.teams.team1.score,
      newTeam2Score: matchState.teams.team2.score,
      prevTeam1Correct: prevT1Correct,
      prevTeam2Correct: prevT2Correct,
      prevTeam1Penalty: prevT1Penalty,
      prevTeam2Penalty: prevT2Penalty,
      prevTurn: matchState.currentTurn,
      prevAnsweredCount: matchState.answeredCount,
      prevStatus: matchState.status
    };

    if (!Array.isArray(matchState.actionHistory)) {
      matchState.actionHistory = [];
    }
    matchState.actionHistory.push(entry);
    return {
      rejudged: true,
      entry: entry,
      cell: targetCell,
      matchState: matchState
    };
  }

  function undoLastAction(matchState) {
    if (!matchState || !Array.isArray(matchState.actionHistory) || matchState.actionHistory.length === 0) {
      return { undone: false, matchState: matchState };
    }
    var last = matchState.actionHistory.pop();

    if (last.type === 'SCORE_ADJUSTMENT') {
      matchState.teams.team1.score = last.prevTeam1Score;
      matchState.teams.team2.score = last.prevTeam2Score;
      return {
        undone: true,
        undoneAction: last,
        wasCompletedTransition: false,
        wasScoredQuestion: false,
        matchState: matchState
      };
    }

    if (last.type === 'REJUDGE_CELL') {
      var rCell = findCell(matchState, last.cellId);
      if (rCell) {
        rCell.awardedTo = last.prevAwardedTo;
        rCell.penaltyAppliedTo = last.prevPenaltyAppliedTo || null;
        rCell.pitAppliedTo = last.prevPitAppliedTo || null;
        rCell.pitDeduction = last.prevPitDeduction || 0;
      }
      matchState.teams.team1.score = last.prevTeam1Score;
      matchState.teams.team2.score = last.prevTeam2Score;
      matchState.teams.team1.correctCount = last.prevTeam1Correct;
      matchState.teams.team2.correctCount = last.prevTeam2Correct;
      matchState.teams.team1.penaltyCount = last.prevTeam1Penalty;
      matchState.teams.team2.penaltyCount = last.prevTeam2Penalty;
      return {
        undone: true,
        undoneAction: last,
        wasCompletedTransition: false,
        wasScoredQuestion: false,
        matchState: matchState
      };
    }

    var targetCell = findCell(matchState, last.cellId);
    if (targetCell) {
      targetCell.answered = false;
      targetCell.awardedTo = null;
      targetCell.penaltyAppliedTo = null;
      targetCell.pitAppliedTo = null;
      targetCell.pitDeduction = 0;
      if (last.prevCellSession) {
        targetCell.session = safeClone(last.prevCellSession);
        targetCell.session.timerRunning = false;
        targetCell.status = last.prevCellSession.isRevealed ? 'revealed' : 'paused';
        matchState.activeCellId = targetCell.cellId;
      } else {
        targetCell.status = 'unopened';
        targetCell.session = null;
        matchState.activeCellId = null;
      }
    }

    matchState.teams.team1.score = last.prevTeam1Score;
    matchState.teams.team2.score = last.prevTeam2Score;
    matchState.teams.team1.correctCount = last.prevTeam1Correct;
    matchState.teams.team2.correctCount = last.prevTeam2Correct;
    matchState.teams.team1.penaltyCount = last.prevTeam1Penalty;
    matchState.teams.team2.penaltyCount = last.prevTeam2Penalty;
    if (last.prevTeam1Lifelines) {
      matchState.teams.team1.lifelines = safeClone(last.prevTeam1Lifelines);
      matchState.teams.team1.lifelinesRemaining = last.prevTeam1LifelinesRem;
      matchState.teams.team1.lifelinesUsed = last.prevTeam1LifelinesUsed;
    }
    if (last.prevTeam2Lifelines) {
      matchState.teams.team2.lifelines = safeClone(last.prevTeam2Lifelines);
      matchState.teams.team2.lifelinesRemaining = last.prevTeam2LifelinesRem;
      matchState.teams.team2.lifelinesUsed = last.prevTeam2LifelinesUsed;
    }
    matchState.currentTurn = last.prevTurn;
    matchState.answeredCount = last.prevAnsweredCount;
    matchState.status = last.prevStatus || 'in_progress';

    return {
      undone: true,
      undoneAction: last,
      wasCompletedTransition: !!last.wasCompletedTransition,
      wasScoredQuestion: last.type === 'SCORE_CELL',
      matchState: matchState
    };
  }

  function getMatchResult(matchState) {
    var s1 = matchState.teams.team1.score;
    var s2 = matchState.teams.team2.score;
    var isTie = s1 === s2;
    var winnerId = isTie ? 'tie' : (s1 > s2 ? 'team1' : 'team2');
    var winnerName = isTie ? 'تعادل بين الفريقين' : matchState.teams[winnerId].name;

    return {
      isTie: isTie,
      winnerId: winnerId,
      winnerName: winnerName,
      scoreDiff: Math.abs(s1 - s2),
      team1: safeClone(matchState.teams.team1),
      team2: safeClone(matchState.teams.team2),
      answeredCount: matchState.answeredCount,
      totalCells: matchState.totalCells
    };
  }

  function validateImportedMatchState(payload) {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return { valid: false, error: 'ملف البيانات غير صالح.' };
    }
    var rawMatch = payload.matchState || payload;
    if (!rawMatch || typeof rawMatch !== 'object' || Array.isArray(rawMatch)) {
      return { valid: false, error: 'بنية المباراة غير صالحة في الملف.' };
    }

    if (!rawMatch.teams || typeof rawMatch.teams !== 'object' || !rawMatch.teams.team1 || !rawMatch.teams.team2) {
      return { valid: false, error: 'بيانات الفريقين مفقودة في الملف المستورد.' };
    }

    var t1 = rawMatch.teams.team1;
    var t2 = rawMatch.teams.team2;
    if (typeof t1.score !== 'number' || !Number.isFinite(t1.score) ||
        typeof t2.score !== 'number' || !Number.isFinite(t2.score)) {
      return { valid: false, error: 'نقاط الفرق غير صالحة أو ليست أرقاماً صحيحة.' };
    }
    if (typeof t1.name !== 'string' || !t1.name.trim() || typeof t2.name !== 'string' || !t2.name.trim()) {
      return { valid: false, error: 'أسماء الفرق غير صالحة.' };
    }

    if (rawMatch.currentTurn !== 'team1' && rawMatch.currentTurn !== 'team2') {
      return { valid: false, error: 'قيمة الدور الحالي غير صالحة.' };
    }
    if (rawMatch.status !== 'in_progress' && rawMatch.status !== 'completed') {
      return { valid: false, error: 'حالة المباراة غير صالحة.' };
    }

    if (!Array.isArray(rawMatch.columns) || rawMatch.columns.length !== 6) {
      return { valid: false, error: 'يجب أن تحتوي المباراة على 6 أعمدة فئات بالضبط.' };
    }
    if (!rawMatch.questionsByCell || typeof rawMatch.questionsByCell !== 'object' || Array.isArray(rawMatch.questionsByCell)) {
      return { valid: false, error: 'بنك أسئلة المباراة مفقود في الملف.' };
    }

    var match = safeClone(rawMatch);
    match.schemaVersion = SCHEMA_VERSION;

    var rawSettings = match.settings && typeof match.settings === 'object' ? match.settings : {};
    var timerSec = typeof rawSettings.timerSeconds === 'number' && Number.isFinite(rawSettings.timerSeconds) && rawSettings.timerSeconds >= 0
      ? Math.min(600, Math.floor(rawSettings.timerSeconds))
      : DEFAULT_SETTINGS.timerSeconds;
    var penMode = ['none', 'half', 'full'].indexOf(rawSettings.penaltyMode) !== -1
      ? rawSettings.penaltyMode
      : DEFAULT_SETTINGS.penaltyMode;
    var lifelinesPerTeam = typeof rawSettings.lifelinesPerTeam === 'number' && Number.isFinite(rawSettings.lifelinesPerTeam) && rawSettings.lifelinesPerTeam >= 0
      ? Math.min(5, Math.floor(rawSettings.lifelinesPerTeam))
      : DEFAULT_SETTINGS.lifelinesPerTeam;
    var allowSteal = typeof rawSettings.allowSteal === 'boolean' ? rawSettings.allowSteal : DEFAULT_SETTINGS.allowSteal;
    var stealSec = typeof rawSettings.stealTimerSeconds === 'number' && rawSettings.stealTimerSeconds > 0
      ? Math.min(120, Math.floor(rawSettings.stealTimerSeconds))
      : DEFAULT_SETTINGS.stealTimerSeconds;

    match.settings = {
      timerSeconds: timerSec,
      penaltyMode: penMode,
      lifelinesPerTeam: lifelinesPerTeam,
      allowSteal: allowSteal,
      stealTimerSeconds: stealSec
    };

    ['team1', 'team2'].forEach(function (tk, idx) {
      var tm = match.teams[tk];
      tm.id = tk;
      tm.name = sanitizeText(tm.name, 28, idx === 0 ? DEFAULT_SETTINGS.team1DefaultName : DEFAULT_SETTINGS.team2DefaultName);
      tm.color = sanitizeColor(tm.color, idx === 0 ? DEFAULT_SETTINGS.team1Color : DEFAULT_SETTINGS.team2Color);
      tm.score = Math.trunc(tm.score);
      tm.correctCount = typeof tm.correctCount === 'number' && Number.isFinite(tm.correctCount) && tm.correctCount >= 0 ? Math.trunc(tm.correctCount) : 0;
      tm.penaltyCount = typeof tm.penaltyCount === 'number' && Number.isFinite(tm.penaltyCount) && tm.penaltyCount >= 0 ? Math.trunc(tm.penaltyCount) : 0;
      tm.lifelinesUsed = typeof tm.lifelinesUsed === 'number' && Number.isFinite(tm.lifelinesUsed) && tm.lifelinesUsed >= 0 ? Math.trunc(tm.lifelinesUsed) : 0;
      tm.lifelinesRemaining = typeof tm.lifelinesRemaining === 'number' && Number.isFinite(tm.lifelinesRemaining) && tm.lifelinesRemaining >= 0
        ? Math.min(lifelinesPerTeam, Math.trunc(tm.lifelinesRemaining))
        : Math.max(0, lifelinesPerTeam - tm.lifelinesUsed);
      if (!tm.lifelines || typeof tm.lifelines !== 'object') {
        var defState = buildTeamLifelineState(tm.selectedLifelines || DEFAULT_LIFELINE_LOADOUT, lifelinesPerTeam);
        tm.lifelines = defState.items;
        tm.selectedLifelines = defState.selectedKeys;
      }
    });

    var seenCategoryIds = {};
    var seenCellIds = {};
    var seenQuestionIds = {};
    var computedAnsweredCount = 0;
    var computedScores = { team1: 0, team2: 0 };
    var computedCorrect = { team1: 0, team2: 0 };
    var computedPenalty = { team1: 0, team2: 0 };
    var derivedPlayedQids = {};
    var derivedExposedQids = {};

    for (var i = 0; i < match.columns.length; i++) {
      var col = match.columns[i];
      if (!col || typeof col !== 'object' || !col.categoryId || typeof col.categoryId !== 'string') {
        return { valid: false, error: 'بيانات عمود الفئة رقم ' + (i + 1) + ' غير صالحة.' };
      }
      if (seenCategoryIds[col.categoryId]) {
        return { valid: false, error: 'تكرار غير صالح للفئة: ' + col.categoryId };
      }
      seenCategoryIds[col.categoryId] = true;
      col.title = sanitizeText(col.title, 60, col.categoryId);
      col.icon = sanitizeText(col.icon, 8, '📚');
      col.selectedByTeam = col.selectedByTeam === 'team2' ? 'team2' : (col.selectedByTeam === 'team1' ? 'team1' : (i < 3 ? 'team1' : 'team2'));
      col.image = sanitizeImageUri(col.image);
      col.imageDataUri = sanitizeImageUri(col.coverAssetId || col.imageDataUri || col.image);

      if (!Array.isArray(col.cells) || (col.cells.length !== 6 && col.cells.length !== 3)) {
        return { valid: false, error: 'يجب أن يحتوي كل عمود فئة على 6 أو 3 خلايا أسئلة.' };
      }

      for (var j = 0; j < col.cells.length; j++) {
        var cell = col.cells[j];
        if (!cell || typeof cell !== 'object' || !cell.cellId || typeof cell.cellId !== 'string') {
          return { valid: false, error: 'خلية غير صالحة في العمود ' + (i + 1) };
        }
        if (seenCellIds[cell.cellId]) {
          return { valid: false, error: 'معرف خلية مكرر: ' + cell.cellId };
        }
        seenCellIds[cell.cellId] = true;

        if ([200, 400, 600].indexOf(cell.points) === -1) {
          return { valid: false, error: 'قيمة نقاط غير صالحة في الخلية: ' + cell.cellId };
        }

        var qObj = match.questionsByCell[cell.cellId];
        if (!qObj || typeof qObj !== 'object') {
          return { valid: false, error: 'سؤال الخلية مفقود: ' + cell.cellId };
        }
        if (!qObj.id || typeof qObj.id !== 'string' || seenQuestionIds[qObj.id]) {
          return { valid: false, error: 'معرف سؤال مفقود أو مكرر في الخلية: ' + cell.cellId };
        }
        seenQuestionIds[qObj.id] = true;
        cell.questionId = qObj.id;
        cell.categoryId = col.categoryId;

        if (qObj.points !== cell.points) {
          return { valid: false, error: 'عدم تطابق نقاط السؤال مع الخلية: ' + cell.cellId };
        }
        if (typeof qObj.question !== 'string' || !qObj.question.trim()) {
          return { valid: false, error: 'نص السؤال مفقود في الخلية: ' + cell.cellId };
        }
        if (!Array.isArray(qObj.options) || qObj.options.length !== 3) {
          return { valid: false, error: 'خيارات السؤال غير صالحة في الخلية: ' + cell.cellId };
        }
        if ([0, 1, 2].indexOf(qObj.correctAnswerIndex) === -1) {
          return { valid: false, error: 'مؤشر الإجابة الصحيحة غير صالح في الخلية: ' + cell.cellId };
        }
        if (!qObj.answer || typeof qObj.answer !== 'string') {
          qObj.answer = String(qObj.options[qObj.correctAnswerIndex]);
        }
        if (!Array.isArray(qObj.acceptedAnswers) || qObj.acceptedAnswers.length === 0) {
          qObj.acceptedAnswers = [qObj.answer];
        }
        if (!qObj.explanation || typeof qObj.explanation !== 'string') {
          return { valid: false, error: 'شرح السؤال مفقود في الخلية: ' + cell.cellId };
        }
        qObj.image = sanitizeImageUri(qObj.image);
        qObj.imageDataUri = sanitizeImageUri(qObj.assetId || qObj.imageDataUri);

        cell.answered = !!cell.answered;
        if (cell.answered) {
          cell.status = 'resolved';
          if (['team1', 'team2', 'none', 'abandoned'].indexOf(cell.awardedTo) === -1) {
            cell.awardedTo = 'none';
          }
          if (cell.penaltyAppliedTo !== 'team1' && cell.penaltyAppliedTo !== 'team2') {
            cell.penaltyAppliedTo = null;
          }
          computedAnsweredCount += 1;
          var effPts = cell.effectivePoints || (cell.isGoldenDouble ? cell.points * 2 : cell.points);
          if (cell.awardedTo === 'team1' || cell.awardedTo === 'team2') {
            computedScores[cell.awardedTo] += effPts;
            computedCorrect[cell.awardedTo] += 1;
          }
          if (cell.penaltyAppliedTo === 'team1' || cell.penaltyAppliedTo === 'team2') {
            var penAmtVal = typeof cell.penaltyDeduction === 'number' ? cell.penaltyDeduction : getPenaltyAmount(effPts, match.settings.penaltyMode);
            computedScores[cell.penaltyAppliedTo] -= penAmtVal;
            computedPenalty[cell.penaltyAppliedTo] += 1;
          }
          if ((cell.pitAppliedTo === 'team1' || cell.pitAppliedTo === 'team2') && typeof cell.pitDeduction === 'number') {
            computedScores[cell.pitAppliedTo] -= cell.pitDeduction;
          }
          derivedPlayedQids[qObj.id] = true;
          derivedExposedQids[qObj.id] = true;
        } else {
          cell.awardedTo = null;
          cell.penaltyAppliedTo = null;
          cell.pitAppliedTo = null;
          cell.pitDeduction = 0;
          var validStatuses = ['unopened', 'answering', 'paused', 'expired', 'revealed'];
          if (validStatuses.indexOf(cell.status) === -1) {
            cell.status = 'unopened';
          }
          if (cell.status !== 'unopened' && cell.session && typeof cell.session === 'object') {
            derivedExposedQids[qObj.id] = true;
            cell.session.timerRunning = false;
            if (!Array.isArray(cell.session.shuffledOptions) || cell.session.shuffledOptions.length !== 3) {
              cell.session.shuffledOptions = buildShuffledOptions(qObj);
            }
          } else {
            cell.status = 'unopened';
            cell.session = null;
          }
        }
      }
    }

    var totalExpectedCells = Object.keys(seenCellIds).length;
    if (totalExpectedCells !== 36 && totalExpectedCells !== 18) {
      return { valid: false, error: 'يجب أن تضم اللوحة 36 أو 18 خلية فريدة.' };
    }

    var netAdjustments = { team1: 0, team2: 0 };
    if (!Array.isArray(match.actionHistory)) {
      match.actionHistory = [];
    } else {
      for (var k = 0; k < match.actionHistory.length; k++) {
        var act = match.actionHistory[k];
        if (!act || typeof act !== 'object') {
          return { valid: false, error: 'سجل التراجع يحتوي على بيانات غير صالحة.' };
        }
        if (act.type === 'SCORE_ADJUSTMENT') {
          if ((act.teamId !== 'team1' && act.teamId !== 'team2') || typeof act.delta !== 'number' || !Number.isFinite(act.delta)) {
            return { valid: false, error: 'سجل تعديل النقاط اليدوي يحتوي على بيانات غير صالحة.' };
          }
          netAdjustments[act.teamId] += Math.trunc(act.delta);
        } else if (!act.cellId || !seenCellIds[act.cellId]) {
          return { valid: false, error: 'سجل التراجع يحتوي على معرف خلية غير صالح.' };
        }
      }
    }

    computedScores.team1 += netAdjustments.team1;
    computedScores.team2 += netAdjustments.team2;

    if (typeof rawMatch.answeredCount === 'number' && rawMatch.answeredCount !== computedAnsweredCount) {
      return { valid: false, error: 'تعارض في عدد الأسئلة المحلولة داخل الملف المستورد.' };
    }
    if (match.teams.team1.score !== computedScores.team1 || match.teams.team2.score !== computedScores.team2) {
      return { valid: false, error: 'تعارض بين نقاط الفريقين ونتائج خلايا اللوحة وسجل التعديلات في الملف المستورد.' };
    }
    match.teams.team1.correctCount = computedCorrect.team1;
    match.teams.team2.correctCount = computedCorrect.team2;
    match.teams.team1.penaltyCount = computedPenalty.team1;
    match.teams.team2.penaltyCount = computedPenalty.team2;
    match.totalCells = totalExpectedCells;
    match.boardMode = totalExpectedCells === 18 ? 'quick' : 'classic';
    match.answeredCount = computedAnsweredCount;
    match.status = computedAnsweredCount >= totalExpectedCells ? 'completed' : 'in_progress';

    if (match.activeCellId && (!seenCellIds[match.activeCellId] || findCell(match, match.activeCellId).answered)) {
      match.activeCellId = null;
    }

    var importedPlayed = {};
    if (payload.playedHistory && typeof payload.playedHistory === 'object' && !Array.isArray(payload.playedHistory)) {
      Object.keys(payload.playedHistory).forEach(function (qid) {
        if (payload.playedHistory[qid]) importedPlayed[qid] = true;
      });
    }
    Object.assign(importedPlayed, derivedPlayedQids);

    var importedExposed = {};
    if (payload.exposedHistory && typeof payload.exposedHistory === 'object' && !Array.isArray(payload.exposedHistory)) {
      Object.keys(payload.exposedHistory).forEach(function (qid) {
        if (payload.exposedHistory[qid]) importedExposed[qid] = true;
      });
    }
    Object.assign(importedExposed, importedPlayed, derivedExposedQids);

    return {
      valid: true,
      matchState: match,
      playedHistory: importedPlayed,
      exposedHistory: importedExposed,
      selectedCategories: match.columns.map(function (c) { return c.categoryId; })
    };
  }

  return {
    SCHEMA_VERSION: SCHEMA_VERSION,
    STORAGE_KEYS: STORAGE_KEYS,
    DEFAULT_SETTINGS: DEFAULT_SETTINGS,
    VALID_TEAM_COLORS: VALID_TEAM_COLORS,
    LIFELINE_CATALOG: LIFELINE_CATALOG,
    DEFAULT_LIFELINE_LOADOUT: DEFAULT_LIFELINE_LOADOUT,
    sanitizeColor: sanitizeColor,
    sanitizeImageUri: sanitizeImageUri,
    resolveMediaUri: resolveMediaUri,
    getMediaMetadata: getMediaMetadata,
    normalizeArabicText: normalizeArabicText,
    sanitizeText: sanitizeText,
    sanitizeLifelineList: sanitizeLifelineList,
    validateDatabase: validateDatabase,
    selectCategoryMatchQuestions: selectCategoryMatchQuestions,
    createMatch: createMatch,
    findCell: findCell,
    armPitLifeline: armPitLifeline,
    openCellSession: openCellSession,
    syncSessionTimer: syncSessionTimer,
    pauseCellTimer: pauseCellTimer,
    useTeamLifeline: useTeamLifeline,
    useShowOptionsLifeline: useShowOptionsLifeline,
    passTurnToOtherTeam: passTurnToOtherTeam,
    revealCellAnswer: revealCellAnswer,
    abandonCellQuestion: abandonCellQuestion,
    getPenaltyAmount: getPenaltyAmount,
    shuffleArray: shuffleArray,
    scoreCell: scoreCell,
    adjustTeamScore: adjustTeamScore,
    rejudgeResolvedCell: rejudgeResolvedCell,
    undoLastAction: undoLastAction,
    getMatchResult: getMatchResult,
    validateImportedMatchState: validateImportedMatchState
  };
});

  
  
