const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

// ✅ Scheduled function to reset students data daily at 5:00 PM IST
exports.resetStudentsAt5PM = functions.pubsub
  .schedule("every day 11:30") // 11:30 UTC = 5:00 PM IST
  .timeZone("Asia/Kolkata")
  .onRun((context) => {
    console.log("⏰ Resetting student data at 5 PM IST...");

    return admin
      .database()
      .ref("students")
      .remove()
      .then(() => {
        console.log("✅ Students data cleared.");
        return null;
      })
      .catch((error) => {
        console.error("❌ Failed to clear students:", error);
      });
  });
