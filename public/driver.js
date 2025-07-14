if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const schoolLatLng = [13.1007, 77.5963]; // Sir MVIT
const map = L.map("map").setView(schoolLatLng, 12);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

const schoolIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

L.marker(schoolLatLng, { icon: schoolIcon })
  .addTo(map)
  .bindPopup("🏫 Sir MVIT - School Location");

let studentMarkers = [];
let routingControl = null;
let driverMarker = null;

// ⏰ Time check
function isWithinTimeWindow() {
  const now = new Date();
  const hour = now.getHours();
  return hour >= 18 || hour < 16;
}

// 📍 Haversine distance
function getDistance(p1, p2) {
  return map.distance(p1, p2);
}

// 🔄 2-opt optimization
function twoOpt(route) {
  let improved = true;
  while (improved) {
    improved = false;
    for (let i = 1; i < route.length - 2; i++) {
      for (let k = i + 1; k < route.length - 1; k++) {
        const newRoute = twoOptSwap(route, i, k);
        const oldDist = totalDistance(route);
        const newDist = totalDistance(newRoute);
        if (newDist < oldDist) {
          route = newRoute;
          improved = true;
        }
      }
    }
  }
  return route;
}

function twoOptSwap(route, i, k) {
  const start = route.slice(0, i);
  const middle = route.slice(i, k + 1).reverse();
  const end = route.slice(k + 1);
  return start.concat(middle).concat(end);
}

function totalDistance(route) {
  let dist = 0;
  for (let i = 0; i < route.length - 1; i++) {
    dist += getDistance(route[i], route[i + 1]);
  }
  return dist;
}

// 🗺️ Update map with students & routing
async function updateMapData() {
  if (!isWithinTimeWindow()) return;

  studentMarkers.forEach((m) => map.removeLayer(m));
  studentMarkers = [];

  const snapshot = await firebase.database().ref("students").once("value");
  const students = snapshot.val();

  const now = new Date();
  const sixPMYesterday = new Date();
  sixPMYesterday.setDate(
    now.getHours() < 18 ? now.getDate() - 1 : now.getDate()
  );
  sixPMYesterday.setHours(18, 0, 0, 0);

  const waypoints = [];

  for (const id in students) {
    const s = students[id];
    if (!s || !s.timestamp || !s.willTakeBus) continue;

    const [dateStr, timeStr] = s.timestamp.split(",");
    const [d, m, y] = dateStr.trim().split("/").map(Number);
    const [h, min, sec] = timeStr.trim().split(":").map(Number);
    const ts = new Date(y, m - 1, d, h, min, sec);

    if (
      ts >= sixPMYesterday &&
      s.willTakeBus &&
      !isNaN(s.lat) &&
      !isNaN(s.lng)
    ) {
      const latlng = L.latLng(s.lat, s.lng);
      waypoints.push(latlng);

      const marker = L.marker(latlng)
        .addTo(map)
        .bindPopup(`<b>${s.name}</b><br>${s.email || ""}`);
      studentMarkers.push(marker);
    }
  }

  if (routingControl) map.removeControl(routingControl);

  if (waypoints.length > 0) {
    let route = [L.latLng(schoolLatLng), ...waypoints, L.latLng(schoolLatLng)];
    const optimized = twoOpt(route);

    routingControl = L.Routing.control({
      waypoints: optimized,
      routeWhileDragging: false,
      draggableWaypoints: false,
      addWaypoints: false,
      createMarker: () => null,
    }).addTo(map);
  }
}

// 🚍 Track driver
function trackDriverLocation() {
  if ("geolocation" in navigator) {
    navigator.geolocation.watchPosition(
      (pos) => {
        const latlng = [pos.coords.latitude, pos.coords.longitude];
        if (driverMarker) map.removeLayer(driverMarker);

        driverMarker = L.circleMarker(latlng, {
          radius: 8,
          color: "blue",
          fillColor: "#00f",
          fillOpacity: 0.8,
        })
          .addTo(map)
          .bindPopup("🚌 Driver Location");
      },
      (err) => console.error("📡 GPS error:", err),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 5000 }
    );
  } else {
    alert("❌ Geolocation not supported.");
  }
}

// 🔁 Refresh markers & route every 5s
setInterval(updateMapData, 5000);
updateMapData();
trackDriverLocation();
