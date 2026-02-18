const I18N = {
  en: {
    homeTitle: "Start Your Car Deal Journey.",
    homeSub: "Evaluation & insurance can be done without login. Finance eligibility needs registration.",
    btnEval: "Check Car Evaluation",
    btnIns: "Get Insurance Quote",
    btnFin: "Check Finance Eligibility",
    engine: "ENGINE\nSTART",
    navHome: "Home",
    navCars: "Cars",
    navEval: "Evaluation",
    navIns: "Insurance",
    navFin: "Finance",
    navAdmin: "Admin",
    lang: "AR"
  },
  ar: {
    homeTitle: "ابدأ رحلة سيارتك.",
    homeSub: "التقييم والتأمين بدون تسجيل. الأهلية التمويلية تحتاج تسجيل دخول.",
    btnEval: "تقييم السيارة",
    btnIns: "عرض سعر التأمين",
    btnFin: "أهلية التمويل",
    engine: "تشغيل\nالمحرك",
    navHome: "الرئيسية",
    navCars: "السيارات",
    navEval: "التقييم",
    navIns: "التأمين",
    navFin: "التمويل",
    navAdmin: "لوحة الإدارة",
    lang: "EN"
  }
};

function getLang(){
  return localStorage.getItem("carfin_lang") || "en";
}
function setLang(lang){
  localStorage.setItem("carfin_lang", lang);
}
function t(key){
  const lang = getLang();
  return (I18N[lang] && I18N[lang][key]) || I18N.en[key] || key;
}
