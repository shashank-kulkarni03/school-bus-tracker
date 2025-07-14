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

    // ⏰ Clear today's old data after 4:29 PM
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();

    if (hour > 16 || (hour === 16 && minute >= 29)) {
      await firebase
        .database()
        .ref("students/" + userId)
        .remove();
    }
  } catch (error) {
    console.error("Error getting name:", error);
    document.getElementById("student-name").textContent = "Hello, Student!";
  }
});

// YES/NO handling
let willTakeBus = null;

document.getElementById("yes").addEventListener("click", () => {
  willTakeBus = true;
});
document.getElementById("no").addEventListener("click", () => {
  willTakeBus = false;
});

// Submit
document.getElementById("submitBtn").addEventListener("click", async () => {
  const user = firebase.auth().currentUser;
  if (!user) return;

  if (willTakeBus === null) {
    alert("Please select YES or NO.");
    return;
  }

  try {
    // 🔁 Get full name from users table
    const nameSnapshot = await firebase
      .database()
      .ref("users/" + user.uid + "/name")
      .once("value");

    const studentName = nameSnapshot.val() || "Student";

    // 🕒 Final timestamp fix
    const timestamp = new Date().toLocaleString("en-GB");

    const studentData = {
      name: studentName,
      email: user.email,
      timestamp: timestamp,
      willTakeBus: willTakeBus,
    };

    // ✅ Save to students/{uid}
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
