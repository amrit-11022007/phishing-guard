# Watch Tower

- Real-time Phishing Detection: Analyzes email content and text instantly

- Stacking Ensemble Model: Leverages multiple ML algorithms for superior accuracy

- Privacy-Focused: All analysis is performed securely

- Minimalist UI: Clean, distraction-free interface

- Lightweight: Built without heavy frontend frameworks

- Developer Friendly: Written in TypeScript with clear documentation

---

# Project Structure
```
phishing-guard/
├── extension/
│   ├── src/                 # TypeScript source code
│   │   ├── content.ts       # Content script
│   │   ├── background.ts    # Background service worker
│   │   ├── popup.ts         # Popup UI logic
│   │   └── definitions.ts   # Shared TypeScript interfaces
│   ├── load/                # Extension bundle
│   │   ├── dist/           # Compiled JavaScript
│   │   ├── manifest.json   # Chrome extension config
│   │   ├── popup.html      # Popup UI
│   │   ├── style.css       # Styling
│   │   └── assets/         # Icons and images
│   ├── package.json        # Dependencies & scripts
│   └── tsconfig.json       # TypeScript configuration
├── backend/                 # Backend API (if applicable)
│   └── Procfile            # Deployment configuration
├── mlmodel/                 # Machine learning models
│   └── README.md           # ML model documentation
└── .github/
    └── workflows/          # GitHub Actions CI/CD
        └── build.yml       # Build automation
```

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

- Use the exact tsconfig.json provided in code. 
- Make sure to remove export{} after compiling from JS files.

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
| `load/assets/`       | Icons                                           |

---

## Current Technology

- TypeScript
- JavaScript
- HTML
- CSS
- Chrome Extension Manifest V3
- Python
- Stacking Ensemble

## Machine Learning
The extension uses a Stacking Ensemble Model that combines multiple ML algorithms for robust phishing detection
- Base Models: Various classifiers (Random Forest, XGBoost, etc.)
- Meta-Model: Logistic Regression for final prediction
- Features: Email headers, content analysis
