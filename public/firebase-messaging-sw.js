/* eslint-disable no-undef */
importScripts("https://www.gstatic.com/firebasejs/11.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.0.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyB6Gq__ZaBHw-Gn2eyLOmAFFtdrvZsm0-s",
  authDomain: "pwadata-c90ba.firebaseapp.com",
  projectId: "pwadata-c90ba",
  messagingSenderId: "305912859581",
  appId:"1:305912859581:web:35a34d900118d3df4e20d4",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Mensaje recibido en background:", payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/icons/Icon256x256.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
