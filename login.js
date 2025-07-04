document.getElementById("login-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const username = document
    .getElementById("username")
    .value.trim()
    .toLowerCase();
  const password = document.getElementById("password").value;

  firebase
    .database()
    .ref("users/" + username)
    .once("value")
    .then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        if (data.password === password) {
          localStorage.setItem("studentName", username);
          window.location.href = "index.html"; // Redirect after login
        } else {
          document.getElementById("error-msg").textContent =
            "❌ Incorrect password";
        }
      } else {
        document.getElementById("error-msg").textContent = "❌ User not found";
      }
    })
    .catch((error) => {
      console.error("Login error:", error);
      document.getElementById("error-msg").textContent = "❌ Login failed";
    });
});
