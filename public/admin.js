document.addEventListener("DOMContentLoaded", function () {
  const calendarEl = document.getElementById("calendar");
  const selectedDateEl = document.getElementById("selected-date");
  const totalCountEl = document.getElementById("total-count");
  const studentListEl = document.getElementById("student-names");
  const detailLink = document.getElementById("detail-link");
  const studentListContainer = document.getElementById("student-list");

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    dateClick: function (info) {
      const selectedDate = info.dateStr; // Format: YYYY-MM-DD
      const dateObj = new Date(selectedDate);
      const formattedDate = dateObj
        .toLocaleDateString("en-GB")
        .replace(/\//g, "-"); // DD-MM-YYYY

      selectedDateEl.textContent = formattedDate;

      document
        .getElementById("status-container")
        .scrollIntoView({ behavior: "smooth" });

      firebase
        .database()
        .ref("students")
        .once("value", (snapshot) => {
          let count = 0;
          const names = [];

          snapshot.forEach((child) => {
            const data = child.val();
            const entryDate = data.timestamp?.split(",")[0] || "";

            if (entryDate === formattedDate) {
              if (data.willTakeBus) {
                count++;
                names.push(data.name);
              }
            }
          });

          totalCountEl.textContent = count;
          studentListEl.innerHTML = names
            .map((n, i) => `<li>${i + 1}. ${n}</li>`)
            .join("");
        });
    },
  });

  calendar.render();

  detailLink.addEventListener("click", () => {
    studentListContainer.style.display = "block";
    studentListContainer.scrollIntoView({ behavior: "smooth" });
  });
});

function printStudentTable() {
  window.print();
}
