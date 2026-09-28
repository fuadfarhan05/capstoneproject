import { db, auth } from "./firebase";
import {
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  collection,
} from "firebase/firestore";

// Saves an event under the logged-in user's saved list
export function saveEvent(event) {
  const user = auth.currentUser;
  if (!user) throw new Error("Must be logged in to save events");

  const eventRef = doc(db, "users", user.uid, "savedEvents", event.id);
  return setDoc(eventRef, event);
}

// Removes an event from the logged-in user's saved list
export function unsaveEvent(eventId) {
  const user = auth.currentUser;
  if (!user) throw new Error("Must be logged in to unsave events");

  const eventRef = doc(db, "users", user.uid, "savedEvents", eventId);
  return deleteDoc(eventRef);
}

// Gets all saved events for the logged-in user
export async function getSavedEvents() {
  const user = auth.currentUser;
  if (!user) return [];

  const savedRef = collection(db, "users", user.uid, "savedEvents");
  const snapshot = await getDocs(savedRef);
  return snapshot.docs.map((doc) => doc.data());
}