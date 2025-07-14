// ✅ Firebase is already initialized in driver.html

let driverToRouteControl = null;

const schoolLatLng = [13.1007, 77.5963]; // Sir MVIT
const map = L.map("map").setView(schoolLatLng, 12);

// 🗺️ Load OpenStreetMap tiles
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

// 🏫 School marker with icon
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
let driverRoute = [];
let driverPolyline = null;

// 🧠 Distance calc (Haversine)
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
        if (totalDistance(newRoute) < totalDistance(route)) {
          route = newRoute;
          improved = true;
        }
      }
    }
  }
  return route;
}
function twoOptSwap(route, i, k) {
  return route
    .slice(0, i)
    .concat(route.slice(i, k + 1).reverse(), route.slice(k + 1));
}
function totalDistance(route) {
  let dist = 0;
  for (let i = 0; i < route.length - 1; i++) {
    dist += getDistance(route[i], route[i + 1]);
  }
  return dist;
}

// ✅ Student waypoints (used globally)
let waypoints = [];

// 📍 Update student markers + route
async function updateStudentData() {
  studentMarkers.forEach((m) => map.removeLayer(m));
  studentMarkers = [];
  waypoints = [];

  const snapshot = await firebase.database().ref("students").once("value");
  const students = snapshot.val();

  const now = new Date();

  // Time boundaries
  const today430 = new Date(now);
  today430.setHours(16, 30, 0, 0); // Today 4:30 PM

  const yesterday6PM = new Date(now);
  yesterday6PM.setDate(
    now.getHours() < 16 ? now.getDate() - 2 : now.getDate() - 1
  );
  yesterday6PM.setHours(18, 0, 0, 0); // Yesterday 6:00 PM

  for (const id in students) {
    const s = students[id];
    if (!s || !s.timestamp || !s.willTakeBus) continue;

    const [dateStr, timeStr] = s.timestamp.split(",");
    const [d, m, y] = dateStr.trim().split("/").map(Number);
    const [h, min, sec] = timeStr.trim().split(":").map(Number);
    const ts = new Date(y, m - 1, d, h, min, sec);

    // Only include if timestamp is between yesterday 6 PM and today 4:30 PM
    if (
      ts >= yesterday6PM &&
      ts <= today430 &&
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
    const route = [
      L.latLng(schoolLatLng),
      ...waypoints,
      L.latLng(schoolLatLng),
    ];
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

// 🚍 Update driver's location
function updateDriverLocation() {
  if (!("geolocation" in navigator)) {
    alert("❌ Geolocation not supported.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const latlng = L.latLng(pos.coords.latitude, pos.coords.longitude);

      if (driverMarker) map.removeLayer(driverMarker);
      driverMarker = L.circleMarker(latlng, {
        radius: 8,
        color: "blue",
        fillColor: "#00f",
        fillOpacity: 0.8,
      })
        .addTo(map)
        .bindPopup("🚌 Driver Location");

      driverRoute.push(latlng);
      if (driverPolyline) map.removeLayer(driverPolyline);
      driverPolyline = L.polyline(driverRoute, {
        color: "blue",
        weight: 3,
        opacity: 0.6,
      }).addTo(map);

      // Route to nearest waypoint
      if (waypoints.length > 0) {
        let nearest = waypoints[0];
        let minDist = getDistance(latlng, nearest);
        for (let i = 1; i < waypoints.length; i++) {
          const dist = getDistance(latlng, waypoints[i]);
          if (dist < minDist) {
            minDist = dist;
            nearest = waypoints[i];
          }
        }

        if (driverToRouteControl) map.removeControl(driverToRouteControl);

        driverToRouteControl = L.Routing.control({
          waypoints: [latlng, nearest],
          routeWhileDragging: false,
          draggableWaypoints: false,
          addWaypoints: false,
          show: false,
          lineOptions: {
            styles: [{ color: "blue", weight: 3, dashArray: "6, 8" }],
          },
          createMarker: () => null,
        }).addTo(map);
      }
    },
    (err) => console.error("📡 GPS error:", err),
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 10000,
    }
  );
}

// 🕒 Refresh intervals
updateStudentData();
updateDriverLocation();
setInterval(updateDriverLocation, 10000); // every 10 sec
setInterval(updateStudentData, 2 * 60 * 1000); // every 2 min
