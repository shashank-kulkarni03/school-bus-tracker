if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

document.getElementById("login-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const email = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      localStorage.setItem("studentEmail", user.email);
      window.location.href = "index.html";
    })
    .catch((error) => {
      console.error("Login error:", error);
      document.getElementById("error-msg").textContent = "❌ " + error.message;
    });
});
