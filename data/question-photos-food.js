// Locally bundled food photographs. Credits: assets/images/questions/food/ATTRIBUTION.md.
(function () {
  'use strict';
  var data = window.SEEN_JEEM_DATA;
  if (!data || !data.questions || !data.mediaRegistry) return;
  var photos = {
  "food_cultures_q01": [
    "sushi.webp",
    "طبق أرز ومأكولات بحرية"
  ],
  "food_cultures_q22": [
    "sushi.webp",
    "طبق أرز ومأكولات بحرية"
  ],
  "food_cultures_q02": [
    "pizza-margherita.webp",
    "بيتزا مخبوزة مع الطماطم والجبن"
  ],
  "food_cultures_q15": [
    "pizza-margherita.webp",
    "بيتزا مخبوزة مع الطماطم والجبن"
  ],
  "food_cultures_q03": [
    "saffron.webp",
    "خيوط توابل حمراء"
  ],
  "food_cultures_q04": [
    "cardamom.webp",
    "قرون توابل عطرية"
  ],
  "hala_wa_gahwa_q03": [
    "cardamom.webp",
    "قرون توابل عطرية"
  ],
  "hala_wa_gahwa_q19": [
    "cardamom.webp",
    "قرون توابل عطرية"
  ],
  "food_cultures_q05": [
    "musakhan.webp",
    "طبق دجاج وخبز تقليدي"
  ],
  "food_cultures_q07": [
    "couscous.webp",
    "طبق من حبيبات السميد والخضار"
  ],
  "food_cultures_q08": [
    "paella.webp",
    "طبق أرز ومأكولات بحرية في مقلاة واسعة"
  ],
  "food_cultures_q09": [
    "cocoa-bean.webp",
    "ثمار نبات استوائي تستخدم في صناعة الشوكولاتة"
  ],
  "hala_wa_gahwa_q15": [
    "cocoa-bean.webp",
    "ثمار نبات استوائي تستخدم في صناعة الشوكولاتة"
  ],
  "food_cultures_q10": [
    "koshary.webp",
    "طبق مصري من الأرز والعدس والمعكرونة"
  ],
  "food_cultures_q11": [
    "tabbouleh.webp",
    "سلطة خضراء مع البقدونس والطماطم"
  ],
  "food_cultures_q12": [
    "guacamole.webp",
    "صلصة خضراء مكسيكية"
  ],
  "food_cultures_q13": [
    "tajine.webp",
    "وعاء طبخ فخاري بغطاء مخروطي"
  ],
  "food_cultures_q14": [
    "kanafeh.webp",
    "حلوى شرقية من عجين رفيع وجبن"
  ],
  "hala_wa_gahwa_q04": [
    "kanafeh.webp",
    "حلوى شرقية من عجين رفيع وجبن"
  ],
  "hala_wa_gahwa_q33": [
    "kanafeh.webp",
    "حلوى شرقية من عجين رفيع وجبن"
  ],
  "food_cultures_q16": [
    "mandi-food.webp",
    "طبق من اللحم والأرز"
  ],
  "food_cultures_q21": [
    "kimchi.webp",
    "خضروات كورية مخمرة"
  ],
  "food_cultures_q23": [
    "halva.webp",
    "حلوى تقليدية مقطعة"
  ],
  "kw_cuisine_q09": [
    "halva.webp",
    "حلوى تقليدية مقطعة"
  ],
  "hala_wa_gahwa_q25": [
    "halva.webp",
    "حلوى تقليدية مقطعة"
  ],
  "food_cultures_q24": [
    "harira.webp",
    "وعاء شوربة مغربية"
  ],
  "food_cultures_q25": [
    "masgouf.webp",
    "سمك مشوي على النار"
  ],
  "food_cultures_q26": [
    "falafel.webp",
    "كرات طعام مقلية من البقول"
  ],
  "food_cultures_q27": [
    "croissant.webp",
    "مخبوزات هلالية مورقة"
  ],
  "hala_wa_gahwa_q11": [
    "croissant.webp",
    "مخبوزات هلالية مورقة"
  ],
  "food_cultures_q33": [
    "vanilla.webp",
    "قرون توابل نباتية"
  ],
  "food_cultures_q35": [
    "truffle.webp",
    "فطر ينمو تحت الأرض"
  ],
  "kw_cuisine_q02": [
    "tharid.webp",
    "طبق خبز ومرق تقليدي"
  ],
  "ramadan_sufra_q01": [
    "tharid.webp",
    "طبق خبز ومرق تقليدي"
  ],
  "kw_cuisine_q08": [
    "luqaimat.webp",
    "كرات عجين مقلية ومغطاة بالقطر"
  ],
  "ramadan_sufra_q02": [
    "luqaimat.webp",
    "كرات عجين مقلية ومغطاة بالقطر"
  ],
  "ramadan_sufra_q21": [
    "luqaimat.webp",
    "كرات عجين مقلية ومغطاة بالقطر"
  ],
  "kw_cuisine_q24": [
    "black-lime.webp",
    "ثمار حمضيات مجففة"
  ],
  "ramadan_sufra_q35": [
    "black-lime.webp",
    "ثمار حمضيات مجففة"
  ],
  "kw_cuisine_q25": [
    "flatbread.webp",
    "خبز مسطح تقليدي"
  ],
  "ramadan_sufra_q34": [
    "flatbread.webp",
    "خبز مسطح تقليدي"
  ],
  "hala_wa_gahwa_q01": [
    "dallah-coffee-pot.webp",
    "وعاء تقليدي لتقديم القهوة العربية"
  ],
  "hala_wa_gahwa_q17": [
    "dallah-coffee-pot.webp",
    "وعاء تقليدي لتقديم القهوة العربية"
  ],
  "hala_wa_gahwa_q37": [
    "dallah-coffee-pot.webp",
    "وعاء تقليدي لتقديم القهوة العربية"
  ],
  "hala_wa_gahwa_q06": [
    "tiramisu.webp",
    "حلوى إيطالية بالقهوة والكريمة"
  ],
  "hala_wa_gahwa_q31": [
    "tiramisu.webp",
    "حلوى إيطالية بالقهوة والكريمة"
  ],
  "hala_wa_gahwa_q12": [
    "baklava.webp",
    "حلوى من طبقات عجين ومكسرات"
  ],
  "hala_wa_gahwa_q32": [
    "baklava.webp",
    "حلوى من طبقات عجين ومكسرات"
  ],
  "hala_wa_gahwa_q16": [
    "macaron.webp",
    "حلوى فرنسية صغيرة ملونة"
  ],
  "hala_wa_gahwa_q38": [
    "macaron.webp",
    "حلوى فرنسية صغيرة ملونة"
  ],
  "hala_wa_gahwa_q35": [
    "basbousa.webp",
    "حلوى مخبوزة من السميد"
  ],
  "hala_wa_gahwa_q34": [
    "umm-ali.webp",
    "حلوى دافئة بالحليب والمكسرات"
  ],
  "ramadan_sufra_q05": [
    "samosa.webp",
    "فطائر مثلثة محشوة"
  ],
  "ramadan_sufra_q23": [
    "samosa.webp",
    "فطائر مثلثة محشوة"
  ],
  "ramadan_sufra_q24": [
    "kibbeh.webp",
    "أقراص طعام مقلية بالبرغل"
  ],
  "ramadan_sufra_q27": [
    "ayran.webp",
    "مشروب لبن أبيض"
  ],
  "food_cultures_q19": [
    "coffee-bean.webp",
    "حبوب بن محمصة"
  ],
  "food_cultures_q34": [
    "coffee-bean.webp",
    "حبوب بن محمصة"
  ],
  "hala_wa_gahwa_q07": [
    "coffee-bean.webp",
    "حبوب بن محمصة"
  ],
  "hala_wa_gahwa_q30": [
    "coffee-bean.webp",
    "حبوب بن محمصة"
  ]
};
  data.questions.forEach(function (question) {
    var photo = photos[question.id];
    if (!photo) return;
    var id = 'asset:question_photo_food_' + question.id;
    data.mediaRegistry[id] = {
      id: id, kind: 'question_media', category: question.categoryId,
      mime: 'image/webp', dataUri: 'assets/images/questions/food/' + photo[0], alt: photo[1]
    };
    question.assetId = id;
    question.image = id;
    question.imageDataUri = id;
    question.imageAlt = photo[1];
  });
})();
