if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const map = L.map("map").setView([20.5937, 78.9629], 5); // Center of India

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

let routingControl = null;

function getValue(val) {
  if (!val) return null;
  if (typeof val === "object" && "Value" in val) return val.Value;
  return val;
}

const now = new Date();
const currentDateStr = now.toLocaleDateString("en-IN"); // DD/MM/YYYY

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
      const name = getValue(student.name);
      const email = getValue(student.email);
      const lat = parseFloat(getValue(student.lat));
      const lng = parseFloat(getValue(student.lng));
      const willTakeBus = getValue(student.willTakeBus);
      const timestamp = getValue(student.timestamp);

      if (!timestamp || !willTakeBus || isNaN(lat) || isNaN(lng)) continue;

      const [dateStr, timeStr] = timestamp.split(",");
      if (!dateStr || !timeStr) continue;

      const isToday = dateStr.trim() === currentDateStr;

      const [hourStr, minuteStr] = timeStr.trim().split(":");
      const studentHour = parseInt(hourStr);
      const studentMinute = parseInt(minuteStr);

      const submittedAfter5PM =
        studentHour > 17 || (studentHour === 17 && studentMinute > 0);

      if (isToday && willTakeBus && submittedAfter5PM) {
        const latlng = L.latLng(lat, lng);
        waypoints.push(latlng);

        L.marker(latlng)
          .addTo(map)
          .bindPopup(`<b>${name}</b><br>${email || ""}`);
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
      alert("⚠️ No valid student data for today AFTER 5:00 PM.");
    }
  })
  .catch((err) => {
    console.error("🔥 Firebase error:", err);
    alert("Failed to load student data.");
  });
