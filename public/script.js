firebase.auth().onAuthStateChanged(async function (user) {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const userId = user.uid;

  try {
    // ✅ Get student full name from 'users/{uid}/name'
    const nameSnapshot = await firebase
      .database()
      .ref("users/" + userId + "/name")
      .once("value");

    const studentName = nameSnapshot.val() || "Student";
    document.getElementById(
      "student-name"
    ).textContent = `Hello, ${studentName}!`;

    // 🕒 Clear previous data after 4:29 PM
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

// ✅ YES/NO button selection
let willTakeBus = null;

document.getElementById("yes").addEventListener("click", () => {
  willTakeBus = true;
});
document.getElementById("no").addEventListener("click", () => {
  willTakeBus = false;
});

// ✅ Submit response
document.getElementById("submitBtn").addEventListener("click", async () => {
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

  try {
    const nameSnapshot = await firebase
      .database()
      .ref("users/" + user.uid + "/name")
      .once("value");

    const fullName = nameSnapshot.val() || "Student";
    const timestamp = new Date().toLocaleString("en-GB"); // ✅ Correct format

    const studentData = {
      name: fullName,
      email: user.email,
      lat: lat,
      lng: lng,
      timestamp: timestamp, // ✅ Correctly formatted timestamp
      willTakeBus: willTakeBus,
    };

    await firebase
      .database()
      .ref("students/" + user.uid)
      .set(studentData);

    alert("✅ Response recorded successfully!");
  } catch (error) {
    console.error("Error saving data:", error);
    alert("Error saving your response.");
  }
});

// 📍 Get location
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
