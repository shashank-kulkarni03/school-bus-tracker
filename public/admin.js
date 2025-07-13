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
      const selectedDate = info.dateStr;

      // Highlight the selected cell
      document
        .querySelectorAll(".fc-daygrid-day")
        .forEach((cell) => cell.classList.remove("selected-day"));
      info.dayEl.classList.add("selected-day");

      // Format to DD-MM-YYYY
      const [yyyy, mm, dd] = selectedDate.split("-");
      const formattedDate = `${dd}-${mm}-${yyyy}`;
      selectedDateEl.textContent = formattedDate;

      // Scroll to status container
      document
        .getElementById("status-container")
        .scrollIntoView({ behavior: "smooth" });

      // Fetch from Firebase
      firebase
        .database()
        .ref("students")
        .once("value", (snapshot) => {
          let count = 0;
          const names = [];

          snapshot.forEach((child) => {
            const data = child.val();
            const entryDate = data.timestamp?.split(",")[0] || "";

            // Compare in en-IN format
            const calendarDate = new Date(selectedDate).toLocaleDateString(
              "en-IN"
            );

            if (entryDate === calendarDate && data.willTakeBus) {
              count++;
              names.push(`${data.name} (${data.email || ""})`);
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

  // Show student list on clicking "Detail"
  detailLink.addEventListener("click", () => {
    studentListContainer.style.display = "block";
    studentListContainer.scrollIntoView({ behavior: "smooth" });
  });
});
