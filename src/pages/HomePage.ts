// Page Object Model: HomePage
// Purpose: Encapsulates post-login dashboard verification and logout actions on Hudl's authenticated home page.
// Used by: Positive Authentication tests in 'tests/login.spec.ts'.

import { Page, Locator, expect } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly userNavigationMenu: Locator;
  readonly logOutLink: Locator;

  constructor(page: Page) {
    this.page = page;
    // Global navigation user profile menu that only renders once authenticated
    // Used by: verifyLoggedIn() and logout()
    this.userNavigationMenu = page.locator('.hui-globaluseritem, [data-qa-id="webnav-usermenu"]');
    // Log Out link inside the user profile dropdown menu
    // Used by: logout()
    this.logOutLink = page.getByRole('link', { name: /log out/i });
  }

  /**
   * Asserts that the browser redirected to 'hudl.com/home' and the authenticated user menu is visible.
   * Used by:
   *  - 'should successfully log in with valid credentials and persist session on reload'
   *  - 'should trim leading and trailing whitespace from a valid email'
   *  - 'should successfully log out and invalidate the active session'
   */
  async verifyLoggedIn(): Promise<void> {
    await expect(this.page).toHaveURL(/hudl\.com\/home/i, { timeout: 20_000 });
    await expect(this.userNavigationMenu).toBeVisible();
  }

  /**
   * Opens the authenticated user dropdown menu and clicks 'Log Out' to end the session.
   * Used by:
   *  - 'should successfully log out and invalidate the active session'
   */
  async logout(): Promise<void> {
    await this.userNavigationMenu.click();
    await this.logOutLink.click();
  }
}
