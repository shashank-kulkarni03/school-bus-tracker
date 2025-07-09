// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Leaflet Map Setup
const map = L.map("map").setView([12.9716, 77.5946], 13);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

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

      // Check for valid lat/lng and if they want to take bus
      if (
        student.willTakeBus === true &&
        typeof student.lat === "number" &&
        typeof student.lng === "number"
      ) {
        const latlng = L.latLng(student.lat, student.lng);

        // Add marker for student
        L.marker(latlng)
          .addTo(map)
          .bindPopup(`<b>${student.name}</b><br>${student.email || ""}`);

        // Add to route
        waypoints.push(latlng);
      }
    }

    // Draw route if 2+ students
    if (waypoints.length >= 2) {
      L.Routing.control({
        waypoints: waypoints,
        router: L.Routing.osrmv1({
          serviceUrl: "https://router.project-osrm.org/route/v1",
        }),
        lineOptions: {
          styles: [{ color: "#007bff", weight: 5 }],
        },
        createMarker: () => null,
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
