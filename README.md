# PriceMoja

**A community-driven price transparency platform for international students and tourists.**

PriceMoja helps newcomers to a city check what everyday things should cost (transport fares, groceries and market goods) so they are not overcharged because they look or sound like outsiders.

| | |
|---|---|
| **Live app** | https://YOUR-PROJECT-ID.web.app |
| **Demo video** | YOUR-VIDEO-LINK |
| **SRS document** | YOUR-SRS-LINK |
| **Author** | Martha Stacey Kanogo, African Leadership University (ALU) |

---

## Table of contents
1. [The problem](#the-problem)
2. [The solution](#the-solution)
3. [Features](#features)
4. [Users](#users)
5. [Tech stack](#tech-stack)
6. [Project structure](#project-structure)
7. [Getting started](#getting-started)
8. [Deploying](#deploying)
9. [How to use the app](#how-to-use-the-app)
10. [Testing](#testing)
11. [Git workflow](#git-workflow)
12. [Known limitations](#known-limitations)
13. [Roadmap](#roadmap)
14. [Data sources and credits](#data-sources-and-credits)

---

## The problem
International students, tourists and newcomers are often charged higher prices for everyday items, groceries and taxi rides, especially in open markets where prices are not posted. Vendors can easily spot non-locals by their accent or appearance. Without a way to know the fair price, newcomers overpay, lose trust in local businesses and struggle to settle in.

## The solution
PriceMoja combines two sources of price information:

1. **Official reference prices** from the Public Procurement Regulatory Authority (PPRA), imported by a moderator.
2. **Community prices** submitted and verified (voted on or flagged) by local residents and other users.

From these, the app shows a **fair-price range** for an item and always states **where each price comes from**.

---

## Features
Mapped to the functional requirements (FR) in the SRS. Tick each box as it is completed.

**Account management (FR1)**
- [ ] FR1.1 Register with email (phone number planned)
- [ ] FR1.2 Log in and log out
- [ ] FR1.3 Choose a preferred language

**Price submission (FR2)**
- [ ] FR2.1 Submit a price (category, item, amount, currency, location)
- [ ] FR2.2 Attach an optional photo
- [ ] FR2.3 Edit or withdraw your own submission

**Price lookup (FR3)**
- [ ] FR3.1 Search by category, item and location
- [ ] FR3.2 View the fair-price range
- [ ] FR3.3 View price history
- [ ] FR3.4 See the source of every price
- [ ] FR3.5 Compare the community median with the PPRA reference price

**Community verification (FR4)**
- [ ] FR4.1 Upvote or downvote a submission
- [ ] FR4.2 Flag a submission as spam or fraudulent

**Alerts and reputation (FR5, FR6)**
- [ ] FR5.1 Overcharge alert
- [ ] FR6.1 Contributor reputation score
- [ ] FR6.2 Recognition badges

**Administration (FR7, FR8)**
- [ ] FR7.1 Moderate flagged content
- [ ] FR7.2 Analytics dashboard
- [ ] FR8.1 Import PPRA reference prices
- [ ] FR8.2 Update reference prices

---

## Users
| User | What they do |
|---|---|
| **Newcomer** | Searches for fair prices (students, tourists, recent arrivals). |
| **Community contributor** | Submits, votes on and flags prices. Builds a reputation. |
| **Moderator** | Reviews flagged content, views analytics and manages the PPRA reference prices. |

---

## Tech stack
- **Front end:** HTML, CSS and vanilla JavaScript (ES modules), built as a progressive web app
- **Back end (no server to run):** [Firebase](https://firebase.google.com/)
  - Authentication (email and password)
  - Cloud Firestore (database)
  - Hosting (public URL)
- **Version control:** Git and GitHub

---

## Project structure
```
pricemoja/
├── index.html                  # Main page
├── css/
│   └── styles.css              # Styles
├── js/
│   ├── app.js                  # App start-up and page navigation
│   ├── firebase-config.js      # Your Firebase project settings
│   ├── auth.js                 # Register, log in, log out
│   ├── prices.js               # Submit, search and fair-price range
│   ├── verification.js         # Votes and flags
│   └── moderator.js            # Moderation and reference prices
├── manifest.json               # Progressive web app settings
├── firebase.json               # Firebase Hosting settings
├── .gitignore
└── README.md
```

---

## Getting started
Follow every step in order. The app has no build step, so it runs straight from the files.

### What you need
- A modern web browser (Chrome, Edge, Firefox or Safari)
- [Git](https://git-scm.com/downloads)
- A free [Google account](https://accounts.google.com/) (for Firebase)
- **One** of the following to run a local web server:
  - [Python 3](https://www.python.org/downloads/), **or**
  - [Node.js](https://nodejs.org/) (version 18 or later), **or**
  - [Visual Studio Code](https://code.visualstudio.com/) with the Live Server extension
- Node.js is also needed later if you want to deploy (see [Deploying](#deploying))

### Step 1: Get the code
```bash
git clone https://github.com/YOUR-GITHUB-USERNAME/pricemoja.git
cd pricemoja
```

### Step 2: Create a Firebase project
1. Go to the [Firebase console](https://console.firebase.google.com/) and click **Add project**.
2. Name it (for example `pricemoja`) and finish the setup. Google Analytics is optional.
3. In the left menu, open **Build > Authentication**, click **Get started**, and enable the **Email/Password** sign-in method.
4. Open **Build > Firestore Database**, click **Create database**, choose a location, and start in **production mode**.
5. In **Firestore > Rules**, paste the rules from `firestore.rules` (if the file is in the repo) and click **Publish**.
6. Go to **Project settings** (gear icon) > **General** > **Your apps**, click the **Web** icon (`</>`), register an app, and copy the `firebaseConfig` object it shows you.

### Step 3: Add your Firebase settings
Open `js/firebase-config.js` and replace the placeholder values with the ones you copied:

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

> Firebase web settings identify your project. They are not secret passwords. Your data is protected by the Firestore security rules, so never skip Step 2.5.

### Step 4: Run the app locally
The app uses JavaScript modules, so it must be opened through a local server (double-clicking `index.html` will not work).

Choose one:

```bash
# Option A: Python
python3 -m http.server 8000
```
```bash
# Option B: Node.js
npx serve .
```
**Option C (VS Code):** open the folder, right-click `index.html` and choose **Open with Live Server**.

Then open **http://localhost:8000** (or the address your server prints) in your browser.

### Step 5: Set up a moderator account (optional)
1. Register a normal account in the app.
2. In the Firebase console, open **Firestore Database > users**, find that user's document, and set the field `role` to `moderator`.
3. Log out and log in again. The moderator pages now appear.

### Step 6: Load the reference prices (optional)
As a moderator, open the **Reference prices** page and import the PPRA price list (see [Data sources](#data-sources-and-credits)). Without it, the app still works using community prices only.

---

## Deploying
The app is hosted on Firebase Hosting.

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
```
When asked:
- **Use an existing project:** select your Firebase project
- **Public directory:** type `.` (a single dot)
- **Single-page app:** `No`
- **Overwrite index.html:** `No`

Then deploy:
```bash
firebase deploy --only hosting
```
The command prints your public URL (for example `https://YOUR-PROJECT-ID.web.app`).

---

## How to use the app
**As a newcomer**
1. Open the app and choose your language.
2. Search for an item (for example "tomatoes" or "moto ride to the airport") and a location.
3. Read the fair-price range and check the source label (PPRA or community).

**As a contributor**
1. Register and log in.
2. Open **Submit price**, fill in the item, amount, currency and location, and add a photo if you wish.
3. Vote on other people's prices or flag anything that looks like spam.

**As a moderator**
1. Log in with a moderator account.
2. Review flagged submissions and remove or edit them.
3. Import or update the PPRA reference prices and view the analytics dashboard.

---

## Testing
Manual test checklist (run before every release):

| Test | Expected result |
|---|---|
| Register with a new email | Account is created and you are logged in |
| Log in with a wrong password | A clear error message is shown |
| Submit a price without logging in | You are asked to log in |
| Submit a valid price | It appears in search results with its source |
| Search for an item with no data | A friendly "no prices yet" message is shown |
| Vote on a submission | The vote count updates |
| Flag a submission | It appears in the moderator's flagged list |
| Use the app on a phone-sized screen | The layout stays usable |

---

## Git workflow
- `main` always holds working code.
- Each feature is built on its own branch, for example `feature/user-auth` or `feature/price-search`.
- Commit often, with clear messages such as `Add login form validation`.
- Merge into `main` only through a pull request with a short description of what changed.

---

## Known limitations
*Keep this section honest and up to date.*
- This is a prototype, so some features in the checklist above may be incomplete.
- Phone number registration and SMS verification are planned but not yet available.
- PPRA reference prices do not cover every item and do not include transport fares.
- The fair-price range is only as good as the community data behind it, so it is weakest at launch.

---

## Roadmap
Based on the four Agile sprints in the project proposal.

| Sprint | Goal |
|---|---|
| 1 | User accounts and price submission for transport fares |
| 2 | PPRA baseline import, community verification, and the fair-price range for transport |
| 3 | Extend submission, lookup and range to market goods and groceries |
| 4 | Overcharge alerts, contributor reputation score and the moderator dashboard |

---

## Data sources and credits
- Official reference prices: Public Procurement Regulatory Authority (PPRA), Government of Kenya, [Market price index](https://ppra.go.ke/market-price-index/). 