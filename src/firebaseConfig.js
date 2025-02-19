import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBxof61iyCyCBlz7Lj_cDsFyzsRkOMcbyM",
  authDomain: "chess-d721a.firebaseapp.com",
  projectId: "chess-d721a",
  storageBucket: "chess-d721a.appspot.com",
  messagingSenderId: "1066329193954",
  appId: "1:1066329193954:web:be7e8c5b262a3bb4e44dbb",
  measurementId: "G-D99ZXY0CS5",
  databaseURL: "https://chess-d721a-default-rtdb.asia-southeast1.firebasedatabase.app/",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };
