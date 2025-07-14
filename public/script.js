firebase.auth().onAuthStateChanged(async function (user) {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const userId = user.uid;

  try {
    // Fetch full name from "users/{uid}/name"
    const nameSnapshot = await firebase
      .database()
      .ref("users/" + userId + "/name")
      .once("value");

    const fullName = nameSnapshot.val() || "Student";

    document.getElementById("student-name").textContent = `Hello ${fullName}!`;
    window.currentStudentName = fullName; // used in submit
  } catch (error) {
    console.error("Error fetching name:", error);
    document.getElementById("student-name").textContent = "Hello Student!";
    window.currentStudentName = "Student";
  }

  // Optional: Remove old data after 4:29 PM
  const now = new Date();
  const hr = now.getHours();
  const min = now.getMinutes();
  if (hr > 16 || (hr === 16 && min >= 29)) {
    await firebase
      .database()
      .ref("students/" + userId)
      .remove();
  }
});

// ✅ Track YES/NO
let willTakeBus = null;

document.getElementById("yes").addEventListener("click", () => {
  willTakeBus = true;
});
document.getElementById("no").addEventListener("click", () => {
  willTakeBus = false;
});

// ✅ Submit response
document.getElementById("submitBtn").addEventListener("click", () => {
  const user = firebase.auth().currentUser;
  if (!user) return;

  if (willTakeBus === null) {
    alert("Please select YES or NO.");
    return;
  }

  const lat = parseFloat(document.getElementById("lat").value);
  const lng = parseFloat(document.getElementById("lng").value);

  if (willTakeBus && (isNaN(lat) || isNaN(lng))) {
    alert("Please allow location access.");
    return;
  }

  const now = new Date();
  const timestamp = now.toLocaleString("en-GB"); // DD/MM/YYYY, HH:mm:ss
  const name = window.currentStudentName || "Student";

  firebase
    .database()
    .ref("students/" + user.uid)
    .set({
      email: user.email,
      lat: lat,
      lng: lng,
      name: name,
      timestamp: timestamp,
      willTakeBus: willTakeBus,
    })
    .then(() => {
      alert("✅ Response recorded successfully!");
    })
    .catch((err) => {
      console.error("Error saving data:", err);
      alert("Error saving your response.");
    });
});

// 📍 Get Location
if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      document.getElementById("lat").value = pos.coords.latitude;
      document.getElementById("lng").value = pos.coords.longitude;
    },
    (err) => console.error("Geolocation error:", err),
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    }
  );
} else {
  alert("Geolocation not supported.");
}
