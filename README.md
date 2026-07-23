# Phishing Guard

A Chrome extension that analyzes email or pasted text to detect potential phishing attempts.

The project is being developed collaboratively using Git and GitHub. The extension is built with **TypeScript without React or any frontend framework**.

---

## Project Structure

```text
phishing-guard/
│
├── extension/
│   ├── src/
│   │   ├── content.ts
│   │   ├── background.ts
│   │   ├── popup.ts
│   │   └── definitions.ts     (shared TypeScript interfaces)
│   │
│   ├── load/
│   │   ├── dist/
│   │   │   ├── content.js
│   │   │   ├── background.js
│   │   │   └── popup.js
│   │   ├── manifest.json
│   │   ├── popup.html
│   │   └── style.css
│   │
│   ├── package.json
│   ├── package-lock.json
│   └── tsconfig.json
│
├── mlmodel
└── LICENSE
```

> The exact structure may change as the project grows.

---

# Getting Started

## 1. Clone the Repository

Clone the repository to your computer:

```bash
git clone https://github.com/amrit-11022007/phishing-guard.git
```

Move into the project:

```bash
cd phishing-guard
```

---

## 2. Install Dependencies

Move into the extension directory:

```bash
cd extension
```

Install dependencies:

```bash
npm install
```

---

# TypeScript Workflow

The source code is written in TypeScript.

TypeScript files are stored inside:

```text
src/
```

For example:

```text
src/
├── content.ts
├── background.ts
├── popup.ts
└── definitions.ts
```

Chrome cannot directly execute TypeScript files. Therefore, TypeScript must be compiled into JavaScript.

```text
src/popup.ts
      │
      ▼
TypeScript Compiler
      │
      ▼
load/dist/popup.js
```

Compile the project using:

```bash
npx tsc
```

This generates JavaScript files inside:

```text
load/dist/
```

After changing a TypeScript file, run:

```bash
npx tsc
```

again.

You can also use watch mode:

```bash
npx tsc --watch
```

This automatically recompiles TypeScript whenever a file changes.

---

# TypeScript Configuration

The project uses strict TypeScript checking. This is the current `tsconfig.json`:

```json
{
  "compilerOptions": {
    // File Layout
    "rootDir": "./src",
    "outDir": "load/dist",

    // Environment Settings
    "module": "es2020",
    "target": "esnext",
    "moduleResolution": "bundler",
    "types": ["chrome"],
    "lib": ["ES2020", "DOM"],

    // Other Outputs
    "sourceMap": true,

    // Stricter Typechecking Options
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,

    // Recommended Options
    "strict": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "noUncheckedSideEffectImports": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*.ts"]
}
```

## Why `strict: true`?

Strict mode helps detect potential bugs before the code runs.

For example:

```ts
const emailBody = document.querySelector(".email");
```

TypeScript knows that this element may not exist.

Therefore, this may cause an error:

```ts
console.log(emailBody.textContent);
```

A safer version is:

```ts
console.log(emailBody?.textContent);
```

or:

```ts
if (emailBody) {
  console.log(emailBody.textContent);
}
```

Always prefer handling possible `null` values instead of disabling strict checking.

## Why `verbatimModuleSyntax` and `noUncheckedIndexedAccess`?

- `verbatimModuleSyntax` forces type-only imports to be written with `import type`, keeping compiled output clean (see `definitions.ts` imports in `content.ts`).
- `noUncheckedIndexedAccess` treats array/object index lookups as possibly `undefined`, catching more bugs at compile time.

---

# Chrome Extension Components

The extension mainly consists of different JavaScript contexts.

## Popup

The popup is the UI that appears when the user clicks the extension icon.

```text
popup.html
    │
    ▼
load/dist/popup.js
```

Example:

```ts
const button = document.querySelector<HTMLButtonElement>("#analyzeButton");

button?.addEventListener("click", () => {
  console.log("Button clicked");
});
```

The popup has its own DevTools console.

To inspect it:

1. Open the extension popup.
2. Right-click inside the popup.
3. Click **Inspect**.
4. Open the **Console** tab.

---

## Content Script

The content script runs inside Gmail (`https://mail.google.com/*`), as defined in `manifest.json`.

```text
Gmail
  │
  ▼
load/dist/content.js
```

It reads information from the webpage DOM and structures it using the shared `EmailData` type from `definitions.ts`.

Example:

```ts
const emailBody = document.querySelector<HTMLElement>(".a3s.aiL");

if (emailBody) {
  const text = emailBody.innerText;

  console.log(text);
}
```

The content script can be used to:

- Read email content
- Extract links
- Analyze webpages
- Display warnings
- Communicate with the extension

---

## Background Script

`background.ts` is registered in `manifest.json` as the extension's service worker. It is currently empty and reserved for future work (e.g. coordinating messages between the popup and content script, or calling a phishing-analysis API).

---

# Building the Extension

Compile TypeScript:

```bash
npx tsc
```

Make sure the compiled JavaScript files exist.

Example:

```text
load/dist/
├── content.js
├── background.js
└── popup.js
```

The Chrome extension should load the compiled JavaScript files, not the TypeScript source files.

---

# Loading the Extension in Chrome

1. Open Google Chrome.
2. Visit:

```text
chrome://extensions
```

3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select the folder containing `manifest.json`.

For example:

```text
extension/load/
```

The folder selected in Chrome must contain the files referenced by `manifest.json`.

For example:

```text
load/
├── manifest.json
├── popup.html
└── dist/
```

If Chrome displays an error such as:

```text
Could not load JavaScript
```

check that the path in `manifest.json` matches the actual file location.

---

# Git Collaboration Workflow

## Important Rule

Do not work directly on the `main` branch for features.

Each feature should have its own branch.

Example:

```text
main
│
├── amrit-popup
│
└── friend-model
```

---

## Get the Latest Code

Before starting new work:

```bash
git checkout main
git pull origin main
```

---

## Create a New Feature Branch

```bash
git checkout -b feature-name
```

Example:

```bash
git checkout -b amrit-email-popup
```

You can check your current branch with:

```bash
git branch
```

The branch marked with `*` is your current branch.

---

## Save Your Changes

Check what changed:

```bash
git status
```

Add your changes:

```bash
git add .
```

Commit:

```bash
git commit -m "Add email text analysis popup"
```

Push your branch:

```bash
git push -u origin amrit-email-popup
```

After the first push, you can usually use:

```bash
git push
```

---

# Merging a Feature

The recommended method is using a Pull Request.

1. Push your branch to GitHub.
2. Open the repository on GitHub.
3. Create a Pull Request.
4. Set:

```text
base: main
compare: your-feature-branch
```

5. Review the changes.
6. Merge the Pull Request.

After your feature is merged:

```bash
git checkout main
git pull origin main
```

---

# Keeping Your Branch Updated

If other changes have been merged into `main` while you are working:

```bash
git checkout main
git pull origin main
```

Then return to your feature branch:

```bash
git checkout your-feature-branch
```

You can merge the latest main branch into your feature branch:

```bash
git merge main
```

If Git reports conflicts, resolve them manually, then:

```bash
git add .
git commit
```

---

# Recommended Commit Style

Use clear commit messages.

Good:

```text
Add popup text input
Add Gmail email extraction
Fix phishing analysis request
Add model API integration
Improve phishing warning UI
```

Avoid:

```text
changes
update
final
stuff
fix
```

A commit should explain what changed.

---

# Important Files

| File                 | Purpose                                         |
| -------------------- | ----------------------------------------------- |
| `src/`               | TypeScript source code                          |
| `src/definitions.ts` | Shared TypeScript interfaces (e.g. `EmailData`) |
| `load/dist/`         | Compiled JavaScript                             |
| `load/manifest.json` | Chrome extension configuration                  |
| `load/popup.html`    | Extension popup UI                              |
| `load/style.css`     | Popup styling                                   |
| `package.json`       | Project dependencies and scripts                |
| `tsconfig.json`      | TypeScript configuration                        |

---

# Development Workflow

The normal workflow is:

```text
1. Pull latest main
        │
        ▼
2. Create feature branch
        │
        ▼
3. Write TypeScript
        │
        ▼
4. Compile TypeScript
        │
        ▼
5. Load/reload extension in Chrome
        │
        ▼
6. Test
        │
        ▼
7. git add .
        │
        ▼
8. git commit
        │
        ▼
9. git push
        │
        ▼
10. Create Pull Request
```

---

# Collaboration Rules

- Do not directly push unfinished work to `main`.
- Create a separate branch for each feature.
- Pull the latest changes before starting work.
- Keep commits focused.
- Do not commit API keys or passwords.
- Do not commit `.env` files.
- Communicate before modifying another person's major feature.
- Resolve merge conflicts carefully.
- Test the extension before creating a Pull Request.

---

## Current Technology

- TypeScript
- JavaScript
- HTML
- CSS
- Chrome Extension Manifest V3
- Git
- GitHub

Phishing analysis logic (and any accompanying model/API) is not implemented yet and will be documented here once added.
