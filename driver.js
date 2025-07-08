// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Leaflet Map Setup
const map = L.map("map").setView([12.9716, 77.5946], 13);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

// ORS API Key (Temporary Dev Key)
const orsApiKey = "ORS_API_KEY";

// Collect all student waypoints
const waypoints = [];

// Load student data from Firebase
firebase
  .database()
  .ref("students")
  .once("value")
  .then((snapshot) => {
    const students = snapshot.val();
    if (!students) return;

    for (const uid in students) {
      const student = students[uid];

      // Check for valid data
      if (
        student.willTakeBus === true &&
        typeof student.lat === "number" &&
        typeof student.lng === "number"
      ) {
        const latlng = L.latLng(student.lat, student.lng);

        // Add marker
        L.marker(latlng)
          .addTo(map)
          .bindPopup(`<b>${student.name}</b><br>${student.email || ""}`);

        // Add to routing waypoints
        waypoints.push(latlng);
      }
    }

    // 🧭 Route only if 2+ points
    if (waypoints.length >= 2) {
      L.Routing.control({
        waypoints: waypoints,
        router: L.Routing.openrouteservice(orsApiKey), // ✅ OpenRouteService router
        lineOptions: {
          styles: [{ color: "#007bff", weight: 5 }],
        },
        createMarker: () => null, // Don't duplicate markers
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        show: false,
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
