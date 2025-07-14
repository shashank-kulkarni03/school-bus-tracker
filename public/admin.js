// ✅ admin.js – Secured access for Admin Panel

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    const adminEmail = "admin@example.com"; // 🔁 Replace with actual admin email

    if (user.email === adminEmail) {
      console.log("✅ Admin access granted");
      initCalendar();
    } else {
      alert("❌ Access denied! Only admin can access this page.");
      window.location.href = "login.html";
    }
  } else {
    alert("⚠️ Please login first.");
    window.location.href = "login.html";
  }
});

function initCalendar() {
  const calendarEl = document.getElementById("calendar");
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    dateClick: function (info) {
      const selectedDate = info.date;
      const dateStr = selectedDate.toLocaleDateString("en-GB");
      document.getElementById("selected-date").textContent = dateStr;
      fetchStudentData(dateStr);
    },
  });
  calendar.render();
}

function fetchStudentData(selectedDateStr) {
  firebase
    .database()
    .ref("students")
    .once("value")
    .then((snapshot) => {
      const students = snapshot.val();
      const tbody = document.getElementById("student-table-body");
      tbody.innerHTML = "";

      let count = 0;
      let siNo = 1;

      for (const id in students) {
        const s = students[id];
        if (!s || !s.timestamp || !s.willTakeBus) continue;

        const [dateStr] = s.timestamp.split(",");
        if (dateStr.trim() === selectedDateStr) {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${siNo++}</td>
            <td>${s.name || "-"}</td>
            <td>${s.email || "-"}</td>
            <td>${s.timestamp}</td>
          `;
          tbody.appendChild(row);
          count++;
        }
      }

      document.getElementById("total-count").textContent = count;
      document.getElementById("student-list").style.display = "block";
    });
}

// 📄 Toggle student list
const detailLink = document.getElementById("detail-link");
detailLink.addEventListener("click", () => {
  const list = document.getElementById("student-list");
  list.style.display = list.style.display === "block" ? "none" : "block";
});
