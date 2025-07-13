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

// Time window logic
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
      const students = [];
      const sixPMYesterday = new Date();
      sixPMYesterday.setDate(now.getDate() - (now.getHours() < 18 ? 1 : 0));
      sixPMYesterday.setHours(18, 0, 0, 0);

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

        if (studentDate >= sixPMYesterday && student.willTakeBus === true) {
          const name = student.name || "Unknown";
          const lat = parseFloat(student.lat);
          const lng = parseFloat(student.lng);

          if (!isNaN(lat) && !isNaN(lng)) {
            students.push({ name, lat, lng });
          }
        }
      }

      if (students.length === 0) {
        alert("⚠️ No valid student data to show.");
        return;
      }

      // Optimize waypoints using Nearest Neighbor
      const optimized = nearestNeighbor(students);

      optimized.forEach((student) => {
        const marker = L.marker([student.lat, student.lng])
          .addTo(map)
          .bindPopup(`<b>${student.name}</b>`);
      });

      const waypoints = optimized.map((s) => L.latLng(s.lat, s.lng));

      if (waypoints.length >= 2) {
        routingControl = L.Routing.control({
          waypoints,
          routeWhileDragging: false,
          draggableWaypoints: false,
          addWaypoints: false,
          createMarker: () => null,
        }).addTo(map);
      } else {
        map.setView(waypoints[0], 14);
      }
    })
    .catch((err) => {
      console.error("🔥 Firebase error:", err);
      alert("Failed to load student data.");
    });
}

// 🔁 Nearest Neighbor Optimization
function nearestNeighbor(points) {
  const visited = new Array(points.length).fill(false);
  const result = [];

  let currentIndex = 0;
  result.push(points[currentIndex]);
  visited[currentIndex] = true;

  for (let i = 1; i < points.length; i++) {
    let nearestIndex = -1;
    let minDist = Infinity;

    for (let j = 0; j < points.length; j++) {
      if (!visited[j]) {
        const dist = distance(
          points[currentIndex].lat,
          points[currentIndex].lng,
          points[j].lat,
          points[j].lng
        );
        if (dist < minDist) {
          minDist = dist;
          nearestIndex = j;
        }
      }
    }

    if (nearestIndex !== -1) {
      visited[nearestIndex] = true;
      result.push(points[nearestIndex]);
      currentIndex = nearestIndex;
    }
  }

  return result;
}

// 📏 Distance between two lat/lng
function distance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg) {
  return (deg * Math.PI) / 180;
}
