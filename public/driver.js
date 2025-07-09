// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Initialize Leaflet map
const map = L.map("map").setView([20.5937, 78.9629], 5); // Default: India

// Add OpenStreetMap tiles
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

// 🧠 Helper to extract nested values like { Value: 13.1 }
function extractValue(input) {
  return typeof input === "object" && input !== null && "Value" in input
    ? input.Value
    : input;
}

const waypoints = [];

// Load student data
firebase
  .database()
  .ref("students")
  .once("value")
  .then((snapshot) => {
    const students = snapshot.val();
    if (!students) return;

    console.log("📦 All student data:", students);

    for (const uid in students) {
      const student = students[uid];
      console.log("🔍 UID:", uid, student);

      const willTakeBus = extractValue(student.willTakeBus);
      const lat = extractValue(student.lat);
      const lng = extractValue(student.lng);

      if (willTakeBus && typeof lat === "number" && typeof lng === "number") {
        console.log("✅ Added:", student.name);
        const latlng = L.latLng(lat, lng);
        L.marker(latlng)
          .addTo(map)
          .bindPopup(`<b>${student.name}</b><br>${student.email || ""}`);
        waypoints.push(latlng);
      }
    }

    console.log("📍 Total students added to map:", waypoints.length);

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
      alert("🚫 No students selected YES to take the bus.");
    }
  })
  .catch((err) => {
    console.error("🔥 Firebase error:", err);
    alert("Failed to load student data.");
  });
