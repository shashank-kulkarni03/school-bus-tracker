// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Initialize Leaflet map
const map = L.map("map").setView([20.5937, 78.9629], 5); // Center of India

// Add OpenStreetMap tiles
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

let routingControl = null;

// Helper to extract value
function getValue(val) {
  if (!val) return null;
  if (typeof val === "object" && "Value" in val) return val.Value;
  return val;
}

// Get today's date in DD/MM/YYYY format
const now = new Date();
const currentDateStr = now.toLocaleDateString("en-IN"); // DD/MM/YYYY

// Check if current time is before 5:00 PM IST
const isBefore5PM =
  now.getHours() < 17 || (now.getHours() === 17 && now.getMinutes() === 0);

// Fetch students
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
      const timestampDate = dateStr?.trim();

      const timestampTime = timeStr?.trim();
      const studentHour = parseInt(timestampTime?.split(":")[0]);
      const studentMinute = parseInt(timestampTime?.split(":")[1]);

      const isToday = timestampDate === currentDateStr;

      const isStudentBefore5PM =
        studentHour < 17 || (studentHour === 17 && studentMinute === 0);

      const validBefore5PM = isBefore5PM ? isStudentBefore5PM : true;

      if (isToday && willTakeBus && validBefore5PM) {
        const latlng = L.latLng(lat, lng);
        waypoints.push(latlng);

        L.marker(latlng)
          .addTo(map)
          .bindPopup(`<b>${name}</b><br>${email || ""}`);
      }
    }

    // Route if valid students exist
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
