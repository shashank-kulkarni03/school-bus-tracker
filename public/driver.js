// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Initialize Leaflet map
const map = L.map("map").setView([20.5937, 78.9629], 5); // India center
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

// Utility to extract value
function getValue(val) {
  if (val === null || val === undefined) return null;
  if (typeof val === "object" && "Value" in val) return val.Value;
  return val;
}

// ✅ Helper to check if timestamp is from today and before 5 PM
function isValidTodayBefore5PM(timestamp) {
  if (!timestamp) return false;
  const date = new Date(timestamp);
  const now = new Date();

  // Check if it's today
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  // Check if it's before 5 PM
  const isBefore5PM = date.getHours() < 17;

  return isToday && isBefore5PM;
}

// Main logic
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
      const timestamp = getValue(student.timestamp); // should be stored at update

      console.log(
        "🔍 Checking student:",
        name,
        lat,
        lng,
        willTakeBus,
        timestamp
      );

      if (
        willTakeBus === true &&
        !isNaN(lat) &&
        !isNaN(lng) &&
        isValidTodayBefore5PM(timestamp)
      ) {
        const latlng = L.latLng(lat, lng);
        waypoints.push(latlng);

        L.marker(latlng)
          .addTo(map)
          .bindPopup(`<b>${name}</b><br>${email || ""}`);
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
      alert("⚠️ No valid student data for today before 5:00 PM.");
    }
  })
  .catch((err) => {
    console.error("🔥 Firebase error:", err);
    alert("Failed to load student data.");
  });
