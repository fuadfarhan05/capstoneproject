import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

// userLookup/{lowercased email} -> { uid, email, displayName, photoURL }
// Lets people add each other to trips by email. The security rules only
// allow fetching one entry by exact email (no listing), so nobody can
// browse every user's address.

const lookupRef = (email) =>
  doc(db, "userLookup", email.trim().toLowerCase());

// The bits of a user other trip members get to see
export function publicProfile(user) {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName ?? null,
    photoURL: user.photoURL ?? null,
  };
}

// Create/refresh the signed-in user's own lookup entry
export function syncUserLookup(user) {
  if (!user?.email) return Promise.resolve();
  return setDoc(lookupRef(user.email), publicProfile(user), { merge: true });
}

// Returns the public profile for an email, or null if nobody has it
export async function findUserByEmail(email) {
  const snapshot = await getDoc(lookupRef(email));
  return snapshot.exists() ? snapshot.data() : null;
}
