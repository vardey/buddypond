# Contributing to BuddyPond

Thanks for your interest in contributing! This guide explains how to set up BuddyPond locally and the workflow for submitting changes.

---

## 1. Set up your local dev environment

1. **Fork the repo** on GitHub.

2. **Clone your fork**:

   ```bash
   git clone https://github.com/<your-username>/buddypond.git
   cd buddypond
   ```

3. **Install Vite globally** (required to run the dev server):

   ```bash
   npm install -g vite
   ```

4. **Start the dev server** from the root of the project:

   ```bash
   vite
   ```

   This will launch the app at:

   ```
   http://localhost:5173/
   ```

   Open it in your browser to confirm everything works.

---

## 2. Create a feature branch

Always branch off `master`:

```bash
git checkout master
git pull origin master
git checkout -b <feature-name>
```

Use clear names like `fix-navbar`, `add-login-form`, or `improve-docs`.

---

## 3. Make changes

- Write clean, consistent code.
- Keep the scope of your branch small — one issue or feature at a time.
- Update docs if your change introduces new behavior.
- Test changes locally by running `vite` again.

---

## 4. Push your branch

```bash
git push origin <feature-name>
```

---

## 5. Open a Pull Request (PR)

- On GitHub, open a PR from your branch to `master`.
- Include:

  - A clear title (e.g. _“Fix navbar responsiveness”_).
  - A short description of what you changed and why.
  - Screenshots or screen recordings if it affects the UI.

- Link related issues with `#<issue-number>`.

---

## 6. Code review

- Reviewers may comment on your code.
- Make adjustments by committing more changes to your branch.
- The PR updates automatically.

---

## 7. Merge & cleanup

Once approved, the PR will be merged.
You can delete your branch both locally and remotely:

```bash
git branch -d <feature-name>
git push origin --delete <feature-name>
```

---

## 8. Tips for contributors

- Smaller PRs are easier to review.
- Use descriptive commit messages.
- Rebase/merge `master` often to avoid conflicts.
- Always test before pushing.
