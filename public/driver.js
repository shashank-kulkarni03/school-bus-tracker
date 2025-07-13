// Initialize Leaflet map
const map = L.map("map").setView([20.5937, 78.9629], 5);

// Add OpenStreetMap tiles
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

let routingControl = null;

// Helper to extract plain values from Firebase
function getValue(val) {
  if (val === null || val === undefined) return null;
  if (typeof val === "object" && "Value" in val) return val.Value;
  return val;
}

// Custom function to parse DD/MM/YYYY, HH:mm:ss into Date object
function parseIndianTimestamp(timestampStr) {
  try {
    const [datePart, timePart] = timestampStr.split(",");
    const [day, month, year] = datePart.trim().split("/").map(Number);
    const [hour, minute, second] = timePart.trim().split(":").map(Number);
    return new Date(year, month - 1, day, hour, minute, second);
  } catch (e) {
    console.warn("⛔ Invalid timestamp format:", timestampStr);
    return null;
  }
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

    // Create cutoff time for today at 5:00 PM
    const cutoff = new Date();
    cutoff.setHours(17, 0, 0, 0); // 5:00 PM

    for (const uid in students) {
      const student = students[uid];

      const name = getValue(student.name);
      const email = getValue(student.email);
      const lat = parseFloat(getValue(student.lat));
      const lng = parseFloat(getValue(student.lng));
      const willTakeBus = getValue(student.willTakeBus);
      const timestampStr = getValue(student.timestamp);

      if (
        willTakeBus &&
        !isNaN(lat) &&
        !isNaN(lng) &&
        typeof timestampStr === "string"
      ) {
        const studentTime = parseIndianTimestamp(timestampStr);

        // Check if student time is from today AND before 5:00 PM
        if (
          studentTime &&
          studentTime.toDateString() === now.toDateString() &&
          studentTime <= cutoff
        ) {
          const latlng = L.latLng(lat, lng);
          waypoints.push(latlng);
          L.marker(latlng)
            .addTo(map)
            .bindPopup(`<b>${name}</b><br>${email || ""}`);
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
