if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const map = L.map("map").setView([13.1535, 77.614], 12); // Sir MVIT

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

let routingControl = null;
const schoolLatLng = L.latLng(13.1535, 77.614);
let driverMarker = null;

// 2-opt optimization function
function twoOpt(route) {
  const distance = (a, b) => a.distanceTo(b);
  let improved = true;

  while (improved) {
    improved = false;
    for (let i = 1; i < route.length - 2; i++) {
      for (let j = i + 1; j < route.length - 1; j++) {
        const newRoute = [...route];
        newRoute.splice(i, j - i + 1, ...route.slice(i, j + 1).reverse());
        const oldDist =
          distance(route[i - 1], route[i]) + distance(route[j], route[j + 1]);
        const newDist =
          distance(newRoute[i - 1], newRoute[i]) +
          distance(newRoute[j], newRoute[j + 1]);
        if (newDist < oldDist) {
          route = newRoute;
          improved = true;
        }
      }
    }
  }
  return route;
}

// Load students and draw route
function loadStudentRoute() {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  const accessAllowed = currentHour >= 18 || currentHour < 16;

  if (!accessAllowed) {
    alert("⏳ Driver panel opens after 6 PM and remains till next day 4 PM.");
    return;
  }

  firebase
    .database()
    .ref("students")
    .once("value")
    .then((snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      if (routingControl) map.removeControl(routingControl);

      const waypoints = [];
      const sixPMYesterday = new Date();
      if (currentHour < 18)
        sixPMYesterday.setDate(sixPMYesterday.getDate() - 1);
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

        if (studentDate >= sixPMYesterday) {
          const lat = parseFloat(student.lat);
          const lng = parseFloat(student.lng);
          const name = student.name || "Unknown";

          if (!isNaN(lat) && !isNaN(lng)) {
            L.marker([lat, lng]).addTo(map).bindPopup(`<b>${name}</b>`);
            waypoints.push(L.latLng(lat, lng));
          }
        }
      }

      if (waypoints.length === 0) {
        alert("⚠️ No valid student data to show.");
        return;
      }

      // Add school at start and end, then optimize
      let routePoints = [schoolLatLng, ...waypoints, schoolLatLng];
      routePoints = twoOpt(routePoints);

      routingControl = L.Routing.control({
        waypoints: routePoints,
        routeWhileDragging: false,
        draggableWaypoints: false,
        addWaypoints: false,
        createMarker: () => null,
      }).addTo(map);
    })
    .catch((err) => {
      console.error("🔥 Firebase error:", err);
      alert("Failed to load student data.");
    });
}

// Live driver GPS tracking
function trackDriverLive() {
  if (!navigator.geolocation) {
    console.warn("❌ Geolocation not supported");
    return;
  }

  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;

      if (driverMarker) {
        driverMarker.setLatLng([latitude, longitude]);
      } else {
        driverMarker = L.circleMarker([latitude, longitude], {
          radius: 8,
          color: "#007bff",
          fillColor: "#007bff",
          fillOpacity: 0.8,
        })
          .addTo(map)
          .bindPopup("📍 Driver's Current Location");
      }
    },
    (err) => {
      console.error("Geolocation error:", err);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 3000,
      timeout: 5000,
    }
  );
}

// Initial load
loadStudentRoute();
trackDriverLive();

// Refresh every 4 seconds
setInterval(() => {
  loadStudentRoute();
}, 4000);
