document
  .getElementById("register-form")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const lat = document.getElementById("lat").value;
    const lng = document.getElementById("lng").value;
    const errorMsg = document.getElementById("error-msg");

    errorMsg.textContent = "";

    if (!name || !email || !password || !lat || !lng) {
      errorMsg.textContent =
        "All fields and location confirmation are required.";
      return;
    }

    firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const user = userCredential.user;

        firebase
          .database()
          .ref("students/" + user.uid)
          .set({
            name: name,
            email: email,
            uid: user.uid,
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            willTakeBus: null,
            timestamp: new Date().toISOString(),
          });

        window.location.href = "login.html";
      })
      .catch((error) => {
        console.error(error);
        errorMsg.textContent = error.message;
      });
  });

let map, marker;

function getLocation() {
  const errorMsg = document.getElementById("error-msg");
  errorMsg.textContent = "";

  if (!navigator.geolocation) {
    errorMsg.textContent = "Geolocation is not supported by your browser.";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      // Show and initialize map
      const mapDiv = document.getElementById("map");
      mapDiv.style.display = "block";

      if (!map) {
        map = L.map("map").setView([lat, lng], 16);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
        }).addTo(map);

        marker = L.marker([lat, lng], { draggable: true }).addTo(map);

        marker.on("dragend", function (e) {
          const position = marker.getLatLng();
          document.getElementById("lat").value = position.lat;
          document.getElementById("lng").value = position.lng;
        });
      } else {
        map.setView([lat, lng], 16);
        marker.setLatLng([lat, lng]);
      }

      document.getElementById("lat").value = lat;
      document.getElementById("lng").value = lng;
    },
    (error) => {
      console.error(error);
      errorMsg.textContent = "Unable to fetch your location.";
    }
  );
}
