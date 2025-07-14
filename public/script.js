firebase.auth().onAuthStateChanged(async function (user) {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const userId = user.uid;

  try {
    // Get name from users/uid/name
    const nameSnapshot = await firebase
      .database()
      .ref("users/" + userId + "/name")
      .once("value");
    const studentName = nameSnapshot.val() || "Student";
    document.getElementById(
      "student-name"
    ).textContent = `Hello, ${studentName}!`;

    // 🔄 Check if current time is after 4:29 PM and delete old data
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    if (currentHour > 16 || (currentHour === 16 && currentMinute >= 29)) {
      await firebase
        .database()
        .ref("students/" + userId)
        .remove();
    }
  } catch (error) {
    console.error("Error:", error);
    document.getElementById("student-name").textContent = "Hello, Student!";
  }
});

// ✅ Track YES/NO response
let willTakeBus = null;

document.getElementById("yes").addEventListener("click", () => {
  willTakeBus = true;
});
document.getElementById("no").addEventListener("click", () => {
  willTakeBus = false;
});

// ✅ On Submit
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
  const nameText = document
    .getElementById("student-name")
    .textContent.replace("Hello, ", "")
    .replace("!", "");

  firebase
    .database()
    .ref("students/" + user.uid)
    .set({
      email: user.email,
      name: nameText,
      willTakeBus: willTakeBus,
      lat: lat,
      lng: lng,
      timestamp: timestamp,
    })
    .then(() => {
      alert("✅ Response recorded successfully!");
    })
    .catch((err) => {
      console.error("Error saving data:", err);
      alert("Error saving your response.");
    });
});

// 📍 Detect and set location
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
  alert("Geolocation not supported on your device.");
}
