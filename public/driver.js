// Initialize Firebase if not already
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Leaflet map setup
const map = L.map("map").setView([20.5937, 78.9629], 5); // India center
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

// Routing setup
let routingControl = null;

// Utility function
function getValue(val) {
  if (!val) return null;
  if (typeof val === "object" && "Value" in val) return val.Value;
  return val;
}

// Parse timestamp and return Date object
function parseDate(timestamp) {
  if (!timestamp) return null;
  const [dateStr] = timestamp.split(",");
  return new Date(dateStr.split("/").reverse().join("-")); // DD/MM/YYYY → YYYY-MM-DD
}

// Get date reference based on time
function getValidDateReference() {
  const now = new Date();
  const currentHour = now.getHours();

  // If time is after 6:00 PM, return today
  if (currentHour >= 18) {
    return now.toLocaleDateString("en-IN"); // DD/MM/YYYY
  }

  // If time is before or at 4:00 PM, return yesterday
  if (currentHour < 16) {
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    return yesterday.toLocaleDateString("en-IN");
  }

  return null; // Outside allowed window
}

const validDate = getValidDateReference();
if (!validDate) {
  alert(
    "⚠️ Driver panel is accessible only between 6:00 PM and next day 4:00 PM."
  );
  throw new Error("Driver panel access time invalid.");
}

// Fetch data from Firebase
firebase
  .database()
  .ref("students")
  .once("value")
  .then((snapshot) => {
    const students = snapshot.val();
    if (!students) {
      alert("⚠️ No student data found.");
      return;
    }

    const waypoints = [];

    for (const uid in students) {
      const student = students[uid];

      const name = getValue(student.name);
      const email = getValue(student.email);
      const lat = parseFloat(getValue(student.lat));
      const lng = parseFloat(getValue(student.lng));
      const willTakeBus = getValue(student.willTakeBus);
      const timestamp = getValue(student.timestamp);

      if (!lat || !lng || !timestamp || !willTakeBus) continue;

      const [dateStr] = timestamp.split(",");
      const formattedDate = dateStr.trim();

      if (formattedDate === validDate) {
        const latlng = L.latLng(lat, lng);
        waypoints.push(latlng);

        // Add marker
        L.marker(latlng)
          .addTo(map)
          .bindPopup(`<b>${name}</b><br>${email || ""}`);
      }
    }

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
      alert("⚠️ No valid student data to show.");
    }
  })
  .catch((err) => {
    console.error("🔥 Firebase error:", err);
    alert("Failed to load student data.");
  });
