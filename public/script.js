// ✅ Firebase is already initialized in HTML

const studentNameEl = document.getElementById("student-name");
const yesBtn = document.getElementById("yes");
const noBtn = document.getElementById("no");
const submitBtn = document.getElementById("submitBtn");

let willTakeBus = null;
let lat = null;
let lng = null;

const user = firebase.auth().currentUser;
let studentEmail = null;
let studentName = null;

// Get location
navigator.geolocation.getCurrentPosition(
  (pos) => {
    lat = pos.coords.latitude;
    lng = pos.coords.longitude;
    document.getElementById("lat").value = lat;
    document.getElementById("lng").value = lng;
  },
  (err) => {
    alert("⚠️ Please allow location access.");
    console.error(err);
  }
);

// ✅ Button clicks
yesBtn.onclick = () => {
  willTakeBus = true;
  yesBtn.classList.add("selected");
  noBtn.classList.remove("selected");
};

noBtn.onclick = () => {
  willTakeBus = false;
  noBtn.classList.add("selected");
  yesBtn.classList.remove("selected");
};

submitBtn.onclick = async () => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();

  // ⛔ Restrict time window
  if (hours < 16 || (hours === 16 && minutes < 30)) {
    alert("⛔ You can submit only after 4:30 PM.");
    return;
  }
  if (hours === 0) {
    alert("⛔ Submissions closed after midnight.");
    return;
  }

  if (willTakeBus === null || lat === null || lng === null) {
    alert("⚠️ Please select YES or NO and allow location access.");
    return;
  }

  const user = firebase.auth().currentUser;
  if (!user) {
    alert("Please login first.");
    window.location.href = "login.html";
    return;
  }

  studentEmail = user.email;
  studentName = user.displayName || user.email.split("@")[0];

  const timestamp = new Date().toLocaleString("en-GB"); // DD/MM/YYYY, HH:mm:ss

  // ✅ Erase old data after 4:29 PM (only once per day)
  const todayKey = new Date().toISOString().split("T")[0]; // e.g., 2025-07-14
  const cleanupKey = `cleared_${todayKey}`;

  if (!localStorage.getItem(cleanupKey) && hours >= 16 && minutes >= 30) {
    await firebase.database().ref("students").remove();
    localStorage.setItem(cleanupKey, "true");
  }

  // ✅ Submit new data
  await firebase.database().ref("students").child(user.uid).set({
    name: studentName,
    email: studentEmail,
    lat,
    lng,
    willTakeBus,
    timestamp,
  });

  alert("✅ Your response has been recorded.");
};
