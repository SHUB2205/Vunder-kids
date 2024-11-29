importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js");
importScripts(
  "https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js"
);

const firebaseConfig = {
    apiKey: "AIzaSyB3Gn_vAixpJerV-YMlm-LvSzZw1s2SvWc",
    authDomain: "vunder-kids-bb948.firebaseapp.com",
    projectId: "vunder-kids-bb948",
    storageBucket: "vunder-kids-bb948.appspot.com",
    messagingSenderId: "919090049445",
    appId: "1:919090049445:web:77e31d17f1b6badb4a384c",
    measurementId: "G-E2R670K03Y"
  };

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.image,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});