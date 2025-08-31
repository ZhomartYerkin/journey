// data/site.js — i18n for whole site (EN/RU), sync with map
(function(){
  const LS_LANG = 'journey:lang'; // shared with map

  const I18N = {
    en: {
      "site.title": "Journey — Map",
      "hdr.title": "My Portfolio",
      "nav.about": "About",
      "nav.resume": "Resume",
      "nav.journey": "Journey",
      "nav.contact": "Contact",
      "nav.language": "Language",
      "about.h2": "About Me",
      "about.p": "Hello! My name is Zhomart Yerkin. I am passionate about software development, travel, and lifelong learning. This site combines my professional background and my personal journey across the world.",
      "resume.h2": "Resume",
      "resume.text": "You can download my resume here:",
      "map.title": "Journey",
      "map.lived": "Lived",
      "map.visited": "Visited",
      "map.reset": "Reset",
      "contact.h2": "Contact",
      "contact.email": "Email",
      "footer.copy": "© 2025 My Website"
    },
    ru: {
      "site.title": "Путешествие — Карта",
      "hdr.title": "Моё портфолио",
      "nav.about": "Обо мне",
      "nav.resume": "Резюме",
      "nav.journey": "Карта",
      "nav.contact": "Контакты",
      "nav.language": "Язык",
      "about.h2": "Обо мне",
      "about.p": "Привет! Меня зовут Жомарт Еркин. Я увлечён разработкой, путешествиями и постоянным обучением. Этот сайт объединяет мой профессиональный опыт и личную географию.",
      "resume.h2": "Резюме",
      "resume.text": "Скачать моё резюме:",
      "map.title": "Маршруты",
      "map.lived": "Жил",
      "map.visited": "Посетил",
      "map.reset": "Сброс",
      "contact.h2": "Контакты",
      "contact.email": "Почта",
      "footer.copy": "© 2025 Мой сайт"
    }
  };

  function currentLang(){
    const hashLang = new URLSearchParams(location.hash.slice(1)).get('lang');
    return hashLang || localStorage.getItem(LS_LANG) || 'en';
  }
  function setLang(lang){
    localStorage.setItem(LS_LANG, lang);
    const sp = new URLSearchParams(location.hash.slice(1));
    sp.set('lang', lang);
    location.hash = sp.toString();
    applyI18n();
    syncSelects(lang);
  }
  function applyI18n(){
    const lang = currentLang();
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const txt = (I18N[lang] && I18N[lang][key]) || '';
      if (el.tagName.toLowerCase() === 'title') {
        document.title = txt || el.textContent;
      } else {
        el.textContent = txt || el.textContent;
      }
    });
  }
  function syncSelects(lang){
    const siteSel = document.getElementById('site-lang');
    const mapSel = document.getElementById('journey-lang');
    if (siteSel) siteSel.value = lang;
    if (mapSel) mapSel.value = lang;
  }

  (function init(){
    const lang = currentLang();
    syncSelects(lang);
    applyI18n();

    const siteSel = document.getElementById('site-lang');
    if (siteSel) siteSel.addEventListener('change', e => setLang(e.target.value));

    window.addEventListener('hashchange', () => {
      const l = currentLang();
      syncSelects(l);
      applyI18n();
    });
  })();
})();

