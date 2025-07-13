if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const map = L.map("map").setView([20.5937, 78.9629], 5);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

let routingControl = null;

const now = new Date();
const currentHour = now.getHours();
const currentDateOnly = new Date(
  now.getFullYear(),
  now.getMonth(),
  now.getDate()
);

// Time window: After 6PM to next day before 4PM
const isAfter6PM = currentHour >= 18;
const isBefore4PMNextDay =
  currentHour < 16 || now.getDate() !== currentDateOnly.getDate();
const isValidWindow = isAfter6PM || isBefore4PMNextDay;

if (!isValidWindow) {
  alert(
    "⏳ Driver panel updates after 6:00 PM and is available till 4:00 PM next day."
  );
} else {
  firebase
    .database()
    .ref("students")
    .once("value")
    .then((snapshot) => {
      const data = snapshot.val();
      const waypoints = [];
      const sixPMYesterday = new Date();
      sixPMYesterday.setDate(now.getDate() - (now.getHours() < 18 ? 1 : 0)); // adjust if before 6PM
      sixPMYesterday.setHours(18, 0, 0, 0);

      console.log("📅 Current time:", now.toLocaleString());
      console.log(
        "⏰ Comparing with 6PM yesterday:",
        sixPMYesterday.toLocaleString()
      );

      for (const id in data) {
        const student = data[id];
        if (!student || !student.timestamp || !student.willTakeBus) continue;

        const [datePart, timePart] = student.timestamp.split(",");
        if (!datePart || !timePart) continue;

        const [day, month, year] = datePart.trim().split("/").map(Number);
        const [hour, minute, second] = timePart.trim().split(":").map(Number);
        const studentDate = new Date(
          year,
          month - 1,
          day,
          hour,
          minute,
          second
        );

        const name = student.name || "Unknown";
        const lat = parseFloat(student.lat);
        const lng = parseFloat(student.lng);

        console.log(`👤 Checking: ${name}`);
        console.log("   📍 Lat/Lng:", lat, lng);
        console.log(
          "   📆 Timestamp:",
          student.timestamp,
          "Parsed:",
          studentDate.toLocaleString()
        );
        console.log("   🚍 Will take bus:", student.willTakeBus);
        console.log("   ✅ Valid time?:", studentDate >= sixPMYesterday);

        if (studentDate >= sixPMYesterday && student.willTakeBus === true) {
          if (!isNaN(lat) && !isNaN(lng)) {
            L.marker([lat, lng]).addTo(map).bindPopup(`<b>${name}</b>`);
            waypoints.push(L.latLng(lat, lng));
          }
        }
      }

      if (waypoints.length >= 2) {
        routingControl = L.Routing.control({
          waypoints,
          routeWhileDragging: false,
          draggableWaypoints: false,
          addWaypoints: false,
          createMarker: () => null,
        }).addTo(map);
      } else if (waypoints.length === 1) {
        map.setView(waypoints[0], 14);
      } else {
        alert("⚠️ No valid student data to show.");
      }
    })
    .catch((err) => {
      console.error("🔥 Firebase error:", err);
      alert("Failed to load student data.");
    });
}
