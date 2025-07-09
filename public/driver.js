// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Initialize Leaflet Map
const map = L.map("map").setView([13.0, 77.5], 7); // Initial zoom out to show South India
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

// Waypoints array
const waypoints = [];

firebase
  .database()
  .ref("students")
  .once("value")
  .then((snapshot) => {
    const students = snapshot.val();
    console.log("👨‍🎓 All students:", students); // Debug: all student data

    if (!students) {
      alert("No student data found.");
      return;
    }

    for (const uid in students) {
      const student = students[uid];
      console.log(
        "🔍 Checking student:",
        student.name,
        student.lat,
        student.lng
      );

      // Validate willTakeBus and coordinates
      if (
        student.willTakeBus === true &&
        typeof student.lat === "number" &&
        typeof student.lng === "number"
      ) {
        const latlng = L.latLng(student.lat, student.lng);
        console.log("✅ Adding student:", student.name, latlng);

        // Marker
        L.marker(latlng)
          .addTo(map)
          .bindPopup(`<b>${student.name}</b><br>${student.email || ""}`);

        // Add to route waypoints
        waypoints.push(latlng);
      } else {
        console.warn(
          "❌ Skipping:",
          student.name,
          "Invalid lat/lng or willTakeBus is false"
        );
      }
    }

    // Route if enough points
    if (waypoints.length >= 2) {
      console.log("🧭 Routing with points:", waypoints);
      L.Routing.control({
        waypoints: waypoints,
        router: L.Routing.osrmv1({
          serviceUrl: "https://router.project-osrm.org/route/v1",
        }),
        lineOptions: {
          styles: [{ color: "#007bff", weight: 5 }],
        },
        createMarker: () => null, // Prevent duplicate markers
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        show: false,
      }).addTo(map);
    } else if (waypoints.length === 1) {
      console.log("ℹ️ Only one student, centering map.");
      map.setView(waypoints[0], 14);
    } else {
      alert("🚫 No students selected YES to take the bus.");
    }
  })
  .catch((err) => {
    console.error("🔥 Firebase load error:", err);
    alert("Error loading student data.");
  });
