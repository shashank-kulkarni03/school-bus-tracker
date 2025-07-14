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
        const selectedDate = new Date(info.dateStr);
        const formattedDate = selectedDate
          .toLocaleDateString("en-GB")
          .split("/")
          .join("-");
        selectedDateEl.textContent = formattedDate;

        document
          .getElementById("status-container")
          .scrollIntoView({ behavior: "smooth" });

        const sixPMYesterday = new Date(selectedDate);
        sixPMYesterday.setDate(sixPMYesterday.getDate() - 1);
        sixPMYesterday.setHours(18, 0, 0, 0);

        const fivePMToday = new Date(selectedDate);
        fivePMToday.setHours(17, 0, 0, 0);

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
              if (!data.timestamp || !data.willTakeBus) return;

              const [dateStr, timeStr] = data.timestamp.split(",");
              const [d, m, y] = dateStr.trim().split("/").map(Number);
              const [h, min, sec] = timeStr.trim().split(":").map(Number);
              const ts = new Date(y, m - 1, d, h, min, sec);

              if (ts >= sixPMYesterday && ts <= fivePMToday) {
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
