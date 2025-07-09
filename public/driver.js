// Initialize map
const map = L.map("map").setView([13.1, 77.6], 13); // Default center

// Add OpenStreetMap tiles
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

let routingControl = null;

firebase
  .database()
  .ref("students")
  .on("value", (snapshot) => {
    const students = snapshot.val();
    if (!students) return;

    // Clear old routes and markers
    if (routingControl) {
      map.removeControl(routingControl);
      routingControl = null;
    }

    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    const waypoints = [];

    for (const uid in students) {
      const student = students[uid];

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
        console.log(`✅ Added: ${student.name}`);
      } else {
        console.log(`⛔ Skipping student: ${student.name}`);
      }
    }

    console.log("📍 Total students added to map:", waypoints.length);

    if (waypoints.length >= 2) {
      routingControl = L.Routing.control({
        waypoints: waypoints,
        routeWhileDragging: false,
        createMarker: () => null,
        addWaypoints: false,
        draggableWaypoints: false,
      }).addTo(map);
    } else if (waypoints.length === 1) {
      map.setView(waypoints[0], 14);
    }
  });
