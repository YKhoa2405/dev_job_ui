import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; 

// Map
export const client_id_api = "SC93qLAKpYHvP5G5tz0hOwuXOznK3jTnyte3YpKe"
export const client_secret_api = "SvQzb8IX1MtX2wVfEUHGbrpjiK3H1CsYmqrgj32EMBu5fw9bAConICsLF6be9FRF7Dzd2fgAYnXJUoOBvuBqvKTXpY3TzNWVv3zTcZ9xfzvPEQtFXV1AHzuEqWhDmb9G"
export const azuze_map_primary_key_api = "FaqJhLIckgPjz6XjhcxZfxsRukcyNyZhHJzRZ8H3eMlo4sISPeilJQQJ99AIACYeBjF6AxJHAAAgAZMPFtxq"
export const clinet_id_google = "239735618406-cm48vh19b18p843uju9anq2jtsnha7ek.apps.googleusercontent.com"


export const api_key_gemini = "AIzaSyCJbQIrPPeWjdEXlNAZITcUfyWlWAOvp90";


// Firebase
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
