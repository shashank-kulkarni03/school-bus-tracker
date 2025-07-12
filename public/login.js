// Handle role selection
document.querySelectorAll(".role-option").forEach((btn) => {
  btn.addEventListener("click", function () {
    document
      .querySelectorAll(".role-option")
      .forEach((el) => el.classList.remove("selected"));
    this.classList.add("selected");
    document.getElementById("role").value = this.getAttribute("data-role");
  });
});

document.getElementById("login-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const selectedRole = document.getElementById("role").value;
  const errorMsg = document.getElementById("error-msg");
  errorMsg.textContent = "";

  if (!email || !password) {
    errorMsg.textContent = "Email and password are required.";
    return;
  }

  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const uid = userCredential.user.uid;

      firebase
        .database()
        .ref(`${selectedRole}s/${uid}`)
        .once("value")
        .then((snapshot) => {
          if (snapshot.exists()) {
            // Redirect based on role
            if (selectedRole === "student")
              window.location.href = "student.html";
            else if (selectedRole === "admin")
              window.location.href = "admin.html";
            else if (selectedRole === "driver")
              window.location.href = "driver.html";
          } else {
            firebase.auth().signOut();
            errorMsg.textContent = `You are not registered as a ${selectedRole}.`;
          }
        });
    })
    .catch((error) => {
      console.error(error);
      errorMsg.textContent = error.message;
    });
});
