# PriceMoja

**A community-driven price transparency platform for international students and tourists.**

PriceMoja helps newcomers to a city check what everyday things should cost (transport fares, groceries and market goods) so they are not overcharged because they look or sound like outsiders.

| | |
|---|---|
| **Live app** | https://pricemoja-8986a.web.app |
| **Demo video** | [ADD YOUR VIDEO LINK] |
| **SRS document** | [ADD YOUR SRS LINK] |
| **GitHub repository** | https://github.com/mskanogo/pricemoja |
| **Author** | Martha Stacey Kanogo, African Leadership University (ALU) |

> **For graders: the quickest way to try it.** Open the live app link above. You can browse prices without an account. To share, confirm or flag prices, click **Sign up** and create an account with any email address and a password of at least 8 characters. To run the code on your own computer, jump to [Getting started](#getting-started).

---

## Table of contents
1. [The problem](#the-problem)
2. [The solution](#the-solution)
3. [Features](#features)
4. [Users](#users)
5. [Tech stack](#tech-stack)
6. [Project structure](#project-structure)
7. [Getting started](#getting-started)
8. [Moderator account and reference prices](#moderator-account-and-reference-prices)
9. [Deploying](#deploying)
10. [How to use the app](#how-to-use-the-app)
11. [Testing](#testing)
12. [Git workflow](#git-workflow)
13. [Known limitations](#known-limitations)
14. [Roadmap](#roadmap)
15. [Data sources and credits](#data-sources-and-credits)

---

## The problem
International students, tourists and newcomers are often charged higher prices for everyday items, groceries and taxi rides, especially in open markets where prices are not posted. Vendors can easily spot non-locals by their accent or appearance. Without a way to know the fair price, newcomers overpay, lose trust in local businesses and struggle to settle in.

## The solution
PriceMoja combines two sources of price information:

1. **Official reference prices** (from the Public Procurement Regulatory Authority, PPRA), loaded by a moderator.
2. **Community prices**, shared by users and checked by other users (confirm, dispute or flag).

From these, the app shows a **fair-price range** for each item and always labels **where each price comes from**.

### How the fair-price range is worked out
- With 1 to 3 shared prices, the range runs from the lowest to the highest price.
- With 4 or more shared prices, the range is the middle half of the prices, so one unusually high or low price does not stretch it.
- A shared price is **left out of the range** once it has 3 flags, or 2 more disputes than confirmations. Left-out prices stay visible so people can review them.
- Cards with fewer than 3 reports show a note that the range is not yet very reliable.
- Items nobody has shared yet fall back to the reference price. Placeholder prices are labelled **Sample**.

---

## Features
Mapped to the functional requirements (FR) in the SRS. A ticked box means it is built and working. Items that are not built are explained in [Known limitations](#known-limitations).

**Account management (FR1)**
- [x] FR1.1 Register with email and password (phone number planned)
- [x] FR1.2 Log in and log out
- [ ] FR1.3 Choose a preferred language (the choice is saved at sign-up, but the interface is English only)

**Price submission (FR2)**
- [x] FR2.1 Share a price (category, item, amount, currency, location)
- [x] FR2.2 Attach an optional photo (on grocery and market cards)
- [ ] FR2.3 Edit or withdraw your own submission (withdraw works; editing is not built)

**Price lookup (FR3)**
- [ ] FR3.1 Search by category, item and location (category tabs and item search work; searching by location is not built)
- [x] FR3.2 View the fair-price range
- [ ] FR3.3 View price history (not built)
- [x] FR3.4 See the source of every price
- [x] FR3.5 Compare the community median with the PPRA reference price

**Community verification (FR4)**
- [x] FR4.1 Confirm or dispute a shared price
- [x] FR4.2 Flag a shared price as spam or fraud

**Alerts and reputation (FR5, FR6)**
- [x] FR5.1 Overcharge check: type the price you were quoted on any card and the app warns you if it is above the fair range
- [x] FR6.1 Contributor reputation score
- [x] FR6.2 Recognition badges

**Administration (FR7, FR8)**
- [x] FR7.1 Moderate flagged content (remove a price or dismiss its flags)
- [x] FR7.2 Analytics dashboard (shared prices, flagged prices, votes cast, active people)
- [x] FR8.1 Import PPRA reference prices
- [x] FR8.2 Update or remove reference prices

### Reputation score and badges
Score = 10 points per verified price + 1 per shared price + 2 per confirmation received, minus 2 per dispute and 5 per flag received (never below 0). A price is **verified** once at least one other person has confirmed it and it has not been left out of the range.

| Badge | Needs |
|---|---|
| First verified price | 1 verified price |
| Reliable sharer | 3 verified prices |
| Community pillar | 10 verified prices |

---

## Users
| User | What they do |
|---|---|
| **Newcomer** | Looks up fair prices and checks quotes (students, tourists, recent arrivals). No account needed. |
| **Community contributor** | Signs up, shares prices, adds photos, confirms, disputes and flags other people's prices, and builds a reputation. |
| **Moderator** | Reviews flagged prices, views the dashboard and manages the official reference prices. |

---

## Tech stack
- **Front end:** HTML, CSS and vanilla JavaScript (ES modules). No build step and no framework.
- **Back end (no server to run):** [Firebase](https://firebase.google.com/)
  - Authentication (email and password)
  - Cloud Firestore (database, protected by security rules)
  - Hosting (public URL)
- **Photos:** shrunk in the browser to a small JPEG and stored in Firestore (no paid storage needed).
- **Version control:** Git and GitHub.

---

## Project structure
```
pricemoja/
├── index.html              # The single page: About, Prices, Share a price, Sign up / Log in, Moderate
├── css/
│   └── styles.css          # Styles
├── js/
│   ├── app.js              # App start-up, page navigation and all screens
│   ├── firebase-config.js  # Firebase project settings
│   ├── firebase-init.js    # Starts Firebase once (exports app, auth, db)
│   ├── auth.js             # Sign up, log in, log out, moderator role
│   ├── submissions.js      # Load, add and withdraw shared prices
│   ├── fair-price.js       # Fair-price range, vote tallies, overcharge check, list parser
│   ├── reviews.js          # Confirm, dispute and flag
│   ├── reputation.js       # Reputation score and badges
│   ├── reference.js        # Official reference prices (moderators only)
│   ├── images.js           # Photo compression and storage
│   └── sample-prices.js    # Labelled placeholder prices
├── icons/                  # Logo and app icon
├── manifest.json           # Web app manifest
├── firebase.json           # Firebase Hosting settings
├── .firebaserc             # Which Firebase project to deploy to
├── firestore.rules         # Firestore security rules
└── README.md
```

### Database collections
| Collection | What it holds |
|---|---|
| `users` | One profile per person (name, language, role) |
| `submissions` | Shared prices |
| `votes` | Confirmations and disputes, one per person per price |
| `flags` | Spam and fraud flags, one per person per price |
| `referencePrices` | Official reference prices added by moderators |
| `priceImages` | Compressed photos for price cards |

---

## Getting started
Follow the steps in order. The app has no build step, so it runs straight from the files.

### What you need
- A modern web browser (Chrome, Edge, Firefox or Safari)
- [Git](https://git-scm.com/downloads)
- **One** of the following to run a local web server:
  - [Python 3](https://www.python.org/downloads/), **or**
  - [Node.js](https://nodejs.org/) version 18 or later, **or**
  - [Visual Studio Code](https://code.visualstudio.com/) with the **Live Server** extension
- A free [Google account](https://accounts.google.com/) only if you want your own Firebase project (Option B) or want to deploy

### Step 1: Get the code
```bash
git clone https://github.com/mskanogo/pricemoja.git
cd pricemoja
```

### Step 2: Choose how to connect to Firebase

**Option A: use the existing PriceMoja Firebase project (fastest).**
`js/firebase-config.js` already contains the settings for the PriceMoja Firebase project, so there is nothing to change. Skip to Step 3. Firebase web settings only identify a project, they are not passwords, and the data is protected by the security rules in `firestore.rules`.

**Option B: use your own Firebase project.**
1. Go to the [Firebase console](https://console.firebase.google.com/) and click **Add project**. Name it and finish the setup (Google Analytics is optional).
2. Open **Build > Authentication**, click **Get started**, and switch on the **Email/Password** sign-in method.
3. Open **Build > Firestore Database**, click **Create database**, choose a location, and start in **production mode**.
4. Open **Firestore Database > Rules**, delete what is there, paste the full contents of `firestore.rules` from this repo, and click **Publish**. **Do not skip this step.** Without the rules the app cannot save or load anything.
5. Open **Project settings** (gear icon) > **General** > **Your apps**, click the **Web** icon (`</>`), register an app, and copy the `firebaseConfig` values it shows you.
6. Open `js/firebase-config.js` and replace the values with yours:
   ```js
   export const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT_ID.appspot.com",
     messagingSenderId: "YOUR_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

### Step 3: Run the app locally
The app uses JavaScript modules, so it must be opened through a local server. Double-clicking `index.html` will not work.

Choose one, and run it **from inside the project folder** (the one that contains `index.html`):

```bash
# Option 1: Python (on Windows you may need "python" instead of "python3")
python3 -m http.server 8000
```
```bash
# Option 2: Node.js
npx serve .
```
**Option 3 (VS Code):** open the project folder, right-click `index.html` and choose **Open with Live Server**.

Then open **http://localhost:8000** (or the address your server prints) in your browser.

### Step 4: Check that it works
1. The About page loads, and the **Prices** page shows cards with a **Sample** label.
2. Click **Sign up** and create an account. The menu item changes to **Account**.
3. Open **Share a price**, share a price, and check it appears on the **Prices** page.

If a page looks old after you change code, do a hard refresh (**Ctrl+Shift+R**). If something is broken, open the browser developer tools (right-click > **Inspect** > **Console**) and read the first red error.

---

## Moderator account and reference prices
Moderator pages are hidden until an account has the moderator role.

### Make an account a moderator
1. Sign up for a normal account in the app.
2. In the Firebase console, open **Firestore Database > Data > users**, and open that person's document.
3. Change the field `role` from `contributor` to `moderator`.
4. Log out of the app and log in again. A **Moderate** link now appears in the menu.

> This has to be done in the Firebase console of the project you are using. On the live app, the project owner does this.

### Load reference prices
1. Log in as a moderator and open **Moderate**.
2. In **Reference prices**, type one price per line in this format:
   ```
   category, low, high, item name
   ```
   Categories are `transport`, `groceries` or `market`. For example:
   ```
   groceries, 90, 140, Tomatoes, 1 kg
   transport, 800, 1200, Moto ride, town to airport
   ```
3. Choose the currency and click **Import reference prices**.

Importing an item that already exists replaces it. Reference prices appear on the **Prices** page with a **PPRA** label, and the card shows how the community median compares with them. Use **Remove** on a reference price to delete it.

### Review flagged prices
Under **Flagged prices**, each card shows the flags and votes it has received. Click **Remove price** to delete it for everyone, or **Dismiss flags** to keep it.

---

## Deploying
The app is hosted on Firebase Hosting. Pushing to GitHub does **not** update the live site. You must deploy yourself.

First time only:
```bash
npm install -g firebase-tools
firebase login
```
To use your own project instead of PriceMoja's, change the project ID in `.firebaserc` (or run `firebase use --add`).

Then, from the project folder (the one that contains `firebase.json`):
```bash
firebase deploy --only hosting
```
The command prints your public URL (for example `https://YOUR-PROJECT-ID.web.app`). Also publish `firestore.rules` in the Firebase console whenever that file changes.

---

## How to use the app
**As a newcomer (no account needed)**
1. Open **Prices** and pick a category: Transport fares, Groceries, or Market goods and services.
2. Type in the search box to find an item.
3. Read the fair-price range and the source label (**PPRA**, **Community** or **Sample**).
4. To check a quote, type the price you were quoted into **Quoted price** on that card and click **Check quote**. The app tells you if it is above, within or below the fair range.

**As a contributor**
1. Click **Sign up** (or **Log in**).
2. Open **Share a price**, fill in the category, item, amount, currency and location, and click **Share price**. Please share after the purchase, not while you are negotiating.
3. On the **Prices** page, open **Review the shared prices** on a card to **Confirm**, **Dispute** or **Flag** other people's prices. You cannot vote on your own price.
4. Use **Add photo** on a grocery or market card to upload a picture.
5. Open **Account** to see your reputation score and badges. Withdraw your own prices from **Share a price**.

**As a moderator**
1. Log in with a moderator account and open **Moderate**.
2. Review flagged prices, and manage reference prices (see [Moderator account and reference prices](#moderator-account-and-reference-prices)).

---

## Testing
Manual test checklist (run before every release):

| Test | Expected result |
|---|---|
| Browse the Prices page without an account | Cards load, each with a source label |
| Search for an item that does not exist | A friendly "No prices match" message is shown |
| Sign up with a new email | Account is created and you are logged in |
| Sign up with a password shorter than 8 characters | A clear error message is shown |
| Log in with a wrong password | A clear error message is shown |
| Open Share a price while logged out | You are asked to sign up or log in |
| Share a valid price | It appears on the Prices page and under "Your shared prices" |
| Withdraw your own price | It disappears from both places |
| Confirm another user's price | The confirmed count goes up |
| Try to vote on your own price | No vote buttons are shown ("This is your price") |
| Flag another user's price | It appears in the moderator's flagged list |
| Enter a quote above the fair range on a card | A warning with the suggested price is shown |
| Add a photo to a grocery card | The photo appears on the card |
| Import reference prices as a moderator | They appear with a PPRA label |
| Open the app on a phone-sized screen | The layout stays usable |

---

## Git workflow
- `main` always holds working code.
- Each feature was built on its own branch (for example `feature/share-price`, `feature/vote-and-flag`, `feature/reputation-badges`, `feature/moderator-page`, `feature/reference-prices` and `feature/overcharge-alert`).
- Work was committed often with descriptive messages, and each branch was merged into `main` through a pull request. The pull request history shows the project built step by step.

---

## Known limitations
This is a prototype. The following features in the SRS are **not built or only partly built**:

- **Price history (FR3.3):** the app shows the current fair range but not a trend over time.
- **Editing a submission (FR2.3):** a person can withdraw their own price and share it again, but cannot edit it.
- **Search by location (FR3.1):** search covers category and item name only.
- **Preferred language (FR1.3):** the choice is saved to the profile, but the interface is only in English.
- **Overcharge alert (FR5.1):** this is a check on the page where the user types a quote. Push notifications are not built.
- **Phone registration and SMS verification:** planned, not built. Sign-up uses email and password.
- **Interactive map and GPS tagging:** planned, not built.
- **Working offline:** the app has a web app manifest but no offline support.

Other things to know:
- PPRA reference prices do not cover every item and do not include transport fares. Prices marked **Sample** are placeholders, not real reports or real PPRA data.
- The fair-price range is only as good as the community data behind it, so it is weakest at launch.
- Photos belong to an item card, not to an individual shared price, and are limited in size.

---

## Roadmap
Based on the four Agile sprints in the project proposal, plus what is next.

| Sprint | Goal |
|---|---|
| 1 | User accounts and price submission for transport fares |
| 2 | PPRA baseline import, community verification, and the fair-price range for transport |
| 3 | Extend submission, lookup and range to market goods and groceries |
| 4 | Overcharge alerts, contributor reputation score and the moderator dashboard |
| Next | Price history, editing submissions, a translated interface, phone sign-up and an interactive map |

---

## Data sources and credits
- Official reference prices: Public Procurement Regulatory Authority (PPRA), Government of Kenya, [Market price index](https://ppra.go.ke/market-price-index/). Government data must be credited wherever it is shown in the app.
- Backend services: [Firebase](https://firebase.google.com/) (Authentication, Cloud Firestore and Hosting).
- Font: [Poppins](https://fonts.google.com/specimen/Poppins) from Google Fonts.
- Research behind the problem statement: Chiaravutthi (2019) and Zamora et al. (2021). Full references are in the SRS.
