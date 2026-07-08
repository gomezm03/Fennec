# MSC Tools for Fusion 360 — Concept Prototype

Interactive concept site for the MSC Tools Fusion 360 add-in. All data simulated.

## Repo structure — keep it exactly like this

```
index.html
css/
  style.css
js/
  app.js
README.md
```

`index.html` loads `css/style.css` and `js/app.js` by relative path. If the two
folders are missing or renamed, the page renders unstyled and non-interactive.

## Deploy to GitHub Pages

1. Extract the zip and push ALL files/folders to the repo root on `main`
   (drag the whole extracted folder contents into GitHub's "Add file -> Upload files",
   or `git add . && git commit && git push`).
2. Settings -> Pages -> Source: Deploy from a branch -> `main` / `/ (root)`.
3. Wait ~1 minute, then open `https://<username>.github.io/<repo>/`
   — the URL must end at the repo, NOT at `/js/app.js`.

## If it looks wrong

- **You see raw JavaScript code** -> you are viewing `js/app.js` directly, or
  `app.js` was uploaded as the root page. Open the site root URL; confirm
  `index.html` is at the repo root.
- **Unstyled black-on-white text** -> `css/style.css` isn't where `index.html`
  expects it. Check the folder names are exactly `css` and `js` (lowercase).
- **Old version showing** -> GitHub Pages caches; hard-refresh (Ctrl/Cmd+Shift+R)
  or wait a minute after pushing.
