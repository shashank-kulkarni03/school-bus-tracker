firebase.auth().onAuthStateChanged(function (user) {
  if (!user) {
    window.location.href = "login.html"; // Redirect if not logged in
    return;
  }

  const studentId = user.uid;
  const studentNameEl = document.getElementById("student-name");
  const yesBtn = document.getElementById("yes");
  const noBtn = document.getElementById("no");
  const submitBtn = document.getElementById("submitBtn");
  const latInput = document.getElementById("lat");
  const lngInput = document.getElementById("lng");

  // 🧑 Fetch student name from Firebase
  firebase
    .database()
    .ref("students/" + studentId)
    .once("value")
    .then((snapshot) => {
      const data = snapshot.val();
      if (data && data.name) {
        studentNameEl.textContent = `Hello, ${data.name}!`;
      } else {
        studentNameEl.textContent = "Hello, Student!";
      }
    });

  let willTakeBus = null;

  yesBtn.addEventListener("click", () => {
    willTakeBus = true;
    yesBtn.classList.add("active");
    noBtn.classList.remove("active");
  });

  noBtn.addEventListener("click", () => {
    willTakeBus = false;
    noBtn.classList.add("active");
    yesBtn.classList.remove("active");
  });

  submitBtn.addEventListener("click", () => {
    if (willTakeBus === null) {
      alert("Please select YES or NO.");
      return;
    }

    const lat = parseFloat(latInput.value);
    const lng = parseFloat(lngInput.value);

    const now = new Date();
    const timestamp =
      now.toLocaleDateString("en-GB") + ", " + now.toLocaleTimeString("en-GB");

    firebase
      .database()
      .ref("students/" + studentId)
      .update({
        willTakeBus: willTakeBus,
        lat: isNaN(lat) ? null : lat,
        lng: isNaN(lng) ? null : lng,
        timestamp: timestamp,
      })
      .then(() => {
        alert("Response submitted!");
      })
      .catch((error) => {
        console.error("Submission error:", error);
        alert("Something went wrong. Try again.");
      });
  });

  // 📍 Get location
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        latInput.value = pos.coords.latitude;
        lngInput.value = pos.coords.longitude;
      },
      (err) => {
        console.warn("Location not allowed or failed.");
      }
    );
  }
});
