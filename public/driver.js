// Initialize the Leaflet map
const map = L.map("map").setView([20.5937, 78.9629], 5); // Center on India

// Add OpenStreetMap tiles
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

// Store routing reference
let routingControl = null;

// Fetch student data from Firebase
firebase
  .database()
  .ref("students")
  .on("value", (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    // Remove existing routes
    if (routingControl) {
      map.removeControl(routingControl);
      routingControl = null;
    }

    // Remove old markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    const waypoints = [];

    for (const uid in data) {
      const student = data[uid];
      if (
        student.willTakeBus &&
        typeof student.lat === "number" &&
        typeof student.lng === "number"
      ) {
        const latlng = L.latLng(student.lat, student.lng);
        L.marker(latlng)
          .addTo(map)
          .bindPopup(
            `<b>${student.name}</b><br>${student.email || ""}<br><small>${
              student.timestamp
            }</small>`
          );
        waypoints.push(latlng);
      }
    }

    if (waypoints.length >= 2) {
      routingControl = L.Routing.control({
        waypoints: waypoints,
        routeWhileDragging: false,
        draggableWaypoints: false,
        addWaypoints: false,
        createMarker: () => null, // prevent extra markers
      }).addTo(map);
    } else if (waypoints.length === 1) {
      map.setView(waypoints[0], 14);
    }
  });
