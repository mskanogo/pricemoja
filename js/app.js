// App start-up: page navigation, the prices page, sharing prices, and the sign-up / log-in page.
import { auth } from "./firebase-init.js";
import { signUp, logIn, logOut, onUser, friendlyError } from "./auth.js";
import { imageKey, loadImages, compress, saveImage } from "./images.js";
import { loadSubmissions, addSubmission, withdrawSubmission } from "./submissions.js";
import { samplePrices } from "./sample-prices.js";

/* ---------- Page navigation ---------- */
const views = [...document.querySelectorAll("[data-view]")];
const navLinks = [...document.querySelectorAll("[data-nav]")];

function showView() {
  let name = window.location.hash.slice(1) || "about";
  if (!views.some((v) => v.dataset.view === name)) name = "about";
  views.forEach((v) => { v.hidden = v.dataset.view !== name; });
  navLinks.forEach((link) => {
    if (link.dataset.nav === name) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  window.scrollTo(0, 0);
}
window.addEventListener("hashchange", showView);
showView();

/* ---------- Helpers ---------- */
const categoryNames = { transport: "Transport fares", groceries: "Groceries", market: "Market goods and services" };

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

/* ---------- Prices page ---------- */
const tabs = [...document.querySelectorAll(".tab[data-cat]")];
const searchBox = document.getElementById("price-search");
const list = document.getElementById("price-list");
const photoHint = document.getElementById("photo-hint");
let category = "transport";
let images = {};
let community = []; // prices shared by users

async function uploadPhoto(file, item, key, status) {
  if (!file) return;
  status.textContent = "Uploading...";
  try {
    const dataUrl = await compress(file);
    await saveImage(key, item.name, dataUrl, auth.currentUser.uid);
    images[key] = dataUrl;
    renderPrices();
  } catch (err) {
    status.textContent = err.code === "permission-denied"
      ? "Not allowed. You can only replace photos you added, and the Firestore rules must be published."
      : "Could not upload that photo. Try a JPG or PNG.";
  }
}

function priceText(p) {
  const money = (n) => Number(n).toLocaleString();
  const cur = p.currency || "KES";
  return p.low === p.high ? `${cur} ${money(p.low)}` : `${cur} ${money(p.low)} to ${money(p.high)}`;
}

function priceCard(p) {
  const key = imageKey(p.name);
  const card = el("article", "card");
  const media = el("div", "card__media");
  const status = el("p", "note card__status");
  status.setAttribute("role", "status");

  if (images[key]) {
    const img = el("img", "card__img");
    img.src = images[key];
    img.alt = p.name;
    img.width = 600;
    img.height = 400;
    img.loading = "lazy";
    media.append(img);
  } else {
    media.append(el("span", "note", "No photo yet"));
  }
  if (auth.currentUser) {
    const label = el("label", "btn btn--small", images[key] ? "Replace photo" : "Add photo");
    const input = el("input", "sr-only");
    input.type = "file";
    input.accept = "image/*";
    input.addEventListener("change", () => uploadPhoto(input.files[0], p, key, status));
    label.append(input);
    media.append(label);
  }

  const hasPhoto = p.category !== "transport"; // transport fares don't need pictures
  card.append(...(hasPhoto ? [media, status] : []), el("h3", "", p.name), el("p", "note", p.place));
  card.append(el("p", "price num", priceText(p)));
  if (p.service) card.append(el("span", "tag tag--service", "Service"), " ");
  p.sources.forEach((s) => card.append(el("span", s === "PPRA" ? "tag tag--ppra" : "tag", s), " "));
  return card;
}

const toRow = (s) => ({
  category: s.category, name: s.item, place: `${s.location} (shared by ${s.userName || "a user"})`,
  low: s.amount, high: s.amount, currency: s.currency, sources: ["Community"]
});

function renderPrices() {
  const query = searchBox.value.trim().toLowerCase();
  const all = [...community.map(toRow), ...samplePrices];
  const rows = all.filter((p) => p.category === category && p.name.toLowerCase().includes(query));
  list.replaceChildren(...(rows.length ? rows.map(priceCard) : [el("p", "note", `No prices match "${searchBox.value.trim()}" in this category.`)]));
}

tabs.forEach((tab) => tab.addEventListener("click", () => {
  category = tab.dataset.cat;
  tabs.forEach((t) => t.setAttribute("aria-pressed", String(t === tab)));
  renderPrices();
}));
searchBox.addEventListener("input", renderPrices);
renderPrices();

loadImages()
  .then((loaded) => { images = loaded; renderPrices(); })
  .catch((err) => console.warn("Could not load photos. Check your Firestore rules.", err.code || err));

/* ---------- Share a price page ---------- */
const shareForm = document.getElementById("share-form");
const shareGuest = document.getElementById("share-guest");
const shareUser = document.getElementById("share-user");
const myList = document.getElementById("my-prices");

async function refreshCommunity() {
  try {
    community = await loadSubmissions();
  } catch (err) {
    console.warn("Could not load shared prices. Check your Firestore rules.", err.code || err);
  }
  renderPrices();
  renderMine();
}

function mineCard(s) {
  const card = el("article", "card");
  const withdraw = el("button", "btn btn--small", "Withdraw");
  withdraw.type = "button";
  withdraw.addEventListener("click", async () => {
    if (!window.confirm("Withdraw this price?")) return;
    try {
      await withdrawSubmission(s.id);
      await refreshCommunity();
    } catch {
      withdraw.textContent = "Could not withdraw";
    }
  });
  card.append(el("h3", "", s.item), el("p", "note", `${s.location} · ${categoryNames[s.category] || s.category}`));
  card.append(el("p", "price num", priceText({ low: s.amount, high: s.amount, currency: s.currency })), withdraw);
  return card;
}

function renderMine() {
  const user = auth.currentUser;
  const mine = user ? community.filter((s) => s.userId === user.uid) : [];
  myList.replaceChildren(...(mine.length ? mine.map(mineCard) : [el("p", "note", "You have not shared any prices yet.")]));
}

/* ---------- Forms (sign up, log in, share a price) ---------- */
function bindForm(form, handler, successMessage = "") {
  const status = form.querySelector(".form-status");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.textContent = "";
    if (!form.checkValidity()) {
      status.textContent = "Please fill in every field correctly.";
      return;
    }
    const button = form.querySelector("button[type=submit]");
    button.disabled = true;
    try {
      await handler(form.elements);
      form.reset();
      status.textContent = successMessage;
    } catch (err) {
      status.textContent = friendlyError(err);
    } finally {
      button.disabled = false;
    }
  });
}

const signupForm = document.getElementById("signup-form");
const loginForm = document.getElementById("login-form");

bindForm(signupForm, (f) => signUp({
  name: f.name.value.trim(), email: f.email.value.trim(), password: f.password.value, language: f.language.value
}));
bindForm(loginForm, (f) => logIn(f.email.value.trim(), f.password.value));
bindForm(shareForm, async (f) => {
  await addSubmission({
    category: f.category.value, item: f.itemName.value.trim(), amount: Number(f.amount.value), currency: f.currency.value,
    location: f.location.value.trim(), userId: auth.currentUser.uid, userName: auth.currentUser.displayName || "A user", status: "pending"
  });
  await refreshCommunity();
}, "Thank you! Your price was shared and now appears on the Prices page.");

/* ---------- Account state ---------- */
const guestPanel = document.getElementById("auth-guest");
const userPanel = document.getElementById("auth-user");
const navAccount = document.getElementById("nav-account");

document.querySelectorAll("[data-auth-tab]").forEach((button) => button.addEventListener("click", () => {
  document.querySelectorAll("[data-auth-tab]").forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
  signupForm.hidden = button.dataset.authTab !== "signup";
  loginForm.hidden = button.dataset.authTab !== "login";
}));
document.getElementById("logout").addEventListener("click", () => logOut());

onUser((user) => {
  navAccount.textContent = user ? "Account" : "Sign up";
  guestPanel.hidden = Boolean(user);
  userPanel.hidden = !user;
  shareGuest.hidden = Boolean(user);
  shareUser.hidden = !user;
  document.getElementById("auth-email").textContent = user ? user.email : "";
  photoHint.textContent = user
    ? "Use Add photo on a grocery or market card to upload a picture."
    : "Sign up to add photos to grocery and market cards.";
  renderPrices();
  renderMine();
});

refreshCommunity();
