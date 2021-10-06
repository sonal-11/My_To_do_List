import firebase from "firebase";

// Put Your firebase project config details below ...
const firebaseApp = firebase.initializeApp({
  // apiKey: ,
  // authDomain: ,
  // projectId: ,
  // storageBucket: ,
  // messagingSenderId: ,
  // appId: ,
  apiKey: "AIzaSyDsi88Jgb86G195gtvnLKYxJAjnFX6BT0M",
  authDomain: "to-list-ed56b.firebaseapp.com",
  projectId: "to-list-ed56b",
  storageBucket: "to-list-ed56b.appspot.com",
  messagingSenderId: "848466307324",
  appId: "1:848466307324:web:4336a8c17e30d6dc92cf79",
  measurementId: "G-PY0EEQTNDV"
});

// const db = firebaseApp.firestore();

// export default db;

const db = firebaseApp.firestore();
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();


export { db, auth, provider };
