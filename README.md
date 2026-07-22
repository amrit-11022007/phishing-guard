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
│   │   └── popup.ts
│   │
│   ├── dist/
│   │   ├── content.js
│   │   └── popup.js
│   │
│   ├── load/
│   │   ├── manifest.json
│   │   ├── popup.html
│   │   ├── popup.css
│   │   └── content.js
│   │
│   ├── package.json
│   └── tsconfig.json
│
└── model/
    └── ...
```

> The exact structure may change as the project grows.

---

# Getting Started

## 1. Clone the Repository

Clone the repository to your computer:

```bash
git clone <repository-url>
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
├── popup.ts
└── content.ts
```

Chrome cannot directly execute TypeScript files. Therefore, TypeScript must be compiled into JavaScript.

```text
src/popup.ts
      │
      ▼
TypeScript Compiler
      │
      ▼
dist/popup.js
```

Compile the project using:

```bash
npx tsc
```

This generates JavaScript files inside:

```text
dist/
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

The project uses strict TypeScript checking.

Important settings include:

```json
{
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist",

    "target": "ES2020",
    "module": "none",

    "lib": ["ES2020", "DOM"],
    "types": ["chrome"],

    "strict": true,

    "sourceMap": true,

    "skipLibCheck": true
  }
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

---

# Chrome Extension Components

The extension mainly consists of different JavaScript contexts.

## Popup

The popup is the UI that appears when the user clicks the extension icon.

```text
popup.html
    │
    ▼
popup.js
```

Example:

```ts
const button =
  document.querySelector<HTMLButtonElement>("#analyzeButton");

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

The content script runs inside web pages.

For example:

```text
Gmail
  │
  ▼
content.js
```

It can read information from the webpage DOM.

Example:

```ts
const emailBody =
  document.querySelector<HTMLElement>(".a3s.aiL");

if (emailBody) {
  const text = emailBody.innerText;

  console.log(text);
}
```

The content script can be used to:

* Read email content
* Extract links
* Analyze webpages
* Display warnings
* Communicate with the extension

---

# Building the Extension

Compile TypeScript:

```bash
npx tsc
```

Make sure the compiled JavaScript files exist.

Example:

```text
dist/
├── content.js
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
├── popup.css
├── popup.js
└── content.js
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

| File                 | Purpose                          |
| -------------------- | -------------------------------- |
| `src/`               | TypeScript source code           |
| `dist/`              | Compiled JavaScript              |
| `load/manifest.json` | Chrome extension configuration   |
| `popup.html`         | Extension popup UI               |
| `popup.css`          | Popup styling                    |
| `package.json`       | Project dependencies and scripts |
| `tsconfig.json`      | TypeScript configuration         |

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

* Do not directly push unfinished work to `main`.
* Create a separate branch for each feature.
* Pull the latest changes before starting work.
* Keep commits focused.
* Do not commit API keys or passwords.
* Do not commit `.env` files.
* Communicate before modifying another person's major feature.
* Resolve merge conflicts carefully.
* Test the extension before creating a Pull Request.

---

## Current Technology

* TypeScript
* JavaScript
* HTML
* CSS
* Chrome Extension Manifest V3
* Git
* GitHub

The project may later include a machine learning model and an API for phishing analysis.
