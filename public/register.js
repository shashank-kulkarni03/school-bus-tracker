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

document
  .getElementById("register-form")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const selectedRole = document.getElementById("role").value;
    const errorMsg = document.getElementById("error-msg");

    errorMsg.textContent = "";

    if (!name || !email || !password) {
      errorMsg.textContent = "All fields are required.";
      return;
    }

    firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const user = userCredential.user;

        // Save to role-wise DB path
        firebase.database().ref(`${selectedRole}s/${user.uid}`).set({
          uid: user.uid,
          name: name,
          email: email,
          role: selectedRole,
          lat: null,
          lng: null,
          timestamp: new Date().toISOString(),
        });

        // Redirect after registration
        window.location.href = "login.html";
      })
      .catch((error) => {
        console.error(error);
        errorMsg.textContent = error.message;
      });
  });
