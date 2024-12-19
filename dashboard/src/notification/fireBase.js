import { initializeApp } from "firebase/app";
import { getMessaging, isSupported } from "firebase/messaging";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB3Gn_vAixpJerV-YMlm-LvSzZw1s2SvWc",
  authDomain: "vunder-kids-bb948.firebaseapp.com",
  projectId: "vunder-kids-bb948",
  storageBucket: "vunder-kids-bb948.appspot.com",
  messagingSenderId: "919090049445",
  appId: "1:919090049445:web:77e31d17f1b6badb4a384c",
  measurementId: "G-E2R670K03Y"
};

// Initialize Firebase app
export const app = initializeApp(firebaseConfig);

// Check if Firebase Messaging is supported
export let messaging = null;

(async () => {
  const supported = await isSupported();
  if (supported) {
    messaging = getMessaging(app);
    console.log("Firebase Messaging is initialized.");
  } else {
    console.warn("Firebase Messaging is not supported in this browser.");
  }
})();
