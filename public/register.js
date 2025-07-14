document.querySelectorAll(".role-option").forEach((btn) => {
  btn.addEventListener("click", function () {
    document
      .querySelectorAll(".role-option")
      .forEach((el) => el.classList.remove("selected"));
    this.classList.add("selected");
    const selectedRole = this.getAttribute("data-role");
    document.getElementById("role").value = selectedRole;

    const locBtn = document.getElementById("use-location-btn");
    const confirmBtn = document.getElementById("confirm-location-btn");
    const map = document.getElementById("map");

    if (selectedRole === "student") {
      locBtn.style.display = "block";
    } else {
      locBtn.style.display = "none";
      confirmBtn.style.display = "none";
      map.style.display = "none";
      document.getElementById("lat").value = "";
      document.getElementById("lng").value = "";
    }
  });
});

let leafletMap = null;
let marker = null;

document
  .getElementById("use-location-btn")
  .addEventListener("click", function () {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        const mapDiv = document.getElementById("map");
        mapDiv.style.display = "block";
        document.getElementById("confirm-location-btn").style.display =
          "inline-block";

        if (!leafletMap) {
          leafletMap = L.map("map").setView([lat, lng], 15);
          L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          ).addTo(leafletMap);
          leafletMap.on("click", function (e) {
            const { lat, lng } = e.latlng;
            marker.setLatLng([lat, lng]);
          });
        } else {
          leafletMap.setView([lat, lng], 15);
        }

        if (!marker) {
          marker = L.marker([lat, lng], { draggable: true }).addTo(leafletMap);
        } else {
          marker.setLatLng([lat, lng]);
        }

        alert("📍 Drag or click on map → then Confirm Location");
      },
      (err) => {
        console.error("Location error:", err);
        alert("❌ Failed to get location.");
      }
    );
  });

document
  .getElementById("confirm-location-btn")
  .addEventListener("click", function () {
    if (marker) {
      const confirmedLat = marker.getLatLng().lat;
      const confirmedLng = marker.getLatLng().lng;

      document.getElementById("lat").value = confirmedLat;
      document.getElementById("lng").value = confirmedLng;

      alert("✅ Location confirmed!");
    }
  });

document
  .getElementById("register-form")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const selectedRole = document.getElementById("role").value;
    const lat = document.getElementById("lat").value;
    const lng = document.getElementById("lng").value;
    const errorMsg = document.getElementById("error-msg");

    errorMsg.textContent = "";

    if (!name || !email || !password) {
      errorMsg.textContent = "All fields are required.";
      return;
    }

    if (selectedRole === "student" && (!lat || !lng)) {
      errorMsg.textContent = "Please confirm your location.";
      return;
    }

    firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const user = userCredential.user;

        const userData = {
          uid: user.uid,
          name,
          email,
          role: selectedRole,
          timestamp: new Date().toISOString(),
        };

        if (selectedRole === "student") {
          userData.lat = parseFloat(lat);
          userData.lng = parseFloat(lng);
          userData.willTakeBus = null;
        }

        const db = firebase.database();

        return Promise.all([
          db.ref(`${selectedRole}s/${user.uid}`).set(userData),
          db.ref(`users/${user.uid}`).set({ name: name }),
        ]);
      })
      .then(() => {
        alert("✅ Registered successfully! Redirecting to login...");
        window.location.href = "login.html";
      })
      .catch((error) => {
        console.error(error);
        errorMsg.textContent = error.message;
      });
  });
