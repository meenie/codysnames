import firebase from "firebase/app";
import "firebase/auth";
import "firebase/analytics";
import "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA7Wgy8GRvyIxBnHS59WLaq3KCEIqUALk4",
  authDomain: "codysnames-game.firebaseapp.com",
  databaseURL: "https://codysnames-game.firebaseio.com",
  projectId: "codysnames-game",
  storageBucket: "codysnames-game.appspot.com",
  messagingSenderId: "596970333106",
  appId: "1:596970333106:web:42ae9bc40e8750d32afaab",
  measurementId: "G-VDK8GFNT0W",
};

firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth();
export const db = firebase.firestore();
export const analytics = firebase.analytics();
