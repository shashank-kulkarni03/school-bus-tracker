if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const map = L.map("map").setView([13.0, 77.5], 8);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

const waypoints = [];

firebase
  .database()
  .ref("students")
  .once("value")
  .then((snapshot) => {
    const students = snapshot.val();
    console.log("📦 All student data:", students);

    if (!students) {
      alert("❌ No student data found.");
      return;
    }

    let count = 0;

    for (const uid in students) {
      const student = students[uid];
      console.log(`🔍 UID: ${uid}`, student);

      const valid =
        student &&
        student.willTakeBus === true &&
        typeof student.lat === "number" &&
        typeof student.lng === "number";

      if (valid) {
        const latlng = L.latLng(student.lat, student.lng);
        L.marker(latlng)
          .addTo(map)
          .bindPopup(`<b>${student.name}</b><br>${student.email || ""}`);
        waypoints.push(latlng);
        console.log(`✅ Added: ${student.name}`);
        count++;
      } else {
        console.warn(`⛔️ Skipped: ${student.name || uid}`, {
          willTakeBus: student.willTakeBus,
          lat: student.lat,
          lng: student.lng,
          typeofLat: typeof student.lat,
          typeofLng: typeof student.lng,
        });
      }
    }

    console.log(`📍 Total students added to map: ${count}`);

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
      alert("🚫 No eligible students found.");
    }
  })
  .catch((err) => {
    console.error("🔥 Firebase load error:", err);
    alert("Something went wrong while loading student data.");
  });
