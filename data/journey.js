// data/journey.js — изолированный компонент карты "Journey"
(function () {
  // --- Константы и i18n
  const SCOPE = 'journey:';
  const LS = {
    lang: SCOPE + 'lang',
    showLived: SCOPE + 'showLived',
    showVisited: SCOPE + 'showVisited',
    mapState: SCOPE + 'mapState',
  };
  const I18N = {
    en: { lived: 'Lived', visited: 'Visited', reset: 'Reset', popup_lived: 'Lived here', popup_visited: 'Visited' },
    ru: { lived: 'Жил', visited: 'Посетил', reset: 'Сброс', popup_lived: 'Здесь жил', popup_visited: 'Посещал' },
  };

  // --- Элементы DOM (внутри секции #journey)
  const root = document.getElementById('journey');
  if (!root) return; // секция не вставлена — выходим без ошибок

  const mapEl = root.querySelector('#journey-map');
  const langSel = root.querySelector('#journey-lang');
  const btnLived = root.querySelector('#journey-toggleLived');
  const btnVisited = root.querySelector('#journey-toggleVisited');
  const btnReset = root.querySelector('#journey-reset');

  // --- Хранилища и слои
  let livedPlaces = [];
  let visitedPlaces = [];
  const livedLayer = L.layerGroup();
  const visitedLayer = L.layerGroup();

  // --- Язык и локализация
  function currentLang() {
    const hashLang = new URLSearchParams(location.hash.slice(1)).get('lang');
    return hashLang || localStorage.getItem(LS.lang) || 'ru';
  }
  function setLang(lang) {
    localStorage.setItem(LS.lang, lang);
    const sp = new URLSearchParams(location.hash.slice(1));
    sp.set('lang', lang);
    location.hash = sp.toString();
    applyI18n();
  }
  function applyI18n() {
    const lang = currentLang();
    document.documentElement.lang = lang;
    root.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      el.textContent = I18N[lang][key];
    });
  }
  function setActive(btn, on) {
    btn.classList.toggle('active', !!on);
  }

  // --- Маркеры/попапы
  function markerIcon(kind) {
    const color = kind === 'lived' ? '#1fc77e' : '#ffd166';
    return L.divIcon({
      className: 'journey-marker',
      html:
        '<span style="display:inline-block;width:12px;height:12px;border-radius:50%;' +
        'background:' + color + ';border:2px solid #0006;box-shadow:0 2px 6px rgba(0,0,0,.35)"></span>',
      iconSize: [12, 12],
      iconAnchor: [6, 6],
    });
  }
  function popupHtml(p, kind) {
    const t = I18N[currentLang()];
    const label = kind === 'lived' ? t.popup_lived : t.popup_visited;
    const years = p.years ? `<div style="opacity:.8">${p.years}</div>` : '';
    const notes = p.notes ? `<div style="margin-top:.25rem">${p.notes}</div>` : '';
    return `
      <div style="min-width:180px">
        <div style="font-weight:700">${p.name}</div>
        <div style="font-size:12px;opacity:.85">${label}</div>
        ${years}
        ${notes}
      </div>
    `;
  }

  // --- Построение точек
  function addPoints() {
    livedLayer.clearLayers();
    visitedLayer.clearLayers();

    livedPlaces.forEach((p) =>
      L.marker(p.coords, { icon: markerIcon('lived') })
        .bindPopup(() => popupHtml(p, 'lived'))
        .addTo(livedLayer)
    );
    visitedPlaces.forEach((p) =>
      L.marker(p.coords, { icon: markerIcon('visited') })
        .bindPopup(() => popupHtml(p, 'visited'))
        .addTo(visitedLayer)
    );
  }

  // --- Автофит маркеров
  function fitAll() {
    const layers = [...livedLayer.getLayers(), ...visitedLayer.getLayers()];
    if (layers.length === 0) {
      map.setView([20, 0], 2);
      return;
    }
    const b = L.featureGroup(layers).getBounds();
    if (b.isValid()) map.fitBounds(b.pad(0.2));
    else map.setView([20, 0], 2);
  }

  // --- Карта
  const map = L.map(mapEl, { worldCopyJump: true, zoomSnap: 0.5 });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '' }).addTo(map);

  // --- Сохранение вида карты
  function saveMapState() {
    const c = map.getCenter();
    const z = map.getZoom();
    localStorage.setItem(LS.mapState, JSON.stringify({ lat: c.lat, lng: c.lng, zoom: z }));
  }
  function restoreMapState() {
    const raw = localStorage.getItem(LS.mapState);
    if (!raw) return false;
    try {
      const s = JSON.parse(raw);
      if (typeof s.lat === 'number' && typeof s.lng === 'number' && typeof s.zoom === 'number') {
        map.setView([s.lat, s.lng], s.zoom);
        return true;
      }
    } catch {}
    return false;
  }
  map.on('moveend', saveMapState);
  map.on('zoomend', saveMapState);

  // --- Контролы
  function initControls() {
    // язык
    langSel.value = currentLang();
    applyI18n();
    langSel.addEventListener('change', (e) => setLang(e.target.value));
    window.addEventListener('hashchange', applyI18n);

    // слои
    const savedShowLived = localStorage.getItem(LS.showLived);
    const savedShowVisited = localStorage.getItem(LS.showVisited);
    const showLived = savedShowLived === null ? true : savedShowLived === '1';
    const showVisited = savedShowVisited === null ? true : savedShowVisited === '1';

    if (showLived) map.addLayer(livedLayer);
    if (showVisited) map.addLayer(visitedLayer);
    setActive(btnLived, showLived);
    setActive(btnVisited, showVisited);

    btnLived.addEventListener('click', () => {
      if (map.hasLayer(livedLayer)) {
        map.removeLayer(livedLayer);
        localStorage.setItem(LS.showLived, '0');
        setActive(btnLived, false);
      } else {
        map.addLayer(livedLayer);
        localStorage.setItem(LS.showLived, '1');
        setActive(btnLived, true);
      }
    });

    btnVisited.addEventListener('click', () => {
      if (map.hasLayer(visitedLayer)) {
        map.removeLayer(visitedLayer);
        localStorage.setItem(LS.showVisited, '0');
        setActive(btnVisited, false);
      } else {
        map.addLayer(visitedLayer);
        localStorage.setItem(LS.showVisited, '1');
        setActive(btnVisited, true);
      }
    });

    btnReset.addEventListener('click', () => {
      if (!map.hasLayer(livedLayer)) map.addLayer(livedLayer);
      if (!map.hasLayer(visitedLayer)) map.addLayer(visitedLayer);
      localStorage.setItem(LS.showLived, '1');
      localStorage.setItem(LS.showVisited, '1');
      setActive(btnLived, true);
      setActive(btnVisited, true);
      localStorage.removeItem(LS.mapState);
      fitAll();
    });
  }

  // --- Загрузка данных
  async function loadData() {
    const res = await fetch('data/places.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error('Не удалось загрузить data/places.json');
    const json = await res.json();
    return {
      lived: (json.lived || []).map((n) => ({ name: n.name, coords: n.coords, years: n.years || '', notes: n.notes || '' })),
      visited: (json.visited || []).map((n) => ({ name: n.name, coords: n.coords, years: n.years || '', notes: n.notes || '' })),
    };
  }

  // --- Старт
  (async function boot() {
    try {
      const data = await loadData();
      livedPlaces = data.lived;
      visitedPlaces = data.visited;
      addPoints();
      initControls();
      if (!restoreMapState()) fitAll();
    } catch (err) {
      console.error(err);
      alert('Ошибка загрузки данных: ' + err.message);
      // даже если данных нет — инициализируем базовые контролы
      initControls();
      map.setView([20, 0], 2);
    }
  })();
})();

