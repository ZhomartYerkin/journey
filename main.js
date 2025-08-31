// Init map
const map = L.map('map').setView([43.2389, 76.8897], 2) // центр: Алматы

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map)

// Example places
const places = [
  { type: "lived", name: "Almaty, Kazakhstan", coords: [43.2389, 76.8897], note: "Where I was born" },
  { type: "lived", name: "Minnesota, USA", coords: [45.0, -93.2], note: "Studied and grew professionally" },
  { type: "visited", name: "Norway", coords: [60.472, 8.4689], note: "Explored the fjords" },
]

places.forEach(p => {
  const color = p.type === "lived" ? "blue" : "green"
  L.circleMarker(p.coords, { radius: 6, color })
    .addTo(map)
    .bindPopup(`<strong>${p.name}</strong><br>${p.note}`)
})

