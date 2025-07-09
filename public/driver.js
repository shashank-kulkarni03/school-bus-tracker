// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Initialize Leaflet map
const map = L.map("map").setView([20.5937, 78.9629], 5); // India center

// Add OpenStreetMap tiles
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

// Remove existing markers
let routingControl = null;

// Helper to safely extract values like { Value: 13.1 }
function getValue(val) {
  if (val === null || val === undefined) return null;
  if (typeof val === "object" && "Value" in val) return val.Value;
  return val;
}

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

      console.log("🔍 Checking student:", name, lat, lng, willTakeBus);

      if (willTakeBus === true && !isNaN(lat) && !isNaN(lng)) {
        const latlng = L.latLng(lat, lng);
        waypoints.push(latlng);

        L.marker(latlng)
          .addTo(map)
          .bindPopup(`<b>${name}</b><br>${email || ""}`);
      }
    }

    console.log("📍 Total waypoints:", waypoints.length, waypoints);

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
      alert("No students selected YES to take the bus.");
    }
  })
  .catch((err) => {
    console.error("🔥 Firebase error:", err);
    alert("Failed to load student data.");
  });
