# bloglist-tests

Playwright e2e tests for the `bloglist` app, written in the same style as
`routed-anecdotes-tests`. These tests were written **before** the features
they cover were implemented, so they describe a contract the app needs to
satisfy. If a test fails, check the app against the assumptions below before
assuming the test is wrong.

## Running

```
npm ci
npx playwright install --with-deps chromium
npm test
```

The config starts the backend (`../bloglist/server`, `npm run start:test`,
`NODE_ENV=test` so `/api/testing/reset` is available) and the frontend
(`../bloglist/client`, `npm run dev`) automatically. The backend needs a
`TEST_MONGODB_URI` (see `bloglist/server/.env` locally, or the workflow env
in CI).

## Assumptions the tests make

- **Error boundary (ex. 9):** visiting `/blogs/<a well-formed but
  nonexistent id>` (e.g. `/blogs/000000000000000000000000`) causes a
  rendering error somewhere below the nav bar, which is caught and replaced
  with a message containing "something went wrong" (case-insensitive). The
  nav bar itself (the `blogs` link, etc.) must stay outside the boundary and
  remain clickable.
- **Nonexisting routes (ex. 10):** any path that doesn't match a defined
  route (e.g. `/this/route/does/not/exist`) renders a view containing
  "page not found" (case-insensitive), with the nav bar still visible.
- **Persistent user service (ex. 16):** `src/services/persistentUser.js`
  exists and exports `getUser`, `saveUser` and `removeUser`. No other file
  under `src` touches `window.localStorage` directly, and `getUser` /
  `saveUser` / `removeUser` are each called from somewhere else in the app.
  This is checked by static source analysis, not the browser.
- **Users view (ex. 17):** a nav link named `users` leads to a view
  containing one table row per user; each row's accessible text includes
  the user's name and the number of blogs they've added, and the user's
  name is a link.
- **Individual user view (ex. 18):** clicking a user's name (from the users
  view) navigates to a page with a heading equal to that user's name and a
  list of the titles of the blogs they've added (empty if they have none).
- **Comments (ex. 19):** a blog's own page (`/blogs/:id`) has a text input
  with an accessible name/label containing "comment" and a button named
  "add comment" (or containing that phrase). Submitting adds the comment to
  a visible list immediately, and the comment is persisted on the server
  (still visible after `page.reload()`), implying a POST to
  `api/blogs/:id/comments`.

If the implementation uses different wording, adjust either the app or the
matching regex/text in the relevant spec file.
