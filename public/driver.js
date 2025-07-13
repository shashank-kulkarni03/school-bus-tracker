const map = L.map("map").setView([20.5937, 78.9629], 5);

// Add tile layer
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

// Current date and time
const now = new Date();

// Get today's and yesterday's date in DD/MM/YYYY
const todayStr = now.toLocaleDateString("en-IN"); // DD/MM/YYYY
const yesterday = new Date(now);
yesterday.setDate(now.getDate() - 1);
const yesterdayStr = yesterday.toLocaleDateString("en-IN");

// Check if current time is within valid driver window (after 6:00 PM to next day 4:00 PM)
const isAfter6PM = now.getHours() >= 18;
const isBefore4PM = now.getHours() < 16;
const allowWindow = isAfter6PM || isBefore4PM;

if (!allowWindow) {
  alert(
    "⚠️ Driver panel is only available after 6:00 PM until next day 4:00 PM."
  );
  throw new Error("Driver access outside allowed hours");
}

// Reset map after 6:00 PM
if (isAfter6PM) {
  map.eachLayer((layer) => {
    if (layer instanceof L.Marker || layer instanceof L.Polyline) {
      map.removeLayer(layer);
    }
  });
}

firebase
  .database()
  .ref("students")
  .once("value")
  .then((snapshot) => {
    const students = snapshot.val();
    if (!students) return;

    const waypoints = [];

    for (const uid in students) {
      const student = students[uid];
      const lat = parseFloat(student.lat);
      const lng = parseFloat(student.lng);
      const name = student.name || "";
      const email = student.email || "";
      const timestamp = student.timestamp || "";
      const willTakeBus = student.willTakeBus;

      if (!lat || !lng || !timestamp || !willTakeBus) continue;

      const [dateStr, timeStr] = timestamp.split(",");
      const tsDate = dateStr?.trim();
      const tsTime = timeStr?.trim();
      const tsHour = parseInt(tsTime?.split(":")[0]);
      const tsMinute = parseInt(tsTime?.split(":")[1]);

      // Accept if timestamp is:
      // - After 6:00 PM yesterday
      // - OR before 4:00 PM today
      const validYesterday = tsDate === yesterdayStr && tsHour >= 18;
      const validToday = tsDate === todayStr && tsHour < 16;

      if ((validYesterday || validToday) && willTakeBus) {
        const latlng = L.latLng(lat, lng);
        waypoints.push(latlng);
        L.marker(latlng).addTo(map).bindPopup(`<b>${name}</b><br>${email}`);
      }
    }

    if (waypoints.length >= 2) {
      L.Routing.control({
        waypoints: waypoints,
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
    console.error("🔥 Firebase error:", err);
    alert("Failed to load student data.");
  });
