import { db } from "./firebase";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  deleteField,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { publicProfile } from "./userLookup";

// Trips live at plans/{planId}:
// {
//   name, destination, travelDate, returnDate, activities: [event, ...],
//   ownerId,                      // who created it (only they can delete it)
//   memberIds: [uid, ...],        // everyone who can see/edit it
//   members: { [uid]: { uid, email, displayName, photoURL } },
//   inviteCode,                   // secret part of the share link
//   createdAt,
// }
// See /firestore.rules for who may read and change what.

const planRef = (planId) => doc(db, "plans", String(planId));

// Firestore rejects `undefined` values, so drop them (e.g. optional event fields)
const clean = (value) => JSON.parse(JSON.stringify(value));

const randomCode = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
};

// Calls onChange with every trip the user is a member of, oldest first
export function watchPlans(uid, onChange, onError) {
  const plansQuery = query(
    collection(db, "plans"),
    where("memberIds", "array-contains", uid)
  );
  return onSnapshot(
    plansQuery,
    (snapshot) => {
      const plans = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      // pending serverTimestamps are null locally; treat them as newest
      const time = (p) => p.createdAt?.toMillis?.() ?? Number.MAX_SAFE_INTEGER;
      onChange(plans.sort((a, b) => time(a) - time(b)));
    },
    onError
  );
}

export function createPlan(plan, user) {
  return addDoc(collection(db, "plans"), {
    name: plan.name,
    destination: plan.destination ?? "",
    travelDate: plan.travelDate ?? "",
    returnDate: plan.returnDate ?? "",
    activities: clean(plan.activities ?? []),
    ownerId: user.uid,
    memberIds: [user.uid],
    members: { [user.uid]: publicProfile(user) },
    inviteCode: randomCode(),
    createdAt: serverTimestamp(),
  });
}

// Only trip details can be edited this way; membership has its own functions
export function updatePlanDetails(planId, details) {
  const allowed = ["name", "destination", "travelDate", "returnDate", "activities"];
  const fields = Object.fromEntries(
    allowed.filter((key) => key in details).map((key) => [key, details[key]])
  );
  return updateDoc(planRef(planId), clean(fields));
}

export function deletePlan(planId) {
  return deleteDoc(planRef(planId));
}

export function addActivity(planId, activity) {
  return updateDoc(planRef(planId), { activities: arrayUnion(clean(activity)) });
}

// profile: the other user's public profile (see findUserByEmail)
export function addMember(planId, profile) {
  return updateDoc(planRef(planId), {
    memberIds: arrayUnion(profile.uid),
    [`members.${profile.uid}`]: clean(profile),
  });
}

export function removeMember(planId, uid) {
  return updateDoc(planRef(planId), {
    memberIds: arrayRemove(uid),
    [`members.${uid}`]: deleteField(),
  });
}

// Join via a share link. The rules only allow a non-member to add
// themselves when the inviteCode they send matches the trip's.
export function joinPlan(planId, inviteCode, user) {
  return updateDoc(planRef(planId), {
    memberIds: arrayUnion(user.uid),
    [`members.${user.uid}`]: { ...clean(publicProfile(user)), inviteCode },
  });
}

export function inviteLink(plan) {
  return `${window.location.origin}/plans/join/${plan.id}?code=${plan.inviteCode}`;
}
