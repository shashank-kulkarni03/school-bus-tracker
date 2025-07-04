// Make sure Firebase is initialized
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

document
  .getElementById("register-form")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const username = document.getElementById("username")?.value?.trim();
    const password = document.getElementById("password")?.value?.trim();

    if (!username || !password) {
      document.getElementById("error-msg").textContent =
        "All fields are required.";
      return;
    }

    const sanitizedUsername = username.replace(/\./g, "_"); // Firebase keys can't contain "."

    firebase
      .database()
      .ref("users/" + sanitizedUsername)
      .set({ password })
      .then(() => {
        alert("✅ Registration successful!");
        window.location.href = "login.html";
      })
      .catch((error) => {
        console.error("❌ Error saving user:", error);
        document.getElementById("error-msg").textContent =
          "Registration failed.";
      });
  });
