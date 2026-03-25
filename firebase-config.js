const firebaseConfig = {
  apiKey:            "AIzaSyDTOaiNMfB9bmBMynqokfy7rN9cAhb-Wn0",
  authDomain:        "jp2-memory-card.firebaseapp.com",
  projectId:         "jp2-memory-card",
  storageBucket:     "jp2-memory-card.firebasestorage.app",
  messagingSenderId: "482401637748",
  appId:             "1:482401637748:web:a7956d0dbaf91671c88821",
  measurementId:     "G-00XKS1F4CR"
};

firebase.initializeApp(firebaseConfig);
window.db = firebase.firestore();
