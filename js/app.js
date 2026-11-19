// App start-up: connects Firebase, switches between pages using the URL hash, and runs the prices and sign-up pages.
import "./firebase-init.js";
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
const tabs = [...document.querySelectorAll(".tab")];
const searchBox = document.getElementById("price-search");
const list = document.getElementById("price-list");
let category = "transport";

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function priceCard(p) {
  const card = el("article", "card");
  card.append(el("h3", "", p.name), el("p", "note", p.place));
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

/* ---------- Sign-up page ---------- */
const signupForm = document.getElementById("signup-form");
const signupStatus = document.getElementById("signup-status");

signupForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const { name, email, password } = signupForm.elements;
  if (!name.value.trim() || !email.validity.valid || password.value.length < 8) {
    signupStatus.textContent = "Please enter your name, a valid email and a password of at least 8 characters.";
    return;
  }
  // Account creation is connected to Firebase in the user-auth update.
  signupStatus.textContent = "Account creation is not connected yet, so nothing was saved. It arrives with the user-auth update.";
});
