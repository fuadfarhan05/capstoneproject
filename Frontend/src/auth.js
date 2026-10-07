import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";

// Sign up a new user
export function signUp(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}

// Log in an existing user
export function logIn(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

// Log out
export function logOut() {
  return signOut(auth);
}

// Track login state (use this to show/hide UI based on login status)
export function watchAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}