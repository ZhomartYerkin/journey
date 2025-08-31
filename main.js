// My Journey: main.js — RU/EN, карта, переключатели, панель списков

// ===== Data =====
const lived = [
  { name: 'Panama City, Panama (2005–2006)',    lat: 8.9824,  lng: -79.5199 },
  { name: 'San Francisco, CA, USA (2006–2007)', lat: 37.7749, lng: -122.4194 },
  { name: 'Bishkek, Kyrgyzstan (2007–2010)',    lat: 42.8746, lng: 74.5698 },
  { name: 'San Salvador, El Salvador (2010–2012)', lat: 13.6929, lng: -89.2182 },
  { name: 'Silver Spring, MD, USA (2012–2016)', lat: 39.0,    lng: -77.0 },
  { name: 'Moscow, Russia (2016–2020)',         lat: 55.7558, lng: 37.6173 },
  { name: 'Reykjavik, Iceland (2020)',          lat: 64.1466, lng: -21.9426 },
  { name: 'Washington, DC, USA (2020–2023)',    lat: 38.9072, lng: -77.0369 },
  { name: 'Almaty, Kazakhstan (2023–present)',  lat: 43.2220, lng: 76.8512 }
];

const visited = [
  { name: 'Tokyo, Japan', lat: 35.6762, lng: 139.6503 },
  { name: 'Osaka, Japan', lat: 34.6937, lng: 135.5023 },
  { name: 'Kathmandu, Nepal', lat: 27.7172, lng: 85.3240 },
  { name: 'Frankfurt, Germany', lat: 50.1109, lng: 8.6821 },
  { name: 'Berlin, Germany', lat: 52.5200, lng: 13.4050 },
  { name: 'Duesseldorf, Germany', lat: 51.2277, lng: 6.7735 },
  { name: 'Greifswald, Germany', lat: 54.0931, lng: 13.3879 },
  { name: 'Nuremberg, Germany', lat: 49.4521, lng: 11.0767 },
  { name: 'Brussels, Belgium', lat: 50.8503, lng: 4.3517 },
  { name: 'Antwerp, Belgium', lat: 51.2194, lng: 4.4025 },
  { name: 'Amsterdam, Netherlands', lat: 52.3676, lng: 4.9041 },
  { name: 'Nice, France', lat: 43.7102, lng: 7.2620 },
  { name: 'Istanbul, Turkey', lat: 41.0082, lng: 28.9784 },
  { name: 'Antalya, Turkey', lat: 36.8969, lng: 30.7133 },
  { name: 'Sharm el-Sheikh, Egypt', lat: 27.9158, lng: 34.3299 },
  { name: 'Hurghada, Egypt', lat: 27.2579, lng: 33.8116 },
  { name: 'Phuket, Thailand', lat: 7.8804, lng: 98.3923 },
  { name: 'Thunder Bay, Canada', lat: 48.3809, lng: -89.2477 },
  { name: 'McGregor, Minnesota, USA', lat: 46.6105, lng: -93.3116 },
  { name: 'Cape Canaveral, Florida, USA', lat: 28.3922, lng: -80.6077 },
  { name: 'Honolulu, Hawaii, USA', lat: 21.3069, lng: -157.8583 }
];

// ===== i18n =====
let currentLang = 'en';
const i18n = {
  en: {
    lived: 'Lived & Worked', visited: 'Visited', dashed: 'Dashed line = life path',
    toggleLivedOn: 'Lived & Worked: ON', toggleLivedOff: 'Lived & Worked: OFF',
    toggleVisitedOn: 'Visited: ON', toggleVisitedOff: 'Visited: OFF',
    showLists: 'Show lists', hideLists: 'Hide lists'
  },
  ru: {
    lived: 'Жил/Работал', visited: 'Посещено', dashed: 'Пунктир — траектория жизни',
    toggleLivedOn: 'Жил/Работал: ВКЛ', toggleLivedOff: 'Жил/Работал: ВЫКЛ',
    toggleVisitedOn: 'Посещено: ВКЛ', toggleVisitedOff: 'Посещено: ВЫКЛ',
    showLists: 'Показать списки', hideLists: 'Скрыть списки'
  }
};

function setLang(lang){
  currentLang = lang;
  var nodes = document.querySelectorAll('[data-en]');
  for (var i=0;i<nodes.length;i++){
    var el = nodes[i];
    var txt = el.getAttribute('data-' + lang) || el.getAttribute('data-en');
    el.innerHTML = txt;
  }
  updateToggleTexts();
  rebuildLegend();
  var btnRU = document.getElementById('btn-ru');
  var btnEN = document.getElementById('btn-en');
  if (btnRU && btnEN){
    btnRU.setAttribute('aria-pressed', String(lang === 'ru'));
    btnEN.setAttribute('aria-pressed', String(lang === 'en'));
  }
  // кнопка панельки
  var btnLoc = document.getElementById('btn-locations');
  if (btnLoc){
    var open = document.getElementById('locations-panel').classList.contains('open');
    btnLoc.textContent = open ? i18n[currentLang].hideLists : i18n[currentLang].showLists;
  }
}

function bindLanguageSwitch(){
  var ru = document.getElementById('btn-ru');
  var en = document.getElementById('btn-en');
  if (ru) ru.addEventListener('click', function(){ setLang('ru'); });
  if (en) en.addEventListener('click', function(){ setLang('en'); });
}

// ===== Map =====
var map, livedLayer, visitedLayer, legendCtrl;

function popupHtml(p){
  // мини-превью опционально: добавь p.img = 'images/xxx.jpg' и появится
  var img = p.img ? '<div style="margin-top:6px"><img src="'+p.img+'" alt="'+p.name+'" style="display:block;max-width:150px;width:100%;height:auto;border-radius:6px"/></div>' : '';
  return '<strong>'+p.name+'</strong>'+img;
}

function rebuildLegend(){
  if (legendCtrl) legendCtrl.remove();
  legendCtrl = L.control({ position: 'bottomright' });
  legendCtrl.onAdd = function(){
    var div = L.DomUtil.create('div', 'legend');
    div.style.background = 'var(--card)';
    div.style.border = '1px solid var(--border)';
    div.style.padding = '8px 10px';
    div.style.borderRadius = '10px';
    div.style.fontSize = '12px';
    div.innerHTML =
      '<div style="display:flex;align-items:center;gap:8px">' +
        '<span style="display:inline-block;width:10px;height:10px;background:#3b82f6;border:2px solid #2563eb;border-radius:50%"></span> ' + i18n[currentLang].lived +
      '</div>' +
      '<div style="display:flex;align-items:center;gap:8px;margin-top:6px">' +
        '<span style="display:inline-block;width:10px;height:10px;background:#9ca3af;border:2px solid #6b7280;border-radius:50%"></span> ' + i18n[currentLang].visited +
      '</div>' +
      '<div style="margin-top:6px;opacity:.8">' + i18n[currentLang].dashed + '</div>';
    return div;
  };
  legendCtrl.addTo(map);
}

function updateToggleTexts(){
  var btnLived = document.getElementById('toggle-lived');
  var btnVisited = document.getElementById('toggle-visited');
  if (btnLived){
    var onL = btnLived.getAttribute('aria-pressed') === 'true';
    btnLived.textContent = onL ? i18n[currentLang].toggleLivedOn : i18n[currentLang].toggleLivedOff;
  }
  if (btnVisited){
    var onV = btnVisited.getAttribute('aria-pressed') === 'true';
    btnVisited.textContent = onV ? i18n[currentLang].toggleVisitedOn : i18n[currentLang].toggleVisitedOff;
  }
}

function bindToggles(){
  var btnLived = document.getElementById('toggle-lived');
  var btnVisited = document.getElementById('toggle-visited');
  if (btnLived){
    btnLived.addEventListener('click', function(){
      var on = btnLived.getAttribute('aria-pressed') !== 'true';
      btnLived.setAttribute('aria-pressed', String(on));
      if (on) livedLayer.addTo(map); else map.removeLayer(livedLayer);
      updateToggleTexts();
    });
  }
  if (btnVisited){
    btnVisited.addEventListener('click', function(){
      var on = btnVisited.getAttribute('aria-pressed') !== 'true';
      btnVisited.setAttribute('aria-pressed', String(on));
      if (on) visitedLayer.addTo(map); else map.removeLayer(visitedLayer);
      updateToggleTexts();
    });
  }
  // кнопка панели списков
  var btnLoc = document.getElementById('btn-locations');
  var panel = document.getElementById('locations-panel');
  if (btnLoc && panel){
    btnLoc.addEventListener('click', function(){
      var isOpen = panel.classList.toggle('open');
      btnLoc.textContent = isOpen ? i18n[currentLang].hideLists : i18n[currentLang].showLists;
    });
  }
}

window.addEventListener('DOMContentLoaded', function(){
  console.log('Leaflet loaded?', typeof L); // должно быть "object"
  bindLanguageSwitch();

  map = L.map('map', { scrollWheelZoom: true, worldCopyJump: true, zoomControl: false });
  L.control.zoom({ position: 'bottomright' }).addTo(map);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);
  map.attributionControl.setPrefix('');

  // слои
  livedLayer = L.layerGroup().addTo(map);
  visitedLayer = L.layerGroup().addTo(map);

  for (var i=0;i<lived.length;i++){
    var p = lived[i];
    L.circleMarker([p.lat, p.lng], { radius:7, weight:2, opacity:1, fillOpacity:0.9, color:'#2563eb', fillColor:'#3b82f6' })
      .bindPopup(popupHtml(p)).addTo(livedLayer);
  }
  for (var j=0;j<visited.length;j++){
    var q = visited[j];
    L.circleMarker([q.lat, q.lng], { radius:7, weight:2, opacity:1, fillOpacity:0.9, color:'#6b7280', fillColor:'#9ca3af' })
      .bindPopup(popupHtml(q)).addTo(visitedLayer);
  }

  // путь жизни
  var path = lived.map(function(p){ return [p.lat, p.lng]; });
  L.polyline(path, { color:'#60a5fa', weight:3, dashArray:'6 6', opacity:0.8 }).addTo(map);

  // надёжный fitBounds без getBounds()
  var bounds = L.latLngBounds([]);
  for (var k=0;k<lived.length;k++) bounds.extend([lived[k].lat, lived[k].lng]);
  for (var m=0;m<visited.length;m++) bounds.extend([visited[m].lat, visited[m].lng]);
  if (bounds.isValid()) map.fitBounds(bounds.pad(0.2)); else map.setView([20, 0], 2);

  rebuildLegend();
  bindToggles();
  setLang('en'); // default UI language
});

