# Christmas Pool Championship 2026

A responsive static website starter for a family 8-ball pool tournament, with a public tournament board and an admin console.

## Files

- `index.html` — public dashboard, player standings, bracket tabs, recent results, house rules.
- `admin.html` — add/remove players, create opening matches, record winners, edit house rules, export/import JSON backups, reset.
- `css/style.css` — responsive green, cream, and gold tournament design.
- `js/storage.js` — browser-local demo storage.
- `js/bracket.js` — basic match creation and result advancement.
- `js/app.js` — public dashboard rendering.
- `js/admin.js` — admin actions.

## Run it locally

1. Extract the ZIP.
2. Open the folder in VS Code.
3. Use the **Live Server** extension to open `index.html`, or publish the folder with GitHub Pages.
4. Open `admin.html` to manage the demo tournament.

## Important prototype limitations

This is a working **front-end starter**, not a production-ready tournament system. Data is saved in the current browser's `localStorage`; it does not automatically synchronize to other devices or browsers. The admin page is not protected by a login. Anyone who can access the site can open `admin.html` and change data in their own browser.

The included bracket engine is intentionally a starter implementation, not a complete tournament-management engine for every double-elimination edge case. In particular, the grand final/reset-final flow and all bracket placements should be tested and finalized before using it to run a real event. Review the bracket after each result and keep backups.

## Before the live tournament: shared sync and real admin security

GitHub Pages serves static files. For shared updates, connect a backend such as **Firebase Authentication + Cloud Firestore** or **Supabase**.

Recommended Firebase approach:

1. Create a Firebase project and a Firestore database.
2. Enable Firebase Authentication (for example, email/password) and create the tournament admin account.
3. Store tournament state in one Firestore document, or use a structured set of collections for players and matches.
4. Add Firebase's web SDK and project configuration to the site.
5. Require authentication for admin writes and enforce authorization in **Firestore Security Rules**. Do not rely on hiding `admin.html` or checking admin status only in JavaScript.
6. Permit unauthenticated visitors to read only the public tournament data; deny public writes. Restrict writes to the verified admin UID(s).
7. Test rules using Firebase's Rules Playground or Emulator before publishing.
8. Do not put service-account keys or server secrets in GitHub Pages code.

Illustrative rule pattern only — replace the placeholder UID and test against your actual document paths before deployment:

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tournaments/christmas-2026 {
      allow read: if true;
      allow write: if request.auth != null
                   && request.auth.uid == 'REPLACE_WITH_ADMIN_UID';
    }
  }
}
```

## Publish in a new GitHub repository

1. Create a **new, dedicated repository** named `christmas-pool-championship-2026` (or another name you prefer).
2. Upload the contents of this folder to the repository root. `index.html` must be at the root for the default GitHub Pages landing page.
3. In repository **Settings → Pages**, select **Deploy from a branch**, choose `main` and `/ (root)`, then save.
4. Wait for the Pages deployment to finish and open the published URL.
5. Do not use the live event until shared synchronization, admin authentication, and bracket logic have been completed and tested.

## House rules

The house-rule list starts blank on purpose. Enter the actual rules agreed by your family in Admin Console; this project does not assume or invent them.
