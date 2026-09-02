// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB1Uy3pjKb1p3uKtqUVz-15mzhYwazhluw",
  authDomain: "nikeshoes-2374c.firebaseapp.com",
  projectId: "nikeshoes-2374c",
  storageBucket: "nikeshoes-2374c.firebasestorage.app",
  messagingSenderId: "191331156081",
  appId: "1:191331156081:web:c8d56717da5e4e10e05bd0",
  measurementId: "G-X2V7CHKM3T"
};




// Initialize Firebase
let app;
let analytics;

try {
  app = initializeApp(firebaseConfig);
  analytics = getAnalytics(app);

  // Expose app/analytics on window so classic (non-module) scripts like
  // js/main.js or js/shop.js can access them if needed
  window.firebaseApp = app;
  window.firebaseAnalytics = analytics;
  window.firebaseConnected = true;

  console.log("✅ Firebase connected successfully!", app.name);

  // Show notification once the DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      showFirebaseToast("Firebase is connected ✅");
    });
  } else {
    showFirebaseToast("Firebase is connected ✅");
  }
} catch (error) {
  console.error("❌ Firebase connection failed:", error);
  window.firebaseConnected = false;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      showFirebaseToast("Firebase connection failed", false);
    });
  } else {
    showFirebaseToast("Firebase connection failed", false);
  }
}

export { app, analytics };