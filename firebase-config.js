// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB5QbFIxweRfq2WAfSiP8FZvVYtSgvzWW4",
  authDomain: "molly-bday-800fe.firebaseapp.com",
  projectId: "molly-bday-800fe",
  storageBucket: "molly-bday-800fe.firebasestorage.app",
  messagingSenderId: "379540340385",
  appId: "1:379540340385:web:a4dd1480b567f7bc843ae0"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();

