// Page Object Model: LoginPage
// Purpose: Encapsulates all UI locators and user interactions for Hudl's two-step Auth0 Universal Login page.
// Used by: All test suites inside 'tests/login.spec.ts'.

import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;

  // --- Step 1: Email Identifier Screen Locators ---
  readonly heading: Locator;
  readonly emailInput: Locator;
  readonly continueButton: Locator;
  readonly createAccountLink: Locator;
  readonly googleLoginButton: Locator;
  readonly facebookLoginButton: Locator;
  readonly appleLoginButton: Locator;

  // --- Step 2: Password Entry Screen Locators ---
  readonly passwordInput: Locator;
  readonly showPasswordToggle: Locator;
  readonly editEmailLink: Locator;
  readonly forgotPasswordLink: Locator;

  // --- Validation & Error Feedback Locators ---
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    // Step 1 Locators (https://identity.hudl.com/u/login/identifier)
    // Used by: 'should render all primary login elements and SSO providers'
    this.heading = page.getByRole('heading', { name: /log in/i });
    this.emailInput = page.getByLabel(/email/i);
    this.continueButton = page.getByRole('button', { name: 'Continue', exact: true });
    // Used by: 'should navigate to the Create Account registration flow'
    this.createAccountLink = page.getByRole('link', { name: /create account/i });
    // Used by: 'should render all primary login elements and SSO providers'
    this.googleLoginButton = page.getByRole('button', { name: /continue with google/i });
    this.facebookLoginButton = page.getByRole('button', { name: /continue with facebook/i });
    this.appleLoginButton = page.getByRole('button', { name: /continue with apple/i });

    // Step 2 Locators (Password step after valid email submission)
    // Used by: All positive login tests, negative password tests, and UX control tests
    this.passwordInput = page.getByRole('textbox', { name: /password/i });
    // Used by: 'should allow toggling password visibility between masked and plain text'
    this.showPasswordToggle = page.getByRole('button', { name: /show password|hide password/i });
    // Used by: 'should allow editing the email address from the password step'
    this.editEmailLink = page.getByRole('link', { name: /edit/i });
    // Used by: 'should navigate to the Forgot Password flow'
    this.forgotPasswordLink = page.getByRole('link', { name: /forgot password/i });

    // Hudl Error Message Locator (matches Hudl's invalid-credentials feedback)
    // Used by: 'should display an error message when submitting an incorrect password'
    this.errorMessage = page.getByText(/your email or password is incorrect|wrong email or password/i);
  }

  /**
   * Navigates to '/login' (which redirects to Auth0 Universal Login) and waits for the email field to be ready.
   * Used by: The 'beforeEach' hook in 'tests/login.spec.ts' (runs before every single test).
   */
  async goto(): Promise<void> {
    await this.page.goto('/login');
    await expect(this.emailInput).toBeVisible();
  }

  /**
   * Fills the email address on Step 1 and clicks 'Continue' to advance to the password step.
   * Used by: All tests that submit an email address on Step 1.
   */
  async submitEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.continueButton.click();
  }

  /**
   * Waits for the password input on Step 2, enters the password, and clicks 'Continue'.
   * Used by: Positive login tests, wrong password test, and internally by login().
   */
  async submitPassword(password: string): Promise<void> {
    await expect(this.passwordInput).toBeVisible();
    await this.passwordInput.fill(password);
    await this.continueButton.click();
  }

  /**
   * Executes the full two-step login sequence (Email -> Continue -> Password -> Continue).
   * Used by: Valid login + session persistence test and logout test.
   */
  async login(email: string, password: string): Promise<void> {
    await this.submitEmail(email);
    await this.submitPassword(password);
  }
}