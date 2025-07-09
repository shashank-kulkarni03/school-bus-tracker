let willTakeBus = null;

// Highlight selected button
function highlightSelection(selectedId) {
  document.getElementById("yes").style.opacity = selectedId === "yes" ? 1 : 0.5;
  document.getElementById("no").style.opacity = selectedId === "no" ? 1 : 0.5;
}

// Handle YES/NO clicks
document.getElementById("yes").onclick = () => {
  willTakeBus = true;
  highlightSelection("yes");
};

document.getElementById("no").onclick = () => {
  willTakeBus = false;
  highlightSelection("no");
};

// On page load
window.onload = () => {
  firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    // Fetch student name for greeting
    firebase
      .database()
      .ref("students/" + user.uid)
      .once("value")
      .then((snapshot) => {
        const student = snapshot.val();
        if (student && student.name) {
          document.getElementById(
            "student-name"
          ).textContent = `Hello, ${student.name}!`;
        } else {
          document.getElementById("student-name").textContent =
            "Hello, student!";
        }
      });
  });

  // Get current geolocation
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition((position) => {
      document.getElementById("lat").value = position.coords.latitude;
      document.getElementById("lng").value = position.coords.longitude;
    });
  }
};

// Handle SUBMIT
document.getElementById("submitBtn").onclick = () => {
  const user = firebase.auth().currentUser;

  if (!user) {
    alert("User not logged in.");
    return;
  }

  if (willTakeBus === null) {
    alert("Please select YES or NO.");
    return;
  }

  const lat = parseFloat(document.getElementById("lat").value);
  const lng = parseFloat(document.getElementById("lng").value);

  // Validate time (IST: 4:30 PM to 11:59 PM)
  const now = new Date();
  const [hours, minutes] = new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
    hour12: false,
  })
    .format(now)
    .split(":")
    .map(Number);

  const totalMins = hours * 60 + minutes;
  if (totalMins < 990 || totalMins > 1439) {
    alert("⛔ Submission allowed only from 4:30 PM to 11:59 PM IST.");
    return;
  }

  // Fetch student info from DB
  firebase
    .database()
    .ref("students/" + user.uid)
    .once("value")
    .then((snapshot) => {
      const student = snapshot.val() || {}; // fallback to empty object

      const data = {
        name: student.name ?? "Unknown",
        email: student.email ?? "unknown@email.com",
        lat,
        lng,
        willTakeBus,
        timestamp: getCurrentIST(),
      };

      console.log("Submitting data to Firebase:", data);

      return firebase
        .database()
        .ref("students/" + user.uid)
        .update(data);
    })
    .then(() => {
      alert("✅ Your response has been submitted!");
    })
    .catch((err) => {
      console.error("❌ Firebase write error:", err);
      alert("❌ Failed to submit data. See console for details.");
    });
};

// Format timestamp in IST
function getCurrentIST() {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());
}
