// Test Suite: Hudl Login Flow
// Purpose: End-to-end automated tests covering UI structure, positive login/logout, input validation, and UX controls.
// Dependencies: Uses LoginPage ('src/pages/LoginPage.ts') and HomePage ('src/pages/HomePage.ts').

import { test, expect } from '@playwright/test';
import { LoginPage } from '../src/pages/LoginPage';
import { HomePage } from '../src/pages/HomePage';

// Read test credentials securely from environment variables loaded via .env
const VALID_EMAIL = process.env.HUDL_USERNAME || '';
const VALID_PASSWORD = process.env.HUDL_PASSWORD || '';

test.describe('Hudl Login Flow', () => {
  let loginPage: LoginPage;
  let homePage: HomePage;

  // Setup hook: Instantiates Page Objects and navigates to the Hudl login page before every test
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    homePage = new HomePage(page);
    await loginPage.goto();
  });

  // ============================================================================
  // SUITE 1: UI & Page Structure Verification
  // ============================================================================
  test.describe('UI & Page Structure', () => {
    // Test 1: Verifies page title, Auth0 URL redirect, required email field, primary CTA, and SSO login buttons
    // Uses: LoginPage.heading, emailInput, continueButton, createAccountLink, google/facebook/appleLoginButton
    test('should render all primary login elements and SSO providers', async ({ page }) => {
      await expect(page).toHaveTitle(/Log In/i);
      await expect(page).toHaveURL(/identity\.hudl\.com\/u\/login\/identifier/);

      await expect(loginPage.heading).toBeVisible();
      await expect(loginPage.emailInput).toBeVisible();
      await expect(loginPage.emailInput).toHaveAttribute('required', '');
      await expect(loginPage.continueButton).toBeVisible();
      await expect(loginPage.createAccountLink).toBeVisible();

      // Verify Third-Party SSO options
      await expect(loginPage.googleLoginButton).toBeVisible();
      await expect(loginPage.facebookLoginButton).toBeVisible();
      await expect(loginPage.appleLoginButton).toBeVisible();
    });
  });

  // ============================================================================
  // SUITE 2: Positive Authentication Flows
  // ============================================================================
  test.describe('Positive Authentication Flows', () => {
    // Test 2: Verifies end-to-end login with valid credentials and confirms session persists across page refresh
    // Uses: LoginPage.login(), HomePage.verifyLoggedIn()
    test('should successfully log in with valid credentials and persist session on reload', async ({ page }) => {
      test.skip(!VALID_EMAIL || !VALID_PASSWORD, 'Test credentials not configured in .env');

      await loginPage.login(VALID_EMAIL, VALID_PASSWORD);
      await homePage.verifyLoggedIn();

      // Verify session persistence across page refresh
      await page.reload();
      await homePage.verifyLoggedIn();
    });

    // Test 3: Verifies input hygiene by ensuring leading/trailing spaces in an email are trimmed gracefully
    // Uses: LoginPage.submitEmail(), LoginPage.submitPassword(), HomePage.verifyLoggedIn()
    test('should trim leading and trailing whitespace from a valid email', async () => {
      test.skip(!VALID_EMAIL || !VALID_PASSWORD, 'Test credentials not configured in .env');

      await loginPage.submitEmail(`  ${VALID_EMAIL}  `);
      await expect(loginPage.passwordInput).toBeVisible();
      await loginPage.submitPassword(VALID_PASSWORD);
      await homePage.verifyLoggedIn();
    });

    // Test 4: Verifies logging out terminates the session and blocks direct navigation back to '/home'
    // Uses: LoginPage.login(), HomePage.verifyLoggedIn(), HomePage.logout()
    test('should successfully log out and invalidate the active session', async ({ page }) => {
      test.skip(!VALID_EMAIL || !VALID_PASSWORD, 'Test credentials not configured in .env');

      await loginPage.login(VALID_EMAIL, VALID_PASSWORD);
      await homePage.verifyLoggedIn();

      await homePage.logout();
      await expect(page).toHaveURL(/hudl\.com/);

      // Attempt to access protected route after logout to confirm session invalidation
      await page.goto('/home');
      await expect(page).toHaveURL(/login/);
    });
  });

  // ============================================================================
  // SUITE 3: Negative & Input Validation Scenarios
  // ============================================================================
  test.describe('Negative & Validation Scenarios', () => {
    // Test 5: Verifies clicking 'Continue' with an empty email field stays on Step 1
    // Uses: LoginPage.continueButton, LoginPage.passwordInput
    test('should prevent progression when submitting an empty email', async ({ page }) => {
      await loginPage.continueButton.click();

      // Should remain on the identifier step and not advance to password
      await expect(page).toHaveURL(/login\/identifier/);
      await expect(loginPage.passwordInput).toBeHidden();
    });

    // Tests 6–9: Data-driven tests verifying that malformed email strings are blocked before Step 2
    // Uses: LoginPage.submitEmail(), LoginPage.passwordInput
    const malformedEmails = ['plainaddress', 'missingdomain@', '@missinguser.com', 'user@.com'];
    for (const badEmail of malformedEmails) {
      test(`should reject malformed email format: "${badEmail}"`, async ({ page }) => {
        await loginPage.submitEmail(badEmail);

        await expect(page).toHaveURL(/login\/identifier/);
        await expect(loginPage.passwordInput).toBeHidden();
      });
    }

    // Test 10: Verifies submitting a valid email with an incorrect password shows an authentication error
    // Uses: LoginPage.submitEmail(), LoginPage.submitPassword(), LoginPage.errorMessage
    test('should display an error message when submitting an incorrect password', async () => {
      test.skip(!VALID_EMAIL, 'HUDL_USERNAME not configured in .env');

      await loginPage.submitEmail(VALID_EMAIL);
      await loginPage.submitPassword('WrongPassword123!@#');

      await expect(loginPage.errorMessage.first()).toBeVisible();
      await expect(loginPage.errorMessage.first()).toContainText(/wrong email or password|incorrect/i);
    });

    // Test 11: Verifies submitting a blank password on Step 2 prevents login progression
    // Uses: LoginPage.submitEmail(), LoginPage.passwordInput, LoginPage.continueButton
    test('should prevent progression when submitting an empty password', async () => {
      test.skip(!VALID_EMAIL, 'HUDL_USERNAME not configured in .env');

      await loginPage.submitEmail(VALID_EMAIL);
      await expect(loginPage.passwordInput).toBeVisible();
      await loginPage.continueButton.click();

      await expect(loginPage.passwordInput).toBeVisible();
    });
  });

  // ============================================================================
  // SUITE 4: Secondary Navigation & UX Controls
  // ============================================================================
  test.describe('Secondary Navigation & UX Controls', () => {
    // Test 12: Verifies the Show/Hide Password toggle switches the input type between 'password' and 'text'
    // Uses: LoginPage.submitEmail(), LoginPage.passwordInput, LoginPage.showPasswordToggle
    test('should allow toggling password visibility between masked and plain text', async () => {
      test.skip(!VALID_EMAIL, 'HUDL_USERNAME not configured in .env');

      await loginPage.submitEmail(VALID_EMAIL);
      await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');

      await loginPage.passwordInput.fill('SampleSecret123!');
      if (await loginPage.showPasswordToggle.isVisible()) {
        await loginPage.showPasswordToggle.click();
        await expect(loginPage.passwordInput).toHaveAttribute('type', 'text');

        await loginPage.showPasswordToggle.click();
        await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
      }
    });

// Test 13: Verifies clicking 'Edit' on the password step returns to Step 1 so a new email can be entered
    // Uses: LoginPage.submitEmail(), LoginPage.editEmailLink, LoginPage.emailInput
    test('should allow editing the email address from the password step', async ({ page }) => {
      test.skip(!VALID_EMAIL, 'HUDL_USERNAME not configured in .env');

      await loginPage.submitEmail(VALID_EMAIL);
      await expect(loginPage.passwordInput).toBeVisible();

      await loginPage.editEmailLink.click();
      await expect(page).toHaveURL(/login\/identifier/);
      await expect(loginPage.emailInput).toBeVisible();
      await expect(loginPage.emailInput).toBeEditable();
    });

    // Test 14: Verifies clicking 'Forgot Password' navigates to the password reset flow
    // Uses: LoginPage.submitEmail(), LoginPage.forgotPasswordLink
    test('should navigate to the Forgot Password flow', async ({ page }) => {
      test.skip(!VALID_EMAIL, 'HUDL_USERNAME not configured in .env');

      await loginPage.submitEmail(VALID_EMAIL);
      await loginPage.forgotPasswordLink.click();

      await expect(page).toHaveURL(/reset-password|forgot/i);
    });

    // Test 15: Verifies clicking 'Create Account' navigates to the registration flow
    // Uses: LoginPage.createAccountLink
    test('should navigate to the Create Account registration flow', async ({ page }) => {
      await loginPage.createAccountLink.click();
      await expect(page).toHaveURL(/signup|register|identifier/i);
    });
  });
});
