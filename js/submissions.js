// Prices that signed-in users share, stored in the "submissions" collection in Firestore.
import {
  collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "./firebase-init.js";

export async function loadSubmissions() {
  const snapshot = await getDocs(query(collection(db, "submissions"), orderBy("createdAt", "desc")));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export const addSubmission = (data) => addDoc(collection(db, "submissions"), { ...data, createdAt: serverTimestamp() });
export const withdrawSubmission = (id) => deleteDoc(doc(db, "submissions", id));
