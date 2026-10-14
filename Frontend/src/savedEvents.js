import { db, auth } from "./firebase";
import {
  doc,
  setDoc,
  deleteDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

// Saved events live at users/{uid}/savedEvents/{eventId}.
// Based on the save-events branch; ids are stringified because Firestore
// document ids must be strings, and savedAt lets us list newest first.

// Saves an event under the logged-in user's saved list
export async function saveEvent(event) {
  const user = auth.currentUser;
  if (!user) throw new Error("Must be logged in to save events");

  const eventRef = doc(db, "users", user.uid, "savedEvents", String(event.id));
  return setDoc(eventRef, { ...event, savedAt: serverTimestamp() });
}

// Removes an event from the logged-in user's saved list
export async function unsaveEvent(eventId) {
  const user = auth.currentUser;
  if (!user) throw new Error("Must be logged in to unsave events");

  const eventRef = doc(db, "users", user.uid, "savedEvents", String(eventId));
  return deleteDoc(eventRef);
}

// Calls onChange with the user's saved events (newest first) now and after
// every change, including ones made in other tabs or on other devices.
// Returns an unsubscribe function.
export function watchSavedEvents(uid, onChange, onError) {
  const savedQuery = query(
    collection(db, "users", uid, "savedEvents"),
    orderBy("savedAt", "desc")
  );
  return onSnapshot(
    savedQuery,
    (snapshot) =>
      onChange(
        snapshot.docs.map((d) => {
          // eslint-disable-next-line no-unused-vars
          const { savedAt, ...event } = d.data();
          return event;
        })
      ),
    onError
  );
}
