// Initialize Leaflet map
const map = L.map("map").setView([20.5937, 78.9629], 5);

// Add OpenStreetMap tiles
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

let routingControl = null;

function getValue(val) {
  if (val === null || val === undefined) return null;
  if (typeof val === "object" && "Value" in val) return val.Value;
  return val;
}

firebase
  .database()
  .ref("students")
  .once("value")
  .then((snapshot) => {
    const students = snapshot.val();
    if (!students) return;

    const waypoints = [];
    const now = new Date();
    const todayStr = now.toLocaleDateString("en-IN"); // "13/07/2025"

    const cutoffTime = new Date();
    cutoffTime.setHours(17, 0, 0); // 5:00 PM

    for (const uid in students) {
      const student = students[uid];

      const name = getValue(student.name);
      const email = getValue(student.email);
      const lat = parseFloat(getValue(student.lat));
      const lng = parseFloat(getValue(student.lng));
      const willTakeBus = getValue(student.willTakeBus);
      const timestamp = getValue(student.timestamp);

      if (willTakeBus && !isNaN(lat) && !isNaN(lng)) {
        if (timestamp) {
          const [dateStr, timeStr] = timestamp.split(",");
          if (dateStr.trim() === todayStr) {
            const time = timeStr?.trim();
            const dateTime = new Date(`${todayStr} ${time}`);
            if (dateTime < cutoffTime) {
              const latlng = L.latLng(lat, lng);
              waypoints.push(latlng);
              L.marker(latlng)
                .addTo(map)
                .bindPopup(`<b>${name}</b><br>${email || ""}`);
            }
          }
        }
      }
    }

    if (waypoints.length >= 2) {
      routingControl = L.Routing.control({
        waypoints: waypoints,
        routeWhileDragging: false,
        draggableWaypoints: false,
        addWaypoints: false,
        createMarker: () => null,
      }).addTo(map);
    } else if (waypoints.length === 1) {
      map.setView(waypoints[0], 14);
    } else {
      alert("⚠️ No valid student data for today before 5:00 PM.");
    }
  })
  .catch((err) => {
    console.error("🔥 Firebase error:", err);
    alert("Failed to load student data.");
  });
