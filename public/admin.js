document.addEventListener("DOMContentLoaded", function () {
  const allowedAdminEmail = "adminanna@gmail.com";

  firebase.auth().onAuthStateChanged(function (user) {
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    if (user.email !== allowedAdminEmail) {
      firebase
        .auth()
        .signOut()
        .then(() => {
          window.location.href = "login.html";
        });
      return;
    }

    initAdminPanel(); // ✅ Authorized, show panel
  });

  function initAdminPanel() {
    const calendarEl = document.getElementById("calendar");
    const selectedDateEl = document.getElementById("selected-date");
    const totalCountEl = document.getElementById("total-count");
    const detailLink = document.getElementById("detail-link");
    const studentListContainer = document.getElementById("student-list");
    const studentTableBody = document.getElementById("student-table-body");

    const calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: "dayGridMonth",
      dateClick: function (info) {
        const selectedDate = info.dateStr;
        const dateObj = new Date(selectedDate);
        const formattedDate = dateObj
          .toLocaleDateString("en-GB")
          .split("/")
          .join("-");

        selectedDateEl.textContent = formattedDate;
        document
          .getElementById("status-container")
          .scrollIntoView({ behavior: "smooth" });

        firebase
          .database()
          .ref("students")
          .once("value")
          .then((snapshot) => {
            let count = 0;
            let si = 1;
            let rows = "";

            snapshot.forEach((child) => {
              const data = child.val();
              const entryDate = data.timestamp?.split(",")[0] || "";
              const entryDateFormatted = new Date(entryDate).toLocaleDateString(
                "en-GB"
              );

              if (
                entryDateFormatted === dateObj.toLocaleDateString("en-GB") &&
                data.willTakeBus
              ) {
                count++;
                rows += `<tr>
                <td>${si++}</td>
                <td>${data.name || "-"}</td>
                <td>${data.email || "-"}</td>
                <td>${data.timestamp || "-"}</td>
              </tr>`;
              }
            });

            totalCountEl.textContent = count;
            studentTableBody.innerHTML =
              rows || "<tr><td colspan='4'>No data</td></tr>";
          });
      },
    });

    calendar.render();

    detailLink.addEventListener("click", () => {
      studentListContainer.style.display = "block";
      studentListContainer.scrollIntoView({ behavior: "smooth" });
    });
  }
});
