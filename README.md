# سين جيم

لعبـة أسئلة عربية تعمل محلياً: افتح `index.html` في المتصفح بعد تنزيل المشروع وفك ضغطه مع الاحتفاظ بجميع المجلدات كما هي.

صور الفئات محفوظة داخل `assets/images/categories` لتظهر دون الحاجة إلى الإنترنت. معلومات مصادر الصور وأصحابها وتراخيصها موجودة في [ملف إسناد الصور](assets/images/ATTRIBUTION.md). الفئات التي لم تتوفر لها صورة مناسبة تحتفظ بغلافها الأصلي.

تُخزّن صور الأسئلة المضافة محلياً أيضاً، وتُحمّل عند الحاجة. توجد مصادرها وتراخيصها في [صور المعالم](data/question-photos-geography-sources.md)، و[صور العلوم](assets/images/QUESTION-PHOTOS-SCIENCE.md)، و[صور التفاصيل](assets/images/questions/details/ATTRIBUTION.md). بعض صور الأسئلة تعيد استخدام صور الفئات أو الصور المدمجة السابقة.

للتحقق من ربط الصور وبقية وظائف المشروع، شغّل `node --test tests/*.test.cjs`.

عداد الصور في الفئات يحسب **الأسئلة المرتبطة بصور فوتوغرافية محلية ذات مصادر موثقة**؛ قد تتكرر الصورة في أكثر من سؤال، ولا تدخل اللوحات الزخرفية أو الرسومات التوضيحية أو الصور غير الموثقة في العدد. تظهر الصور المرفوعة والوسائط اللازمة للألعاب التفاعلية والرسومات الوظيفية الموثقة عند الحاجة دون احتسابها صوراً فوتوغرافية. مصادر الصور التاريخية في [ملف الإسناد](assets/images/questions/history/ATTRIBUTION.md).

مصادر صور الأسئلة الإضافية وتراخيصها موثّقة في ملفات الإسناد داخل مجلدات الصور، وفي [مصادر صور الكويت](data/question-photos-kuwait-sources.md)، و[المعالم العالمية](data/question-photos-landmarks-extra-sources.md)، و[الحضارات القديمة](data/question-photos-ancient-civs-sources.md).

تتوفر أيضاً مصادر الصور الجديدة في ملفات إسناد [ملاعب كرة القدم](assets/images/questions/stadiums/ATTRIBUTION.md)، و[العواصم العربية](assets/images/questions/arab-capitals/ATTRIBUTION.md)، و[المدن الخليجية](assets/images/questions/gulf-cities/ATTRIBUTION.md)، و[التراث الكويتي](assets/images/questions/kuwait-heritage/ATTRIBUTION.md)، و[المعلومات العامة](assets/images/questions/general-knowledge/ATTRIBUTION.md)، و[تاريخ الطب](assets/images/questions/medical-history/ATTRIBUTION.md).

مصادر [الصور الإضافية للأسئلة](assets/images/questions/visual-priority/ATTRIBUTION.md) و[خرائط الدول](assets/images/questions/country-maps/ATTRIBUTION.md) موثقة محلياً. الخرائط رسوم جغرافية وليست صوراً فوتوغرافية؛ وتوضح [مراجعة فرص الصور](docs/visual-audit-2026-11-04.md) نطاق التدقيق والفرص المتبقية.

مصادر الصور المضافة للأسئلة متاحة في ملفات الإسناد المحلية: [الطعام والشراب](assets/images/questions/batch-food/ATTRIBUTION.md)، و[التاريخ](assets/images/questions/batch-history/ATTRIBUTION.md)، و[المعالم](assets/images/questions/batch-landmarks/ATTRIBUTION.md)، و[الطبيعة](assets/images/questions/batch-nature/ATTRIBUTION.md)، و[صور ناسا والجغرافيا](assets/images/questions/batch-science/ATTRIBUTION.md).
