// Import the functions you need from the SDKs you need
//import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration/

// const firebaseConfig = {
//   apiKey: "AIzaSyDQPblcwF2QLWdXtM2Q8xdESzh4NOVSzP8",
//   authDomain: "school-bus-tracker-e6a1d.firebaseapp.com",
//   projectId: "school-bus-tracker-e6a1d",
//   storageBucket: "school-bus-tracker-e6a1d.firebasestorage.app",
//   messagingSenderId: "610506187838",
//   appId: "1:610506187838:web:c5e0988b8539d2baae9d6f",
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);

// firebase-config.js

const firebaseConfig = {
  apiKey: "AIzaSyDQPblcwF2QLWdXtM2Q8xdESzh4NOVSzP8",
  authDomain: "school-bus-tracker-e6a1d.firebaseapp.com",
  databaseURL:
    "https://school-bus-tracker-e6a1d-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "school-bus-tracker-e6a1d",
  storageBucket: "school-bus-tracker-e6a1d.firebasestorage.app",
  messagingSenderId: "610506187838",
  appId: "1:610506187838:web:c5e0988b8539d2baae9d6f",
};

// ✅ Use Firebase v8 syntax
firebase.initializeApp(firebaseConfig);
