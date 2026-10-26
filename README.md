# Christmas Pool Championship 2026 — starter website

This package contains a remake of the starter site with Firebase browser-module imports:
- `index.html` — public live tournament board
- `admin.html` — Firebase email/password sign-in and admin controls
- `tv.html` — 16:9-style TV display
- `css/style.css` — dark pool-hall / green-felt design
- `js/` — Firebase setup, Firestore data access, and tournament UI

## Before publishing
1. Upload the files/folders in this ZIP into the root of `Bob-tech25252/christmas-pool-championship-2026`.
2. In Firebase Authentication, enable **Email/Password** and make sure your admin user exists.
3. In Firestore, confirm `/tournaments/christmas-2026` exists.
4. Keep Firestore rules restricted to authenticated admin writes. The rules you configured earlier should permit reads and writes only for the admin UID.
5. Enable GitHub Pages for the repository (Settings → Pages → deploy from the `main` branch and `/ (root)`).
6. Test the public page, admin sign-in, and TV page after the deployment finishes.

## Security notes
- Firebase web configuration is client-side configuration, not an admin password.
- Do not commit service-account keys, passwords, or private credentials.
- The admin UI signs in with Firebase Authentication. Firestore Rules—not hidden buttons—must enforce write access.
- The existing rule setup expects the authorized UID to be `RXIIgRhTceMP7gckW1hrQC8Q2Yh1`. Confirm this matches the Firebase admin account before using it.

## Tournament engine limitation
The current engine uses a simple loss-count pairing queue to keep the starter understandable and editable. It is **not** a certified bracket generator and does not implement a strict seeded winners/losers bracket tree or a formal grand-final reset. Test it with dummy players before using it on tournament day. Replace `js/engine.js` if you need a formal bracket with deterministic round-by-round advancement.

## Current data shape
Firestore document: `tournaments/christmas-2026`

Expected fields include:
- `name` (string)
- `status` (`setup`, `in-progress`, `complete`)
- `format` (`double-elimination`)
- `game` (`8-ball`)
- `gamesPerMatch` (number)
- `players` (array of player objects)
- `matches` (array of match objects)
- `rules` (array of strings)
- `currentMatchId`, `championId` (string or null)

## Local testing
Because the project uses JavaScript modules and Firebase, open it through GitHub Pages or a local static server rather than double-clicking an HTML file.
