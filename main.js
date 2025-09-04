// === My Journey: main.js (robust JSON loader + fallback data) ===

let map, group, legendCtrl, livedLayer, visitedLayer;
let livedPoints = [];
let visitedPoints = [];

// ---- Fallback: твои данные на случай, если places.json не загрузится ----
const FALLBACK = {
  lived: [
    { name: "Panama City, Panama", coords: [8.983333, -79.516667], years: "2005–2006" },
    { name: "San Francisco, CA, USA", coords: [37.7749, -122.4194], years: "2006–2007" },
    { name: "Bishkek, Kyrgyzstan", coords: [42.8746, 74.5698], years: "2007–2010" },
    { name: "San Salvador, El Salvador", coords: [13.6929, -89.2182], years: "2010–2012" },
    { name: "Silver Spring, MD, USA", coords: [39.0098, -77.0074], years: "2012–2016" },
    { name: "Moscow, Russia", coords: [55.7558, 37.6173], years: "2016–2020" },
    { name: "Reykjavik, Iceland", coords: [64.1355, -21.8954], years: "2020" },
    { name: "Washington, DC, USA", coords: [38.9072, -77.0369], years: "2020–2023" },
    { name: "Almaty, Kazakhstan", coords: [43.2389, 76.8897], years: "2023–present" }
  ],
  visited: [
    { name: "Tokyo, Japan", coords: [35.6762, 139.6503] },
    { name: "Osaka, Japan", coords: [34.6937, 135.5023] },
    { name: "Kathmandu, Nepal", coords: [27.7172, 85.3240] },
    { name: "Frankfurt, Germany", coords: [50.1109, 8.6821] },
    { name: "Berlin, Germany", coords: [52.5200, 13.4050] },
    { name: "Düsseldorf, Germany", coords: [51.2277, 6.7735] },
    { name: "Greifswald, Germany", coords: [54.0931, 13.3879] },
    { name: "Nuremberg, Germany", coords: [49.4521, 11.0767] },
    { name: "Brussels, Belgium", coords: [50.8503, 4.3517] },
    { name: "Antwerp, Belgium", coords: [51.2194, 4.4025] },
    { name: "Amsterdam, Netherlands", coords: [52.3676, 4.9041] },
    { name: "Nice, France", coords: [43.7102, 7.2620] },
    { name: "Istanbul, Turkey", coords: [41.0082, 28.9784] },
    { name: "Antalya, Turkey", coords: [36.8969, 30.7133] },
    { name: "Sharm El Sheikh, Egypt", coords: [27.9158, 34.3299] },
    { name: "Hurghada, Egypt", coords: [27.2579, 33.8116] },
    { name: "Phuket, Thailand", coords: [7.8804, 98.3923] },
    { name: "Thunder Bay, Canada", coords: [48.3809, -89.2477] },
    { name: "McGregor, Minnesota, USA", coords: [46.6116, -93.3113] },
    { name: "Cape Canaveral, FL, USA", coords: [28.3922, -80.6077] },
    { name: "Honolulu, Hawaii, USA", coords: [21.3099, -157.8581] }
  ]
};

// ---- i18n ----
const i18n = {
  en: {
    lived: 'Lived & Worked',
    visited: 'Visited',
    dashed: 'Dashed line = life path',
    toggleLivedOn: 'Lived & Worked: ON',
    toggleLivedOff: 'Lived & Worked: OFF',
    toggleVisitedOn: 'Visited: ON',
    toggleVisitedOff: 'Visited: OFF'
  },
  ru: {
    lived: 'Жил/Работал',
    visited: 'Посещено',
    dashed: 'Пунктир — траектория жизни',
    toggleLivedOn: 'Жил/Работал: ВКЛ',
    toggleLivedOff: 'Жил/Работал: ВЫКЛ',
    toggleVisitedOn: 'Посещено: ВКЛ',
    toggleVisitedOff: 'Посещено: ВЫКЛ'
  }
};
let currentLang = 'en';

// ---- Lang UI ----
function setLang(lang){
  currentLang = lang;
  updateToggleTexts();
  rebuildLegend();
  const btnRU = document.getElementById('btn-ru');
  const btnEN = document.getElementById('btn-en');
  if (btnRU && btnEN){
    btnRU.setAttribute('aria-pressed', String(lang === 'ru'));
    btnEN.setAttribute('aria-pressed', String(lang === 'en'));
  }
}
function bindLanguageSwitch(){
  document.getElementById('btn-ru')?.addEventListener('click', ()=> setLang('ru'));
  document.getElementById('btn-en')?.addEventListener('click', ()=> setLang('en'));
}

// ---- UI helpers ----
function popupHtml(p){
  const years = p.years ? `<div style="margin-top:2px;opacity:.8">${p.years}</div>` : '';
  const thumb = p.img ? `<div style="margin-top:6px"><img src="${p.img}" alt="${p.name}" style="display:block;max-width:150px;width:100%;height:auto;border-radius:6px"/></div>` : '';
  return `<strong>${p.name}</strong>${years}${thumb}`;
}
function rebuildLegend(){
  if (legendCtrl) legendCtrl.remove();
  legendCtrl = L.control({ position: 'bottomright' });
  legendCtrl.onAdd = function(){
    const div = L.DomUtil.create('div', 'legend');
    // стили через CSS-переменные — подстраиваются под тему
    Object.assign(div.style, {
      background: 'var(--panel)',
      border: '1px solid var(--outline)',
      color: 'var(--fg)',
      padding: '8px 10px',
      borderRadius: '10px',
      fontSize: '12px',
      lineHeight: '1.35'
    });
    div.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px">
        <span style="display:inline-block;width:10px;height:10px;background:#3b82f6;border:2px solid #2563eb;border-radius:50%"></span> ${i18n[currentLang].lived}
      </div>
      <div style="display:flex;align-items:center;gap:8px;margin-top:6px">
        <span style="display:inline-block;width:10px;height:10px;background:#d1d5db;border:2px solid #9ca3af;border-radius:50%"></span> ${i18n[currentLang].visited}
      </div>
      <div style="margin-top:6px;opacity:.8">${i18n[currentLang].dashed}</div>
    `;
    return div;
  };
  legendCtrl.addTo(map);
}


function updateToggleTexts(){
  const btnLived = document.getElementById('toggle-lived');
  const btnVisited = document.getElementById('toggle-visited');
  if (btnLived){
    const on = btnLived.getAttribute('aria-pressed') === 'true';
    btnLived.textContent = on ? i18n[currentLang].toggleLivedOn : i18n[currentLang].toggleLivedOff;
  }
  if (btnVisited){
    const on = btnVisited.getAttribute('aria-pressed') === 'true';
    btnVisited.textContent = on ? i18n[currentLang].toggleVisitedOn : i18n[currentLang].toggleVisitedOff;
  }
}
function bindToggles(){
  const btnLived = document.getElementById('toggle-lived');
  const btnVisited = document.getElementById('toggle-visited');
  if (btnLived){
    btnLived.addEventListener('click', () => {
      const on = btnLived.getAttribute('aria-pressed') !== 'true';
      btnLived.setAttribute('aria-pressed', String(on));
      if (on) livedLayer.addTo(group); else group.removeLayer(livedLayer);
      updateToggleTexts(); fitAll();
    });
  }
  if (btnVisited){
    btnVisited.addEventListener('click', () => {
      const on = btnVisited.getAttribute('aria-pressed') !== 'true';
      btnVisited.setAttribute('aria-pressed', String(on));
      if (on) visitedLayer.addTo(group); else group.removeLayer(visitedLayer);
      updateToggleTexts(); fitAll();
    });
  }
}
function fitAll(){
  const layers = [];
  if (group) group.eachLayer(l => {
    if (l instanceof L.LayerGroup) l.eachLayer(m => layers.push(m));
    else layers.push(l);
  });
  if (!layers.length) { map.setView([20, 0], 2); return; }
  const b = L.featureGroup(layers).getBounds();
  if (b.isValid()) map.fitBounds(b.pad(0.2)); else map.setView([20,0],2);
}

// ---- Data loading ----
async function loadJSONorFallback(){
  try {
    const url = 'data/places.json?v=' + Date.now(); // жёстко гасим кеш
    console.log('[journey] fetching', url);
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const json = await res.json();
    console.log('[journey] places.json loaded OK');

    return {
      lived: Array.isArray(json.lived) ? json.lived : [],
      visited: Array.isArray(json.visited) ? json.visited : [],
      source: 'json'
    };
  } catch (e) {
    console.warn('[journey] Failed to load places.json, using FALLBACK:', e);
    return { lived: FALLBACK.lived, visited: FALLBACK.visited, source: 'fallback' };
  }
}
function normalize(points){
  return points.map(o => {
    let lat = o.lat, lng = o.lng;
    if (Array.isArray(o.coords)) { lat = o.coords[0]; lng = o.coords[1]; }
    return {
      name: o.name, years: o.years || '', img: o.img || '',
      lat: typeof lat === 'number' ? lat : null,
      lng: typeof lng === 'number' ? lng : null,
    };
  }).filter(p => p.lat !== null && p.lng !== null);
}


// Подставляем тексты из data-en/data-ru в элементы
function applyLangTexts() {
  document.querySelectorAll('[data-en]').forEach(el => {
    const txt = el.dataset[currentLang] || el.dataset.en || '';
    // если это input/textarea — можно было бы писать в placeholder, но у нас обычные узлы
    el.textContent = txt;
  });
}

function setLang(lang){
  currentLang = lang;
  applyLangTexts();        // <<< добавили эту строку
  updateToggleTexts();
  rebuildLegend();
  const btnRU = document.getElementById('btn-ru');
  const btnEN = document.getElementById('btn-en');
  if (btnRU && btnEN){
    btnRU.setAttribute('aria-pressed', String(lang === 'ru'));
    btnEN.setAttribute('aria-pressed', String(lang === 'en'));
  }
}



// ---- Boot ----
window.addEventListener('DOMContentLoaded', async () => {
  bindLanguageSwitch();

  // карта
  map = L.map('map', { scrollWheelZoom: true, worldCopyJump: true, zoomControl: false });
  L.control.zoom({ position: 'bottomright' }).addTo(map);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19, attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);
  map.attributionControl.setPrefix('');
  group = L.featureGroup().addTo(map);

  // данные
  const { lived, visited, source } = await loadJSONorFallback();
  livedPoints   = normalize(lived);
  visitedPoints = normalize(visited);
  console.log(`[journey] points: lived=${livedPoints.length}, visited=${visitedPoints.length} (source: ${source})`);

  // слои
  livedLayer = L.layerGroup(livedPoints.map(p =>
    L.circleMarker([p.lat, p.lng], { radius:7, weight:2, opacity:1, fillOpacity:0.9, color:'#2563eb', fillColor:'#3b82f6' })
      .bindPopup(popupHtml(p))
  )).addTo(group);

  visitedLayer = L.layerGroup(visitedPoints.map(p =>
    L.circleMarker([p.lat, p.lng], { radius:7, weight:2, opacity:1, fillOpacity:0.9, color:'#6b7280', fillColor:'#9ca3af' })
      .bindPopup(popupHtml(p))
  )).addTo(group);

  // пунктир по lived
  if (livedPoints.length >= 2){
    L.polyline(livedPoints.map(p => [p.lat, p.lng]), { color:'#60a5fa', weight:3, dashArray:'6 6', opacity:0.8 }).addTo(group);
  }

  // UI
  fitAll(); rebuildLegend(); bindToggles(); setLang('en');
  setTimeout(() => map.invalidateSize(), 100);
  window.addEventListener('resize', () => map.invalidateSize());
});

