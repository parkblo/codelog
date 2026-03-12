# CodeLog Agent Rules

## README Sync

- Before pushing or updating a pull request, run `npm run check:readme` whenever changes touch `README.md`, `package.json`, `app/`, `pages/`, `src/`, `test/`, or `.github/workflows/`.
- If the check fails, run `npm run sync:readme`, review the generated `README.md` diff, and rerun `npm run check:readme`.
- Do not hand-edit the managed blocks between `readme-sync:*` markers. Update the source-of-truth files and resync instead.
