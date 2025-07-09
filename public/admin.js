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
      selectedDateEl.textContent = selectedDate;

      // Scroll to status container
      document
        .getElementById("status-container")
        .scrollIntoView({ behavior: "smooth" });

      // Fetch and count students from Firebase
      firebase
        .database()
        .ref("students")
        .once("value", (snapshot) => {
          let count = 0;
          const names = [];

          snapshot.forEach((child) => {
            const data = child.val();
            const entryDate = data.timestamp?.split(",")[0] || "";

            if (
              entryDate === new Date(selectedDate).toLocaleDateString("en-IN")
            ) {
              if (data.willTakeBus) {
                count++;
                names.push(data.name);
              }
            }
          });

          totalCountEl.textContent = count;
          studentListEl.innerHTML = names.map((n) => `<li>${n}</li>`).join("");
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
