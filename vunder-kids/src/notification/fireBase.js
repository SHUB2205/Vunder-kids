import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";
// import { getAnalytics } from "firebase/analytics";
const firebaseConfig = {
  apiKey: "AIzaSyB3Gn_vAixpJerV-YMlm-LvSzZw1s2SvWc",
  authDomain: "vunder-kids-bb948.firebaseapp.com",
  projectId: "vunder-kids-bb948",
  storageBucket: "vunder-kids-bb948.appspot.com",
  messagingSenderId: "919090049445",
  appId: "1:919090049445:web:77e31d17f1b6badb4a384c",
  measurementId: "G-E2R670K03Y"
};


export const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export const messaging = getMessaging(app);
