document
  .getElementById("register-form")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorMsg = document.getElementById("error-msg");

    // Clear old error
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

        // Get location
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            // Save to Realtime DB
            firebase
              .database()
              .ref("students/" + user.uid)
              .set({
                name: name,
                email: email,
                uid: user.uid,
                lat: lat,
                lng: lng,
                willTakeBus: null,
                timestamp: new Date().toISOString(),
              });

            // Redirect to login
            window.location.href = "login.html";
          },
          (error) => {
            console.error("Location error:", error);
            errorMsg.textContent =
              "Registration successful, but couldn't get location.";
          }
        );
      })
      .catch((error) => {
        console.error(error);
        errorMsg.textContent = error.message;
      });
  });
