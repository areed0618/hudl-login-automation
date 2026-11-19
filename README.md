# Hudl Login Test Automation Framework

An end-to-end UI test automation framework built with **Playwright** and **TypeScript** to validate the Hudl authentication flow (`https://www.hudl.com/login`).

## Architectural Highlights

* **Page Object Model (POM):** Separates page locators and user actions (`src/pages/LoginPage.ts`, `src/pages/HomePage.ts`) from test assertions (`tests/login.spec.ts`) for maintainability and reuse.
* **Resilient User-Facing Locators:** Prioritizes accessible ARIA roles and labels (`getByRole`, `getByLabel`) over brittle CSS selectors so tests survive styling updates.
* **Secure Credential Management:** Uses `dotenv` with a `.gitignore`-excluded `.env` file locally and GitHub Secrets in CI/CD so credentials are never committed to source control.
* **Static Code Quality:** Configured with strict TypeScript (`tsconfig.json`) and ESLint (`eslint.config.mjs`) to enforce clean, consistent code.
* **Cross-Browser & CI Ready:** Configured to execute across Chromium, Firefox, and WebKit, with automatic trace, screenshot, and video capture on failures.

---

## Project Structure & File Responsibilities

| File / Folder | Purpose & Test Usage |
| :--- | :--- |
| `src/pages/LoginPage.ts` | Page Object Model encapsulating all Step 1 (Email/SSO) and Step 2 (Password/UX) locators and actions. Used by all 15 tests in `tests/login.spec.ts`. |
| `src/pages/HomePage.ts` | Page Object Model encapsulating post-login verification (`/home`) and logout actions. Used by the Positive Authentication tests (Tests 2–4). |
| `tests/login.spec.ts` | Complete 15-test suite covering UI structure, positive login/logout, negative validation, and UX controls. |
| `playwright.config.ts` | Global Playwright configuration (baseURL, timeouts, browser targets, failure screenshots/traces, `.env` loading). |
| `eslint.config.mjs` | ESLint static code analysis configuration run via `npm run lint`. |
| `.github/workflows/playwright.yml` | GitHub Actions CI pipeline for automated linting, typechecking, and test execution. |
| `.env` / `.env.example` | `.env` stores local test credentials (ignored by Git via `.gitignore`); `.env.example` provides a safe template for reviewers. |

---

## Prerequisites

* **Node.js** (v18 or higher)
* **npm** (v9 or higher)

---

## Local Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone <your-github-repo-url>
   cd hudl-login-automation
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Install Playwright browsers:**
   ```bash
   npx playwright install
   ```

4. **Configure test credentials:**
   Copy the example environment file and populate it with valid Hudl test account credentials:
   ```bash
   cp .env.example .env
   ```
   Update `.env`:
   ```env
   BASE_URL=https://www.hudl.com
   HUDL_USERNAME=your_test_email@example.com
   HUDL_PASSWORD=your_test_password
   ```

---

## Running the Tests

| Command | Description |
| :--- | :--- |
| `npm test` | Run all tests headlessly across all configured browsers |
| `npx playwright test --project=chromium` | Run all tests in Chromium only (fastest local run) |
| `npm run test:headed` | Run tests with visible browser windows |
| `npm run test:ui` | Open Playwright's interactive UI mode for step-by-step debugging |
| `npm run test:report` | Open the last generated HTML test report |
| `npm run lint` | Run ESLint static code analysis |
| `npm run typecheck` | Run TypeScript compiler type verification |

---

## Test Coverage Overview

* **UI & Page Structure (Test 1):** Validates page title, Auth0 redirect URL, required email field, primary CTA, and SSO providers (Google, Facebook, Apple).
* **Positive Authentication (Tests 2–4):** Validates end-to-end login, `/home` redirect, session persistence on reload, whitespace trimming on email inputs, and session invalidation upon logout.
* **Negative & Input Validation (Tests 5–11):** Validates empty email submission, malformed email addresses, empty password submission, and invalid password error messaging.
* **UX & Secondary Flows (Tests 12–15):** Validates password masking toggle, editing email from the password step, Forgot Password navigation, and Create Account navigation.
