import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; 
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDhfhyLNRXwps364gLOW0eR_v1rUmoMTR8",
  authDomain: "heyjob-4bde9.firebaseapp.com",
  projectId: "heyjob-4bde9",
  storageBucket: "heyjob-4bde9.appspot.com",
  messagingSenderId: "103107320213",
  appId: "1:103107320213:web:37d755dddbf7382ada7e9c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const storeDb = getFirestore(app)
const storage = getStorage(app); 

export { storeDb, storage}


