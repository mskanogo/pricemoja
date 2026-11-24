// Votes (confirm or dispute) and flags (spam or fraud) on shared prices.
// One document per person per price: the id is "<priceId>_<userId>", so nobody can vote or flag twice.
import { collection, getDocs, doc, setDoc, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "./firebase-init.js";

const readAll = async (name) => (await getDocs(collection(db, name))).docs.map((d) => d.data());

export const loadVotes = () => readAll("votes");
export const loadFlags = () => readAll("flags");

export const setVote = (submissionId, userId, value) =>
  setDoc(doc(db, "votes", `${submissionId}_${userId}`), { submissionId, userId, value, createdAt: serverTimestamp() });
export const clearVote = (submissionId, userId) => deleteDoc(doc(db, "votes", `${submissionId}_${userId}`));
export const addFlag = (submissionId, userId, reason) =>
  setDoc(doc(db, "flags", `${submissionId}_${userId}`), { submissionId, userId, reason, createdAt: serverTimestamp() });
export const removeFlag = (submissionId, userId) => deleteDoc(doc(db, "flags", `${submissionId}_${userId}`));
