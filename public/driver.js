// Leaflet map init
const map = L.map("map").setView([20.5937, 78.9629], 5); // India center

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

let routingControl = null;

// Get current date-time
const now = new Date();
const todayDateStr = now.toLocaleDateString("en-IN"); // DD/MM/YYYY
const currentHour = now.getHours();

// Determine display mode
const isAfter6PM = currentHour >= 18;
const isBefore4PMNextDay =
  currentHour < 16 || now.getDate() !== new Date().getDate();

// If it's NOT between 6:00PM and 4:00PM next day, stop
if (!isAfter6PM && !isBefore4PMNextDay) {
  alert("🕔 Map is only available between 6:00PM and next day 4:00PM.");
  throw new Error("Access outside allowed time.");
}

// Helper
function getValue(val) {
  if (val === null || val === undefined) return null;
  if (typeof val === "object" && "Value" in val) return val.Value;
  return val;
}

// Reset map and fetch student locations
firebase
  .database()
  .ref("students")
  .once("value")
  .then((snapshot) => {
    const students = snapshot.val();
    if (!students) return;

    const waypoints = [];
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const validDateStr = isAfter6PM
      ? today.toLocaleDateString("en-IN")
      : yesterday.toLocaleDateString("en-IN");

    for (const uid in students) {
      const s = students[uid];
      const timestamp = getValue(s.timestamp);
      const willTakeBus = getValue(s.willTakeBus);
      const lat = parseFloat(getValue(s.lat));
      const lng = parseFloat(getValue(s.lng));

      if (!timestamp || !willTakeBus || isNaN(lat) || isNaN(lng)) continue;

      const [dateStr] = timestamp.split(",");
      const formattedDate = dateStr.trim();

      if (formattedDate === validDateStr && willTakeBus) {
        const latlng = L.latLng(lat, lng);
        waypoints.push(latlng);

        L.marker(latlng)
          .addTo(map)
          .bindPopup(`<b>${s.name}</b><br>${s.email || ""}`);
      }
    }

    if (waypoints.length >= 2) {
      routingControl = L.Routing.control({
        waypoints,
        routeWhileDragging: false,
        draggableWaypoints: false,
        addWaypoints: false,
        createMarker: () => null,
      }).addTo(map);
    } else if (waypoints.length === 1) {
      map.setView(waypoints[0], 14);
    } else {
      alert("⚠️ No valid student data to show.");
    }
  })
  .catch((err) => {
    console.error("❌ Firebase error:", err);
    alert("Failed to load student data.");
  });
