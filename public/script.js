// ✅ Firebase Auth and Name Fetch
firebase.auth().onAuthStateChanged(async function (user) {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const userId = user.uid;

  try {
    // ✅ Fetch name from users/userId/name
    const nameSnapshot = await firebase
      .database()
      .ref("users/" + userId + "/name")
      .once("value");

    const studentName = nameSnapshot.val() || "Student";

    // ✅ Set name on page
    document.getElementById(
      "student-name"
    ).textContent = `Hello, ${studentName}!`;
  } catch (error) {
    console.error("Error fetching name:", error);
    document.getElementById("student-name").textContent = "Hello, Student!";
  }
});

// ✅ Track YES/NO selection
let willTakeBus = null;

document.getElementById("yes").addEventListener("click", () => {
  willTakeBus = true;
});

document.getElementById("no").addEventListener("click", () => {
  willTakeBus = false;
});

// ✅ Handle Submit
document.getElementById("submitBtn").addEventListener("click", async () => {
  const user = firebase.auth().currentUser;
  if (!user) return;

  if (willTakeBus === null) {
    alert("Please select YES or NO.");
    return;
  }

  try {
    // ✅ Fetch full name
    const nameSnapshot = await firebase
      .database()
      .ref("users/" + user.uid + "/name")
      .once("value");

    const studentName = nameSnapshot.val() || "Student";

    // ✅ Format timestamp in en-GB (DD/MM/YYYY, HH:mm:ss)
    const timestamp = new Date().toLocaleString("en-GB", {
      timeZone: "Asia/Kolkata",
    });

    // ✅ Final data
    const studentData = {
      name: studentName,
      email: user.email,
      timestamp: timestamp,
      willTakeBus: willTakeBus,
    };

    // ✅ Save to database
    await firebase
      .database()
      .ref("students/" + user.uid)
      .set(studentData);

    alert("✅ Response recorded successfully!");
  } catch (error) {
    console.error("Error saving response:", error);
    alert("Error saving your response.");
  }
});
