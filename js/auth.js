// Sign up, log in, log out and watching who is signed in.
import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { auth, db } from "./firebase-init.js";

const messages = {
  "auth/email-already-in-use": "That email already has an account. Try logging in instead.",
  "auth/invalid-email": "That email address does not look right.",
  "auth/weak-password": "Please choose a password of at least 8 characters.",
  "auth/invalid-credential": "The email or password is incorrect.",
  "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
  "auth/network-request-failed": "No connection. Check your internet and try again.",
  "auth/operation-not-allowed": "Email sign-in is not switched on in the Firebase console yet.",
  "permission-denied": "Not allowed. Make sure you are logged in and the Firestore rules are published."
};
export const friendlyError = (err) => messages[err.code] || "Something went wrong. Please try again.";

export async function signUp({ name, email, password, language }) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  try {
    await setDoc(doc(db, "users", cred.user.uid), { name, language, role: "contributor", createdAt: serverTimestamp() });
  } catch (err) {
    console.warn("Account created, but the profile could not be saved. Check your Firestore rules.", err);
  }
  return cred.user;
}

export const logIn = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const logOut = () => signOut(auth);
export const onUser = (callback) => onAuthStateChanged(auth, callback);
