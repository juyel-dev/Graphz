// firebase-config.js
const firebaseConfig = {
  apiKey: "AIzaSyA84Ty4SNDuLMKzeHX1pJMUgjoFZ89nbRE",
  authDomain: "graphzlive.firebaseapp.com",
  projectId: "graphzlive",
  storageBucket: "graphzlive.firebasestorage.app",
  messagingSenderId: "521947472086",
  appId: "1:521947472086:web:b7795552c40bb58b0b2977",
  measurementId: "G-WBCGC9EMRX"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const db = firebase.firestore();
const auth = firebase.auth();
