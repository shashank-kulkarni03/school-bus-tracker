// Initialize the Leaflet map
const map = L.map("map").setView([20.5937, 78.9629], 5); // Default center on India

// Add OpenStreetMap tiles
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

// Store marker and routing references
let routingControl = null;

// Fetch data from Firebase
firebase
  .database()
  .ref("students")
  .on("value", (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    // Clear existing route
    if (routingControl) {
      map.removeControl(routingControl);
      routingControl = null;
    }

    // Remove existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    const waypoints = [];

    Object.values(data).forEach((student) => {
      if (student.willTakeBus) {
        const latlng = L.latLng(student.lat, student.lng);
        const marker = L.marker(latlng).addTo(map);
        marker.bindPopup(
          `<b>${student.name}</b><br>🟢 Will take the bus<br><small>${student.timestamp}</small>`
        );
        waypoints.push(latlng);
      }
    });

    if (waypoints.length >= 2) {
      routingControl = L.Routing.control({
        waypoints: waypoints,
        routeWhileDragging: false,
        draggableWaypoints: false,
        addWaypoints: false,
        createMarker: () => null, // Hide route markers
      }).addTo(map);
    }

    // Auto-fit map view to markers
    if (waypoints.length > 0) {
      const bounds = L.latLngBounds(waypoints);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  });
