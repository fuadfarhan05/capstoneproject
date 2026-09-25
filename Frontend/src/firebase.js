import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD4xJkI3me08K0C-i2rbzYvPly-H3-aAa0",
  authDomain: "capstoneproject-e9ff3.firebaseapp.com",
  projectId: "capstoneproject-e9ff3",
  storageBucket: "capstoneproject-e9ff3.firebasestorage.app",
  messagingSenderId: "875436932875",
  appId: "1:875436932875:web:e42d1b3d722bcfad5dec0e",
  measurementId: "G-KT370Q4HGQ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);