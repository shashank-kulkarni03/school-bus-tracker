let willTakeBus = null;

// Handle Yes/No button selection
document.getElementById("yes").onclick = () => {
  willTakeBus = true;
  highlightSelection("yes");
};
document.getElementById("no").onclick = () => {
  willTakeBus = false;
  highlightSelection("no");
};

function highlightSelection(selectedId) {
  document.getElementById("yes").style.opacity = selectedId === "yes" ? 1 : 0.5;
  document.getElementById("no").style.opacity = selectedId === "no" ? 1 : 0.5;
}

// Auto-detect location
window.onload = function () {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        document.getElementById("lat").value = pos.coords.latitude;
        document.getElementById("lng").value = pos.coords.longitude;
        console.log("📍 Location auto-detected.");
      },
      (err) => console.error("🚫 Location access denied.")
    );
  }
};

// Submit button logic
document.getElementById("submitBtn").onclick = () => {
  const now = new Date();

  // Accurate IST conversion using timeZone
  const formatter = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const [hourStr, minuteStr] = formatter.format(now).split(":");
  const hours = parseInt(hourStr, 10);
  const minutes = parseInt(minuteStr, 10);
  const totalMinutes = hours * 60 + minutes;

  console.log(`🕒 IST Time: ${hours}:${minutes} (${totalMinutes} mins)`);

  // Allow only between 4:30 PM (990) to 11:59 PM (1439)
  if (totalMinutes < 990 || totalMinutes > 1439) {
    alert("⛔ Submission allowed only between 4:30 PM and 11:59 PM IST.");
    return;
  }

  const lat = document.getElementById("lat").value;
  const lng = document.getElementById("lng").value;

  if (willTakeBus === null) {
    alert("⚠️ Please select YES or NO.");
    return;
  }

  const studentName =
    localStorage.getItem("studentName") ||
    prompt("Enter your name:").toLowerCase().trim();

  if (!studentName) {
    alert("⚠️ Name is required.");
    return;
  }

  const studentData = {
    name: studentName,
    lat: parseFloat(lat),
    lng: parseFloat(lng),
    willTakeBus,
    timestamp: getCurrentISTTimestamp(),
  };

  // Send data to Firebase
  firebase
    .database()
    .ref("students/" + studentName)
    .set(studentData)
    .then(() => {
      alert("✅ Your response has been submitted!");
      console.log("📤 Submitted Data:", studentData);
    })
    .catch((error) => {
      console.error("❌ Firebase error:", error);
      alert("Something went wrong. Please try again.");
    });
};

// Get formatted IST timestamp
function getCurrentISTTimestamp() {
  const now = new Date();
  const options = {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };
  return new Intl.DateTimeFormat("en-IN", options).format(now);
}
