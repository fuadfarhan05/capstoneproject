import { auth, storage } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

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

// Upload a profile picture to Storage and save its URL on the user's profile.
// Returns the new download URL.
export async function uploadProfilePicture(file) {
  const user = auth.currentUser;
  const pictureRef = ref(storage, `profilePictures/${user.uid}`);
  await uploadBytes(pictureRef, file, { contentType: file.type });
  const photoURL = await getDownloadURL(pictureRef);
  await updateProfile(user, { photoURL });
  return photoURL;
}