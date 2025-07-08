// Initialize Firebase if not already initialized
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Initialize the Leaflet map
const map = L.map("map").setView([12.9716, 77.5946], 13); // Default center

// Add tile layer (OpenStreetMap)
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

// Load students from Firebase and show markers
firebase
  .database()
  .ref("students")
  .once("value")
  .then((snapshot) => {
    const students = snapshot.val();

    if (!students) {
      alert("❌ No students found in database.");
      return;
    }

    let bounds = [];

    for (const uid in students) {
      const student = students[uid];

      if (
        student.willTakeBus === true &&
        typeof student.lat === "number" &&
        typeof student.lng === "number"
      ) {
        const marker = L.marker([student.lat, student.lng])
          .addTo(map)
          .bindPopup(`<b>${student.name}</b><br>${student.email || ""}`);

        bounds.push([student.lat, student.lng]);
      }
    }

    // Adjust map to fit all markers
    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [30, 30] });
    } else {
      alert("🚫 No students selected 'YES' to take the bus.");
    }
  })
  .catch((err) => {
    console.error("🔥 Firebase error:", err);
    alert("Failed to load student data.");
  });
