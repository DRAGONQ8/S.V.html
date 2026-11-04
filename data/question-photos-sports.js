// Sports question photos reuse locally stored, licensed category photographs.
// Image credits and license links are listed in assets/images/ATTRIBUTION.md.
(function () {
  'use strict';
  var data = window.SEEN_JEEM_DATA;
  if (!data || !data.questions || !data.mediaRegistry) return;

  // Each photo is used only where its subject is already named in the question,
  // or where the trophy/sport provides context without naming the answer.
  var groups = [
    {
      file: 'player_career_path.webp',
      alt: 'صورة لاعب كرة القدم المذكور في السؤال',
      questions: ['football_legends_q03', 'spanish_la_liga_q07', 'uefa_champions_league_q18', 'shared_clubs_q01', 'shared_clubs_q08', 'shared_clubs_q20', 'shared_clubs_q26']
    },
    {
      file: 'who_is_the_player.webp',
      alt: 'صورة من مباراة للاعب المذكور في السؤال',
      questions: ['world_football_q35', 'football_legends_q02', 'players_challenge_q27']
    },
    {
      file: 'combat_and_team_sports.webp',
      alt: 'صورة من منافسات الجودو',
      questions: ['combat_and_team_sports_q06', 'combat_and_team_sports_q26']
    },
    {
      file: 'fifa_world_cup.webp',
      alt: 'كأس العالم لكرة القدم',
      questions: ['fifa_world_cup_q01', 'fifa_world_cup_q04', 'fifa_world_cup_q05', 'fifa_world_cup_q06', 'fifa_world_cup_q07', 'fifa_world_cup_q08', 'fifa_world_cup_q09', 'fifa_world_cup_q14', 'fifa_world_cup_q17', 'fifa_world_cup_q18', 'fifa_world_cup_q24', 'fifa_world_cup_q27', 'fifa_world_cup_q30', 'fifa_world_cup_q31', 'fifa_world_cup_q37', 'fifa_world_cup_q39', 'fifa_world_cup_q40']
    },
    {
      file: 'uefa_champions_league.webp',
      alt: 'كأس دوري أبطال أوروبا',
      questions: ['euro_clubs_q01', 'euro_clubs_q10', 'euro_clubs_q18', 'uefa_champions_league_q01', 'uefa_champions_league_q02', 'uefa_champions_league_q03', 'uefa_champions_league_q07', 'uefa_champions_league_q08', 'uefa_champions_league_q09', 'uefa_champions_league_q11', 'uefa_champions_league_q12', 'uefa_champions_league_q15', 'uefa_champions_league_q16', 'uefa_champions_league_q27', 'uefa_champions_league_q33', 'uefa_champions_league_q35']
    }
  ];

  var byId = {};
  data.questions.forEach(function (question) { byId[question.id] = question; });
  groups.forEach(function (group) {
    group.questions.forEach(function (questionId) {
      var question = byId[questionId];
      if (!question) return;
      var assetId = 'asset:question_photo_sports_' + questionId;
      data.mediaRegistry[assetId] = {
        id: assetId,
        kind: 'question_media',
        category: question.categoryId,
        dataUri: 'assets/images/categories/' + group.file,
        alt: group.alt
      };
      question.assetId = assetId;
      question.imageDataUri = assetId;
      question.image = assetId;
      question.imageAlt = group.alt;
    });
  });
})();
