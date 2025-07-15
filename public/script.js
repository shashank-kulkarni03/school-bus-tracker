// ✅ Firebase Auth and Name Fetch
firebase.auth().onAuthStateChanged(async function (user) {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const userId = user.uid;

  try {
    const nameSnapshot = await firebase
      .database()
      .ref("users/" + userId + "/name")
      .once("value");

    const studentName = nameSnapshot.val() || "Student";
    document.getElementById(
      "student-name"
    ).textContent = `Hello, ${studentName}!`;
  } catch (error) {
    console.error("Error fetching name:", error);
    document.getElementById("student-name").textContent = "Hello, Student!";
  }
});

// ✅ YES/NO Selection
let willTakeBus = null;
document.getElementById("yes").addEventListener("click", () => {
  willTakeBus = true;
});
document.getElementById("no").addEventListener("click", () => {
  willTakeBus = false;
});

// ✅ Handle Submit with time check and location
document.getElementById("submitBtn").addEventListener("click", async () => {
  const user = firebase.auth().currentUser;
  if (!user) return;

  if (willTakeBus === null) {
    alert("Please select YES or NO.");
    return;
  }

  // 🕟 Validate time: Only between 4:30 PM and 12:00 AM
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();

  const after430 = hours > 16 || (hours === 16 && minutes >= 30);
  const beforeMidnight = hours < 24;

  if (!(after430 && beforeMidnight)) {
    alert("❌ Submission allowed only between 4:30 PM and 12:00 AM.");
    return;
  }

  // 🌍 Try to get geolocation
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      try {
        const nameSnapshot = await firebase
          .database()
          .ref("users/" + user.uid + "/name")
          .once("value");

        const studentName = nameSnapshot.val() || "Student";
        const timestamp = new Date().toLocaleString("en-GB", {
          timeZone: "Asia/Kolkata",
        });

        const studentData = {
          name: studentName,
          email: user.email,
          timestamp: timestamp,
          willTakeBus: willTakeBus,
          lat: lat,
          lng: lng,
        };

        await firebase
          .database()
          .ref("students/" + user.uid)
          .set(studentData);
        alert("✅ Response with location saved successfully!");
      } catch (error) {
        console.error("Error saving response:", error);
        alert("Error saving your response.");
      }
    },
    (error) => {
      alert("❌ Location access denied. Please enable GPS and try again.");
    }
  );
});
