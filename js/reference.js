// Official reference prices (for example from PPRA). Only moderators can add, replace or remove them.
import { collection, getDocs, doc, setDoc, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "./firebase-init.js";
import { slug } from "./fair-price.js";

export async function loadReferences() {
  const snapshot = await getDocs(collection(db, "referencePrices"));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// The same item always gets the same id, so importing it again replaces the old price.
export const referenceId = (row) => `${row.category}_${slug(row.name)}`;

export function saveReferences(rows, currency, userId) {
  return Promise.all(rows.map((r) => setDoc(doc(db, "referencePrices", referenceId(r)), {
    category: r.category, name: r.name, low: r.low, high: r.high, currency, source: "PPRA", updatedBy: userId, updatedAt: serverTimestamp()
  })));
}

export const removeReference = (id) => deleteDoc(doc(db, "referencePrices", id));
