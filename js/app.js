// App start-up: page navigation, the prices page (with photos), and the sign-up / log-in page.
import { auth } from "./firebase-init.js";
import { signUp, logIn, logOut, onUser, friendlyError } from "./auth.js";
import { imageKey, loadImages, compress, saveImage } from "./images.js";
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

/* ---------- Prices page ---------- */
const tabs = [...document.querySelectorAll(".tab[data-cat]")];
const searchBox = document.getElementById("price-search");
const list = document.getElementById("price-list");
const photoHint = document.getElementById("photo-hint");
let category = "transport";
let images = {};

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

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
  card.append(el("p", "price num", `KES ${p.low.toLocaleString()} to ${p.high.toLocaleString()}`));
  if (p.service) card.append(el("span", "tag tag--service", "Service"), " ");
  p.sources.forEach((s) => card.append(el("span", s === "PPRA" ? "tag tag--ppra" : "tag", s), " "));
  return card;
}

function renderPrices() {
  const query = searchBox.value.trim().toLowerCase();
  const rows = samplePrices.filter((p) => p.category === category && p.name.toLowerCase().includes(query));
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

/* ---------- Sign up and log in ---------- */
const signupForm = document.getElementById("signup-form");
const loginForm = document.getElementById("login-form");
const guestPanel = document.getElementById("auth-guest");
const userPanel = document.getElementById("auth-user");
const navAccount = document.getElementById("nav-account");

function bindForm(form, handler) {
  const status = form.querySelector(".form-status");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.textContent = "";
    if (!form.checkValidity()) {
      status.textContent = "Please fill in every field. Passwords need at least 8 characters.";
      return;
    }
    const button = form.querySelector("button[type=submit]");
    button.disabled = true;
    try {
      await handler(form.elements);
      form.reset();
    } catch (err) {
      status.textContent = friendlyError(err);
    } finally {
      button.disabled = false;
    }
  });
}

bindForm(signupForm, (f) => signUp({
  name: f.name.value.trim(), email: f.email.value.trim(), password: f.password.value, language: f.language.value
}));
bindForm(loginForm, (f) => logIn(f.email.value.trim(), f.password.value));

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
  document.getElementById("auth-email").textContent = user ? user.email : "";
  photoHint.textContent = user
    ? "Use Add photo on a grocery or market card to upload a picture."
    : "Sign up to add photos to grocery and market cards.";
  renderPrices();
});