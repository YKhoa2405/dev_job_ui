import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; 

const firebaseConfig = {
  apiKey: "AIzaSyDFRUrMi8QbQmzrUOEHCmbVwyqKVpveuV8",
  authDomain: "devjob-fe071.firebaseapp.com",
  projectId: "devjob-fe071",
  storageBucket: "devjob-fe071.firebasestorage.app",
  messagingSenderId: "1043747816081",
  appId: "1:1043747816081:web:3d45a59179f5f5eb8d7530"
};

const app = initializeApp(firebaseConfig);

const storeDb = getFirestore(app)

export { storeDb}
