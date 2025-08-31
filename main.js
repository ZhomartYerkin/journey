// ====== Data ======
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
  { name: 'Düsseldorf, Germany', lat: 51.2277, lng: 6.7735 },
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

// ====== Map ======
document.addEventListener('DOMContentLoaded', () => {
  const mapEl = document.getElementById('map');
  if (!mapEl) return;

  const map = L.map('map', { scrollWheelZoom: true, worldCopyJump: true });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  const group = L.featureGroup().addTo(map);

  const dot = (lat, lng, options) =>
    L.circleMarker([lat, lng], Object.assign({
      radius: 7, weight: 2, opacity: 1, fillOpacity: 0.9
    }, options));

  // Lived (blue)
  lived.forEach(p => {
    dot(p.lat, p.lng, { color: '#2563eb', fillColor: '#3b82f6' })
      .bindPopup(`<strong>${p.name}</strong>`)
      .addTo(group);
  });

  // Visited (gray)
  visited.forEach(p => {
    dot(p.lat, p.lng, { color: '#6b7280', fillColor: '#9ca3af' })
      .bindPopup(`<strong>${p.name}</strong>`)
      .addTo(group);
  });

  // Connect lived path
  L.polyline(lived.map(p => [p.lat, p.lng]), {
    color: '#60a5fa', weight: 3, dashArray: '6 6', opacity: 0.8
  }).addTo(group);

  // Fit bounds
  map.fitBounds(group.getBounds().pad(0.2));

  // Legend
  const legend = L.control({ position: 'bottomright' });
  legend.onAdd = function () {
    const div = L.DomUtil.create('div', 'legend');
    Object.assign(div.style, {
      background: 'var(--card)', border: '1px solid var(--border)',
      padding: '8px 10px', borderRadius: '10px', fontSize: '12px'
    });
    div.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px">
        <span style="display:inline-block;width:10px;height:10px;background:#3b82f6;border:2px solid #2563eb;border-radius:50%"></span> Lived & Worked
      </div>
      <div style="display:flex;align-items:center;gap:8px;margin-top:6px">
        <span style="display:inline-block;width:10px;height:10px;background:#9ca3af;border:2px solid #6b7280;border-radius:50%"></span> Visited
      </div>
      <div style="margin-top:6px;opacity:.8">Dashed line = life path</div>
    `;
    return div;
  };
  legend.addTo(map);
});

