// Photos for price cards. Each photo is shrunk in the browser and stored as a small JPEG in Firestore.
import { collection, getDocs, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "./firebase-init.js";

export const imageKey = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export async function loadImages() {
  const snapshot = await getDocs(collection(db, "priceImages"));
  const images = {};
  snapshot.forEach((d) => { images[d.id] = d.data().dataUrl; });
  return images;
}

// Shrinks the photo to at most 600 px wide or tall, so it stays small (about 40 to 80 KB).
export async function compress(file, max = 600) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.7);
}

export function saveImage(key, name, dataUrl, uid) {
  return setDoc(doc(db, "priceImages", key), { dataUrl, name, uploadedBy: uid, updatedAt: serverTimestamp() });
}
