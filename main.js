// Minimal, Safari-safe map + language toggles

// ---- Data ----
var lived = [
  { name: 'Panama City, Panama (2005–2006)', lat: 8.9824, lng: -79.5199 },
  { name: 'San Francisco, CA, USA (2006–2007)', lat: 37.7749, lng: -122.4194 },
  { name: 'Bishkek, Kyrgyzstan (2007–2010)', lat: 42.8746, lng: 74.5698 },
  { name: 'San Salvador, El Salvador (2010–2012)', lat: 13.6929, lng: -89.2182 },
  { name: 'Silver Spring, MD, USA (2012–2016)', lat: 39.0, lng: -77.0 },
  { name: 'Moscow, Russia (2016–2020)', lat: 55.7558, lng: 37.6173 },
  { name: 'Reykjavik, Iceland (2020)', lat: 64.1466, lng: -21.9426 },
  { name: 'Washington, DC, USA (2020–2023)', lat: 38.9072, lng: -77.0369 },
  { name: 'Almaty, Kazakhstan (2023–present)', lat: 43.2220, lng: 76.8512 }
];
var visited = [
  { name: 'Tokyo, Japan', lat: 35.6762, lng: 139.6503 },
  { name: 'Osaka, Japan', lat: 34.6937, lng: 135.5023 }
  // (остальные можно добавить позже; для проверки достаточно пары точек)
];

// ---- i18n ----
var currentLang = 'en';
var i18n = {
  en: {
    lived: 'Lived & Worked', visited: 'Visited', dashed: 'Dashed line = life path',
    tlOn: 'Lived & Worked: ON', tlOff: 'Lived & Worked: OFF',
    tvOn: 'Visited: ON', tvOff: 'Visited: OFF'
  },
  ru: {
    lived: 'Жил/Работал', visited: 'Посещено', dashed: 'Пунктир — траектория жизни',
    tlOn: 'Жил/Работал: ВКЛ', tlOff: 'Жил/Работал: ВЫКЛ',
    tvOn: 'Посещено: ВКЛ', tvOff: 'Посещено: ВЫКЛ'
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
  // update toggle button labels
  updateToggleTexts();
  // rebuild legend
  rebuildLegend();
  // pressed state
  document.getElementById('btn-ru').setAttribute('aria-pressed', String(lang === 'ru'));
  document.getElementById('btn-en').setAttribute('aria-pressed', String(lang === 'en'));
}

function updateToggleTexts(){
  var bl = document.getElementById('toggle-lived');
  var bv = document.getElementById('toggle-visited');
  if (bl){
    var onL = bl.getAttribute('aria-pressed') === 'true';
    bl.textContent = onL ? i18n[currentLang].tlOn : i18n[currentLang].tlOff;
  }
  if (bv){
    var onV = bv.getAttribute('aria-pressed') === 'true';
    bv.textContent = onV ? i18n[currentLang].tvOn : i18n[currentLang].tvOff;
  }
}

// ---- Map ----
var map, livedLayer, visitedLayer, legendCtrl;

function popupHtml(p){
  return '<strong>' + p.name + '</strong>';
}

function rebuildLegend(){
  if (!map) return;
  if (legendCtrl) legendCtrl.remove();
  legendCtrl = L.control({ position: 'bottomright' });
  legendCtrl.onAdd = function(){
    var div = L.DomUtil.create('div', 'legend');
    div.innerHTML =
      '<div style="display:flex;align-items:center;gap:8px">' +
        '<span style="display:inline-block;width:10px;height:10px;background:#3b82f6;border:2px solid #2563eb;border-radius:50%"></span> ' + i18n[currentLang].lived +
      '</div>' +
      '<div style="display:flex;align-items:center;gap:8px;margin-top:6px">' +
        '<span style="display:inline-block;width:10px;height:10px;background:#9ca3af;border:2px solid #6b7280;border-radius:50%"></span> ' + i18n[currentLang].visited +
      '</div>' +
      '<div style="margin-top:6px;opacity:.8">' + i18n[currentLang].dashed + '</div>';
    div.className = 'legend';
    return div;
  };
  legendCtrl.addTo(map);
}

function bindToggles(){
  var bl = document.getElementById('toggle-lived');
  var bv = document.getElementById('toggle-visited');
  if (bl){
    bl.addEventListener('click', function(){
      var on = bl.getAttribute('aria-pressed') !== 'true';
      bl.setAttribute('aria-pressed', String(on));
      if (on) livedLayer.addTo(map); else map.removeLayer(livedLayer);
      updateToggleTexts();
    });
  }
  if (bv){
    bv.addEventListener('click', function(){
      var on = bv.getAttribute('aria-pressed') !== 'true';
      bv.setAttribute('aria-pressed', String(on));
      if (on) visitedLayer.addTo(map); else map.removeLayer(visitedLayer);
      updateToggleTexts();
    });
  }
}

function initMap(){
  if (typeof L === 'undefined') {
    console.error('Leaflet not loaded');
    return;
  }
  map = L.map('map', { scrollWheelZoom: true, worldCopyJump: true, zoomControl: false });
  L.control.zoom({ position: 'bottomright' }).addTo(map);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19, attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);
  map.attributionControl.setPrefix('');

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

  // Life path
  var path = [];
  for (var k=0;k<lived.length;k++) path.push([lived[k].lat, lived[k].lng]);
  L.polyline(path, { color:'#60a5fa', weight:3, dashArray:'6 6', opacity:0.8 }).addTo(map);

  // Robust bounds
  var bounds = L.latLngBounds([]);
  for (var a=0;a<lived.length;a++) bounds.extend([lived[a].lat, lived[a].lng]);
  for (var b=0;b<visited.length;b++) bounds.extend([visited[b].lat, visited[b].lng]);
  if (bounds.isValid()) map.fitBounds(bounds.pad(0.2)); else map.setView([20, 0], 2);

  rebuildLegend();
}

function bindLangButtons(){
  var ru = document.getElementById('btn-ru');
  var en = document.getElementById('btn-en');
  if (ru) ru.addEventListener('click', function(){ setLang('ru'); });
  if (en) en.addEventListener('click', function(){ setLang('en'); });
}

document.addEventListener('DOMContentLoaded', function(){
  console.log('Leaflet loaded?', typeof L); // должно быть "object"
  bindLangButtons();
  bindToggles();
  setLang('en'); // default UI language
  initMap();
});

